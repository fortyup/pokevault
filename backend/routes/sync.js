const express = require('express');
const router = express.Router();
const TCGdexSyncService = require('../services/tcgdexSync');

let syncInProgress = false;
let lastSyncResult = null;

/**
 * POST /api/sync
 * Déclencher une synchronisation manuelle
 */
router.post('/', async (req, res) => {
    if (syncInProgress) {
        return res.status(409).json({
            success: false,
            error: 'Une synchronisation est déjà en cours'
        });
    }

    try {
        syncInProgress = true;
        
        const syncService = new TCGdexSyncService();
        const stats = await syncService.syncAll();
        
        lastSyncResult = {
            timestamp: new Date(),
            stats,
            success: true
        };

        res.json({
            success: true,
            message: 'Synchronisation terminée avec succès',
            data: lastSyncResult
        });
    } catch (error) {
        lastSyncResult = {
            timestamp: new Date(),
            error: error.message,
            success: false
        };

        res.status(500).json({
            success: false,
            error: error.message
        });
    } finally {
        syncInProgress = false;
    }
});

/**
 * GET /api/sync/status
 * Récupérer le statut de la dernière synchronisation
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        data: {
            inProgress: syncInProgress,
            lastSync: lastSyncResult
        }
    });
});

module.exports = router;
