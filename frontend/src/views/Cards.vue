<template>
  <div class="cards-search-page">
    <main class="page-shell">
      <section class="search-hero">
        <div class="search-hero__top">
          <button class="ghost-button" @click="goBack">← Retour</button>
          <span class="search-hero__badge" v-if="!loading">
            {{ filteredCards.length }} carte{{ filteredCards.length > 1 ? 's' : '' }} trouvée{{ filteredCards.length > 1 ? 's' : '' }}
          </span>
        </div>
        <div class="search-hero__body">
          <div>
            <p class="eyebrow">{{ isVariantsMode ? 'Autres impressions' : 'Résultats de recherche' }}</p>
            <h1>{{ searchQuery || 'Toutes les cartes' }}</h1>
            <p class="hero-subtitle">
              {{ isVariantsMode ? 'Toutes les cartes de ce Pokémon, toutes éditions et déclinaisons confondues.' : 'Explorez les cartes correspondant à votre recherche' }}
            </p>
          </div>
          <div v-if="!isVariantsMode" class="search-input-wrapper">
            <input 
              type="text" 
              v-model="localSearchQuery"
              @keyup.enter="performSearch"
              placeholder="Rechercher des cartes..."
              class="search-input-large"
            />
            <button @click="performSearch" class="search-btn-large">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section class="filters-section" v-if="!loading && filteredCards.length > 0">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Trier par</label>
            <select v-model="sortBy" class="filter-select">
              <option value="name">Nom</option>
              <option value="number">Numéro</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Type</label>
            <select v-model="filterType" class="filter-select">
              <option value="">Tous</option>
              <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Rareté</label>
            <select v-model="filterRarity" class="filter-select">
              <option value="">Toutes</option>
              <option v-for="rarity in availableRarities" :key="rarity" :value="rarity">{{ rarity }}</option>
            </select>
          </div>
        </div>
      </section>

      <section class="cards-section">
        <div v-if="loading" class="status-tile">Chargement des cartes...</div>
        <div v-else-if="error" class="status-tile status-tile--error">{{ error }}</div>
        <div v-else-if="!filteredCards.length" class="status-tile status-tile--empty">
          Aucune carte ne correspond à votre recherche.
        </div>
        <div v-else class="cards-grid">
          <article
            v-for="card in paginatedCards"
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
                loading="lazy"
                @error="handleImageError(card.id, $event)"
              />
              <div v-else class="card-placeholder">
                <img
                  :src="placeholderCard"
                  :alt="`Illustration manquante pour ${card.name || card.localId}`"
                  class="card-image card-image--placeholder"
                />
              </div>
            </div>
            <div class="card-item__info">
              <h3 v-if="isVariantsMode">{{ card.set?.name || 'Set inconnu' }}</h3>
              <h3 v-else>{{ card.name || 'Sans nom' }}</h3>
              <p class="card-number">#{{ card.localId || '—' }}</p>
              <p class="card-set" v-if="!isVariantsMode">{{ card.set?.name || 'Set inconnu' }}</p>
              <p class="card-rarity">{{ card.rarity || 'Rareté inconnue' }}</p>
            </div>
          </article>
        </div>

        <div v-if="filteredCards.length > cardsPerPage" class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            ← Précédent
          </button>
          <span class="pagination-info">
            Page {{ currentPage }} sur {{ totalPages }}
          </span>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Suivant →
          </button>
        </div>
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
const localSearchQuery = ref('')
const sortBy = ref('name')
const filterType = ref('')
const filterRarity = ref('')
const currentPage = ref(1)
const cardsPerPage = 50
const PAGE_STORAGE_KEY = 'pokevault-cards-pagination-state'

// Mode variants : recherche des cartes avec le même nom de Pokémon
const isVariantsMode = computed(() => Boolean(route.params.name))
const excludedId = computed(() => route.query.exclude || '')
const targetDexId = computed(() => {
  const raw = route.query.dexId
  if (raw === undefined || raw === null || raw === '') return ''
  if (Array.isArray(raw)) return normalizeDexValue(raw[0])
  return normalizeDexValue(raw)
})

const searchQuery = computed(() => {
  if (isVariantsMode.value) {
    return route.params.name
  }
  return route.query.search || ''
})

