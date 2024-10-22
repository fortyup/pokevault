const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Charger les variables d'environnement

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY; // Récupérer la clé d'API depuis le fichier .env

app.use(cors());

app.get('/api/card/:id', async (req, res) => {
    try {
        const cardId = req.params.id;
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
            headers: {
                'X-Api-Key': API_KEY // Utiliser la clé d'API dans l'en-tête de la requête
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});