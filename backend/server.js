const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Configuration
const connectDB = require('./config/database');
const TCGdexSyncService = require('./services/tcgdexSync');

// Routes
const cardsRouter = require('./routes/cards');
const setsRouter = require('./routes/sets');
const seriesRouter = require('./routes/series');
const syncRouter = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à la base de données
connectDB();

// Routes API
app.use('/api/cards', cardsRouter);
app.use('/api/sets', setsRouter);
app.use('/api/series', seriesRouter);
app.use('/api/sync', syncRouter);

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'PokeVault API is running',
        timestamp: new Date()
    });
});

// Planification de la synchronisation quotidienne à 2h du matin
cron.schedule('0 2 * * *', async () => {
    console.log('🕐 Début de la synchronisation quotidienne automatique...');
    try {
        const syncService = new TCGdexSyncService();
        await syncService.syncAll();
        console.log('✅ Synchronisation quotidienne terminée');
    } catch (error) {
        console.error('❌ Erreur lors de la synchronisation quotidienne:', error);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📅 Synchronisation automatique programmée tous les jours à 2h du matin`);
});