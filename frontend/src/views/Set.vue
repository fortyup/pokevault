<template>
  <div class="set-detail-view">
    <div v-if="loading" class="loading">
      Chargement...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="$router.push('/')" class="back-button">Retour aux sets</button>
    </div>

    <div v-else>
      <!-- En-tête du set -->
      <header class="set-header">
        <button @click="$router.push('/')" class="back-button">← Retour</button>
        
        <div class="set-info-header">
          <div class="set-logos">
            <img v-if="set.logo" :src="getSetLogo(set.logo)" :alt="set.name" class="set-logo" />
            <img v-if="set.symbol" :src="getSetSymbol(set.symbol)" :alt="set.name" class="set-symbol" />
          </div>
          
          <div class="set-details">
            <h1>{{ set.name }}</h1>
            <p class="serie-name">{{ set.serie?.name }}</p>
            <div class="set-meta">
              <span class="meta-item">
                <strong>Date de sortie:</strong> {{ formatDate(set.releaseDate) }}
              </span>
              <span class="meta-item">
                <strong>Cartes:</strong> {{ set.cardCount?.official || set.cardCount?.total || 0 }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Grille de cartes -->
      <section class="cards-section">
        <h2>Cartes du set</h2>
        
        <div v-if="loadingCards" class="loading">
          Chargement des cartes...
        </div>

        <div v-else-if="cards.length === 0" class="no-cards">
          Aucune carte disponible pour ce set
        </div>

        <div v-else class="cards-grid">
          <div 
            v-for="card in cards" 
            :key="card.id" 
            class="card-item"
            @click="goToCard(card.id)"
          >
            <div class="card-image-container">
              <img 
                v-if="card.image" 
                :src="getCardImage(card.image)" 
                :alt="card.name" 
                class="card-image"
                @error="handleImageError"
              />
              <div v-else class="card-placeholder">
                <span>{{ card.localId }}</span>
              </div>
            </div>
            <div class="card-info">
              <p class="card-number">{{ card.localId }}</p>
              <p class="card-name">{{ card.name }}</p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="pagination">
          <button 
            @click="loadPage(pagination.page - 1)" 
            :disabled="pagination.page === 1"
            class="page-button"
          >
            Précédent
          </button>
          <span class="page-info">
            Page {{ pagination.page }} sur {{ pagination.pages }}
          </span>
          <button 
            @click="loadPage(pagination.page + 1)" 
            :disabled="pagination.page === pagination.pages"
            class="page-button"
          >
            Suivant
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getLogoUrl, getSymbolUrl, getCardImageUrl } from '../services/imageService'

const route = useRoute()
const router = useRouter()
const set = ref({})
const cards = ref([])
const loading = ref(true)
const loadingCards = ref(true)
const error = ref(null)
const pagination = ref({
  page: 1,
  limit: 100,
  total: 0,
  pages: 0
})

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long',
    day: 'numeric'
  })
}

const getSetLogo = (logoUrl) => {
  return getLogoUrl(logoUrl, 'webp')
}

const getSetSymbol = (symbolUrl) => {
  return getSymbolUrl(symbolUrl, 'webp')
}

const getCardImage = (imageUrl) => {
  return getCardImageUrl(imageUrl, 'low', 'webp')
}

const goToCard = (cardId) => {
  router.push({ name: 'Card', params: { id: cardId } })
}

const sortByLocalId = (cardsArray) => {
  return cardsArray.sort((a, b) => {
    const aId = a.localId || ''
    const bId = b.localId || ''
    
    // Extraire toutes les parties (texte et nombres alternés)
    const aParts = aId.match(/(\d+|\D+)/g) || []
    const bParts = bId.match(/(\d+|\D+)/g) || []
    
    // Comparer partie par partie
    const maxLength = Math.max(aParts.length, bParts.length)
    for (let i = 0; i < maxLength; i++) {
      const aPart = aParts[i] || ''
      const bPart = bParts[i] || ''
      
      // Si les deux parties sont numériques, comparer en tant que nombres
      const aNum = parseInt(aPart, 10)
      const bNum = parseInt(bPart, 10)
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) {
          return aNum - bNum
        }
      } else {
        // Sinon, comparer en tant que strings
        const comparison = aPart.localeCompare(bPart)
        if (comparison !== 0) {
          return comparison
        }
      }
    }
    
    return 0
  })
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.parentElement.classList.add('image-error')
}

const fetchSet = async () => {
  try {
    loading.value = true
    const response = await fetch(`http://localhost:3000/api/sets/${route.params.id}`)
    const data = await response.json()
    
    if (data.success) {
      set.value = data.data
    } else {
      error.value = 'Set non trouvé'
    }
  } catch (err) {
    error.value = 'Impossible de charger le set'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

const fetchCards = async (page = 1) => {
  try {
    loadingCards.value = true
    const response = await fetch(`http://localhost:3000/api/sets/${route.params.id}/cards?page=${page}&limit=100`)
    const data = await response.json()
    
    if (data.success) {
      cards.value = sortByLocalId(data.data)
      pagination.value = data.pagination
    }
  } catch (err) {
    console.error('Erreur lors du chargement des cartes:', err)
  } finally {
    loadingCards.value = false
  }
}

const loadPage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    fetchCards(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchSet()
  fetchCards()
})
</script>

<style scoped>
.set-detail-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
}

.error {
  color: #e74c3c;
}

.back-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  margin-bottom: 1.5rem;
}

.back-button:hover {
  background: #2980b9;
}

.set-header {
  margin-bottom: 3rem;
}

.set-info-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.set-logos {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
}

.set-logo {
  max-width: 200px;
  max-height: 100px;
  object-fit: contain;
}

.set-symbol {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
}

.set-details h1 {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.serie-name {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.set-meta {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 1rem;
  color: #34495e;
}

.meta-item strong {
  color: #2c3e50;
}

.cards-section {
  margin-top: 2rem;
}

.cards-section h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #3498db;
}

.no-cards {
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.card-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image-container {
  aspect-ratio: 63/88;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
  font-size: 2rem;
  font-weight: bold;
  color: #999;
}

.image-error {
  background: linear-gradient(135deg, #ffe0e0 0%, #fff5f5 100%);
}

.card-info {
  padding: 1rem;
  text-align: center;
}

.card-number {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-top: 3rem;
  padding: 2rem;
}

.page-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

.page-button:hover:not(:disabled) {
  background: #2980b9;
}

.page-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.page-info {
  font-size: 1rem;
  color: #34495e;
}

@media (max-width: 768px) {
  .set-detail-view {
    padding: 1rem;
  }

  .set-logos {
    flex-direction: column;
    align-items: center;
  }

  .set-details h1 {
    font-size: 1.5rem;
  }

  .set-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
