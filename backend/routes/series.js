const express = require('express');
const router = express.Router();
const Serie = require('../models/Serie');
const Set = require('../models/Set');

/**
 * GET /api/series
 * Récupérer toutes les séries
 */
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 50, name } = req.query;
        const query = {};
        
        if (name) query.name = { $regex: name, $options: 'i' };

        const series = await Serie.find(query)
            .sort('name')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .select('-__v');

        const total = await Serie.countDocuments(query);

        res.json({
            success: true,
            data: series,
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
 * GET /api/series/random/serie
 * Récupérer une série aléatoire
 */
router.get('/random/serie', async (req, res) => {
    try {
        const count = await Serie.countDocuments();
        const random = Math.floor(Math.random() * count);
        const serie = await Serie.findOne().skip(random).select('-__v');

        res.json({
            success: true,
            data: serie
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/series/:id
 * Récupérer une série par son ID
 */
router.get('/:id', async (req, res) => {
    try {
        const serie = await Serie.findOne({ id: req.params.id }).select('-__v');
        
        if (!serie) {
            return res.status(404).json({
                success: false,
                error: 'Série non trouvée'
            });
        }

        res.json({
            success: true,
            data: serie
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/series/:id/sets
 * Récupérer tous les sets d'une série
 */
router.get('/:id/sets', async (req, res) => {
    try {
        const sets = await Set.find({ 'serie.id': req.params.id })
            .sort('releaseDate')
            .select('-__v');

        res.json({
            success: true,
            data: sets,
            count: sets.length
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
