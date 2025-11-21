<template>
	<div class="advanced-search-page">
		<main class="page-shell">
			<section class="hero-panel">
				<div>
					<p class="eyebrow">Recherche experte</p>
					<h1>Composez la carte parfaite</h1>
					<p class="hero-subtitle">
						Filtrez par caractéristiques, sets et formats de jeu pour trouver précisément la carte que vous cherchez.
					</p>
				</div>
				<div class="hero-actions">
					<button type="button" class="btn btn-secondary" @click="resetFilters" :disabled="isPristine">
						Réinitialiser
					</button>
					<button type="button" class="btn btn-primary" @click="submitSearch" :disabled="loading">
						{{ loading ? 'Recherche…' : 'Lancer la recherche' }}
					</button>
				</div>
			</section>

			<section class="filters-panel">
				<form class="filters-form" @submit.prevent="submitSearch">
					<div class="filters-group">
						<header>
							<h2>Identité</h2>
							<p>Recherchez par nom, artiste, rareté ou numéro de Pokédex.</p>
						</header>
						<div class="form-grid">
							<label class="form-field">
								<span>Nom de la carte</span>
								<input type="text" v-model="filters.name" placeholder="Ex : Pikachu" />
							</label>
							<label class="form-field">
								<span>Artiste</span>
								<input type="text" v-model="filters.artist" placeholder="Ex : Mitsuhiro Arita" />
							</label>
							<label class="form-field">
								<span>Rareté</span>
								<input type="text" v-model="filters.rarity" list="rarity-options" placeholder="Commune, Illustration secrète…" />
								<datalist id="rarity-options">
									<option v-for="option in raritySuggestions" :key="option" :value="option" />
								</datalist>
							</label>
							<label class="form-field">
								<span>Numéro Pokédex</span>
								<input type="number" min="1" v-model="filters.dexId" placeholder="Ex : 25" />
							</label>
						</div>
					</div>

					<div class="filters-group">
						<header>
							<h2>Caractéristiques</h2>
							<p>Filtrez par types, points de vie, faiblesses, résistances et coût de retraite.</p>
						</header>
						<div class="chips-section">
							<span>Types</span>
							<div class="chip-group">
								<button
									v-for="typeName in typeOptions"
									:key="typeName"
									type="button"
									class="chip"
									:class="{ 'chip--active': filters.types.includes(typeName) }"
									@click="toggleValue('types', typeName)"
								>
									{{ typeName }}
								</button>
							</div>
						</div>
						<div class="chips-section">
							<span>Faiblesses</span>
							<div class="chip-group">
								<button
									v-for="typeName in typeOptions"
									:key="`weak_${typeName}`"
									type="button"
									class="chip chip--ghost"
									:class="{ 'chip--active': filters.weaknesses.includes(typeName) }"
									@click="toggleValue('weaknesses', typeName)"
								>
									{{ typeName }}
								</button>
							</div>
						</div>
						<div class="chips-section">
							<span>Résistances</span>
							<div class="chip-group">
								<button
									v-for="typeName in typeOptions"
									:key="`res_${typeName}`"
									type="button"
									class="chip chip--ghost"
									:class="{ 'chip--active': filters.resistances.includes(typeName) }"
									@click="toggleValue('resistances', typeName)"
								>
									{{ typeName }}
								</button>
							</div>
						</div>
						<div class="form-grid ranges-grid">
							<label class="form-field">
								<span>PV minimum</span>
								<input type="number" min="0" v-model="filters.hpMin" placeholder="0" />
							</label>
							<label class="form-field">
								<span>PV maximum</span>
								<input type="number" min="0" v-model="filters.hpMax" placeholder="300" />
							</label>
							<label class="form-field">
								<span>Retraite min.</span>
								<input type="number" min="0" v-model="filters.retreatMin" placeholder="0" />
							</label>
							<label class="form-field">
								<span>Retraite max.</span>
								<input type="number" min="0" v-model="filters.retreatMax" placeholder="4" />
							</label>
						</div>
					</div>

					<div class="filters-group">
						<header>
							<h2>Sets & légalités</h2>
							<p>Sélectionnez un set précis ou ciblez les formats compétitifs disponibles.</p>
						</header>
						<div class="form-grid">
							<label class="form-field">
								<span>Série</span>
								<select v-model="filters.serieId">
									<option value="">Toutes les séries</option>
									<option v-for="serie in seriesOptions" :key="serie.id" :value="serie.id">
										{{ serie.name }}
									</option>
								</select>
							</label>
							<label class="form-field">
								<span>Set</span>
								<select v-model="filters.setId">
									<option value="">Tous les sets</option>
									<option v-for="set in filteredSets" :key="set.id" :value="set.id">
										{{ set.name }}
									</option>
								</select>
							</label>
							<label class="form-field">
								<span>Format recherché</span>
								<div class="chip-group chip-group--compact">
									<button
										v-for="format in legalitiesOptions"
										:key="format"
										type="button"
										class="chip"
										:class="{ 'chip--active': filters.legalities.includes(format) }"
										@click="toggleValue('legalities', format)"
									>
										{{ formatLabel(format) }}
									</button>
								</div>
							</label>
							<label class="form-field">
								<span>Statut</span>
								<select v-model="filters.legalStatus" :disabled="!filters.legalities.length">
									<option v-for="option in legalStatusOptions" :key="option.value" :value="option.value">
										{{ option.label }}
									</option>
								</select>
							</label>
						</div>
					</div>

					<div class="form-actions">
						<label class="form-field sort-field">
							<span>Trier par</span>
							<select v-model="sortBy">
								<option v-for="option in sortOptions" :key="option.value" :value="option.value">
									{{ option.label }}
								</option>
							</select>
						</label>
						<div class="actions-buttons">
							<button type="button" class="btn btn-secondary" @click="resetFilters" :disabled="isPristine">
								Réinitialiser
							</button>
							<button type="submit" class="btn btn-primary" :disabled="loading">
								{{ loading ? 'Recherche…' : 'Appliquer les filtres' }}
							</button>
						</div>
					</div>
				</form>
			</section>

			<section class="results-panel">
				<header class="results-header">
					<div>
						<p class="eyebrow">Résultats</p>
						<h2>
							{{ pagination.total }} carte{{ pagination.total > 1 ? 's' : '' }} trouvée{{ pagination.total > 1 ? 's' : '' }}
						</h2>
						<p class="subtitle" v-if="activeFiltersCount">
							{{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }} appliqué{{ activeFiltersCount > 1 ? 's' : '' }}
						</p>
					</div>
					<div class="page-indicator" v-if="pagination.pages > 1">
						Page {{ currentPage }} / {{ pagination.pages }}
					</div>
				</header>

				<div v-if="loading" class="status-tile">Chargement des cartes…</div>
				<div v-else-if="error" class="status-tile status-tile--error">{{ error }}</div>
				<div v-else-if="!cards.length" class="status-tile status-tile--empty">
					Ajustez les filtres pour afficher des résultats.
				</div>
				<div v-else class="cards-grid">
					<article
						v-for="card in cards"
						:key="card.id"
						class="result-card"
						@click="goToCard(card.id)"
					>
						<div class="result-card__visual" :class="{ 'image-error': erroredCards.has(card.id) }">
							<img
								v-if="card.image && !erroredCards.has(card.id)"
								:src="getCardImage(card.image)"
								:alt="card.name"
								loading="lazy"
								@error="handleImageError(card.id)"
							/>
							<img v-else :src="placeholderCard" :alt="card.name" />
						</div>
						<div class="result-card__body">
							<div class="card-meta__top">
								<h3>{{ card.name || 'Carte inconnue' }}</h3>
								<span class="card-set">{{ card.set?.name || 'Set inconnu' }}</span>
							</div>
							<div class="card-meta__bottom">
								<span v-if="card.hp" class="badge">{{ formatHp(card.hp) }}</span>
								<span v-if="card.types?.length" class="badge badge--ghost">
									{{ card.types.join(' • ') }}
								</span>
								<span v-if="card.rarity" class="badge badge--ghost">
									{{ card.rarity }}
								</span>
							</div>
						</div>
					</article>
				</div>

				<div v-if="pagination.pages > 1" class="pagination">
					<button class="pagination-btn" :disabled="currentPage === 1" @click="previousPage">
						← Précédent
					</button>
					<span>Page {{ currentPage }} sur {{ pagination.pages }}</span>
					<button class="pagination-btn" :disabled="currentPage === pagination.pages" @click="nextPage">
						Suivant →
					</button>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import placeholderCard from '@/assets/placeholder_card.png'
