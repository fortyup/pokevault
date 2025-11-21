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
                      <div class="cards-filters">
                        <div class="filters-left">
                          <input
                            v-model="filters.q"
                            type="search"
                            placeholder="Rechercher par nom, #..."
                            class="filter-input"
                            @input="onFilterChange"
                          />
                        </div>

                        <div class="filters-right">
                          <div class="filter-row">
                            <div class="filter-row__title">Raretés</div>
                            <div class="filter-pills scroll-x">
                              <button
                                class="filter-pill filter-pill--all"
                                :class="{ 'filter-pill--active': filters.rarities.length === 0 }"
                                @click="clearRarities"
                                title="Afficher toutes les raretés"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>

                              <button
                                v-for="r in availableRarities"
                                :key="r"
                                class="filter-pill"
                                :class="{ 'filter-pill--active': filters.rarities.includes(r) }"
                                @click="() => toggleRarity(r)"
                                :title="`Filtrer par ${r}`"
                              >
                                <img v-if="getRarityIcon(r)" :src="getRarityIcon(r)" :alt="r" class="pill-icon-img" />
                                <span class="pill-label" v-else>{{ r }}</span>
                                <span class="pill-count">{{ rarityCounts[r] || 0 }}</span>
                              </button>
                            </div>
                          </div>

                          <div class="filter-row">
                            <div class="filter-row__title">Types</div>
                            <div class="filter-pills scroll-x">
                              <button
                                class="filter-pill filter-pill--all"
                                :class="{ 'filter-pill--active': filters.types.length === 0 }"
                                @click="clearTypes"
                                title="Afficher tous les types"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                                  <path d="M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </button>

                              <button
                                v-for="t in availableTypes"
                                :key="t"
                                class="filter-pill"
                                :class="{ 'filter-pill--active': filters.types.includes(t) }"
                                @click="() => toggleType(t)"
                                :title="`Filtrer par ${t}`"
                              >
                                <img v-if="getTypeIcon(t)" :src="getTypeIcon(t)" :alt="t" class="pill-icon-img" />
                                <span class="pill-count">{{ typeCounts[t] || 0 }}</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div class="filters-actions">
                          <button class="ghost-button" @click="resetFilters">Réinitialiser</button>
                          <span v-if="loadingAllCards" class="filters-loading">Chargement filtres…</span>
                        </div>
                      </div>
            <p class="cards-section__count">{{ noFilterActive ? cards.length : filteredAll.length }} / {{ cardsSynced }} cartes affichées</p>
          </header>

          <div v-if="loadingCards" class="cards-status">
            Chargement des cartes...
          </div>

          <div v-else-if="(noFilterActive ? cards.length === 0 : filteredAll.length === 0)" class="cards-status cards-status--empty">
            <span v-if="noFilterActive">Aucune carte disponible pour ce set</span>
            <span v-else>Aucune carte ne correspond aux critères de filtrage</span>
          </div>

          <div v-else class="cards-grid">
            <article
              v-for="card in displayedCards"
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

          <div v-if="noFilterActive ? (pagination.pages > 1) : (filteredPages > 1)" class="pagination">
            <template v-if="noFilterActive">
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
            </template>
            <template v-else>
              <button
                @click="loadFilteredPage(filteredPage - 1)"
                :disabled="filteredPage === 1"
                class="ghost-button"
              >
                Précédent
              </button>
              <span class="page-info">
                Page {{ filteredPage }} / {{ filteredPages }}
              </span>
              <button
                @click="loadFilteredPage(filteredPage + 1)"
                :disabled="filteredPage === filteredPages"
                class="ghost-button"
              >
                Suivant
              </button>
            </template>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderLogo from '@/assets/placeholder_logo.png'
import popLogo from '@/assets/pop_logo.png'
import placeholderCard from '@/assets/placeholder_card.png'
import { getLogoUrl, getSymbolUrl, getCardImageUrl } from '../services/imageService'

// Import all rarity/type icons via Vite glob (use eager option for compatibility)
const rarityModules = import.meta.glob('../assets/rarity/*', { eager: true })
const typeModules = import.meta.glob('../assets/type/*', { eager: true })

