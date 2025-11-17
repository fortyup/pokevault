const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

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
            rarity,
            setId,
            hp,
            sort = 'name'
        } = req.query;

        const query = {};
        
        // Filtres
        if (name) query.name = { $regex: name, $options: 'i' };
        if (type) query.types = type;
        if (rarity) query.rarity = rarity;
        if (setId) query['set.id'] = setId;
        if (hp) query.hp = parseInt(hp);

        const cards = await Card.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const total = await Card.countDocuments(query);

        res.json({
            success: true,
            data: cards,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
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
