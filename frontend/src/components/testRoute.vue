<script>
import { getCardImageUrl, getLogoUrl, getSymbolUrl } from '../services/imageService.js';

export default {
  data() {
    return {
      card: null,
      set: null,
      serie: null,
      loading: false,
      error: null,
      searchId: 'sv6-214',
      viewType: 'card' // 'card', 'set', 'serie'
    };
  },
  mounted() {
    this.fetchCard(this.searchId);
  },
  computed: {
    cardImageUrl() {
      return this.card?.image ? getCardImageUrl(this.card.image, 'high') : '';
    },
    setLogoUrl() {
      const logo = this.set?.logo || this.card?.set?.logo;
      return logo ? getLogoUrl(logo) : '';
    },
    setSymbolUrl() {
      const symbol = this.set?.symbol || this.card?.set?.symbol;
      return symbol ? getSymbolUrl(symbol) : '';
    },
    serieLogoUrl() {
      const logo = this.serie?.logo || this.set?.serie?.logo;
      return logo ? getLogoUrl(logo) : '';
    }
  },
  methods: {
    async fetchCard(cardId) {
      this.loading = true;
      this.error = null;
      this.viewType = 'card';
      
      try {
        const response = await fetch(`http://localhost:3000/api/cards/${cardId}`);
        
        if (!response.ok) {
          throw new Error('Carte non trouvée');
        }
        
        const result = await response.json();
        this.card = result.data;
        this.set = null;
        this.serie = null;
      } catch (error) {
        this.error = error.message;
        console.error('Erreur lors de la récupération de la carte:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async getRandomCard() {
      this.loading = true;
      this.error = null;
      this.viewType = 'card';
      
      try {
        const response = await fetch('http://localhost:3000/api/cards/random/card');
        const result = await response.json();
        this.card = result.data;
        this.searchId = result.data.id;
        this.set = null;
        this.serie = null;
      } catch (error) {
        this.error = error.message;
        console.error('Erreur lors de la récupération de la carte aléatoire:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async getRandomSet() {
      this.loading = true;
      this.error = null;
      this.viewType = 'set';
      
      try {
        const response = await fetch('http://localhost:3000/api/sets/random/set');
        const result = await response.json();
        this.set = result.data;
        this.card = null;
        this.serie = null;
      } catch (error) {
        this.error = error.message;
        console.error('Erreur lors de la récupération du set aléatoire:', error);
      } finally {
        this.loading = false;
      }
    },
    
    async getRandomSerie() {
      this.loading = true;
      this.error = null;
      this.viewType = 'serie';
      
      try {
        const response = await fetch('http://localhost:3000/api/series/random/serie');
        const result = await response.json();
        this.serie = result.data;
        this.card = null;
        this.set = null;
      } catch (error) {
        this.error = error.message;
        console.error('Erreur lors de la récupération de la série aléatoire:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<template>
  <div class="card-viewer">
    <div class="controls">
      <input 
        v-model="searchId" 
        @keyup.enter="fetchCard(searchId)"
        placeholder="ID de la carte (ex: sv6-214)"
        class="search-input"
      />
      <button @click="fetchCard(searchId)" class="btn">Rechercher</button>
      <button @click="getRandomCard" class="btn btn-random">Carte aléatoire</button>
      <button @click="getRandomSet" class="btn btn-random">Set aléatoire</button>
      <button @click="getRandomSerie" class="btn btn-random">Série aléatoire</button>
    </div>

    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <!-- Affichage d'une carte -->
    <div v-else-if="viewType === 'card' && card" class="card-details">
      <div class="card-header">
        <h2>{{ card.name }}</h2>
        <span v-if="card.hp" class="hp">HP {{ card.hp }}</span>
      </div>
      
      <div class="card-content">
        <div class="card-image" v-if="cardImageUrl">
          <img :src="cardImageUrl" :alt="card.name" loading="lazy" />
        </div>
        
        <div class="card-info">
          <div class="info-group">
            <strong>ID:</strong> {{ card.id }}
          </div>
          
          <div class="info-group" v-if="card.types && card.types.length">
            <strong>Types:</strong> {{ card.types.join(', ') }}
          </div>
          
          <div class="info-group" v-if="card.rarity">
            <strong>Rareté:</strong> {{ card.rarity }}
          </div>
          
          <div class="info-group" v-if="card.illustrator">
            <strong>Illustrateur:</strong> {{ card.illustrator }}
          </div>
          
          <div class="info-group" v-if="card.set">
            <strong>Set:</strong> 
            <img v-if="setSymbolUrl" :src="setSymbolUrl" :alt="card.set.name" class="set-symbol" />
            {{ card.set.name }}
            <img v-if="setLogoUrl" :src="setLogoUrl" :alt="card.set.name" class="set-logo" />
          </div>
          
          <div class="info-group" v-if="card.description">
            <strong>Description:</strong> {{ card.description }}
          </div>
          
          <div v-if="card.attacks && card.attacks.length" class="attacks">
            <strong>Attaques:</strong>
            <div v-for="(attack, index) in card.attacks" :key="index" class="attack">
              <div class="attack-name">{{ attack.name }}</div>
              <div class="attack-cost" v-if="attack.cost">Coût: {{ attack.cost.join(', ') }}</div>
              <div class="attack-damage" v-if="attack.damage">Dégâts: {{ attack.damage }}</div>
              <div class="attack-effect" v-if="attack.effect">{{ attack.effect }}</div>
            </div>
          </div>
          
          <details class="raw-data">
            <summary>Données brutes (JSON)</summary>
            <pre>{{ card }}</pre>
          </details>
        </div>
      </div>
    </div>
    
    <!-- Affichage d'un set -->
    <div v-else-if="viewType === 'set' && set" class="set-details">
      <div class="set-header">
        <h2>{{ set.name }}</h2>
        <div class="set-logos">
          <img v-if="setSymbolUrl" :src="setSymbolUrl" :alt="set.name" class="set-symbol-large" />
          <img v-if="setLogoUrl" :src="setLogoUrl" :alt="set.name" class="set-logo-large" />
        </div>
      </div>
      
      <div class="set-info">
        <div class="info-group">
          <strong>ID:</strong> {{ set.id }}
        </div>
        
        <div class="info-group" v-if="set.releaseDate">
          <strong>Date de sortie:</strong> {{ set.releaseDate }}
        </div>
        
        <div class="info-group" v-if="set.serie">
          <strong>Série:</strong>
          <img v-if="serieLogoUrl" :src="serieLogoUrl" :alt="set.serie.name" class="serie-logo-inline" />
          {{ set.serie.name }}
        </div>
        
        <div class="info-group" v-if="set.cardCount">
          <strong>Nombre de cartes:</strong>
          <ul class="card-count-list">
            <li v-if="set.cardCount.total">Total: {{ set.cardCount.total }}</li>
            <li v-if="set.cardCount.official">Officielles: {{ set.cardCount.official }}</li>
            <li v-if="set.cardCount.normal">Normales: {{ set.cardCount.normal }}</li>
            <li v-if="set.cardCount.reverse">Reverse: {{ set.cardCount.reverse }}</li>
            <li v-if="set.cardCount.holo">Holo: {{ set.cardCount.holo }}</li>
          </ul>
        </div>
        
        <details class="raw-data">
          <summary>Données brutes (JSON)</summary>
          <pre>{{ set }}</pre>
        </details>
      </div>
    </div>
    
    <!-- Affichage d'une série -->
    <div v-else-if="viewType === 'serie' && serie" class="serie-details">
      <div class="serie-header">
        <h2>{{ serie.name }}</h2>
        <img v-if="serieLogoUrl" :src="serieLogoUrl" :alt="serie.name" class="serie-logo-large" />
      </div>
      
      <div class="serie-info">
        <div class="info-group">
          <strong>ID:</strong> {{ serie.id }}
        </div>
        
        <details class="raw-data">
          <summary>Données brutes (JSON)</summary>
          <pre>{{ serie }}</pre>
        </details>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-viewer {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.btn {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.btn:hover {
  background-color: #45a049;
}

.btn-random {
  background-color: #2196F3;
}

.btn-random:hover {
  background-color: #0b7dda;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}

.error {
  color: #f44336;
}

.card-details {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  color: black;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.card-header h2 {
  margin: 0;
  color: #333;
}

.hp {
  font-size: 24px;
  font-weight: bold;
  color: #f44336;
}

.card-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.card-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-group {
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.info-group strong {
  color: #555;
  margin-right: 8px;
}

.set-symbol {
  height: 20px;
  width: auto;
  vertical-align: middle;
  margin-right: 8px;
}

.set-logo {
  height: 30px;
  width: auto;
  vertical-align: middle;
  margin-left: 10px;
  opacity: 0.8;
}

.attacks {
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.attack {
  margin: 10px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #4CAF50;
}

.attack-name {
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 5px;
}

.attack-cost, .attack-damage {
  font-size: 14px;
  color: #666;
}

.attack-effect {
  margin-top: 5px;
  font-style: italic;
  color: #555;
}

.raw-data {
  margin-top: 20px;
  padding: 10px;
  background: white;
  border-radius: 4px;
}

.raw-data summary {
  cursor: pointer;
  font-weight: bold;
  color: #555;
}

.raw-data pre {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}

@media (max-width: 768px) {
  .card-content {
    grid-template-columns: 1fr;
  }
}

/* Styles pour les sets */
.set-details {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  color: black;
}

.set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.set-header h2 {
  margin: 0;
  color: #333;
}

.set-logos {
  display: flex;
  gap: 20px;
  align-items: center;
}

.set-symbol-large {
  height: 60px;
  width: auto;
}

.set-logo-large {
  height: 80px;
  width: auto;
}

.set-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.card-count-list {
  margin: 5px 0;
  padding-left: 20px;
}

.card-count-list li {
  margin: 3px 0;
}

.serie-logo-inline {
  height: 25px;
  width: auto;
  vertical-align: middle;
  margin-right: 8px;
}

/* Styles pour les séries */
.serie-details {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  color: black;
}

.serie-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 10px;
}

.serie-header h2 {
  margin: 0;
  color: #333;
}

.serie-logo-large {
  height: 100px;
  width: auto;
}

.serie-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
