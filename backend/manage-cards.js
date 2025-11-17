const mongoose = require('mongoose');
const Card = require('./models/Card');
const Set = require('./models/Set');
const Serie = require('./models/Serie');
require('dotenv').config();

/**
 * Script utilitaire pour gérer les cartes, sets et séries dans la base de données
 * Usage: node manage-cards.js [type] [action] [filter]
 * 
 * Types disponibles:
 * - cards: Gérer les cartes
 * - sets: Gérer les sets
 * - series: Gérer les séries
 * 
 * Actions disponibles:
 * - count: Compter selon un filtre
 * - delete: Supprimer selon un filtre
 * - list: Lister selon un filtre
 * 
 * Filtres disponibles:
 * - tcgp: Éléments TCGP (Pokémon Trading Card Game Pocket)
 * - set:SET_ID: Cartes d'un set spécifique
 * - serie:SERIE_ID: Sets d'une série spécifique
 * 
 * Exemples:
 * node manage-cards.js cards count tcgp
 * node manage-cards.js sets delete tcgp
 * node manage-cards.js series count tcgp
 */

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pokevault');
        console.log('✅ MongoDB connecté');
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        process.exit(1);
    }
};

const buildFilter = (type, filterArg) => {
    if (!filterArg) {
        console.error('❌ Filtre manquant');
        process.exit(1);
    }

    switch (filterArg.toLowerCase()) {
        case 'tcgp':
            if (type === 'cards') {
                return { image: { $regex: '/tcgp/' } };
            } else if (type === 'sets') {
                return { 
                    $or: [
                        { logo: { $regex: '/tcgp/' } },
                        { symbol: { $regex: '/tcgp/' } },
                        { 'serie.id': 'tcgp' }
                    ]
                };
            } else if (type === 'series') {
                return { 
                    $or: [
                        { id: 'tcgp' },
                        { logo: { $regex: '/tcgp/' } }
                    ]
                };
            }
            break;
        
        default:
            if (filterArg.startsWith('set:')) {
                const setId = filterArg.substring(4);
                return { 'set.id': setId };
            }
            if (filterArg.startsWith('serie:')) {
                const serieId = filterArg.substring(6);
                return { 'serie.id': serieId };
            }
            console.error(`❌ Filtre inconnu: ${filterArg}`);
            console.log('\nFiltres disponibles:');
            console.log('  - tcgp: Éléments TCGP');
            console.log('  - set:SET_ID: Cartes d\'un set spécifique');
            console.log('  - serie:SERIE_ID: Sets d\'une série spécifique');
            process.exit(1);
    }
};

const getModel = (type) => {
    switch (type) {
        case 'cards':
            return Card;
        case 'sets':
            return Set;
        case 'series':
            return Serie;
        default:
            console.error(`❌ Type inconnu: ${type}`);
            console.log('Types disponibles: cards, sets, series');
            process.exit(1);
    }
};

const countItems = async (model, filter, type) => {
    const count = await model.countDocuments(filter);
    console.log(`📊 Nombre de ${type} trouvé(e)s: ${count}`);
    return count;
};

const deleteItems = async (model, filter, type) => {
    const count = await model.countDocuments(filter);
    
    if (count === 0) {
        console.log(`ℹ️  Aucun(e) ${type} à supprimer`);
        return 0;
    }

    console.log(`⚠️  Vous êtes sur le point de supprimer ${count} ${type}`);
    console.log(`💡 Pour confirmer, relancez avec: node manage-cards.js ${type} delete-confirm [filter]`);
    return count;
};

const deleteItemsConfirm = async (model, filter, type) => {
    const count = await model.countDocuments(filter);
    
    if (count === 0) {
        console.log(`ℹ️  Aucun(e) ${type} à supprimer`);
        return 0;
    }

    console.log(`🗑️  Suppression de ${count} ${type}...`);
    const result = await model.deleteMany(filter);
    console.log(`✅ ${result.deletedCount} ${type} supprimé(e)s`);
    return result.deletedCount;
};

const listItems = async (model, filter, type, limit = 10) => {
    let selectFields = 'id name';
    if (type === 'cards') {
        selectFields += ' image set.id set.name';
    } else if (type === 'sets') {
        selectFields += ' serie.id serie.name';
    }
    
    const items = await model.find(filter)
        .select(selectFields)
        .limit(limit);
    
    console.log(`\n📋 Aperçu des ${type} (${limit} premier(e)s):\n`);
    items.forEach(item => {
        if (type === 'cards') {
            console.log(`  - ${item.id}: ${item.name} [${item.set?.name || 'N/A'}]`);
        } else if (type === 'sets') {
            console.log(`  - ${item.id}: ${item.name} [Série: ${item.serie?.name || 'N/A'}]`);
        } else {
            console.log(`  - ${item.id}: ${item.name}`);
        }
    });
    console.log('');
};

const main = async () => {
    const [,, type, action, filterArg] = process.argv;

    if (!type || !action || !filterArg) {
        console.log('📖 Usage: node manage-cards.js [type] [action] [filter]');
        console.log('\nTypes:');
        console.log('  - cards: Gérer les cartes');
        console.log('  - sets: Gérer les sets');
        console.log('  - series: Gérer les séries');
        console.log('\nActions:');
        console.log('  - count: Compter');
        console.log('  - delete: Supprimer (demande confirmation)');
        console.log('  - delete-confirm: Supprimer sans confirmation');
        console.log('  - list: Lister');
        console.log('\nFiltres:');
        console.log('  - tcgp: Éléments TCGP');
        console.log('  - set:SET_ID: Cartes d\'un set');
        console.log('  - serie:SERIE_ID: Sets d\'une série');
        console.log('\nExemples:');
        console.log('  node manage-cards.js cards count tcgp');
        console.log('  node manage-cards.js sets delete tcgp');
        console.log('  node manage-cards.js series list tcgp');
        console.log('  node manage-cards.js cards count set:sv6');
        process.exit(0);
    }

    await connectDB();
    const model = getModel(type);
    const filter = buildFilter(type, filterArg);

    try {
        switch (action.toLowerCase()) {
            case 'count':
                await countItems(model, filter, type);
                break;
            
            case 'delete':
                await deleteItems(model, filter, type);
                break;
            
            case 'delete-confirm':
                await deleteItemsConfirm(model, filter, type);
                break;
            
            case 'list':
                await listItems(model, filter, type);
                break;
            
            default:
                console.error(`❌ Action inconnue: ${action}`);
                console.log('Actions disponibles: count, delete, delete-confirm, list');
                process.exit(1);
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Déconnexion de MongoDB');
    }
};

main();