import { getCardImageUrl } from '../services/imageService'
import { fetchAdvancedCards, fetchSeriesList, fetchSetsList, fetchCardsMetadata } from '../services/cardsService'

const router = useRouter()
const RESULT_LIMIT = 36

const typeOptions = [
	'Plante',
	'Feu',
	'Eau',
	'Électrique',
	'Psy',
	'Combat',
	'Obscurité',
	'Métal',
	'Dragon',
	'Fée',
	'Incolore'
]

const defaultRaritySuggestions = [
	'Commune',
	'Peu commune',
	'Rare',
	'Rare Holo',
	'Ultra Rare',
	'Illustration Spéciale',
	'Illustration Rare',
	'Illustration spéciale rare',
	'Hyper Rare',
	'Secret Rare'
]

const raritySuggestions = ref([...defaultRaritySuggestions])

const defaultFormatOptions = ['standard', 'expanded']
const legalitiesOptions = ref([...defaultFormatOptions])
const legalStatusOptions = [
	{ value: 'legal', label: 'Autorisé' },
	{ value: 'banned', label: 'Interdit' }
]

const formatLabelMap = {
	standard: 'Standard',
	expanded: 'Étendu',
	unlimited: 'Illimité',
	modern: 'Moderne',
	glc: 'GLC'
}

