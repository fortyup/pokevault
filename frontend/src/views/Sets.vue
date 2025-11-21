<template>
  <div class="sets-page">
    <main class="page-shell">
      <PageHero
        align="center"
        badge="📦 Bibliothèque complète des sets"
        title="Plongez dans les sets Pokémon"
        subtitle="Explorez toutes les séries, découvrez les sets promotionnels et suivez les sorties les plus récentes."
      >
        <template #title>
          Plongez dans les sets<br />Pokémon
        </template>
      </PageHero>

      <div v-if="loading" class="status-tile">
        Chargement des sets...
      </div>
      <div v-else-if="error" class="status-tile status-tile--error">
        {{ error }}
      </div>
      <div v-else class="series-wrapper" id="series">
        <section
          v-for="serie in series"
          :key="serie.id"
          class="serie-panel"
          :class="{ 'serie-panel--collapsed': isSerieCollapsed(serie.id) }"
        >
          <header class="serie-header">
            <div>
              <p class="serie-eyebrow">{{ serie.sets.length }} sets</p>
              <h2>{{ serie.name }}</h2>
            </div>
            <div class="serie-header__actions">
              <p class="serie-date">Dernière sortie · {{ getSerieLatestDate(serie) }}</p>
              <button
                type="button"
                class="serie-toggle"
                :aria-expanded="!isSerieCollapsed(serie.id)"
                :aria-controls="`sets-${serie.id}`"
                :aria-label="isSerieCollapsed(serie.id) ? 'Dérouler la série' : 'Enrouler la série'"
                @click="toggleSerieCollapse(serie.id)"
              >
                <span
                  class="serie-toggle__chevron"
                  :class="{ 'serie-toggle__chevron--collapsed': isSerieCollapsed(serie.id) }"
                >
                  ▾
                </span>
              </button>
            </div>
          </header>

          <div
            class="sets-grid"
            :id="`sets-${serie.id}`"
            :class="{ 'sets-grid--collapsed': isSerieCollapsed(serie.id) }"
          >
            <article
              v-for="set in serie.sets"
              :key="set.id"
              class="set-card"
              @click="goToSet(set.id)"
            >
              <div class="set-card__glow"></div>
              <div class="set-card__header" :style="getHeaderBackground(set.logo, set)">
                <div class="set-card__header-blur" :style="getHeaderBackground(set.logo, set)"></div>
                <img
                  :src="getSetLogo(set.logo, set)"
                  :alt="set.name || 'Logo de set Pokémon'"
                  class="set-logo"
                  :class="{ 'set-logo--placeholder': !set.logo }"
                />
              </div>
              <div class="set-card__body">
                <div class="set-title-row">
                  <h3>{{ set.name }}</h3>
                  <img
                    v-if="set.symbol"
                    :src="getSetSymbol(set.symbol)"
                    :alt="set.name"
                    class="set-symbol"
                  />
                </div>
                <p class="set-card__subtitle">{{ set.series?.name || serie.name }}</p>
                <div class="set-card__meta">
                  <span>{{ formatDate(set.releaseDate) }}</span>
                  <span>{{ set.cardCount?.official || set.cardCount?.total || 0 }} cartes</span>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/PageHero.vue'
import StatHighlights from '@/components/StatHighlights.vue'
import { getLogoUrl, getSymbolUrl } from '../services/imageService'
import placeholderLogo from '@/assets/placeholder_logo.png'
import popLogo from '@/assets/pop_logo.png'

const router = useRouter()

const series = ref([])
const loading = ref(true)
const error = ref(null)
const logoPalettes = ref({})
const collapsedSeries = ref(new Set())
const COLLAPSED_SERIES_KEY = 'pokevault-collapsed-series'

const paletteFallback = {
  primary: 'rgba(255, 255, 255, 0.1)',
  secondary: 'rgba(10, 10, 10, 0.85)'
}

const pendingPalettes = new Set()

const totalSets = computed(() => {
  return series.value.reduce((sum, serie) => sum + serie.sets.length, 0)
})

const promoSets = computed(() => {
  return series.value.reduce((count, serie) => {
    return (
      count +
      serie.sets.filter((set) => {
        const normalized = (set.name || '').toLowerCase()
        return normalized.includes('promo')
      }).length
    )
  }, 0)
})

const latestReleaseDate = computed(() => {
  const timestamps = series.value.flatMap((serie) =>
    serie.sets
      .map((set) => (set.releaseDate ? new Date(set.releaseDate).getTime() : null))
      .filter(Boolean)
  )

  if (!timestamps.length) {
    return null
  }

  return new Date(Math.max(...timestamps))
})

const latestReleaseLabel = computed(() => {
  if (!latestReleaseDate.value) {
    return 'À venir'
  }

  return latestReleaseDate.value.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long'
  })
})

