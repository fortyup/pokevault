const express = require('express');
const router = express.Router();
const Set = require('../models/Set');
const Card = require('../models/Card');

/**
 * GET /api/sets
 * Récupérer tous les sets avec pagination
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            name,
            serieId,
            sort = 'releaseDate'
        } = req.query;

        const query = {};
        
        // Filtres
        if (name) query.name = { $regex: name, $options: 'i' };
        if (serieId) query['serie.id'] = serieId;

        const sets = await Set.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const total = await Set.countDocuments(query);

        res.json({
            success: true,
            data: sets,
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
 * GET /api/sets/random/set
 * Récupérer un set aléatoire
 */
router.get('/random/set', async (req, res) => {
    try {
        const count = await Set.countDocuments();
        const random = Math.floor(Math.random() * count);
        const set = await Set.findOne().skip(random).select('-__v');

        res.json({
            success: true,
            data: set
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sets/:id
 * Récupérer un set par son ID
 */
router.get('/:id', async (req, res) => {
    try {
        const set = await Set.findOne({ id: req.params.id }).select('-__v');
        
        if (!set) {
            return res.status(404).json({
                success: false,
                error: 'Set non trouvé'
            });
        }

        res.json({
            success: true,
            data: set
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/sets/:id/cards
 * Récupérer toutes les cartes d'un set
 */
router.get('/:id/cards', async (req, res) => {
    try {
        const { page = 1, limit = 100 } = req.query;
        
        const cards = await Card.find({ 'set.id': req.params.id })
            .sort('localId')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const total = await Card.countDocuments({ 'set.id': req.params.id });

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

module.exports = router;
