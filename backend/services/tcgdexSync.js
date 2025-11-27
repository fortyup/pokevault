const TCGdex = require('@tcgdex/sdk').default;
const Card = require('../models/Card');
const Set = require('../models/Set');
const Serie = require('../models/Serie');

class TCGdexSyncService {
    constructor() {
        this.tcgdex = new TCGdex('fr'); // API en français
        this.stats = {
            series: { imported: 0, updated: 0, errors: 0 },
            sets: { imported: 0, updated: 0, errors: 0 },
            cards: { imported: 0, updated: 0, errors: 0 }
        };
    }

    /**
     * Synchronisation complète : séries, sets et cartes
     */
    async syncAll() {
        console.log('🚀 Début de la synchronisation TCGdex...');
        const startTime = Date.now();

        try {
            // 1. Synchroniser les séries
            await this.syncSeries();

            // 2. Synchroniser les sets
            await this.syncSets();

            // 3. Synchroniser les cartes
            await this.syncCards();

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log('\n✅ Synchronisation terminée avec succès !');
            console.log(`⏱️  Durée totale: ${duration}s`);
            this.printStats();

            return this.stats;
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            throw error;
        }
    }

    /**
     * Synchroniser toutes les séries
     */
    async syncSeries() {
        console.log('\n📚 Synchronisation des séries...');
        try {
            const seriesList = await this.tcgdex.serie.list();

            for (const serieResume of seriesList) {
                try {
                    // Récupérer les détails complets de la série
                    const serieData = await this.tcgdex.serie.get(serieResume.id);

                    // Filtrer les séries TCGP, Kit du Dresseur et McDonald's
                    if (serieData.id === 'tcgp' ||
                        serieData.id === 'tk' ||
                        serieData.id === 'mc' ||
                        serieData.id?.toLowerCase().includes('tcgp') ||
                        (serieData.name && serieData.name.toLowerCase().includes('pocket')) ||
                        (serieData.name && serieData.name.toLowerCase().includes('kit')) ||
                        (serieData.name && serieData.name.toLowerCase().includes('mcdonald')) ||
                        (serieData.logo && serieData.logo.includes('/tcgp/'))) {
                        // Supprimer la série si elle existe déjà
                        await Serie.deleteOne({ id: serieData.id });
                        // Ignorer les séries exclues
                        continue;
                    }

                    await Serie.findOneAndUpdate(
                        { id: serieData.id },
                        {
                            id: serieData.id,
                            name: serieData.name,
                            logo: serieData.logo
                        },
                        { upsert: true, new: true }
                    );

                    this.stats.series.imported++;
                    process.stdout.write(`\r   Séries importées: ${this.stats.series.imported}`);
                } catch (error) {
                    this.stats.series.errors++;
                    console.error(`\n   ❌ Erreur série ${serieResume.id}:`, error.message);
                }
            }

            console.log(`\n   ✅ ${this.stats.series.imported} séries synchronisées`);
        } catch (error) {
            console.error('   ❌ Erreur lors de la récupération des séries:', error);
            throw error;
        }
    }

    /**
     * Synchroniser tous les sets
     */
    async syncSets() {
        console.log('\n📦 Synchronisation des sets...');
        try {
            const setsList = await this.tcgdex.set.list();

            for (const setResume of setsList) {
                try {
                    // Récupérer les détails complets du set
                    const setData = await this.tcgdex.set.get(setResume.id);

                    // Filtrer les sets TCGP (Pokémon Trading Card Game Pocket), Kits du Dresseur et McDonald's
                    if (setData.id?.toLowerCase().includes('tcgp') ||
                        setData.id?.toLowerCase().startsWith('tk') ||
                        setData.id?.toLowerCase().includes('mcdonald') ||
                        (setData.name && setData.name.toLowerCase().includes('pocket')) ||
                        (setData.name && setData.name.toLowerCase().includes('kit')) ||
                        (setData.name && setData.name.toLowerCase().includes('mcdonald')) ||
                        (setData.logo && setData.logo.includes('/tcgp/')) ||
                        (setData.symbol && setData.symbol.includes('/tcgp/')) ||
                        (setData.serie && (setData.serie.id === 'tcgp' || setData.serie.id === 'tk' || setData.serie.id === 'mc'))) {
                        // Supprimer le set s'il existe déjà
                        await Set.deleteOne({ id: setData.id });
                        // Ignorer les sets exclus
                        continue;
                    }

                    await Set.findOneAndUpdate(
                        { id: setData.id },
                        {
                            id: setData.id,
                            name: setData.name,
                            logo: setData.logo,
                            symbol: setData.symbol,
                            cardCount: setData.cardCount,
                            releaseDate: setData.releaseDate,
                            serie: setData.serie,
                            tcg: setData.tcg
                        },
                        { upsert: true, new: true }
                    );

                    this.stats.sets.imported++;
                    process.stdout.write(`\r   Sets importés: ${this.stats.sets.imported}`);
                } catch (error) {
                    this.stats.sets.errors++;
                    console.error(`\n   ❌ Erreur set ${setResume.id}:`, error.message);
                }
            }

            console.log(`\n   ✅ ${this.stats.sets.imported} sets synchronisés`);
        } catch (error) {
            console.error('   ❌ Erreur lors de la récupération des sets:', error);
            throw error;
        }
    }