const setsStats = computed(() => [
  { value: `${totalSets.value}`, label: 'Sets suivis' },
  { value: `${series.value.length}`, label: 'Séries cataloguées' },
  { value: `${promoSets.value}`, label: 'Sets promotionnels' },
  { value: latestReleaseLabel.value, label: 'Dernière sortie' }
])

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long'
  })
}

const getSerieLatestDate = (serie) => {
  if (!serie?.sets?.length) return 'Date inconnue'

  const latestDate = serie.sets.reduce((latest, current) => {
    if (!current.releaseDate) return latest
    const currentDate = new Date(current.releaseDate)
    if (!latest || currentDate > latest) {
      return currentDate
    }
    return latest
  }, null)

  return latestDate
    ? latestDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    : 'Date inconnue'
}

const getSetLogo = (logoUrl, set) => {
  if (logoUrl) return getLogoUrl(logoUrl)
  
  // Check if it's a POP series set
  const isPop = set?.id?.toLowerCase().includes('pop') || 
                set?.name?.toLowerCase().includes('pop')
  
  return isPop ? popLogo : placeholderLogo
}

const getSetSymbol = (symbolUrl) => {
  return getSymbolUrl(symbolUrl)
}

const normalizeLogoKey = (logoUrl, set) => {
  const source = getSetLogo(logoUrl, set)
  if (!source) return placeholderLogo
  try {
    return source
  } catch (err) {
    console.warn('Logo normalization failed:', err)
    return placeholderLogo
  }
}

