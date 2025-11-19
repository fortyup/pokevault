<template>
  <div class="illustrator-page">
    <main class="page-shell">
      <section class="illustrator-hero">
        <div class="illustrator-hero__top">
          <button class="ghost-button" @click="goBack">← Retour</button>
          <span v-if="cards.length" class="illustrator-hero__badge">
            {{ cards.length }} cartes répertoriées
          </span>
        </div>
        <div class="illustrator-hero__body">
          <div>
            <p class="eyebrow">Illustrateur</p>
            <h1>{{ displayName }}</h1>
            <p class="hero-subtitle">
              Toutes les cartes officielles illustrées par {{ displayName }} et disponibles dans Pokévault.
            </p>
          </div>
          <div v-if="cards.length" class="illustrator-meta">
            <div class="meta-card">
              <span class="meta-label">Sets couverts</span>
              <strong>{{ distinctSets }}</strong>
            </div>
            <div class="meta-card">
              <span class="meta-label">Raretés uniques</span>
              <strong>{{ distinctRarities }}</strong>
            </div>
            <div v-if="activeYears" class="meta-card">
              <span class="meta-label">Période d'activité</span>
              <strong>{{ activeYears }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="cards-section">
        <div v-if="loading" class="status-tile">Chargement des illustrations...</div>
        <div v-else-if="error" class="status-tile status-tile--error">{{ error }}</div>
        <div v-else-if="!cards.length" class="status-tile status-tile--empty">
          Aucune carte illustrée par {{ displayName }} n'a encore été importée.
        </div>
        <template v-else>
          <div class="cards-grid">
            <article
              v-for="card in cards"
              :key="card.id"
              class="card-item"
              @click="goToCard(card.id)"
            >
              <div class="card-item__visual" :class="{ 'image-error': erroredCards.has(card.id) }">
                <img
                  v-if="card.image && !erroredCards.has(card.id)"
                  :src="getCardImage(card.image)"
                  :alt="card.name"
                  class="card-image"
                  loading="lazy"
                  @error="handleImageError(card.id, $event)"
                />
                <div v-else class="card-placeholder">
                  <img
                    :src="placeholderCard"
                    :alt="`Illustration manquante pour ${card.name || card.localId}`"
                    class="card-image card-image--placeholder"
                  />
                  <span class="card-placeholder__badge">#{{ card.localId ?? '—' }}</span>
                </div>
              </div>
              <div class="card-item__info">
                <div class="card-item__header">
                  <p class="card-set-name" @click.stop="goToSet(card.set?.id)">
                    {{ card.set?.name || 'Set inconnu' }}
                  </p>
                  <span class="card-release" v-if="card.set?.releaseDate">
                    {{ formatReleaseDate(card.set.releaseDate) }}
                  </span>
                </div>
                <h3>{{ card.name || card.localId }}</h3>
                <div class="card-item__meta">
                  <span class="card-number">#{{ card.localId || '—' }}</span>
                  <span class="card-rarity">{{ card.rarity || 'Rareté inconnue' }}</span>
                </div>
              </div>
            </article>
          </div>

          <div v-if="totalPages > 1" class="pagination-bar">
            <button class="pagination-button" :disabled="currentPage === 1" @click="prevPage">
              ← Précédent
            </button>
            <div class="pagination-pages">
              <button
                v-for="page in paginationWindow"
                :key="page"
                class="pagination-button"
                :class="{ 'pagination-button--active': page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button
              class="pagination-button"
              :disabled="currentPage === totalPages"
              @click="nextPage"
            >
              Suivant →
            </button>
            <span class="pagination-summary">{{ paginationSummary }}</span>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderCard from '@/assets/placeholder_card.png'
import { getCardImageUrl } from '../services/imageService'

const route = useRoute()
const router = useRouter()

const cards = ref([])
const loading = ref(true)
const error = ref(null)
const erroredCards = ref(new Set())
const currentPage = ref(1)
const totalPages = ref(1)
const totalCards = ref(0)
const pageSize = 100

const paginationSummary = computed(() => {
  if (!totalCards.value) return ''
  const start = (currentPage.value - 1) * pageSize + 1
  const end = Math.min(currentPage.value * pageSize, totalCards.value)
  return `${start}–${end} sur ${totalCards.value}`
})

const paginationWindow = computed(() => {
  const pages = []
  if (!totalPages.value) return pages

  const windowSize = 5
  let start = Math.max(1, currentPage.value - Math.floor(windowSize / 2))
  let end = start + windowSize - 1

  if (end > totalPages.value) {
    end = totalPages.value
    start = Math.max(1, end - windowSize + 1)
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  return pages
})

const displayName = computed(() => route.params.illustrator || 'Illustrateur inconnu')

const distinctSets = computed(() => {
  const ids = new Set(cards.value.map((card) => card.set?.id).filter(Boolean))
  return ids.size
})

const distinctRarities = computed(() => {
  const rarities = new Set(cards.value.map((card) => card.rarity).filter(Boolean))
  return rarities.size
})

const activeYears = computed(() => {
  const years = cards.value
    .map((card) => card.set?.releaseDate)
    .filter(Boolean)
    .map((date) => new Date(date).getFullYear())
    .filter((year) => !Number.isNaN(year))

  if (!years.length) return ''

  const min = Math.min(...years)
  const max = Math.max(...years)
  return min === max ? `${min}` : `${min} - ${max}`
})

const getCardImage = (imageUrl) => getCardImageUrl(imageUrl, 'low', 'webp')

const formatReleaseDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

const handleImageError = (cardId, event) => {
  const updated = new Set(erroredCards.value)
  updated.add(cardId)
  erroredCards.value = updated

  if (event?.target?.parentElement) {
    event.target.parentElement.classList.add('image-error')
  }
}

const goToCard = (cardId) => {
  router.push({ name: 'Card', params: { id: cardId } })
}

const goToSet = (setId) => {
  if (!setId) return
  router.push({ name: 'Set', params: { id: setId } })
}

const goBack = () => {
  router.back()
}

const sortCards = (list) => {
  return [...list].sort((a, b) => {
    const dateA = new Date(a.set?.releaseDate || 0).getTime()
    const dateB = new Date(b.set?.releaseDate || 0).getTime()
    if (dateB !== dateA) return dateB - dateA

    const setNameA = a.set?.name || ''
    const setNameB = b.set?.name || ''
    if (setNameA !== setNameB) return setNameA.localeCompare(setNameB)

    const localA = a.localId ? String(a.localId).padStart(3, '0') : ''
    const localB = b.localId ? String(b.localId).padStart(3, '0') : ''
    return localA.localeCompare(localB)
  })
}

const fetchCards = async () => {
  const illustrator = route.params.illustrator

  if (!illustrator) {
    error.value = 'Illustrateur introuvable'
    loading.value = false
    cards.value = []
    return
  }

  try {
    loading.value = true
    error.value = null
    erroredCards.value = new Set()

    const params = new URLSearchParams()
    params.append('limit', pageSize.toString())
    params.append('page', currentPage.value.toString())
    params.append('illustrator', illustrator)

    const response = await fetch(`http://localhost:3000/api/cards?${params.toString()}`)
    const data = await response.json()

    if (!data.success) {
      throw new Error('Réponse API invalide')
    }

    cards.value = sortCards(data.data || [])
    totalCards.value = data.pagination?.total ?? cards.value.length
    totalPages.value = data.pagination?.pages ?? 1
  } catch (err) {
    console.error('Erreur lors du chargement des cartes par illustrateur:', err)
    error.value = `Impossible de charger les cartes dessinées par ${displayName.value}.`
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value += 1
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value -= 1
  }
}

watch(
  () => route.params.illustrator,
  () => {
    currentPage.value = 1
    fetchCards()
  }
)

watch(
  () => currentPage.value,
  (newPage, oldPage) => {
    if (newPage === oldPage) return
    fetchCards()
  }
)

onMounted(() => {
  fetchCards()
})
</script>

<style scoped>
.illustrator-page {
  padding: 2rem 0 6rem;
}

.page-shell {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.ghost-button {
  padding: 0.6rem 1.35rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #f8fafc;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.ghost-button:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

.illustrator-hero {
  border-radius: 36px;
  padding: 2.5rem;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 60%),
    rgba(12, 12, 12, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
  margin-bottom: 2.5rem;
}

.illustrator-hero__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.illustrator-hero__badge {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
}

.illustrator-hero__body {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.35rem;
}

.illustrator-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #fff;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.75);
  max-width: 520px;
}

.illustrator-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-card {
  padding: 1rem 1.5rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #fff;
  min-width: 160px;
}

.meta-label {
  display: block;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 0.2rem;
}

.cards-section {
  border-radius: 32px;
  padding: 2rem;
  background: rgba(10, 10, 10, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 35px 90px rgba(0, 0, 0, 0.55);
}

.status-tile {
  padding: 2.5rem;
  text-align: center;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
}

.status-tile--error {
  color: #ffb4b4;
  border-color: rgba(255, 0, 0, 0.4);
}

.status-tile--empty {
  color: rgba(255, 255, 255, 0.7);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.card-item {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(25, 25, 25, 0.7), rgba(5, 5, 5, 0.95));
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.55);
}

.card-item__visual {
  position: relative;
  padding: 1.25rem;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
}

.card-image {
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.65);
}

.card-placeholder {
  position: relative;
  aspect-ratio: 63 / 88;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-image--placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.card-placeholder__badge {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 0.85rem;
}

.card-item__info {
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.card-item__header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: baseline;
}

.card-set-name {
  margin: 0;
  color: rgba(94, 234, 212, 0.95);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.card-set-name:hover {
  text-decoration: underline;
}

.card-release {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.card-item__info h3 {
  margin: 0;
  color: #fff;
  font-size: 1.15rem;
}

.card-item__meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.card-number,
.card-rarity {
  margin: 0;
}

.image-error {
  background: linear-gradient(180deg, rgba(255, 145, 145, 0.15), rgba(255, 225, 225, 0.05));
}

.pagination-bar {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
}

.pagination-button {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(3, 7, 18, 0.7);
  color: #f8fafc;
  border-radius: 999px;
  padding: 0.5rem 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.pagination-button--active {
  background: rgba(250, 204, 21, 0.15);
  border-color: rgba(250, 204, 21, 0.6);
  color: #fde68a;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:not(:disabled):hover {
  border-color: rgba(255, 255, 255, 0.65);
  transform: translateY(-1px);
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
}

.pagination-summary {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .page-shell {
    padding: 0 1rem;
  }

  .cards-section {
    padding: 1.5rem;
  }
}
</style>