// Fonctions de normalisation pour le mode variants
const stripAccents = (value = '') => value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
const sanitizeName = (value = '') =>
  stripAccents(value)
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[-_/]/g, ' ')
    .replace(/[^a-z0-9& ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const SINGLE_WORD_VARIANTS = new Set([
  'gx', 'ex', 'v', 'vstar', 'vmax', 'vm', 'break', 'prime', 'sp', 'g', 'fb', 'gl', 'c', 'lvl', 'lv', 'lvx', 'ra', 'radiant'
])

const TWO_WORD_VARIANTS = ['v union', 'delta species']
const PREFIX_VARIANTS = new Set(['mega', 'méga', 'megaevolution', 'mega evolution', 'primal'])

const computeBaseName = (value = '') => {
  const sanitized = sanitizeName(value)
  if (!sanitized) return ''

  const tokens = sanitized.split(' ')
  if (!tokens.length) return ''

  while (tokens.length && PREFIX_VARIANTS.has(tokens[0])) {
    tokens.shift()
  }

  const stripSuffix = () => {
    let removed = false
    if (tokens.length >= 2) {
      const lastTwo = tokens.slice(-2).join(' ')
      if (TWO_WORD_VARIANTS.includes(lastTwo)) {
        tokens.splice(-2, 2)
        removed = true
      }
    }
    if (!removed && tokens.length) {
      const last = tokens[tokens.length - 1]
      if (SINGLE_WORD_VARIANTS.has(last)) {
        tokens.pop()
        removed = true
      }
    }
    return removed
  }

  while (stripSuffix()) {}

  return tokens.join(' ')
}

const normalizeDexValue = (value) => {
  if (value === undefined || value === null) return ''
  const numeric = Number(value)
  return Number.isNaN(numeric) ? String(value).trim() : String(numeric)
}

const normalizedTarget = computed(() => computeBaseName(searchQuery.value))

const matchesDexId = (cardDexIds) => {
  if (!targetDexId.value) return false
  if (Array.isArray(cardDexIds)) {
    return cardDexIds.some((entry) => normalizeDexValue(entry) === targetDexId.value)
  }
  return normalizeDexValue(cardDexIds) === targetDexId.value
}

const availableTypes = computed(() => {
  const types = new Set()
  cards.value.forEach(card => {
    if (card.types && Array.isArray(card.types)) {
      card.types.forEach(type => types.add(type))
    }
  })
  return Array.from(types).sort()
})

const availableRarities = computed(() => {
  const rarities = new Set()
  cards.value.forEach(card => {
    if (card.rarity) rarities.add(card.rarity)
  })
  return Array.from(rarities).sort()
})

const filteredCards = computed(() => {
  let result = [...cards.value]

  // En mode variants, filtrer par nom de base ou dexId
  if (isVariantsMode.value) {
    const hasDexFilter = Boolean(targetDexId.value)
    result = result.filter((card) => {
      const sameName = hasDexFilter
        ? matchesDexId(card.dexId)
        : computeBaseName(card.name || '') === normalizedTarget.value
      const notExcluded = !excludedId.value || card.id !== excludedId.value
      return sameName && notExcluded
    })
  }

  // Filtrer par type
  if (filterType.value) {
    result = result.filter(card => 
      card.types && card.types.includes(filterType.value)
    )
  }

  // Filtrer par rareté
  if (filterRarity.value) {
    result = result.filter(card => card.rarity === filterRarity.value)
  }

  // Trier
  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '')
      case 'set':
        return (a.set?.name || '').localeCompare(b.set?.name || '')
      case 'number':
        return (a.localId || 0) - (b.localId || 0)
      default:
        return 0
    }
  })

  return result
})

const totalPages = computed(() => Math.ceil(filteredCards.value.length / cardsPerPage))

const paginatedCards = computed(() => {
  const start = (currentPage.value - 1) * cardsPerPage
  const end = start + cardsPerPage
  return filteredCards.value.slice(start, end)
})

const getCardImage = (imageUrl) => getCardImageUrl(imageUrl, 'low', 'webp')

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

const goBack = () => {
  router.back()
}

const performSearch = () => {
  if (localSearchQuery.value.trim()) {
    router.push({
      path: '/cards',
      query: { search: localSearchQuery.value.trim() }
    })
  }
}

const readPaginationState = () => {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(PAGE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    console.warn('Impossible de lire la pagination sauvegardée:', err)
    return {}
  }
}

const writePaginationState = (state) => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PAGE_STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.warn('Impossible d\'écrire la pagination sauvegardée:', err)
  }
}

const buildPaginationKey = () => {
  const context = isVariantsMode.value ? 'variants' : 'search'
  return [
    context,
    searchQuery.value || 'all',
    targetDexId.value || 'none',
    filterType.value || 'all',
    filterRarity.value || 'all',
    sortBy.value || 'name'
  ].join('|')
}

