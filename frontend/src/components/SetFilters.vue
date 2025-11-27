<template>
  <div class="cards-filters">
    <div class="filters-left" v-if="showSearch">
      <input
        :value="modelValue.q"
        @input="updateQ($event.target.value)"
        type="search"
        placeholder="Rechercher par nom, #..."
        class="filter-input"
      />
    </div>

    <div class="filters-right">
      <div class="filter-row">
        <div class="filter-row__title">Raretés</div>
        <div class="filter-pills scroll-x">
          <button
            class="filter-pill filter-pill--all"
            :class="{ 'filter-pill--active': modelValue.rarities.length === 0 }"
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
            :class="{ 'filter-pill--active': modelValue.rarities.includes(r) }"
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
            :class="{ 'filter-pill--active': modelValue.types.length === 0 }"
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
            :class="{ 'filter-pill--active': modelValue.types.includes(t) }"
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
      <span v-if="loading" class="filters-loading">Chargement filtres…</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ q: '', types: [], rarities: [] })
  },
  availableRarities: {
    type: Array,
    default: () => []
  },
  availableTypes: {
    type: Array,
    default: () => []
  },
  rarityCounts: {
    type: Object,
    default: () => ({})
  },
  typeCounts: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  showSearch: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'reset'])

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
  if (rarityIconMap[key]) return rarityIconMap[key]

  const lvxRegex = /\blv\s*\.?\s*x\b|\blvx\b/
  if (lvxRegex.test(key) && key.includes('rare') && key.includes('holo')) {
    const canon = normalizeKey('illustration rare')
    if (rarityIconMap[canon]) return rarityIconMap[canon]
  }

  const aliases = {
    'holo rare': 'rare',
    'rare holo': 'holo rare',
    'holo': 'rare',
    'holo rare vmax': 'holo rare v',
    'holo rare vstar': 'holo rare v',
    'rare prime': 'illustration rare',
    'legende': 'illustration speciale rare'
  }
  for (const from in aliases) {
    if (key === normalizeKey(from)) {
      const toKey = normalizeKey(aliases[from])
      if (rarityIconMap[toKey]) return rarityIconMap[toKey]
    }
  }

  const stripped = key.replace(/\b(holo|vmax|v-star|v-max|vstar|v)\b/g, '').replace(/\s+/g, ' ').trim()
  if (stripped && rarityIconMap[stripped]) return rarityIconMap[stripped]

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

const updateQ = (val) => {
  emit('update:modelValue', { ...props.modelValue, q: val })
}

const toggleRarity = (r) => {
  const newRarities = [...props.modelValue.rarities]
  const idx = newRarities.indexOf(r)
  if (idx === -1) newRarities.push(r)
  else newRarities.splice(idx, 1)
  emit('update:modelValue', { ...props.modelValue, rarities: newRarities })
}

const clearRarities = () => {
  emit('update:modelValue', { ...props.modelValue, rarities: [] })
}

const toggleType = (t) => {
  const newTypes = [...props.modelValue.types]
  const idx = newTypes.indexOf(t)
  if (idx === -1) newTypes.push(t)
  else newTypes.splice(idx, 1)
  emit('update:modelValue', { ...props.modelValue, types: newTypes })
}

const clearTypes = () => {
  emit('update:modelValue', { ...props.modelValue, types: [] })
}

const resetFilters = () => {
  emit('reset')
}
</script>

<style scoped>
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
  min-width: 0; /* Important for nested flex/grid overflow */
}

.filter-input {
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: #fff;
  min-width: 180px;
  width: 100%;
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

.filter-pills {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1;
  min-width: 0; /* Allows shrinking to trigger scroll */
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

.filter-pill--all {
  opacity: 0.9;
}

.filter-pill svg { color: rgba(255,255,255,0.85); }

.pill-count {
  background: rgba(0,0,0,0.4);
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: #fff;
}

.pill-icon-img {
  width: 20px;
  height: 20px;
  object-fit: contain;
  display: inline-block;
}

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

.filters-loading {
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
  margin-left: 0.5rem;
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

.ghost-button:hover {
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

@media (max-width: 880px) {
  .cards-filters { grid-template-columns: 1fr; }
  .filters-right { flex-direction: column; }
  .filter-row__title { min-width: 54px; }
}
</style>
