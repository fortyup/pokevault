# 🖼️ Frontend - PokeVault

Cette partie du projet est le frontend de l'application PokeVault, construit avec Vue.js.

## 📋 Prérequis

- 🟢 Node.js (v14+)
- 📦 npm ou yarn

## ⚙️ Installation

1. Accédez au dossier `frontend` :
   ```bash
   cd frontend
    ```
2. Installez les dépendances :
    ```bash
    npm install
    ```
3. Lancez le serveur de développement :
    ```bash
    npm run dev
    ```
   
Le projet est maintenant accessible à l'adresse `http://localhost:8080`.

## 🗂️ Structure du projet
- `src/` : Contient le code source de l'application.
    - `components/` : Les composants Vue.js.
    - `views/` : Les vues/pages de l'application.
    - `assets/` : Les fichiers statiques (images, styles, etc.).

## 🚀 Déploiement
Pour générer le projet prêt à être déployé, exécutez :
```bash
npm run build
```
Cela créera un dossier `dist` contenant la version optimisée de l'application.

## 🧪 Tests
Pour lancer les tests unitaires, exécutez :
```bash
npm run test:unit
```