const clampPageToAvailable = (page) => {
  if (!Number.isFinite(page) || page < 1) return 1
  const total = totalPages.value
  if (!Number.isFinite(total) || total < 1) return 1
  return Math.min(page, total)
}

const restorePaginationFromStorage = () => {
  if (typeof window === 'undefined') return false
  const store = readPaginationState()
  const saved = store[buildPaginationKey()]
  if (typeof saved === 'number' && saved >= 1) {
    currentPage.value = clampPageToAvailable(saved)
    return true
  }
  return false
}

const persistPaginationToStorage = () => {
  if (typeof window === 'undefined') return
  const store = readPaginationState()
  store[buildPaginationKey()] = currentPage.value
  writePaginationState(store)
}

const applyStoredPaginationOrReset = () => {
  if (!restorePaginationFromStorage()) {
    currentPage.value = 1
  }
}

const fetchCards = async () => {
  const hasDexFilter = Boolean(targetDexId.value)

  if (isVariantsMode.value && !hasDexFilter && !normalizedTarget.value) {
    error.value = 'Nom de carte manquant'
    loading.value = false
    cards.value = []
    return
  }

  try {
    loading.value = true
    error.value = null
    
    const params = new URLSearchParams()
    
    if (isVariantsMode.value) {
      // Mode variants : recherche par dexId ou nom de base
      params.append('limit', '200')
      if (hasDexFilter) {
        params.append('dexId', targetDexId.value)
      } else {
        params.append('name', normalizedTarget.value)
      }
    } else {
      // Mode recherche normale
      if (searchQuery.value) {
        params.append('name', searchQuery.value)
        params.append('limit', '500')
      } else {
        params.append('limit', '100')
      }
    }

    const response = await fetch(`http://localhost:3000/api/cards?${params.toString()}`)
    const data = await response.json()

    if (!data.success) {
      throw new Error('Réponse API invalide')
    }

    cards.value = data.data || []
    applyStoredPaginationOrReset()
  } catch (err) {
    console.error('Erreur lors du chargement des cartes:', err)
    error.value = "Impossible de charger les cartes."
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.params.name, route.query.search, route.query.exclude, route.query.dexId],
  () => {
    localSearchQuery.value = searchQuery.value
    erroredCards.value = new Set()
    fetchCards()
  }
)

watch([filterType, filterRarity, sortBy], () => {
  applyStoredPaginationOrReset()
})

watch(currentPage, () => {
  persistPaginationToStorage()
})

watch(totalPages, (next) => {
  if (!Number.isFinite(next) || next < 1) {
    if (currentPage.value !== 1) {
      currentPage.value = 1
    }
    return
  }

  if (currentPage.value > next) {
    currentPage.value = next
  }
})

onMounted(() => {
  localSearchQuery.value = searchQuery.value
  fetchCards()
})
</script>

<style scoped>
.cards-search-page {
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

.ghost-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-hero {
  border-radius: 36px;
  padding: 2.5rem;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 60%),
    rgba(12, 12, 12, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
  margin-bottom: 2rem;
}

.search-hero__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.search-hero__badge {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.9rem;
}

.search-hero__body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0.35rem;
}

.search-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #fff;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.7);
  max-width: 520px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  max-width: 600px;
  transition: all 0.2s ease;
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.2);
}

.search-input-large {
  flex: 1;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  outline: none;
  padding: 0.5rem 0.75rem;
}

.search-input-large::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-btn-large {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-btn-large:hover {
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.95);
  transform: scale(1.05);
}

.filters-section {
  border-radius: 24px;
  padding: 1.5rem 2rem;
  background: rgba(10, 10, 10, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 2rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
}

.filter-select {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.2);
}

.filter-select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.3);
}

.cards-section {
  border-radius: 32px;
  padding: 2rem;
  background: rgba(10, 10, 10, 0.7);
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
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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
}

.card-item__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent 65%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.card-item:hover .card-item__glow {
  opacity: 1;
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

.card-item__info {
  padding: 1rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.card-item__info h3 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

.card-number,
.card-set,
.card-rarity {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.image-error {
  background: linear-gradient(180deg, rgba(255, 145, 145, 0.15), rgba(255, 225, 225, 0.05));
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.pagination-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-info {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .page-shell {
    padding: 0 1rem;
  }

  .search-hero {
    padding: 1.5rem;
  }

  .cards-section {
    padding: 1.5rem;
  }

  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input-wrapper {
    max-width: 100%;
  }
}
</style>
