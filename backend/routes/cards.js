const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const SetModel = require('../models/Set');

const sanitizeRegexInput = (value = '') =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parseListParam = (rawValue) => {
    if (!rawValue) return [];
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    return values
        .flatMap((entry) => String(entry).split(','))
        .map((entry) => entry.trim())
        .filter(Boolean);
};

const normalizeKey = (value = '') =>
    value.toString().trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '');

const stripDiacritics = (value = '') =>
    value.normalize('NFD').replace(/\p{Diacritic}/gu, '');

const normalizeTypeToken = (value = '') =>
    stripDiacritics(value).trim().toLowerCase().replace(/[^a-z]/g, '');

const TYPE_SYNONYMS = {
    plante: ['Plante', 'Grass', 'Leaf'],
    feu: ['Feu', 'Fire'],
    eau: ['Eau', 'Water'],
    electrique: ['Électrique', 'Electrique', 'Electric', 'Lightning'],
    psy: ['Psy', 'Psychic'],
    combat: ['Combat', 'Fighting'],
    obscurite: ['Obscurité', 'Obscurite', 'Darkness', 'Dark'],
    metal: ['Métal', 'Metal', 'Steel'],
    dragon: ['Dragon'],
    fee: ['Fée', 'Fee', 'Fairy'],
    incolore: ['Incolore', 'Colorless'],
    tenebres: ['Ténèbres', 'Tenebres', 'Obscurité', 'Darkness', 'Dark'],
    acier: ['Acier', 'Steel', 'Metal']
};

const LEGAL_STATUS_BOOLEAN = {
    legal: true,
    banned: false
};

const expandTypeValues = (values = []) => {
    const expanded = new Set();
    values.forEach((value) => {
        if (!value) return;
        expanded.add(value);
        const synonyms = TYPE_SYNONYMS[normalizeTypeToken(value)];
        if (synonyms) {
            synonyms.forEach((entry) => expanded.add(entry));
        }
    });
    return Array.from(expanded);
};

const buildRegexList = (values = []) =>
    values
        .filter(Boolean)
        .map((value) => new RegExp(`^${sanitizeRegexInput(value)}$`, 'i'));

const toNumber = (value) => {
    if (value === undefined || value === null || value === '') return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
};

const ensureAndClause = (matchStage) => {
    if (!matchStage.$and) {
        matchStage.$and = [];
    }
    return matchStage.$and;
};

const buildNumericConversion = (fieldPath) => ({
    $switch: {
        branches: [
            {
                case: { $in: [{ $type: fieldPath }, ['int', 'long', 'double', 'decimal']] },
                then: { $toDouble: fieldPath }
            },
            {
                case: { $eq: [{ $type: fieldPath }, 'string'] },
                then: {
                    $convert: {
                        input: fieldPath,
                        to: 'double',
                        onError: null,
                        onNull: null
                    }
                }
            }
        ],
        default: null
    }
});

const buildRetreatConversion = (fieldPath) => ({
    $switch: {
        branches: [
            {
                case: { $isArray: fieldPath },
                then: { $size: fieldPath }
            },
            {
                case: { $in: [{ $type: fieldPath }, ['int', 'long', 'double', 'decimal']] },
                then: { $toDouble: fieldPath }
            },
            {
                case: { $eq: [{ $type: fieldPath }, 'string'] },
                then: {
                    $convert: {
                        input: fieldPath,
                        to: 'double',
                        onError: null,
                        onNull: null
                    }
                }
            }
        ],
        default: null
    }
});

const resolveSortStage = (rawSort) => {
    const sortParam = typeof rawSort === 'string' && rawSort.trim() ? rawSort.trim() : 'name';
    const direction = sortParam.startsWith('-') ? -1 : 1;
    const field = sortParam.replace(/^-/, '') || 'name';

    switch (field) {
        case 'hp':
            return { numericHp: direction, name: 1 };
        case 'number':
        case 'localId':
            return { localIdNumeric: direction, localId: direction, name: 1 };
        case 'releaseDate':
            return { 'set.releaseDate': direction, name: 1 };
        default:
            return { name: direction };
    }
};