const getHeaderBackground = (logoUrl, set) => {
  const key = normalizeLogoKey(logoUrl, set)
  const palette = (key && logoPalettes.value[key]) || paletteFallback
  return {
    backgroundImage: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`
  }
}

const toColorString = (r, g, b, alpha = 0.95) => `rgba(${r}, ${g}, ${b}, ${alpha})`

const clamp = (value, min = 0, max = 255) => Math.min(max, Math.max(min, value))

const adjustColor = (r, g, b, factor) => ({
  r: clamp(r + (255 - r) * factor),
  g: clamp(g + (255 - g) * factor),
  b: clamp(b + (255 - b) * factor)
})

const darkenColor = (r, g, b, factor) => ({
  r: clamp(r * (1 - factor)),
  g: clamp(g * (1 - factor)),
  b: clamp(b * (1 - factor))
})

const extractColorsFromImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 48
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      if (!ctx) {
        resolve(paletteFallback)
        return
      }

      ctx.drawImage(img, 0, 0, size, size)
      const imageData = ctx.getImageData(0, 0, size, size).data

      let r = 0
      let g = 0
      let b = 0
      let total = 0

      for (let i = 0; i < imageData.length; i += 4) {
        const alpha = imageData[i + 3] / 255
        if (alpha < 0.1) continue
        r += imageData[i] * alpha
        g += imageData[i + 1] * alpha
        b += imageData[i + 2] * alpha
        total += alpha
      }

      if (!total) {
        resolve(paletteFallback)
        return
      }

      r = Math.round(r / total)
      g = Math.round(g / total)
      b = Math.round(b / total)

      const lighter = adjustColor(r, g, b, 0.35)
      const darker = darkenColor(r, g, b, 0.4)

      resolve({
        primary: toColorString(lighter.r, lighter.g, lighter.b, 0.9),
        secondary: toColorString(darker.r, darker.g, darker.b, 0.95)
      })
    }

    img.onerror = () => reject(new Error('Color extraction failed'))
  })
}

const ensurePaletteForLogo = async (logoUrl, set) => {
  const key = normalizeLogoKey(logoUrl, set)
  if (!key || logoPalettes.value[key] || pendingPalettes.has(key)) {
    return
  }

  pendingPalettes.add(key)

  try {
    const palette = await extractColorsFromImage(key)
    logoPalettes.value = { ...logoPalettes.value, [key]: palette }
  } catch (err) {
    console.warn('Palette extraction fallback:', err)
    logoPalettes.value = { ...logoPalettes.value, [key]: paletteFallback }
  } finally {
    pendingPalettes.delete(key)
  }
}

const preparePaletteExtraction = (seriesData) => {
  seriesData.forEach((serie) => {
    serie.sets.forEach((set) => {
      if (set.logo) {
        ensurePaletteForLogo(set.logo, set)
      }
    })
  })
}

const goToSet = (setId) => {
  router.push(`/set/${setId}`)
}

const isSerieCollapsed = (serieId) => collapsedSeries.value.has(serieId)

const toggleSerieCollapse = (serieId) => {
  const next = new Set(collapsedSeries.value)
  if (next.has(serieId)) {
    next.delete(serieId)
  } else {
    next.add(serieId)
  }
  collapsedSeries.value = next
}

const loadCollapsedSeries = () => {
  if (typeof window === 'undefined') return
  try {
    const stored = window.localStorage.getItem(COLLAPSED_SERIES_KEY)
    if (!stored) return
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      collapsedSeries.value = new Set(parsed)
    }
  } catch (err) {
    console.warn('Failed to load collapsed series state:', err)
  }
}

const persistCollapsedSeries = () => {
  if (typeof window === 'undefined') return
  try {
    const payload = JSON.stringify([...collapsedSeries.value])
    window.localStorage.setItem(COLLAPSED_SERIES_KEY, payload)
  } catch (err) {
    console.warn('Failed to persist collapsed series state:', err)
  }
}

const fetchSeries = async () => {
  try {
    loading.value = true
    const response = await fetch('http://localhost:3000/api/sets/by-series')
    const data = await response.json()

    if (data.success) {
      const sortedData = data.data.map((serie) => ({
        ...serie,
        sets: [...serie.sets].sort((a, b) => {
          const dateA = new Date(a.releaseDate || 0)
          const dateB = new Date(b.releaseDate || 0)
          return dateB - dateA
        })
      }))

      const getMostRecentDate = (serie) => {
        if (!serie.sets.length) return new Date(0)
        const dates = serie.sets.map((set) => new Date(set.releaseDate || 0))
        return new Date(Math.max(...dates))
      }

      const finalSortedData = sortedData.map((serie) => ({
        ...serie,
        sets: [...serie.sets].sort((a, b) => {
          const isPromoA = (a.name || '').toLowerCase().includes('promo')
          const isPromoB = (b.name || '').toLowerCase().includes('promo')

          if (isPromoA && !isPromoB) return -1
          if (!isPromoA && isPromoB) return 1
          return 0
        })
      }))

      finalSortedData.sort((a, b) => {
        return getMostRecentDate(b) - getMostRecentDate(a)
      })

      series.value = finalSortedData
      preparePaletteExtraction(finalSortedData)
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
  loadCollapsedSeries()
  fetchSeries()
})

watch(
  series,
  (current) => {
    if (!current?.length) return
    preparePaletteExtraction(current)
  },
  { deep: true }
)

watch(
  collapsedSeries,
  () => {
    persistCollapsedSeries()
  },
  { deep: false }
)
</script>

<style scoped>
.sets-page {
  padding-bottom: 8rem;
}

.sets-page .page-shell {
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.status-tile--error {
  color: #ffb4b4;
  border-color: rgba(255, 0, 0, 0.4);
}

.series-wrapper {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-top: 2rem;
}

.serie-panel {
  padding: 2.5rem;
  border-radius: 32px;
  background: rgba(8, 8, 8, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.45);
}

.serie-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 2rem;
}

.serie-header__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.serie-eyebrow {
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.serie-header h2 {
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: #ffffff;
  margin: 0;
}

.serie-date {
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.95rem;
}

.serie-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  border-radius: 50%;
  padding: 0;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease, border 0.2s ease, color 0.2s ease;
}

.serie-toggle:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.serie-toggle__chevron {
  display: inline-block;
  transition: transform 0.25s ease;
}

.serie-toggle__chevron--collapsed {
  transform: rotate(-180deg);
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  max-height: 9999px;
  transition: max-height 0.35s ease, opacity 0.25s ease;
}

.sets-grid--collapsed {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.serie-panel--collapsed .serie-header {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.set-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(25, 25, 25, 0.7), rgba(5, 5, 5, 0.95));
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.set-card__glow {
  position: absolute;
  inset: -40% -10% auto -10%;
  height: 120%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 60%);
  transform: translateY(60%);
  filter: blur(60px);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.set-card__header {
  position: relative;
  z-index: 1;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-size: cover;
  background-position: center;
}

.set-card__header-blur {
  position: absolute;
  inset: 0;
  filter: blur(40px) saturate(150%);
  opacity: 0.9;
  transform: scale(1.2);
  background-size: cover;
  background-position: center;
  pointer-events: none;
}

.set-card__header-blur::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8));
}

.set-logo {
  max-width: 170px;
  max-height: 100px;
  object-fit: contain;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.6));
  position: relative;
  z-index: 1;
}

.set-logo--placeholder {
  opacity: 0.65;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45));
}

.set-card__body {
  position: relative;
  z-index: 1;
  padding: 1.75rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.set-title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.set-card__body h3 {
  font-size: 1.2rem;
  color: #ffffff;
  margin: 0;
  flex: 1;
}

.set-symbol {
  width: 25px;
  height: 25px;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
}

.set-card__subtitle {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.set-card__meta {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.set-card__meta span {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
}

.set-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 35px 70px rgba(0, 0, 0, 0.55);
}

.set-card:hover .set-card__glow {
  opacity: 1;
}

@media (max-width: 768px) {
  .sets-page .page-shell {
    padding: 0 1rem;
  }

  .serie-panel {
    padding: 1.75rem;
  }

  .set-card__header {
    flex-direction: column;
    gap: 1.5rem;
  }
}

@media (max-width: 520px) {
  .set-card__meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