const sortOptions = [
	{ value: 'name', label: 'Nom (A → Z)' },
	{ value: '-name', label: 'Nom (Z → A)' },
	{ value: 'hp', label: 'PV croissants' },
	{ value: '-hp', label: 'PV décroissants' },
	{ value: 'localId', label: 'Numéro de carte' },
	{ value: 'releaseDate', label: 'Date de sortie' }
]

const normalizeNumericFilter = (value) => {
	if (value === null || value === undefined || value === '') return undefined
	const numeric = Number(value)
	return Number.isNaN(numeric) ? undefined : numeric
}

const normalizeFormatKey = (value) => {
	if (value === undefined || value === null) return ''
	return value.toString().trim().toLowerCase()
}

const formatLabel = (formatKey) => formatLabelMap[formatKey] || formatKey.toUpperCase()

const mergeRaritySuggestions = (values = []) => {
	const map = new Map()
	const addValue = (label) => {
		if (!label) return
		const trimmed = label.trim()
		if (!trimmed) return
		const key = trimmed.toLowerCase()
		if (!map.has(key)) {
			map.set(key, trimmed)
		}
	}

	;[...raritySuggestions.value, ...values].forEach(addValue)
	raritySuggestions.value = Array.from(map.values()).sort((a, b) =>
		a.localeCompare(b, 'fr', { sensitivity: 'base' })
	)
}

const setLegalitiesOptions = (values = []) => {
	const normalizedKeys = values
		.map((value) => normalizeFormatKey(value))
		.filter(Boolean)
	const uniqueKeys = normalizedKeys.length
		? Array.from(new Set(normalizedKeys))
		: [...defaultFormatOptions]
	legalitiesOptions.value = uniqueKeys
	if (filters.legalities.length) {
		const allowed = new Set(uniqueKeys)
		const nextSelection = filters.legalities
			.map((value) => normalizeFormatKey(value))
			.filter((value) => allowed.has(value))
		if (nextSelection.length !== filters.legalities.length) {
			filters.legalities.splice(0, filters.legalities.length, ...nextSelection)
		}
	}
}