    /**
     * Synchroniser toutes les cartes
     */
    async syncCards() {
        console.log('\n🃏 Synchronisation des cartes...');
        try {
            const cardsList = await this.tcgdex.card.list();

            const batchSize = 50; // Traiter par lots pour éviter la surcharge
            for (let i = 0; i < cardsList.length; i += batchSize) {
                const batch = cardsList.slice(i, i + batchSize);

                await Promise.all(batch.map(async (cardResume) => {
                    try {
                        // Récupérer les détails complets de la carte
                        const cardData = await this.tcgdex.card.get(cardResume.id);

                        // Filtrer les cartes TCGP, Kit du Dresseur et McDonald's
                        const excludedRarities = [
                            'un diamant',
                            'deux diamants',
                            'trois diamants',
                            'quatre diamants',
                            'une étoile',
                            'deux étoiles',
                            'trois étoiles',
                            'un chromatique',
                            'deux chromatiques',
                            'couronne'
                        ];

                        if ((cardData.image && cardData.image.includes('/tcgp/')) ||
                            (cardData.set && cardData.set.id && cardData.set.id.toLowerCase().includes('tcgp')) ||
                            (cardData.set && cardData.set.id && cardData.set.id.toLowerCase().startsWith('tk')) ||
                            (cardData.set && cardData.set.id && cardData.set.id.toLowerCase().includes('mcdonald')) ||
                            (cardData.set && cardData.set.name && cardData.set.name.toLowerCase().includes('pocket')) ||
                            (cardData.set && cardData.set.name && cardData.set.name.toLowerCase().includes('kit')) ||
                            (cardData.set && cardData.set.name && cardData.set.name.toLowerCase().includes('mcdonald')) ||
                            (cardData.set && cardData.set.serie && (cardData.set.serie.id === 'tcgp' || cardData.set.serie.id === 'tk' || cardData.set.serie.id === 'mc')) ||
                            (cardData.rarity && excludedRarities.includes(cardData.rarity.toLowerCase()))) {
                            // Supprimer la carte si elle existe déjà
                            await Card.deleteOne({ id: cardData.id });
                            // Ignorer les cartes exclues
                            return;
                        }

                        await Card.findOneAndUpdate(
                            { id: cardData.id },
                            {
                                id: cardData.id,
                                localId: cardData.localId,
                                name: cardData.name,
                                illustrator: cardData.illustrator,
                                rarity: cardData.rarity,
                                category: cardData.category,
                                hp: cardData.hp,
                                types: cardData.types,
                                evolveFrom: cardData.evolveFrom,
                                description: cardData.description,
                                level: cardData.level,
                                stage: cardData.stage,
                                abilities: cardData.abilities,
                                attacks: cardData.attacks,
                                weaknesses: cardData.weaknesses,
                                resistances: cardData.resistances,
                                retreat: cardData.retreat,
                                set: cardData.set,
                                variants: cardData.variants,
                                image: cardData.image,
                                legal: cardData.legal,
                                regulationMark: cardData.regulationMark,
                                dexId: cardData.dexId
                            },
                            { upsert: true, new: true }
                        );

                        this.stats.cards.imported++;
                    } catch (error) {
                        this.stats.cards.errors++;
                        console.error(`\n   ❌ Erreur carte ${cardResume.id}:`, error.message);
                    }
                }));

                process.stdout.write(`\r   Cartes importées: ${this.stats.cards.imported}/${cardsList.length}`);
            }

            console.log(`\n   ✅ ${this.stats.cards.imported} cartes synchronisées`);
        } catch (error) {
            console.error('   ❌ Erreur lors de la récupération des cartes:', error);
            throw error;
        }
    }

    /**
     * Afficher les statistiques de synchronisation
     */
    printStats() {
        console.log('\n📊 Statistiques de synchronisation:');
        console.log('┌─────────────┬──────────┬──────────┬─────────┐');
        console.log('│ Type        │ Importés │ Mis à j. │ Erreurs │');
        console.log('├─────────────┼──────────┼──────────┼─────────┤');
        console.log(`│ Séries      │ ${String(this.stats.series.imported).padStart(8)} │ ${String(this.stats.series.updated).padStart(8)} │ ${String(this.stats.series.errors).padStart(7)} │`);
        console.log(`│ Sets        │ ${String(this.stats.sets.imported).padStart(8)} │ ${String(this.stats.sets.updated).padStart(8)} │ ${String(this.stats.sets.errors).padStart(7)} │`);
        console.log(`│ Cartes      │ ${String(this.stats.cards.imported).padStart(8)} │ ${String(this.stats.cards.updated).padStart(8)} │ ${String(this.stats.cards.errors).padStart(7)} │`);
        console.log('└─────────────┴──────────┴──────────┴─────────┘');
    }
}

module.exports = TCGdexSyncService;
