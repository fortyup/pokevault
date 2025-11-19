<template>
  <div class="card-page">
    <main class="page-shell">
      <div v-if="loading" class="status-tile">
        Chargement de la carte...
      </div>

      <div v-else-if="error" class="status-tile status-tile--error">
        {{ error }}
        <button class="ghost-button" @click="goBack">Retour</button>
      </div>

      <div v-else-if="card">
        <section class="card-board">
          <div class="card-board__top">
            <button class="ghost-button" @click="goBack">← Retour</button>
            <span class="card-number-chip">{{ cardNumber }}</span>
          </div>

          <div class="card-grid">
            <aside class="card-media" :class="{ 'image-error': imageErrored }">
              <div class="card-media__frame">
                <img
                  v-if="hasCardImage"
                  :src="getCardImage(card.image)"
                  :alt="card.name"
                  class="card-media__image"
                  @error="handleImageError"
                />
                <div v-else class="card-placeholder card-placeholder--hero">
                  <img
                    :src="placeholderCard"
                    :alt="`Illustration manquante pour ${card.name}`"
                    class="card-image card-image--placeholder"
                  />
                </div>
              </div>

              <div class="cta-stack">
                <button class="btn btn-secondary" @click="goToSimilarCards">
                  Plus de cartes
                </button>
              </div>
            </aside>

            <div class="card-info">
              <header class="card-info__header">
                <div>
                  <p class="card-stage">{{ stageLabel }}</p>
                  <h1>{{ card.name }}</h1>
                </div>
                <div class="card-hp" v-if="card.hp || card.types?.length">
                  <template v-if="card.hp">
                    <span>PV</span>
                    <strong>{{ card.hp }}</strong>
                  </template>
                  <div v-if="card.types?.length" class="type-chip-group">
                    <template v-for="(type, index) in card.types" :key="`${type}-${index}`">
                      <img
                        v-if="getTypeIcon(type)"
                        :src="getTypeIcon(type)"
                        :alt="`Type ${type}`"
                        class="type-chip"
                        loading="lazy"
                      />
                      <span v-else class="type-chip type-chip--fallback">
                        {{ type.charAt(0) }}
                      </span>
                    </template>
                  </div>
                </div>
              </header>

              <p class="card-category" v-if="card.category">{{ card.category }}</p>
              <p class="card-set"><a class="yellow-link" @click="goToSet(card.set?.id)">Set {{ card.set?.name || 'inconnu' }}</a> • {{ card.rarity || 'Rareté inconnue' }}</p>

              <div class="card-abilities" v-if="card.abilities?.length">
                <article
                  v-for="(ability, index) in card.abilities"
                  :key="index"
                  class="attack-line"
                >
                  <div class="attack-line__title">
                    <img
                      v-if="ability.type && getAbilityIcon(ability.type)"
                      :src="getAbilityIcon(ability.type)"
                      :alt="`Icône ${ability.type}`"
                      class="ability-icon"
                      loading="lazy"
                    />
                    <strong>{{ ability.name }}</strong>
                  </div>
                  <p v-if="ability.text || ability.effect" class="attack-effect">
                    {{ ability.text || ability.effect }}
                  </p>
                </article>
              </div>

              <div class="card-attacks" v-if="card.attacks?.length">
                <article v-for="(attack, index) in card.attacks" :key="index" class="attack-line">
                  <div class="attack-line__title">
                    <div class="attack-cost" v-if="attack.cost?.length">
                      <template v-for="(cost, i) in attack.cost" :key="`${cost}-${i}`">
                        <img
                          v-if="getTypeIcon(cost)"
                          :src="getTypeIcon(cost)"
                          :alt="`Énergie ${cost}`"
                          class="energy-icon-img"
                          loading="lazy"
                        />
                        <span v-else class="energy-icon energy-icon--fallback" :title="cost">
                          {{ cost.charAt(0) }}
                        </span>
                      </template>
                    </div>
                    <strong>{{ attack.name }}</strong>
                    <span v-if="attack.damage" class="attack-damage">{{ attack.damage }}</span>
                  </div>
                  <p v-if="attack.effect" class="attack-effect">{{ attack.effect }}</p>
                </article>
              </div>

              <div v-if="card.effect" class="card-effect">
                <span class="effect-label">Texte de la carte</span>
                <p>{{ card.effect }}</p>
              </div>

              <div class="card-stat-panel">
                <div class="stat-col">
                  <p>Faiblesse</p>
                  <div v-if="card.weaknesses?.length" class="stat-value stat-value--icons">
                    <div
                      v-for="(weakness, index) in card.weaknesses"
                      :key="`${weakness.type || 'unknown'}-${index}`"
                      class="type-badge"
                      :title="formatWeakness(weakness)"
                    >
                      <div class="type-badge__icon">
                        <img
                          v-if="getTypeIcon(weakness.type)"
                          :src="getTypeIcon(weakness.type)"
                          :alt="`Type ${weakness.type}`"
                          loading="lazy"
                        />
                        <span v-else class="type-badge__icon-fallback">
                          {{ weakness.type?.charAt(0) || '?' }}
                        </span>
                      </div>
                      <div class="type-badge__info">
                        <span class="type-badge__type">{{ weakness.type || '—' }}</span>
                        <span v-if="weakness.value" class="type-badge__value">{{ weakness.value }}</span>
                      </div>
                    </div>
                  </div>
                  <span v-else class="stat-value">—</span>
                </div>
                <div class="stat-col">
                  <p>Résistance</p>
                  <div v-if="card.resistances?.length" class="stat-value stat-value--icons">
                    <div
                      v-for="(resistance, index) in card.resistances"
                      :key="`${resistance.type || 'unknown'}-${index}`"
                      class="type-badge"
                      :title="formatResistance(resistance)"
                    >
                      <div class="type-badge__icon">
                        <img
                          v-if="getTypeIcon(resistance.type)"
                          :src="getTypeIcon(resistance.type)"
                          :alt="`Type ${resistance.type}`"
                          loading="lazy"
                        />
                        <span v-else class="type-badge__icon-fallback">
                          {{ resistance.type?.charAt(0) || '?' }}
                        </span>
                      </div>
                      <div class="type-badge__info">
                        <span class="type-badge__type">{{ resistance.type || '—' }}</span>
                        <span v-if="resistance.value" class="type-badge__value">{{ resistance.value }}</span>
                      </div>
                    </div>
                  </div>
                  <span v-else class="stat-value">—</span>
                </div>
                <div class="stat-col">
                  <p>Coût de retraite</p>
                  <span class="stat-value retreat-icons">
                    <template v-if="card.retreat === 0">Aucun</template>
                    <template v-else-if="card.retreat">
                      <span v-for="i in card.retreat" :key="i">
                        <img
                          v-if="retreatIcon"
                          :src="retreatIcon"
                          alt="Énergie incolore"
                          class="energy-icon-img"
                        />
                        <span v-else class="energy-icon energy-icon--retreat">⚪</span>
                      </span>
                    </template>
                    <template v-else>—</template>
                  </span>
                </div>
              </div>

              <div class="card-meta">
                <p v-if="card.illustrator" class="card-illustrator-link">
                  Illustrateur :
                  <a class="inline-link yellow-link" @click="">
                    {{ card.illustrator }}
                  </a>
                </p>
                <p>
                  {{ card.localId }} / {{ card.set?.cardCount?.official || card.set?.cardCount?.total || '—' }}
                  {{ card.rarity ? `• ${card.rarity}` : '' }}
                </p>
                <p v-if="card.regulationMark">Marque de régulation : {{ card.regulationMark }}</p>
              </div>

              <div class="card-meta card-meta--links">
                <p v-if="card.dexId?.length">Pokédex : {{ card.dexId.join(', ') }}</p>
                <div v-if="card.variants" class="variant-tags">
                  <span v-if="card.variants.normal">Normal</span>
                  <span v-if="card.variants.reverse">Reverse</span>
                  <span v-if="card.variants.holo">Holo</span>
                  <span v-if="card.variants.firstEdition">1ère Édition</span>
                  <span v-if="card.variants.wPromo">W Promo</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import placeholderCard from '@/assets/placeholder_card.png'
