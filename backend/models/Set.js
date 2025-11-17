const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    // Identifiants
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    
    // Informations du set
    logo: String,
    symbol: String,
    
    // Comptage des cartes
    cardCount: {
        total: Number,
        official: Number,
        normal: Number,
        reverse: Number,
        holo: Number,
        firstEd: Number
    },
    
    // Dates de sortie
    releaseDate: String,
    
    // Série parente
    serie: {
        id: String,
        name: String,
        logo: String
    },
    
    // TCG (Pokemon, Magic, etc.)
    tcg: String,
    
}, { timestamps: true });

// Index pour améliorer les performances de recherche
setSchema.index({ name: 'text' });
setSchema.index({ 'serie.id': 1 });

module.exports = mongoose.model('Set', setSchema);