const normalizeKey = (s) => {
  if (!s) return ''
  return String(s)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^0-9a-zA-Z ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const rarityIconMap = {}
for (const p in rarityModules) {
  const file = p.split('/').pop()
  const name = file.replace(/\.[^.]+$/, '')
  const key = normalizeKey(name)
  rarityIconMap[key] = rarityModules[p].default
}

const typeIconMap = {}
for (const p in typeModules) {
  const file = p.split('/').pop()
  const name = file.replace(/\.[^.]+$/, '')
  const key = normalizeKey(name)
  typeIconMap[key] = typeModules[p].default
}

const getRarityIcon = (label) => {
  if (!label) return ''
  const key = normalizeKey(label)
  // Retour direct si présent
  if (rarityIconMap[key]) return rarityIconMap[key]

  // Cas spécial : Rare Holo LV.X (ou variantes) -> utiliser 'illustration rare'
  // Normalisation possible des formes : 'rare holo lv.x', 'holo rare lv x', 'rare holo lvx', etc.
  const lvxRegex = /\blv\s*\.?\s*x\b|\blvx\b/
  if (lvxRegex.test(key) && key.includes('rare') && key.includes('holo')) {
    const canon = normalizeKey('illustration rare')
    if (rarityIconMap[canon]) return rarityIconMap[canon]
  }

  // Aliases explicites (on compare via normalizeKey pour être sûr)
  const aliases = {
    'holo rare': 'rare',
    'rare holo': 'holo rare',
    'holo': 'rare',
    'holo rare vmax': 'holo rare v',
    'holo rare vstar': 'holo rare v',
    'rare prime': 'illustration rare',
    // 'légende' (ou 'legende' normalisé) doit utiliser l'icône "illustration spéciale rare"
    'legende': 'illustration speciale rare'
  }
  for (const from in aliases) {
    if (key === normalizeKey(from)) {
      const toKey = normalizeKey(aliases[from])
      if (rarityIconMap[toKey]) return rarityIconMap[toKey]
    }
  }

  // Enlever des tokens courants liés aux variantes Holo/V (holo, v, vmax, vstar, v-star, v-max)
  const stripped = key.replace(/\b(holo|vmax|v-star|v-max|vstar|v)\b/g, '').replace(/\s+/g, ' ').trim()
  if (stripped && rarityIconMap[stripped]) return rarityIconMap[stripped]

  // Dernier essai: parcourir tokens pour trouver un match (ex: 'rare', 'ultra')
  const tokens = key.split(' ').filter(Boolean)
  for (let t of tokens) {
    if (['holo','v','vmax','vstar','v-star','v-max'].includes(t)) continue
    if (rarityIconMap[t]) return rarityIconMap[t]
  }

  return ''
}

const getTypeIcon = (label) => {
  if (!label) return ''
  const key = normalizeKey(label)
  return typeIconMap[key] || ''
}

const route = useRoute()
const router = useRouter()
const set = ref({})
const cards = ref([])
const allCards = ref([])
const erroredCards = ref(new Set())
const loading = ref(true)
const loadingCards = ref(true)
const loadingAllCards = ref(false)
const error = ref(null)
const pagination = ref({
  page: 1,
  limit: 100,
  total: 0,
  pages: 0
})

// Filtres UI (multi-select pour types et raretés)
const filters = ref({
  q: '',
  types: [],
  rarities: []
})

const FILTER_STORAGE_KEY = `setFilters-${route.params.id}`

const getCardType = (card) => {
  if (!card) return ''
  if (card.supertype) return card.supertype
  if (card.type) return card.type
  if (Array.isArray(card.types) && card.types.length) return card.types[0]
  if (Array.isArray(card.subtypes) && card.subtypes.length) return card.subtypes[0]
  return ''
}

// Ordre préféré demandé par l'utilisateur (normalisé)
const preferredTypeOrder = ['plante', 'feu', 'eau', 'electrique', 'psy', 'combat', 'obscurite', 'metal', 'dragon', 'fée', 'normal']

const availableTypes = computed(() => {
  const source = (allCards.value && allCards.value.length) ? allCards.value : cards.value
  const setTypes = new Set()
  for (const c of source) {
    const t = getCardType(c)
    if (t) setTypes.add(t)
  }

  const arr = Array.from(setTypes)
  // Trier d'abord selon `preferredTypeOrder`, puis alphabétiquement pour les types non listés
  arr.sort((a, b) => {
    const na = normalizeKey(a)
    const nb = normalizeKey(b)
    const ia = preferredTypeOrder.indexOf(na)
    const ib = preferredTypeOrder.indexOf(nb)

    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return na.localeCompare(nb)
  })

  return arr
})

// Ordre préféré pour les raretés (normalisé)
const preferredRarityOrder = [
  'commune',
  'peu commune',
  'rare',
  'holo rare',
  'rare holo',
  'holo rare v',
  'holo rare vmax',
  'holo rare vstar',
  'double rare',
  'illustration rare',
  'ultra rare',
  'illustration speciale rare',
  'hyper rare',
  'rare noir blanc',
  'mega hyper rare',
  'high tech rare',
  'rare prime',
  'legende',
  'rare holo lv.x',
]

const availableRarities = computed(() => {
  const source = (allCards.value && allCards.value.length) ? allCards.value : cards.value
  const setR = new Set()
  for (const c of source) {
    if (c.rarity) setR.add(c.rarity)
  }

  const arr = Array.from(setR)
  // Trier selon preferredRarityOrder (après normalisation), puis alphabétiquement
  arr.sort((a, b) => {
    const na = normalizeKey(a)
    const nb = normalizeKey(b)
    const ia = preferredRarityOrder.indexOf(na)
    const ib = preferredRarityOrder.indexOf(nb)

    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return na.localeCompare(nb)
  })

  return arr
})

const rarityCounts = computed(() => {
  const source = (allCards.value && allCards.value.length) ? allCards.value : cards.value
  const map = {}
  for (const c of source) {
    const r = c.rarity || '—'
    map[r] = (map[r] || 0) + 1
  }
  return map
})

const typeCounts = computed(() => {
  const source = (allCards.value && allCards.value.length) ? allCards.value : cards.value
  const map = {}
  for (const c of source) {
    const t = getCardType(c) || '—'
    map[t] = (map[t] || 0) + 1
  }
  return map
})

const noFilterActive = computed(() => {
  const q = (filters.value.q || '').trim()
  const types = filters.value.types || []
  const rarities = filters.value.rarities || []
  return !q && types.length === 0 && rarities.length === 0
})

// filteredAll contains the full list of matching cards (across all pages when available)
const filteredAll = computed(() => {
  const q = (filters.value.q || '').trim().toLowerCase()
  const types = (filters.value.types || []).map(t => (t || '').toLowerCase())
  const rarities = (filters.value.rarities || []).map(r => (r || '').toLowerCase())

  const source = (allCards.value && allCards.value.length) ? allCards.value : cards.value

  let result = source.filter((c) => {
    const name = (c.name || '').toLowerCase()
    const localId = String(c.localId || '')
    if (q) {
      if (!name.includes(q) && !localId.includes(q)) return false
    }

    if (types.length > 0) {
      const ct = (getCardType(c) || '').toLowerCase()
      if (!types.includes(ct)) return false
    }

    if (rarities.length > 0) {
      const cr = (c.rarity || '').toLowerCase()
      if (!rarities.includes(cr)) return false
    }

    return true
  })

  return sortByLocalId(result)
})

// Local pagination for filtered results
const pageSize = computed(() => parseInt(pagination.value.limit, 10) || 100)
const filteredPage = ref(1)
const filteredPages = computed(() => Math.max(1, Math.ceil(filteredAll.value.length / pageSize.value)))

// displayedCards: when no filter active -> server page, otherwise -> slice of filteredAll
const displayedCards = computed(() => {
  if (noFilterActive.value) return cards.value
  const start = (filteredPage.value - 1) * pageSize.value
  return filteredAll.value.slice(start, start + pageSize.value)
})

const loadFilteredPage = (page) => {
  if (page >= 1 && page <= filteredPages.value) {
    filteredPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// reset filtered page when filters change
watch(filters, () => {
  filteredPage.value = 1
})

const onFilterChange = () => {
  try {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters.value))
  } catch (e) {
    // ignore
  }
}

const resetFilters = () => {
  filters.value = { q: '', types: [], rarities: [] }
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY)
  } catch (e) {}
}