/**
 * GET /api/cards
 * Récupérer toutes les cartes avec pagination et filtres
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            name,
            type,
            types,
            rarity,
            setId,
            serieId,
            hp,
            hpMin,
            hpMax,
            retreatMin,
            retreatMax,
            weaknesses,
            resistances,
            illustrator,
            artist,
            dexId,
            pokedex,
            legalities,
            legalStatus = 'legal',
            sort = 'name'
        } = req.query;

        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 500);
        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const skip = (pageNumber - 1) * limitNumber;

        const typeFilters = Array.from(new Set([
            ...parseListParam(type),
            ...parseListParam(types)
        ]));
        const expandedTypeFilters = buildRegexList(expandTypeValues(typeFilters));
        const weaknessFilters = buildRegexList(expandTypeValues(parseListParam(weaknesses)));
        const resistanceFilters = buildRegexList(expandTypeValues(parseListParam(resistances)));
        const legalFilters = Array.from(new Set(parseListParam(legalities).map(normalizeKey))).filter(Boolean);

        let hpMinValue = toNumber(hpMin);
        let hpMaxValue = toNumber(hpMax);
        let retreatMinValue = toNumber(retreatMin);
        let retreatMaxValue = toNumber(retreatMax);
        const exactHp = toNumber(hp);
        if (exactHp !== null) {
            hpMinValue = exactHp;
            hpMaxValue = exactHp;
        }

        const matchStage = {};

        let serieSetIds = [];
        if (serieId) {
            serieSetIds = await SetModel.distinct('id', { 'serie.id': serieId });
            if (!serieSetIds.length) {
                return res.json({
                    success: true,
                    data: [],
                    pagination: {
                        page: pageNumber,
                        limit: limitNumber,
                        total: 0,
                        pages: 0
                    }
                });
            }
        }

        if (name) {
            matchStage.name = { $regex: new RegExp(sanitizeRegexInput(name), 'i') };
        }

        if (expandedTypeFilters.length === 1) {
            matchStage.types = expandedTypeFilters[0];
        } else if (expandedTypeFilters.length > 1) {
            matchStage.types = { $in: expandedTypeFilters };
        }

        if (rarity) matchStage.rarity = rarity;
        if (setId) {
            matchStage['set.id'] = setId;
        } else if (serieSetIds.length) {
            matchStage['set.id'] = { $in: serieSetIds };
        }

        const artistFilter = artist || illustrator;
        if (artistFilter) {
            matchStage.illustrator = {
                $regex: new RegExp(sanitizeRegexInput(artistFilter), 'i')
            };
        }

        const dexFilter = pokedex ?? dexId;
        if (dexFilter !== undefined && dexFilter !== null && dexFilter !== '') {
            const rawDex = Array.isArray(dexFilter) ? dexFilter[0] : dexFilter;
            const numericDex = Number(rawDex);
            matchStage.dexId = Number.isNaN(numericDex) ? rawDex : numericDex;
        }

        if (weaknessFilters.length) {
            matchStage['weaknesses.type'] = { $in: weaknessFilters };
        }

        if (resistanceFilters.length) {
            matchStage['resistances.type'] = { $in: resistanceFilters };
        }

        const normalizedLegalStatus = normalizeKey(legalStatus || 'legal');
        const booleanLegalStatus = Object.prototype.hasOwnProperty.call(LEGAL_STATUS_BOOLEAN, normalizedLegalStatus)
            ? LEGAL_STATUS_BOOLEAN[normalizedLegalStatus]
            : null;
        const legalStatusRegex = new RegExp(`^${sanitizeRegexInput(legalStatus || 'legal')}$`, 'i');

        if (legalFilters.length) {
            const andClause = ensureAndClause(matchStage);
            legalFilters.forEach((format) => {
                if (!format) return;
                if (booleanLegalStatus !== null) {
                    andClause.push({ [`legal.${format}`]: booleanLegalStatus });
                } else {
                    andClause.push({ [`legal.${format}`]: legalStatusRegex });
                }
            });
            if (!matchStage.$and.length) delete matchStage.$and;
        }

        const pipeline = [
            { $match: matchStage },
            {
                $addFields: {
                    numericHp: buildNumericConversion('$hp'),
                    retreatCost: buildRetreatConversion('$retreat'),
                    localIdNumeric: buildNumericConversion('$localId')
                }
            }
        ];

        const rangeConditions = {};
        if (hpMinValue !== null || hpMaxValue !== null) {
            const hpCondition = {};
            if (hpMinValue !== null) hpCondition.$gte = hpMinValue;
            if (hpMaxValue !== null) hpCondition.$lte = hpMaxValue;
            if (Object.keys(hpCondition).length) {
                rangeConditions.numericHp = hpCondition;
            }
        }

        if (retreatMinValue !== null || retreatMaxValue !== null) {
            const retreatCondition = {};
            if (retreatMinValue !== null) retreatCondition.$gte = retreatMinValue;
            if (retreatMaxValue !== null) retreatCondition.$lte = retreatMaxValue;
            if (Object.keys(retreatCondition).length) {
                rangeConditions.retreatCost = retreatCondition;
            }
        }

        if (Object.keys(rangeConditions).length) {
            pipeline.push({ $match: rangeConditions });
        }

        const sortStage = resolveSortStage(sort);

        pipeline.push({
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $sort: sortStage },
                    { $skip: skip },
                    { $limit: limitNumber },
                    {
                        $project: {
                            __v: 0,
                            numericHp: 0,
                            retreatCost: 0,
                            localIdNumeric: 0
                        }
                    }
                ]
            }
        });

        const results = await Card.aggregate(pipeline);
        const metadata = results[0]?.metadata?.[0] || { total: 0 };
        const cards = results[0]?.data || [];
        const total = metadata.total || 0;

        res.json({
            success: true,
            data: cards,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(total / limitNumber) || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/cards/metadata
 * Récupérer les valeurs distinctes utiles aux filtres avancés
 */
