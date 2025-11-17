const mongoose = require('mongoose');

const serieSchema = new mongoose.Schema({
    // Identifiants
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    
    // Informations de la série
    logo: String,
    
}, { timestamps: true });

// Index pour améliorer les performances de recherche
serieSchema.index({ name: 'text' });

module.exports = mongoose.model('Serie', serieSchema);