const toggleRarity = (r) => {
  const idx = filters.value.rarities.indexOf(r)
  if (idx === -1) filters.value.rarities.push(r)
  else filters.value.rarities.splice(idx, 1)
  onFilterChange()
}

const clearRarities = () => {
  filters.value.rarities = []
  onFilterChange()
}

const toggleType = (t) => {
  const idx = filters.value.types.indexOf(t)
  if (idx === -1) filters.value.types.push(t)
  else filters.value.types.splice(idx, 1)
  onFilterChange()
}

const clearTypes = () => {
  filters.value.types = []
  onFilterChange()
}

watch(cards, () => {
  // If cards change (page change or fresh fetch), ensure filters persisted keys exist
  // nothing else: filteredCards is reactive
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
      // Lance une récupération en arrière-plan de toutes les cartes du set
      if (pagination.value.pages > 1 && allCards.value.length === 0) {
        fetchAllCards(pagination.value.pages)
      } else if (pagination.value.pages === 1) {
        // si une seule page, on peut remplir allCards directement
        allCards.value = sortByLocalId(data.data)
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement des cartes:', err)
  } finally {
    loadingCards.value = false
  }
}

const fetchAllCards = async (pages) => {
  if (!pages || pages <= 1) return
  loadingAllCards.value = true
  try {
    const promises = []
    // on commence à 2 parce que page 1 a déjà été chargée via fetchCards
    for (let p = 2; p <= pages; p++) {
      const url = `http://localhost:3000/api/sets/${route.params.id}/cards?page=${p}&limit=100`
      promises.push(fetch(url).then(r => r.json()))
    }

    const results = await Promise.all(promises)
    const pagesData = results.filter(r => r && r.success).flatMap(r => r.data || [])
    allCards.value = sortByLocalId([...cards.value, ...pagesData])
  } catch (err) {
    console.error('Erreur lors du chargement de toutes les cartes:', err)
  } finally {
    loadingAllCards.value = false
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
  // charge les filtres sauvegardés
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') filters.value = { ...filters.value, ...parsed }
    }
  } catch (e) {
    // ignore
  }

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

.cards-filters {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: #fff;
  min-width: 180px;
}

.filter-select {
  padding: 0.45rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: #fff;
}

.filters-loading {
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-left: 0.5rem;
}

.filter-group__label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.02);
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-pill--active {
  border-color: rgba(255,255,255,0.9);
  background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
}

.pill-count {
  background: rgba(0,0,0,0.4);
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: #fff;
}

.pill-icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}

.pill-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: inline-block;
}

/* New layout styles */
.cards-filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.filters-left {
  min-width: 220px;
}

.filters-right {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-row__title {
  color: rgba(255,255,255,0.6);
  font-size: 0.78rem;
  min-width: 68px;
}

.filter-pill--all {
  opacity: 0.9;
}

.filter-pill svg { color: rgba(255,255,255,0.85); }

.scroll-x {
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-pills::-webkit-scrollbar { height: 8px; }
.filter-pills::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 8px; }

.filters-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 880px) {
  .cards-filters { grid-template-columns: 1fr; }
  .filters-right { flex-direction: column; }
  .filter-row__title { min-width: 54px; }
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
  /* Fixe la largeur des colonnes pour garder des cartes de dimensions constantes
     même si la dernière ligne est incomplète. La grille est centrée pour que
     l'espace restant soit distribué autour des colonnes, pas en étirant les cartes. */
  grid-template-columns: repeat(auto-fill, minmax(220px, 220px));
  justify-content: center;
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
