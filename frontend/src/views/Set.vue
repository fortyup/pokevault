<template>
  <div class="set-page">
    <main class="page-shell">
      <div v-if="loading" class="status-tile">
        Chargement du set...
      </div>

      <div v-else-if="error" class="status-tile status-tile--error">
        {{ error }}
        <button class="ghost-button" @click="goBack">Retour aux sets</button>
      </div>

      <div v-else>
        <section class="set-hero">
          <div class="set-hero__top">
            <button class="ghost-button" @click="goBack">← Liste des sets</button>
            <span class="set-hero__badge">{{ releaseBadge }}</span>
          </div>
          <div class="set-hero__body">
            <div class="set-hero__content">
              <p class="set-hero__serie">{{ set.serie?.name || 'Série inconnue' }}</p>
              <div class="set-hero__title">
                <h1>{{ set.name }}</h1>
                <img
                  v-if="set.symbol"
                  :src="getSetSymbol(set.symbol)"
                  :alt="`${set.name} symbol`"
                  class="set-symbol set-symbol--inline"
                />
              </div>
              <p class="set-hero__subtitle">{{ heroSubtitle }}</p>
              <div class="set-hero__meta">
                <div class="meta-card">
                  <span class="meta-label">Cartes officielles</span>
                  <strong>{{ officialCount }}</strong>
                </div>
                <div class="meta-card">
                  <span class="meta-label">Cartes importées</span>
                  <strong>{{ cardsSynced }}</strong>
                </div>
                <div class="meta-card">
                  <span class="meta-label">Date de sortie</span>
                  <strong>{{ releaseBadge }}</strong>
                </div>
              </div>
            </div>
            <div class="set-hero__visual">
              <div class="set-hero__orb"></div>
              <img :src="heroLogo" :alt="set.name" class="set-logo" />
            </div>
          </div>
        </section>

        <section class="cards-section">
          <header class="cards-section__header">
            <div>
              <p class="eyebrow">Collection complète</p>
              <h2>Cartes du set</h2>
            </div>
            <p class="cards-section__count">{{ cards.length }} / {{ cardsSynced }} cartes affichées</p>
          </header>

          <div v-if="loadingCards" class="cards-status">
            Chargement des cartes...
          </div>

          <div v-else-if="cards.length === 0" class="cards-status cards-status--empty">
            Aucune carte disponible pour ce set
          </div>

          <div v-else class="cards-grid">
            <article
              v-for="card in cards"
              :key="card.id"
              class="card-item"
              @click="goToCard(card.id)"
            >
              <div class="card-item__visual" :class="{ 'image-error': erroredCards.has(card.id) }">
                <div class="card-item__glow"></div>
                <img
                  v-if="card.image && !erroredCards.has(card.id)"
                  :src="getCardImage(card.image)"
                  :alt="card.name"
                  class="card-image"
                  @error="handleImageError(card.id, $event)"
                />
                <div v-else class="card-placeholder">
                  <img
                    :src="placeholderCard"
                    :alt="`Illustration manquante pour ${card.name || card.localId}`"
                    class="card-image card-image--placeholder"
                    loading="lazy"
                  />
                  <span class="card-placeholder__badge">#{{ card.localId ?? '—' }}</span>
                </div>
              </div>
              <div class="card-item__info">
                <p class="card-number">#{{ card.localId }}</p>
                <h3>{{ card.name }}</h3>
                <p class="card-rarity" v-if="card.rarity">{{ card.rarity }}</p>
              </div>
            </article>
          </div>

          <div v-if="pagination.pages > 1" class="pagination">
            <button
              @click="loadPage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              class="ghost-button"
            >
              Précédent
            </button>
            <span class="page-info">
              Page {{ pagination.page }} / {{ pagination.pages }}
            </span>
            <button
              @click="loadPage(pagination.page + 1)"
              :disabled="pagination.page === pagination.pages"
              class="ghost-button"
            >
              Suivant
            </button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderLogo from '@/assets/placeholder_logo.png'
import popLogo from '@/assets/pop_logo.png'
import placeholderCard from '@/assets/placeholder_card.png'
import { getLogoUrl, getSymbolUrl, getCardImageUrl } from '../services/imageService'

const route = useRoute()
const router = useRouter()
const set = ref({})
const cards = ref([])
const erroredCards = ref(new Set())
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

