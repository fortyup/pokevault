const express = require('express');
const cors = require('cors'); // Importer le middleware CORS
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Utiliser CORS pour autoriser les requêtes depuis le frontend

// Définir un endpoint qui répond à une requête GET
app.get('/', (req, res) => {
  res.send('Pokevault is under construction!'); // Message à envoyer au frontend
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