import { getCardImageUrl } from '../services/imageService'

const typeIconModules = import.meta.glob('../assets/type/*.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default'
})

const abilityIconModules = import.meta.glob('../assets/abilities/*.{png,jpg,jpeg,svg}', {
  eager: true,
  import: 'default'
})

const stripAccents = (value = '') => value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
const normalizeTypeKey = (value = '') => stripAccents(value).toLowerCase()

const typeIconMap = Object.entries(typeIconModules).reduce((acc, [path, module]) => {
  const fileName = path.split('/').pop() || ''
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const key = normalizeTypeKey(baseName)
  if (key) acc[key] = module
  return acc
}, {})

const abilityIconMap = Object.entries(abilityIconModules).reduce((acc, [path, module]) => {
  const fileName = path.split('/').pop() || ''
  const baseName = fileName.replace(/\.[^.]+$/, '')
  const key = normalizeTypeKey(baseName)
  if (key) acc[key] = module
  return acc
}, {})

const TYPE_ALIASES = {
  eau: 'eau',
  water: 'eau',
  feu: 'feu',
  fire: 'feu',
  electric: 'electrik',
  lightning: 'electrik',
  electrique: 'electrik',
  grass: 'plante',
  leaf: 'plante',
  plante: 'plante',
  psychic: 'psy',
  psy: 'psy',
  fighting: 'combat',
  combat: 'combat',
  darkness: 'tenebres',
  dark: 'tenebres',
  metal: 'acier',
  steel: 'acier',
  fairy: 'fee',
  dragon: 'dragon',
  colorless: 'incolore',
  incolore: 'incolore'
}