const defaultFilters = () => ({
	name: '',
	types: [],
	hpMin: '',
	hpMax: '',
	weaknesses: [],
	resistances: [],
	retreatMin: '',
	retreatMax: '',
	setId: '',
	serieId: '',
	legalities: [],
	legalStatus: 'legal',
	dexId: '',
	artist: '',
	rarity: ''
})

const filters = reactive(defaultFilters())
const sortBy = ref('name')
const currentPage = ref(1)
const cards = ref([])
const pagination = ref({ page: 1, limit: RESULT_LIMIT, total: 0, pages: 0 })
const loading = ref(false)
const error = ref(null)
const seriesOptions = ref([])
const allSets = ref([])
const erroredCards = ref(new Set())

const filteredSets = computed(() => {
	if (!allSets.value.length) return []
	if (!filters.serieId) {
		return allSets.value
	}
	return allSets.value.filter((set) => set?.serie?.id === filters.serieId)
})

const activeFiltersCount = computed(() => {
	let total = 0
	if (filters.name.trim()) total++
	if (filters.artist.trim()) total++
	if (filters.rarity.trim()) total++
	if (filters.dexId) total++
	if (filters.types.length) total++
	if (filters.weaknesses.length) total++
	if (filters.resistances.length) total++
	if (filters.hpMin) total++
	if (filters.hpMax) total++
	if (filters.retreatMin) total++
	if (filters.retreatMax) total++
	if (filters.setId) total++
	if (filters.serieId) total++
	if (filters.legalities.length) total++
	return total
})

const isPristine = computed(() => activeFiltersCount.value === 0 && sortBy.value === 'name')