router.get('/metadata', async (_req, res) => {
    try {
        const rarities = await Card.distinct('rarity', {
            rarity: { $nin: [null, '', undefined] }
        });

        const normalized = rarities
            .map((value) => String(value).trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));

        const legalFormatsResult = await Card.aggregate([
            {
                $project: {
                    legalKeys: {
                        $map: {
                            input: { $objectToArray: { $ifNull: ['$legal', {}] } },
                            as: 'entry',
                            in: '$$entry.k'
                        }
                    }
                }
            },
            { $unwind: '$legalKeys' },
            {
                $group: {
                    _id: null,
                    formats: { $addToSet: '$legalKeys' }
                }
            }
        ]);

        const legalFormats = legalFormatsResult[0]?.formats
            ?.map((value) => String(value).trim())
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })) || [];

        res.json({
            success: true,
            data: {
                rarities: normalized,
                legalFormats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/cards/:id
 * Récupérer une carte par son ID
 */
router.get('/:id', async (req, res) => {
    try {
        const card = await Card.findOne({ id: req.params.id }).select('-__v');
        
        if (!card) {
            return res.status(404).json({
                success: false,
                error: 'Carte non trouvée'
            });
        }

        res.json({
            success: true,
            data: card
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/cards/search/:term
 * Rechercher des cartes par nom
 */
router.get('/search/:term', async (req, res) => {
    try {
        const { term } = req.params;
        const { limit = 10 } = req.query;

        const cards = await Card.find({
            name: { $regex: term, $options: 'i' }
        })
            .limit(parseInt(limit))
            .select('id name image set types rarity hp');

        res.json({
            success: true,
            data: cards,
            count: cards.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/cards/random
 * Récupérer une carte aléatoire
 */
router.get('/random/card', async (req, res) => {
    try {
        const count = await Card.countDocuments();
        const random = Math.floor(Math.random() * count);
        const card = await Card.findOne().skip(random).select('-__v');

        res.json({
            success: true,
            data: card
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