Object.entries(TYPE_ALIASES).forEach(([alias, target]) => {
  const aliasKey = normalizeTypeKey(alias)
  const targetKey = normalizeTypeKey(target)
  if (!typeIconMap[aliasKey] && typeIconMap[targetKey]) {
    typeIconMap[aliasKey] = typeIconMap[targetKey]
  }
})

const getTypeIcon = (type) => typeIconMap[normalizeTypeKey(type)] || null
const ABILITY_ALIASES = {
  talent: 'talent',
  ability: 'talent',
  'poke-power': 'poke-power',
  'pokepower': 'poke-power',
  'poké-power': 'poke-power',
  'poke-body': 'poke-body',
  'poké-body': 'poke-body'
}

Object.entries(ABILITY_ALIASES).forEach(([alias, target]) => {
  const aliasKey = normalizeTypeKey(alias)
  const targetKey = normalizeTypeKey(target)
  if (!abilityIconMap[aliasKey] && abilityIconMap[targetKey]) {
    abilityIconMap[aliasKey] = abilityIconMap[targetKey]
  }
})

const getAbilityIcon = (type) => abilityIconMap[normalizeTypeKey(type)] || null

const route = useRoute()
const router = useRouter()
const card = ref(null)
const loading = ref(true)
const error = ref(null)
const imageErrored = ref(false)

const getCardImage = (imageUrl) => getCardImageUrl(imageUrl, 'high', 'webp')

const hasCardImage = computed(() => Boolean(card.value?.image) && !imageErrored.value)

const cardNumber = computed(() => {
  const local = card.value?.localId || '—'
  const official = card.value?.set?.cardCount?.official
  return official ? `${local}/${official}` : `#${local}`
})

const primaryType = computed(() => card.value?.types?.[0] || null)
const retreatIcon = computed(() => getTypeIcon('colorless'))

const stageLabel = computed(() => {
  if (!card.value) return 'Carte'
  if (card.value.stage) return card.value.stage
  if (card.value.category) return card.value.category
  return 'Carte Pokémon'
})

const handleImageError = () => {
  imageErrored.value = true
}

const goBack = () => {
  router.back()
}

const goToSet = (setId) => {
  if (setId) {
    router.push({ name: 'Set', params: { id: setId } })
  }
}

const goToSimilarCards = () => {
  const name = card.value?.name
  if (!name) return

  const primaryDexId = Array.isArray(card.value?.dexId)
    ? card.value.dexId[0]
    : card.value?.dexId

  const routeOptions = {
    name: 'CardsByName',
    params: { name }
  }

  if (primaryDexId !== undefined && primaryDexId !== null && primaryDexId !== '') {
    routeOptions.query = { dexId: primaryDexId }
  }

  router.push(routeOptions)
}

const formatWeakness = (weakness) => {
  if (!weakness) return '—'
  return `${weakness.type} ${weakness.value}`
}

const formatResistance = (resistance) => {
  if (!resistance) return '—'
  return `${resistance.type} ${resistance.value}`
}

const fetchCard = async () => {
  try {
    loading.value = true
    imageErrored.value = false
    const response = await fetch(`http://localhost:3000/api/cards/${route.params.id}`)
    const data = await response.json()

    if (data.success) {
      card.value = data.data
    } else {
      error.value = 'Carte non trouvée'
    }
  } catch (err) {
    error.value = 'Impossible de charger la carte'
    console.error('Erreur:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCard()
})
</script>

<style scoped>
.card-page {
  padding: 2rem 0 6rem;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent 55%), #050505;
}

.page-shell {
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

.card-board {
  background: rgba(12, 12, 12, 0.85);
  border-radius: 36px;
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.65);
  position: relative;
  overflow: hidden;
}

.card-board::after {
  content: '';
  position: absolute;
  inset: 15% 50% -20% 15%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent);
  filter: blur(70px);
}

.card-board__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.card-number-chip {
  padding: 0.4rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
}

.card-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 2.5rem;
  align-items: start;
  position: relative;
  z-index: 1;
}