const fetchTaxonomies = async () => {
	try {
		const [series, sets, metadata] = await Promise.all([
			fetchSeriesList(),
			fetchSetsList({ limit: 800 }),
			fetchCardsMetadata()
		])
		seriesOptions.value = (series || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
		allSets.value = (sets || []).sort((a, b) => (a.name || '').localeCompare(b.name || ''))
		if (metadata?.rarities?.length) {
			mergeRaritySuggestions(metadata.rarities)
		}
		setLegalitiesOptions(metadata?.legalFormats || [])
	} catch (err) {
		console.warn('Impossible de charger les séries/sets :', err)
	}
}

const buildQueryPayload = () => ({
	page: currentPage.value,
	limit: RESULT_LIMIT,
	sort: sortBy.value,
	name: filters.name || undefined,
	illustrator: filters.artist || undefined,
	rarity: filters.rarity || undefined,
	dexId: filters.dexId || undefined,
	type: filters.types,
	weaknesses: filters.weaknesses,
	resistances: filters.resistances,
	hpMin: normalizeNumericFilter(filters.hpMin),
	hpMax: normalizeNumericFilter(filters.hpMax),
	retreatMin: normalizeNumericFilter(filters.retreatMin),
	retreatMax: normalizeNumericFilter(filters.retreatMax),
	setId: filters.setId || undefined,
	serieId: filters.serieId || undefined,
	legalities: filters.legalities,
	legalStatus: filters.legalities.length ? filters.legalStatus : undefined
})

const runSearch = async () => {
	loading.value = true
	error.value = null
	try {
		const payload = buildQueryPayload()
		const { cards: fetchedCards, pagination: meta } = await fetchAdvancedCards(payload)
		cards.value = fetchedCards
		pagination.value = { ...meta, page: meta?.page || currentPage.value, limit: RESULT_LIMIT }
		erroredCards.value = new Set()
	} catch (err) {
		console.error('Erreur de recherche avancée:', err)
		error.value = err?.message || 'Impossible de charger les cartes.'
		cards.value = []
		pagination.value = { page: 1, limit: RESULT_LIMIT, total: 0, pages: 0 }
	} finally {
		loading.value = false
	}
}

const submitSearch = () => {
	if (currentPage.value !== 1) {
		currentPage.value = 1
		return
	}
	runSearch()
}

const resetFilters = () => {
	Object.assign(filters, defaultFilters())
	sortBy.value = 'name'
	erroredCards.value = new Set()
	submitSearch()
}

const toggleValue = (key, value) => {
	const bucket = filters[key]
	if (!Array.isArray(bucket)) return
	const index = bucket.indexOf(value)
	if (index === -1) {
		bucket.push(value)
	} else {
		bucket.splice(index, 1)
	}
}

const previousPage = () => {
	if (currentPage.value > 1) {
		currentPage.value -= 1
	}
}

const nextPage = () => {
	if (currentPage.value < pagination.value.pages) {
		currentPage.value += 1
	}
}

const handleImageError = (cardId) => {
	const next = new Set(erroredCards.value)
	next.add(cardId)
	erroredCards.value = next
}

const getCardImage = (imageUrl) => getCardImageUrl(imageUrl, 'low', 'webp')

const formatHp = (hp) => `${hp} PV`

const goToCard = (id) => {
	router.push({ name: 'Card', params: { id } })
}

watch(
	() => filters.serieId,
	() => {
		if (!filters.setId) return
		const stillAvailable = filteredSets.value.some((set) => set.id === filters.setId)
		if (!stillAvailable) {
			filters.setId = ''
		}
	}
)

watch(currentPage, (newPage, oldPage) => {
	if (newPage === oldPage) return
	runSearch()
})

onMounted(() => {
	fetchTaxonomies()
	runSearch()
})
</script>

<style scoped>
.advanced-search-page {
	padding: 2rem 0 5rem;
	--surface-base: rgba(8, 8, 8, 0.95);
	--surface-soft: rgba(12, 12, 12, 0.85);
	--surface-card: rgba(15, 15, 15, 0.75);
	--stroke-light: rgba(255, 255, 255, 0.08);
	--stroke-strong: rgba(255, 255, 255, 0.18);
	--text-strong: rgba(255, 255, 255, 0.92);
	--text-muted: rgba(255, 255, 255, 0.65);
	--cta-light: #f7f7f7;
	--cta-dark: #cfcfcf;
	--cta-text: #050505;
}

.page-shell {
	max-width: 1380px;
	margin: 0 auto;
	padding: 0 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.2em;
	font-size: 0.75rem;
	color: rgba(255, 255, 255, 0.6);
	margin-bottom: 0.25rem;
}

.hero-panel {
	border-radius: 36px;
	padding: 2.5rem;
	background: linear-gradient(135deg, var(--surface-base), #050505);
	border: 1px solid var(--stroke-light);
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 2rem;
	flex-wrap: wrap;
}

.hero-panel h1 {
	margin: 0;
	font-size: clamp(2rem, 4vw, 3rem);
}

.hero-subtitle {
	color: var(--text-muted);
	max-width: 550px;
}

.hero-actions {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.ghost-button,
.primary-button {
	padding: 0.85rem 1.75rem;
	border-radius: 999px;
	font-weight: 600;
	border: 1px solid transparent;
	cursor: pointer;
	transition: all 0.2s ease;
}

.ghost-button {
	background: transparent;
	border-color: var(--stroke-strong);
	color: var(--text-strong);
}

.ghost-button:not(:disabled):hover {
	border-color: rgba(255, 255, 255, 0.4);
}

.primary-button {
	background: linear-gradient(135deg, var(--cta-light), var(--cta-dark));
	border-color: rgba(255, 255, 255, 0.05);
	color: var(--cta-text);
	box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
}

.primary-button:not(:disabled):hover {
	transform: translateY(-1px);
	box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
}

.filters-panel,
.results-panel {
	border-radius: 32px;
	padding: 2rem;
	background: var(--surface-card);
	border: 1px solid var(--stroke-light);
}

.filters-form {
	display: flex;
	flex-direction: column;
	gap: 2rem;
}

.filters-group {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.filters-group header h2 {
	margin: 0;
}

.filters-group header p {
	margin: 0.25rem 0 0;
	color: var(--text-muted);
}

.form-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 1rem;
}

.form-field {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	font-size: 0.9rem;
	color: var(--text-strong);
}

.form-field input,
.form-field select {
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 14px;
	padding: 0.75rem 1rem;
	color: #fff;
	font-size: 0.95rem;
	transition: border-color 0.2s ease, background 0.2s ease;
}

.form-field input:focus,
.form-field select:focus {
	outline: none;
	border-color: rgba(255, 255, 255, 0.3);
	background: rgba(255, 255, 255, 0.07);
}

.chips-section {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.chip-group {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.chip {
	border-radius: 999px;
	padding: 0.45rem 0.95rem;
	border: 1px solid var(--stroke-strong);
	background: rgba(255, 255, 255, 0.04);
	color: var(--text-strong);
	cursor: pointer;
	font-size: 0.85rem;
	transition: all 0.2s ease;
}

.chip--ghost {
	border-style: solid;
}

.chip--active {
	background: rgba(255, 255, 255, 0.18);
	border-color: rgba(255, 255, 255, 0.45);
	color: #fff;
}

.chip-group--compact .chip {
	padding: 0.35rem 0.8rem;
}

.ranges-grid {
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.form-actions {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	gap: 1rem;
	flex-wrap: wrap;
}

.sort-field {
	min-width: 200px;
}

.actions-buttons {
	display: flex;
	gap: 1rem;
}

.results-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
	margin-bottom: 1.5rem;
}

.results-header h2 {
	margin: 0;
}

.subtitle {
	margin: 0.25rem 0 0;
	color: var(--text-muted);
}

.page-indicator {
	padding: 0.5rem 1rem;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.12);
}

.status-tile {
	padding: 2rem;
	border-radius: 24px;
	border: 1px solid var(--stroke-light);
	background: rgba(255, 255, 255, 0.02);
	text-align: center;
}

.status-tile--error {
	color: var(--text-strong);
	border-color: rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.04);
}

.status-tile--empty {
	color: rgba(255, 255, 255, 0.75);
}

.cards-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	gap: 1.5rem;
}

.result-card {
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(15, 15, 15, 0.75);
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
}

.result-card__visual {
	position: relative;
	padding: 1rem;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
}

.result-card__visual img {
	width: 100%;
	border-radius: 18px;
	box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
}

.image-error {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(0, 0, 0, 0.35));
}

.result-card__body {
	padding: 1.25rem;
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.card-meta__top {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
}

.card-meta__top h3 {
	margin: 0;
	font-size: 1.05rem;
}

.card-set {
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.9rem;
}

.card-meta__bottom {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
}

.badge {
	padding: 0.35rem 0.8rem;
	border-radius: 999px;
	font-size: 0.8rem;
	background: rgba(255, 255, 255, 0.12);
	color: var(--text-strong);
}

.badge--ghost {
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid var(--stroke-light);
}

.pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1.5rem;
	margin-top: 2rem;
}

.pagination-btn {
	padding: 0.75rem 1.5rem;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.04);
	color: #fff;
	cursor: pointer;
	transition: all 0.2s ease;
}

.pagination-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

.pagination-btn:not(:disabled):hover {
	border-color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
	.hero-panel,
	.filters-panel,
	.results-panel {
		padding: 1.5rem;
	}

	.form-actions {
		flex-direction: column;
		align-items: stretch;
	}

	.actions-buttons {
		width: 100%;
		justify-content: space-between;
	}

	.hero-actions {
		width: 100%;
		justify-content: space-between;
	}
}
</style>