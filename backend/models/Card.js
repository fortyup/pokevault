const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    // Identifiants
    id: { type: String, required: true, unique: true },
    localId: String,
    name: { type: String, required: true },
    
    // Informations de base
    illustrator: String,
    rarity: String,
    category: String,
    
    // Caractéristiques
    hp: mongoose.Schema.Types.Mixed, // Peut être Number ou String
    types: [String],
    
    // Evolution
    evolveFrom: String,
    
    // Texte et description
    description: String,
    level: mongoose.Schema.Types.Mixed, // Peut être Number ou String
    stage: String,
    suffix: String, // Pour les variantes comme "EX", "V", etc.
    item: mongoose.Schema.Types.Mixed, // Pour les cartes Item/Trainer
    
    // Attaques et capacités
    abilities: mongoose.Schema.Types.Mixed,
    attacks: mongoose.Schema.Types.Mixed,
    
    // Résistances et faiblesses - Utiliser Mixed pour plus de flexibilité
    weaknesses: mongoose.Schema.Types.Mixed,
    resistances: mongoose.Schema.Types.Mixed,
    retreat: mongoose.Schema.Types.Mixed, // Peut être Number, Array, ou undefined
    
    // Effet (pour les cartes Trainer/Energy)
    effect: String,
    trainerType: String,
    energyType: String,
    
    // Informations du set
    set: mongoose.Schema.Types.Mixed,
    
    // Variantes
    variants: mongoose.Schema.Types.Mixed,
    
    // Images
    image: String,
    
    // Informations légales
    legal: mongoose.Schema.Types.Mixed,
    
    // Métadonnées
    regulationMark: String,
    dexId: mongoose.Schema.Types.Mixed, // Peut être Array ou Number unique
    
}, { 
    timestamps: true,
    strict: false // Permet les champs non définis dans le schéma
});

// Index pour améliorer les performances de recherche
cardSchema.index({ name: 'text' });
cardSchema.index({ 'set.id': 1 });
cardSchema.index({ types: 1 });
cardSchema.index({ rarity: 1 });

module.exports = mongoose.model('Card', cardSchema);