.card-media {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card-media__frame {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.35);
}

.card-media__image {
  width: 100%;
  display: block;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
}

.card-placeholder {
  width: 100%;
  aspect-ratio: 63 / 88;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.card-image--placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.6;
}

.cta-stack {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cta-button {
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(120deg, #ff944d, #ff5f6d);
  color: #fff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.cta-button--secondary {
  background: linear-gradient(120deg, #38bdf8, #6366f1);
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: rgba(255, 255, 255, 0.85);
}

.card-info__header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 1rem;
}

.card-stage {
  text-transform: uppercase;
  letter-spacing: 0.25em;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 0.35rem;
}

.card-info h1 {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  color: #fff;
  font-weight: 900;
}

.card-hp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  flex-wrap: wrap;
}

.card-hp strong {
  font-size: 2.2rem;
  line-height: 1;
  font-weight: 900;
}

.type-chip-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.type-chip {
  width: 34px;
  height: 34px;
  object-fit: contain;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

.type-chip--fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
}

.card-category,
.card-set {
  margin: 0;
  color: rgba(255, 255, 255, 0.65);
}

.card-attacks {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.attack-line {
  padding: 1rem 1.2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.attack-line__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.attack-line__title strong {
  flex: 1;
  font-size: 1.1rem;
  color: #fff;
  font-weight: 900;
}

.attack-damage {
  font-weight: 700;
  color: white;
}

.attack-effect {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.attack-cost {
  display: flex;
  gap: 0.25rem;
}

.ability-icon {
  width: 100px;
  height: 32px;
  object-fit: contain;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.45));
}

.energy-icon-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
}

.energy-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(14, 165, 233, 0.25);
  color: #f0f9ff;
  font-weight: 700;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(14, 165, 233, 0.5);
}

.energy-icon--fallback {
  text-transform: uppercase;
}

.energy-icon--retreat {
  background: rgba(148, 163, 184, 0.2);
  border-color: rgba(148, 163, 184, 0.5);
  color: #fff;
}

.card-effect {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 22px;
  padding: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.effect-label {
  display: inline-block;
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.35rem;
}

.card-effect p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
}

.card-stat-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.stat-col {
  padding: 1.1rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
}

.stat-col + .stat-col {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-col p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.stat-value {
  display: block;
  margin-top: 0.4rem;
  font-weight: 700;
  color: #fff;
}

.stat-value--icons {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  align-items: center;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.35);
}

.type-badge__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.type-badge__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.type-badge__icon-fallback {
  font-weight: 700;
  color: #fff;
}

.type-badge__info {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  color: #fff;
}

.type-badge__type {
  font-size: 0.95rem;
  text-transform: capitalize;
}

.type-badge__value {
  font-size: 0.85rem;
  color: rgba(248, 250, 255, 0.8);
}

.retreat-icons {
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.card-meta {
  padding: 1rem 1.25rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-illustrator-link {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.inline-link {
  border: none;
  background: transparent;
  color: rgba(250, 204, 21, 0.85);
  font-weight: 600;
  cursor: pointer;
  position: relative;
  padding: 0.15rem 0.2rem;
  transition: color 0.2s ease, transform 0.2s ease;
}

.inline-link::after {
  content: '';
  position: absolute;
  left: 0.15rem;
  right: 0.15rem;
  bottom: 0.1rem;
  height: 2px;
  background: linear-gradient(90deg, rgba(250, 204, 21, 0.2), rgba(250, 204, 21, 0.7));
  border-radius: 999px;
  opacity: 0;
  transform: scaleX(0.6);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}

.inline-link:hover {
  color: #facc15;
  transform: translateY(-1px);
}

.inline-link:hover::after,
.inline-link:focus-visible::after {
  opacity: 1;
  transform: scaleX(1);
}

.inline-link:focus-visible {
  outline: none;
  color: #facc15;
}

.card-meta--links {
  border-style: dashed;
}

.variant-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.variant-tags span {
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.1);
  color: #e0f2fe;
  font-weight: 600;
  font-size: 0.85rem;
}

.image-error .card-media__frame {
  background: linear-gradient(180deg, rgba(255, 145, 145, 0.15), rgba(255, 225, 225, 0.05));
}

@media (max-width: 1024px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .card-media__frame {
    max-width: 380px;
    margin: 0 auto;
  }

  .cta-stack {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .cta-button {
    flex: 1 1 220px;
  }
}

@media (max-width: 640px) {
  .page-shell {
    padding: 0 1rem;
  }

  .card-board {
    padding: 1.75rem;
  }

  .card-stat-panel {
    grid-template-columns: 1fr;
  }
}
</style>
