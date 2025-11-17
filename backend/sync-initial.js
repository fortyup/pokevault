const TCGdexSyncService = require('./services/tcgdexSync');
const connectDB = require('./config/database');
require('dotenv').config();

/**
 * Script de synchronisation manuelle
 * Utilisation: node sync-initial.js
 */

const runSync = async () => {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await connectDB();
        
        console.log('🚀 Démarrage de la synchronisation initiale...');
        const syncService = new TCGdexSyncService();
        await syncService.syncAll();
        
        console.log('\n✅ Synchronisation terminée !');
        console.log('💡 Vous pouvez maintenant démarrer le serveur avec: npm start');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur fatale:', error);
        process.exit(1);
    }
};

runSync();
