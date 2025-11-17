<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="pokeball-icon">⚪</span>
          PokeVault
        </h1>
        <p class="hero-subtitle">Votre collection de cartes Pokémon TCG</p>
        
        <!-- Barre de recherche -->
        <div class="search-section">
          <div class="search-box">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher une carte par nom..." 
              class="search-input"
              @keyup.enter="searchCards"
              @input="onSearchInput"
            />
            <button @click="searchCards" class="search-button">
              <span class="search-icon">🔍</span>
            </button>
          </div>
          
          <!-- Résultats de recherche -->
          <div v-if="searchResults.length > 0" class="search-results">
            <div class="results-header">
              <span>{{ searchResults.length }} résultat(s) trouvé(s)</span>
              <button @click="clearSearch" class="clear-button">✕</button>
            </div>
            <div class="results-grid">
              <div 
                v-for="card in searchResults" 
                :key="card.id" 
                class="result-card"
                @click="goToCard(card.id)"
              >
                <img 
                  v-if="card.image" 
                  :src="getCardImage(card.image)" 
                  :alt="card.name" 
                  class="result-image"
                />
                <div class="result-info">
                  <p class="result-name">{{ card.name }}</p>
                  <p class="result-set">{{ card.set?.name }}</p>
                </div>
              </div>
            </div>
          </div>

          <div v-if="searching" class="searching">
            Recherche en cours...
          </div>
        </div>

        <!-- Bouton Sets -->
        <button @click="goToSets" class="cta-button">
          <span class="button-icon">📚</span>
          Explorer les Sets
        </button>

        <!-- Stats -->
        <div class="stats" v-if="stats.totalSets > 0">
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalSets }}</span>
            <span class="stat-label">Sets</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalCards }}</span>
            <span class="stat-label">Cartes</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalSeries }}</span>
            <span class="stat-label">Séries</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="feature-card">
        <div class="feature-icon">🎴</div>
        <h3>Collection complète</h3>
        <p>Accédez à toutes les cartes du Pokémon TCG</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔍</div>
        <h3>Recherche rapide</h3>
        <p>Trouvez facilement vos cartes préférées</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Informations détaillées</h3>
        <p>Consultez toutes les stats de chaque carte</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCardImageUrl } from '../services/imageService'

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const stats = ref({
  totalSets: 0,
  totalCards: 0,
  totalSeries: 0
})

let searchTimeout = null

const getCardImage = (imageUrl) => {
  return getCardImageUrl(imageUrl, 'low', 'webp')
}

const onSearchInput = () => {
  // Debounce: attendre 500ms après la dernière frappe
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searchTimeout = setTimeout(() => {
    searchCards()
  }, 500)
}

const searchCards = async () => {
  if (searchQuery.value.trim().length < 2) {
    return
  }

  try {
    searching.value = true
    const response = await fetch(`http://localhost:3000/api/cards/search/${encodeURIComponent(searchQuery.value)}?limit=20`)
    const data = await response.json()
    
    if (data.success) {
      searchResults.value = data.data
    }
  } catch (err) {
    console.error('Erreur de recherche:', err)
  } finally {
    searching.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const goToCard = (cardId) => {
  router.push({ name: 'Card', params: { id: cardId } })
}

const goToSets = () => {
  router.push({ name: 'Sets' })
}

const fetchStats = async () => {
  try {
    // Récupérer les stats depuis l'API
    const [setsResponse, cardsResponse] = await Promise.all([
      fetch('http://localhost:3000/api/sets/by-series'),
      fetch('http://localhost:3000/api/cards?limit=1')
    ])
    
    const setsData = await setsResponse.json()
    const cardsData = await cardsResponse.json()
    
    if (setsData.success) {
      stats.value.totalSeries = setsData.data.length
      stats.value.totalSets = setsData.data.reduce((sum, serie) => sum + serie.sets.length, 0)
    }
    
    if (cardsData.success) {
      stats.value.totalCards = cardsData.pagination.total
    }
  } catch (err) {
    console.error('Erreur lors du chargement des stats:', err)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero-content {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.hero-title {
  font-size: 4rem;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.pokeball-icon {
  font-size: 3.5rem;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
}

.search-section {
  margin-bottom: 2rem;
  position: relative;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto 2rem;
  background: white;
  border-radius: 50px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.search-input {
  flex: 1;
  padding: 1.25rem 2rem;
  border: none;
  font-size: 1.1rem;
  outline: none;
}

.search-input::placeholder {
  color: #95a5a6;
}

.search-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  cursor: pointer;
  transition: background 0.3s;
}

.search-button:hover {
  background: #2980b9;
}

.search-icon {
  font-size: 1.5rem;
}

.search-results {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem auto;
  max-width: 800px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-height: 500px;
  overflow-y: auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
  font-weight: 600;
  color: #2c3e50;
}

.clear-button {
  background: #e74c3c;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.clear-button:hover {
  background: #c0392b;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.result-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.result-image {
  width: 100%;
  max-width: 120px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.result-info {
  text-align: center;
}

.result-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.result-set {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.searching {
  color: white;
  text-align: center;
  padding: 1rem;
  font-size: 1.1rem;
}

.cta-button {
  background: white;
  color: #667eea;
  border: none;
  padding: 1.25rem 3rem;
  font-size: 1.3rem;
  font-weight: 700;
  border-radius: 50px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, box-shadow 0.3s;
  margin-bottom: 3rem;
}

.cta-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.button-icon {
  font-size: 1.5rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.features {
  background: white;
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 16px;
  background: #f8f9fa;
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: #7f8c8d;
  font-size: 1rem;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .pokeball-icon {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .search-input {
    font-size: 1rem;
    padding: 1rem 1.5rem;
  }

  .cta-button {
    font-size: 1.1rem;
    padding: 1rem 2rem;
  }

  .stats {
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
