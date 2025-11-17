<template>
  <div class="sets-view">
    <header class="header">
      <button @click="goToHome" class="back-button">← Accueil</button>
      <h1>Collection de Sets Pokémon</h1>
      <p class="subtitle">{{ totalSets }} sets répartis dans {{ series.length }} séries</p>
    </header>

    <div v-if="loading" class="loading">
      Chargement des sets...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else class="series-container">
      <section v-for="serie in series" :key="serie.id" class="serie-section">
        <h2 class="serie-title">
          {{ serie.name }}
          <span class="serie-count">({{ serie.sets.length }} sets)</span>
        </h2>
        
        <div class="sets-grid">
          <div v-for="set in serie.sets" :key="set.id" class="set-card" @click="goToSet(set.id)">
            <div class="set-header">
              <img v-if="set.logo" :src="getSetLogo(set.logo)" :alt="set.name" class="set-logo" />
              <img v-if="set.symbol" :src="getSetSymbol(set.symbol)" :alt="set.name" class="set-symbol" />
            </div>
            
            <div class="set-info">
              <h3 class="set-name">{{ set.name }}</h3>
              <div class="set-details">
                <span class="set-date">{{ formatDate(set.releaseDate) }}</span>
                <span class="set-cards">{{ set.cardCount?.official || set.cardCount?.total || 0 }} cartes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getLogoUrl, getSymbolUrl } from '../services/imageService'

const router = useRouter()

const series = ref([])
const loading = ref(true)
const error = ref(null)

const totalSets = computed(() => {
  return series.value.reduce((sum, serie) => sum + serie.sets.length, 0)
})

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long'
  })
}

const getSetLogo = (logoUrl) => {
  return getLogoUrl(logoUrl)
}

const getSetSymbol = (symbolUrl) => {
  return getSymbolUrl(symbolUrl)
}

const goToSet = (setId) => {
  router.push(`/set/${setId}`)
}

const goToHome = () => {
  router.push('/')
}

const fetchSeries = async () => {
  try {
    loading.value = true
    const response = await fetch('http://localhost:3000/api/sets/by-series')
    const data = await response.json()
    
    if (data.success) {
      // Trier chaque série par date de sortie (du plus récent au plus ancien)
      const sortedData = data.data.map(serie => ({
        ...serie,
        sets: [...serie.sets].sort((a, b) => {
          const dateA = new Date(a.releaseDate || 0)
          const dateB = new Date(b.releaseDate || 0)
          return dateB - dateA // Tri décroissant (plus récent en premier)
        })
      }))

      // Fonction pour obtenir la date du set le plus récent d'une série
      const getMostRecentDate = (serie) => {
        if (!serie.sets.length) return new Date(0)
        const dates = serie.sets.map(set => new Date(set.releaseDate || 0))
        return new Date(Math.max(...dates))
      }

      // Trier les séries : d'abord les sets promo, puis le reste par date décroissante
      const finalSortedData = sortedData.map(serie => ({
        ...serie,
        sets: [...serie.sets].sort((a, b) => {
          const isPromoA = a.name.toLowerCase().includes('promo')
          const isPromoB = b.name.toLowerCase().includes('promo')
          
          // Si un est promo et pas l'autre, le promo vient en premier
          if (isPromoA && !isPromoB) return -1
          if (!isPromoA && isPromoB) return 1
          
          // Sinon, tri par date (déjà fait précédemment, on garde l'ordre)
          return 0
        })
      }))
      
      // Trier les séries par date du set le plus récent
      finalSortedData.sort((a, b) => {
        return getMostRecentDate(b) - getMostRecentDate(a)
      })

      series.value = finalSortedData
    } else {
      error.value = 'Erreur lors du chargement des sets'
    }
  } catch (err) {
    error.value = 'Impossible de se connecter au serveur'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSeries()
})
</script>

<style scoped>
.sets-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
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
  display: inline-block;
}

.back-button:hover {
  background: #2980b9;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
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

.serie-section {
  margin-bottom: 3rem;
}

.serie-title {
  font-size: 1.8rem;
  color: #34495e;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #3498db;
}

.serie-count {
  font-size: 1rem;
  color: #95a5a6;
  font-weight: normal;
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.set-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.set-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.set-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 120px;
}

.set-logo {
  max-width: 140px;
  max-height: 80px;
  object-fit: contain;
}

.set-symbol {
  max-width: 50px;
  max-height: 50px;
  object-fit: contain;
}

.set-info {
  padding: 1.5rem;
}

.set-name {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.set-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.set-date {
  font-style: italic;
}

.set-cards {
  background: #ecf0f1;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .sets-view {
    padding: 1rem;
  }

  .header h1 {
    font-size: 2rem;
  }

  .serie-title {
    font-size: 1.5rem;
  }

  .sets-grid {
    grid-template-columns: 1fr;
  }
}
</style>
