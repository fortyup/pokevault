# ⚙️ Backend - PokeVault

Backend pour PokeVault utilisant l'API TCGdex avec synchronisation automatique vers MongoDB.

## 📋 Prérequis

- 🟢 Node.js (v14+)
- 📦 npm ou yarn
- 🗄️ MongoDB (installé et en cours d'exécution)

## ⚙️ Installation

1. Accédez au dossier `backend` :
   ```bash
   cd backend
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` (copiez `.env.example`) :
   ```bash
   cp .env.example .env
   ```

4. Assurez-vous que MongoDB est démarré :
   ```bash
   # macOS avec Homebrew
   brew services start mongodb-community
   
   # Ou démarrage manuel
   mongod --config /usr/local/etc/mongod.conf
   ```

## 📥 Synchronisation initiale des données

**⚠️ Important** : Avant le premier démarrage, lancez la synchronisation initiale :

```bash
node sync-initial.js
```

Cette opération importe **toutes les cartes Pokemon** depuis l'API TCGdex (peut prendre 10-30 minutes).

## 🏃 Démarrage

```bash
node server.js
```

Le serveur démarre sur `http://localhost:3000`

## 📅 Synchronisation automatique

La synchronisation avec l'API TCGdex est programmée **quotidiennement à 2h du matin**.

**Note importante :** Les cartes TCGP (Pokémon Trading Card Game Pocket) sont automatiquement exclues de la synchronisation.

Synchronisation manuelle via API :
```bash
curl -X POST http://localhost:3000/api/sync
```

## 📚 Endpoints API

### 🃏 Cartes

- `GET /api/cards` - Liste toutes les cartes (avec pagination)
  - Query params: `page`, `limit`, `name`, `type`, `rarity`, `setId`, `hp`, `sort`
  
- `GET /api/cards/:id` - Récupère une carte par ID
  - Exemple: `/api/cards/sv6-214`
  
- `GET /api/cards/search/:term` - Recherche des cartes par nom
  - Exemple: `/api/cards/search/pikachu`
  
- `GET /api/cards/random/card` - Carte aléatoire

### Sets

- `GET /api/sets` - Liste des sets
  - Query params: `page`, `limit`, `name`, `serieId`, `sort`
  
- `GET /api/sets/:id` - Détails d'un set
  
- `GET /api/sets/:id/cards` - Cartes d'un set

- `GET /api/sets/random/set` - Set aléatoire

### Séries

- `GET /api/series` - Liste des séries
  - Query params: `page`, `limit`, `name`
  
- `GET /api/series/:id` - Détails d'une série
  
- `GET /api/series/:id/sets` - Sets d'une série

- `GET /api/series/random/serie` - Série aléatoire

### 🔄 Synchronisation

- `POST /api/sync` - Déclenche une synchronisation manuelle
- `GET /api/sync/status` - Statut de la dernière synchronisation

### ❤️ Santé

- `GET /api/health` - Vérification de l'état du serveur

## 🖼️ Images des cartes

Les images sont disponibles via TCGdex :

```
https://assets.tcgdex.net/fr/{serieId}/{setId}/{cardLocalId}/high.png
```

Qualités/formats disponibles :
- `high.png` / `high.webp` - Haute qualité
- `low.png` / `low.webp` - Basse qualité

Logo du set :
```
https://assets.tcgdex.net/fr/{serieId}/{setId}/symbol.png
```

## 📊 Exemples de requêtes

### Récupérer une carte
```bash
curl http://localhost:3000/api/cards/sv6-214
```

### Rechercher Pikachu
```bash
curl http://localhost:3000/api/cards/search/pikachu
```

### Filtrer les cartes
```bash
curl "http://localhost:3000/api/cards?type=electric&rarity=rare&page=1&limit=10"
```

### Cartes d'un set
```bash
curl http://localhost:3000/api/sets/sv6/cards
```

## 🔧 Structure du projet

```
backend/
├── config/
│   └── database.js          # Configuration MongoDB
├── models/
│   ├── Card.js              # Modèle Carte
│   ├── Set.js               # Modèle Set
│   └── Serie.js             # Modèle Série
├── routes/
│   ├── cards.js             # Routes des cartes
│   ├── sets.js              # Routes des sets
│   ├── series.js            # Routes des séries
│   └── sync.js              # Routes de synchronisation
├── services/
│   └── tcgdexSync.js        # Service de synchronisation
├── server.js                # Point d'entrée
├── sync-initial.js          # Script de sync initiale
├── manage-cards.js          # Script de gestion des cartes
├── package.json
└── .env.example
```

## 🛠️ Gestion des cartes

Un script utilitaire permet de gérer les cartes dans la base de données :

```bash
# Compter les cartes TCGP
npm run manage count tcgp

# Lister les cartes TCGP
npm run manage list tcgp

# Supprimer les cartes TCGP (demande confirmation)
npm run manage delete tcgp

# Supprimer sans confirmation
npm run manage delete-confirm tcgp

# Gérer un set spécifique
npm run manage count set:P-A
npm run manage delete set:P-A
```

**Filtres disponibles :**
- `tcgp` : Cartes Pokémon Trading Card Game Pocket
- `set:SET_ID` : Cartes d'un set spécifique (ex: `set:sv6`)

## 🐛 Debugging

Vérifier MongoDB :
```bash
mongosh
> show dbs
> use pokevault
> db.cards.countDocuments()
```

## 📝 Notes techniques

- ✅ Données en **français** (SDK TCGdex configuré avec `'fr'`)
- ✅ Index MongoDB optimisés pour les recherches
- ✅ Synchronisation automatique quotidienne
- ✅ Gestion d'erreurs et logs détaillés

## 🧪 Tests
Pour exécuter les tests unitaires :
```bash
npm run test
```

## 🤝 Contribuer
Voir le [README du projet](../README.md) pour les instructions de contribution.