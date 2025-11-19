<template>
  <div class="card-variants-page">
    <main class="page-shell">
      <section class="variants-hero">
        <div class="variants-hero__top">
          <button class="ghost-button" @click="goBack">← Retour</button>
          <span class="variants-hero__badge" v-if="cards.length">{{ cards.length }} cartes trouvées</span>
        </div>
        <div class="variants-hero__body">
          <div>
            <p class="eyebrow">Autres impressions</p>
            <h1>{{ displayName }}</h1>
            <p class="hero-subtitle">
              Toutes les cartes de ce Pokémon, toutes éditions et déclinaisons confondues.
            </p>
          </div>
          <div class="variants-meta" v-if="cards.length">
            <div class="meta-card">
              <span class="meta-label">Sets distincts</span>
              <strong>{{ distinctSets }}</strong>
            </div>
            <div class="meta-card">
              <span class="meta-label">Raretés uniques</span>
              <strong>{{ distinctRarities }}</strong>
            </div>
          </div>
        </div>
      </section>

      <section class="cards-section">
        <div v-if="loading" class="status-tile">Chargement des cartes similaires...</div>
        <div v-else-if="error" class="status-tile status-tile--error">{{ error }}</div>
        <div v-else-if="!cards.length" class="status-tile status-tile--empty">
          Aucune autre carte ne correspond à ce Pokémon.
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
              <p class="card-number">#{{ card.localId || '—' }}</p>
              <h3>{{ card.set?.name || 'Set inconnu' }}</h3>
              <p class="card-rarity">{{ card.rarity || 'Rareté inconnue' }}</p>
            </div>
          </article>
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

const stripAccents = (value = '') => value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
const sanitizeName = (value = '') =>
  stripAccents(value)
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[-_/]/g, ' ')
    .replace(/[^a-z0-9& ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const SINGLE_WORD_VARIANTS = new Set([
  'gx',
  'ex',
  'v',
  'vstar',
  'vmax',
  'vm',
  'break',
  'prime',
  'sp',
  'g',
  'fb',
  'gl',
  'c',
  'lvl',
  'lv',
  'lvx',
  'ra',
  'radiant'
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

const displayName = computed(() => route.params.name || 'Cartes similaires')
const normalizedTarget = computed(() => computeBaseName(route.params.name || ''))
const excludedId = computed(() => route.query.exclude || '')
const targetDexId = computed(() => {
  const raw = route.query.dexId
  if (raw === undefined || raw === null || raw === '') return ''
  if (Array.isArray(raw)) return normalizeDexValue(raw[0])
  return normalizeDexValue(raw)
})

const getCardImage = (imageUrl) => getCardImageUrl(imageUrl, 'low', 'webp')

const distinctSets = computed(() => {
  const ids = new Set(cards.value.map((card) => card.set?.id).filter(Boolean))
  return ids.size
})

const distinctRarities = computed(() => {
  const rarities = new Set(cards.value.map((card) => card.rarity).filter(Boolean))
  return rarities.size
})

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

const sortCards = (list) => {
  return [...list].sort((a, b) => {
    const dateA = new Date(a.set?.releaseDate || 0)
    const dateB = new Date(b.set?.releaseDate || 0)
    if (dateB - dateA !== 0) return dateB - dateA
    const rarityA = a.rarity || ''
    const rarityB = b.rarity || ''
    return rarityA.localeCompare(rarityB)
  })
}

const matchesDexId = (cardDexIds) => {
  if (!targetDexId.value) return false
  if (Array.isArray(cardDexIds)) {
    return cardDexIds.some((entry) => normalizeDexValue(entry) === targetDexId.value)
  }
  return normalizeDexValue(cardDexIds) === targetDexId.value
}

const fetchCards = async () => {
  const hasDexFilter = Boolean(targetDexId.value)

  if (!hasDexFilter && !normalizedTarget.value) {
    error.value = 'Nom de carte manquant'
    loading.value = false
    cards.value = []
    return
  }

  try {
    loading.value = true
    error.value = null
    const params = new URLSearchParams()
    params.append('limit', '200')
    if (hasDexFilter) {
      params.append('dexId', targetDexId.value)
    } else {
      params.append('name', normalizedTarget.value)
    }

    const response = await fetch(`http://localhost:3000/api/cards?${params.toString()}`)
    const data = await response.json()

    if (!data.success) {
      throw new Error('Réponse API invalide')
    }

    const filtered = (data.data || []).filter((card) => {
      const sameName = hasDexFilter
        ? matchesDexId(card.dexId)
        : computeBaseName(card.name || '') === normalizedTarget.value
      const notExcluded = !excludedId.value || card.id !== excludedId.value
      return sameName && notExcluded
    })

    cards.value = sortCards(filtered)
  } catch (err) {
    console.error('Erreur lors du chargement des cartes par nom:', err)
    error.value = "Impossible de charger les autres cartes portant ce nom."
  } finally {
    loading.value = false
  }
}

watch(
  () => [route.params.name, route.query.exclude, route.query.dexId],
  () => {
    erroredCards.value = new Set()
    fetchCards()
  }
)

onMounted(() => {
  fetchCards()
})
</script>

<style scoped>
.card-variants-page {
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

.variants-hero {
  border-radius: 36px;
  padding: 2.5rem;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 60%),
    rgba(12, 12, 12, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.55);
  margin-bottom: 2.5rem;
}

.variants-hero__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.variants-hero__badge {
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.85);
}

.variants-hero__body {
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

.variants-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #fff;
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.7);
  max-width: 520px;
}

.variants-meta {
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
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
  gap: 0.3rem;
}

.card-item__info h3 {
  margin: 0;
  color: #fff;
  font-size: 1.1rem;
}

.card-number,
.card-rarity {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.image-error {
  background: linear-gradient(180deg, rgba(255, 145, 145, 0.15), rgba(255, 225, 225, 0.05));
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