const getSetLogo = (logoUrl, setData) => {
  if (logoUrl) return getLogoUrl(logoUrl, 'webp')
  
  // Check if it's a POP series set
  const isPop = setData?.id?.toLowerCase().includes('pop') || 
                setData?.name?.toLowerCase().includes('pop')
  
  return isPop ? popLogo : placeholderLogo
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

const goBack = () => {
  router.push('/sets')
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

const handleImageError = (cardId, event) => {
  const updated = new Set(erroredCards.value)
  updated.add(cardId)
  erroredCards.value = updated

  if (event?.target?.parentElement) {
    event.target.parentElement.classList.add('image-error')
  }
}

const heroLogo = computed(() => getSetLogo(set.value.logo, set.value))

const officialCount = computed(() => {
  const count = set.value.cardCount?.official ?? set.value.cardCount?.total
  return count ? count.toString() : '—'
})

const cardsSynced = computed(() => {
  return pagination.value.total || cards.value.length || 0
})

const releaseBadge = computed(() => formatDate(set.value.releaseDate))

const heroSubtitle = computed(() => {
  const fragments = []
  if (officialCount.value !== '—') {
    fragments.push(`${officialCount.value} cartes référencées`)
  }
  if (set.value.serie?.name) {
    fragments.push(`Série ${set.value.serie.name}`)
  }
  if (releaseBadge.value && releaseBadge.value !== 'Date inconnue') {
    fragments.push(`Sorti le ${releaseBadge.value}`)
  }
  return fragments.join(' • ') || 'Découvrez toutes les cartes disponibles de ce set.'
})

const setStats = computed(() => [
  { value: officialCount.value, label: 'Cartes officielles' },
  { value: `${cardsSynced.value}`, label: 'Cartes synchronisées' },
  { value: releaseBadge.value, label: 'Date de sortie' },
  { value: set.value.serie?.name || 'Série inconnue', label: 'Série' }
])

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
      // Sauvegarde la page courante dans le local storage
      localStorage.setItem(`setPage-${route.params.id}`, String(page))
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
  // Récupère la page sauvegardée pour ce set, sinon 1
  const savedPage = parseInt(localStorage.getItem(`setPage-${route.params.id}`), 10)
  const initialPage = (!isNaN(savedPage) && savedPage > 0) ? savedPage : 1
  fetchCards(initialPage)
})
</script>

<style scoped>
.set-page {
  padding: 2rem 0 6rem;
}

.set-page .page-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.status-tile {
  margin: 3rem auto;
  padding: 2.5rem;
  max-width: 640px;
  text-align: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.status-tile--error {
  color: #ffb4b4;
  border-color: rgba(255, 0, 0, 0.4);
}

.ghost-button {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #f8fafc;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.ghost-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ghost-button:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.set-hero {
  position: relative;
  border-radius: 36px;
  padding: 2.5rem;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 60%),
    rgba(10, 10, 10, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.set-hero::after {
  content: '';
  position: absolute;
  inset: 10% 40% -40% 10%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent);
  filter: blur(60px);
}

.set-hero__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.set-hero__badge {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.set-hero__body {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.set-hero__content {
  flex: 1 1 360px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.set-hero__serie {
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.set-hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin: 0;
  background: linear-gradient(120deg, #ffffff, #cbd5f5);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.set-hero__title {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.set-hero__subtitle {
  color: rgba(255, 255, 255, 0.75);
  max-width: 520px;
}

.set-hero__meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-card {
  flex: 1 1 160px;
  padding: 1rem 1.2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.meta-label {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.35rem;
}

.meta-card strong {
  font-size: 1.25rem;
  color: #ffffff;
}

.set-hero__visual {
  flex: 1 1 260px;
  min-height: 280px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.set-hero__orb {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent 70%);
  filter: blur(40px);
}

.set-logo {
  width: 60%;
  height: 60%;
  object-fit: contain;
  filter: drop-shadow(0 18px 32px rgba(0, 0, 0, 0.5));
  position: relative;
  z-index: 1;
}

.set-symbol {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55));
}

.set-symbol--inline {
  width: 40px;
  height: 40px;
}

.cards-section {
  margin-top: 5rem;
  padding: 0 0 1rem;
}

.cards-section__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.eyebrow {
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 0.35rem;
}

.cards-section__header h2 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  color: #ffffff;
}

.cards-section__count {
  color: rgba(255, 255, 255, 0.65);
}

.cards-status {
  text-align: center;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.02);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.75rem;
}

.card-item {
  position: relative;
  border-radius: 20px 20px 28px 28px;

  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(20, 20, 20, 0.95), rgba(5, 5, 5, 0.85));
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
}

.card-item__visual {
  position: relative;
  aspect-ratio: 245 / 337;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
}

.card-item__glow {
  position: absolute;
  inset: 20% 10% auto;
  height: 60%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%);
  filter: blur(40px);
}

.card-image {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  border-radius: 18px;
}

.card-placeholder {
  position: relative;
  aspect-ratio: 33 / 46;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-image--placeholder {
  filter: saturate(0) brightness(1.2);
  opacity: 0.7;
}

.card-item__visual.image-error {
  background: linear-gradient(135deg, rgba(255, 224, 224, 0.2), rgba(255, 245, 245, 0.05));
}

.card-item__info {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card-number {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.45);
}

.card-item__info h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #ffffff;
}

.card-rarity {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.pagination {
  margin-top: 3rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  align-items: center;
}

.page-info {
  color: rgba(255, 255, 255, 0.65);
}

@media (max-width: 768px) {
  .set-page .page-shell {
    padding: 0 1rem;
  }

  .set-hero {
    padding: 2rem;
  }

  .set-hero__meta {
    flex-direction: column;
  }

  .set-hero__visual {
    width: 100%;
    min-height: 220px;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 520px) {
  .set-hero__content {
    gap: 0.75rem;
  }

  .meta-card {
    width: 100%;
  }

  .cards-section__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
