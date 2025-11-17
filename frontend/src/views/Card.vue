<template>
  <div class="card-detail-view">
    <div v-if="loading" class="loading">
      Chargement...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="goBack" class="back-button">Retour</button>
    </div>

    <div v-else-if="card" class="card-container">
      <button @click="goBack" class="back-button">← Retour</button>

      <div class="card-content">
        <!-- Image de la carte -->
        <div class="card-image-section">
          <img 
            v-if="card.image" 
            :src="getCardImage(card.image)" 
            :alt="card.name" 
            class="card-image-large"
            @error="handleImageError"
          />
          <div v-else class="card-placeholder-large">
            <span>{{ card.localId }}</span>
          </div>
        </div>

        <!-- Informations de la carte -->
        <div class="card-info-section">
          <div class="card-header">
            <h1>{{ card.name }}</h1>
            <p class="card-number">{{ card.localId }}/{{ card.set?.cardCount?.official }}</p>
          </div>

          <div class="card-details">
            <!-- Set -->
            <div class="detail-group">
              <h3>Set</h3>
              <p class="set-link" @click="goToSet(card.set?.id)">{{ card.set?.name }}</p>
              <p v-if="card.serie?.name" class="serie-name">{{ card.serie?.name }}</p>
            </div>

            <!-- Stage -->
            <div v-if="card.stage" class="detail-group">
              <h3>Stade</h3>
              <p>{{ card.stage }}</p>
            </div>

            <!-- Évolution -->
            <div v-if="card.evolveFrom" class="detail-group">
              <h3>Évolue de</h3>
              <p>{{ card.evolveFrom }}</p>
            </div>

            <!-- Types -->
            <div v-if="card.types && card.types.length" class="detail-group">
              <h3>Type(s)</h3>
              <div class="types-list">
                <span v-for="type in card.types" :key="type" class="type-badge">
                  {{ type }}
                </span>
              </div>
            </div>

            <!-- HP -->
            <div v-if="card.hp" class="detail-group">
              <h3>HP</h3>
              <p class="hp-value">{{ card.hp }}</p>
            </div>

            <!-- Catégorie -->
            <div v-if="card.category" class="detail-group">
              <h3>Catégorie</h3>
              <p>{{ card.category }}</p>
            </div>

            <!-- Rareté -->
            <div v-if="card.rarity" class="detail-group">
              <h3>Rareté</h3>
              <p>{{ card.rarity }}</p>
            </div>

            <!-- Regulation Mark -->
            <div v-if="card.regulationMark" class="detail-group">
              <h3>Marque de Régulation</h3>
              <p class="regulation-mark">{{ card.regulationMark }}</p>
            </div>

            <!-- Dex IDs -->
            <div v-if="card.dexId && card.dexId.length" class="detail-group">
              <h3>Numéro Pokédex</h3>
              <p>{{ card.dexId.join(', ') }}</p>
            </div>

            <!-- Illustrateur -->
            <div v-if="card.illustrator" class="detail-group">
              <h3>Illustrateur</h3>
              <p>{{ card.illustrator }}</p>
            </div>

            <!-- Description/Effet -->
            <div v-if="card.effect" class="detail-group">
              <h3>Effet</h3>
              <p class="effect-text">{{ card.effect }}</p>
            </div>

            <!-- Abilities -->
            <div v-if="card.abilities && card.abilities.length" class="detail-group abilities">
              <h3>Talents</h3>
              <div v-for="(ability, index) in card.abilities" :key="index" class="ability-item">
                <div class="ability-header">
                  <span class="ability-type">{{ ability.type }}</span>
                  <span class="ability-name">{{ ability.name }}</span>
                </div>
                <p v-if="ability.effect" class="ability-effect">{{ ability.effect }}</p>
              </div>
            </div>

            <!-- Attaques -->
            <div v-if="card.attacks && card.attacks.length" class="detail-group attacks">
              <h3>Attaques</h3>
              <div v-for="(attack, index) in card.attacks" :key="index" class="attack-item">
                <div class="attack-header">
                  <div class="attack-cost">
                    <span v-for="(cost, i) in attack.cost" :key="i" class="energy-icon">
                      {{ cost.charAt(0) }}
                    </span>
                  </div>
                  <span class="attack-name">{{ attack.name }}</span>
                  <span v-if="attack.damage" class="attack-damage">{{ attack.damage }}</span>
                </div>
                <p v-if="attack.effect" class="attack-effect">{{ attack.effect }}</p>
              </div>
            </div>

            <!-- Faiblesses -->
            <div v-if="card.weaknesses && card.weaknesses.length" class="detail-group">
              <h3>Faiblesses</h3>
              <div class="weakness-list">
                <span v-for="(weakness, index) in card.weaknesses" :key="index" class="weakness-badge">
                  {{ weakness.type }} {{ weakness.value }}
                </span>
              </div>
            </div>

            <!-- Résistances -->
            <div v-if="card.resistances && card.resistances.length" class="detail-group">
              <h3>Résistances</h3>
              <div class="resistance-list">
                <span v-for="(resistance, index) in card.resistances" :key="index" class="resistance-badge">
                  {{ resistance.type }} {{ resistance.value }}
                </span>
              </div>
            </div>

            <!-- Coût de retraite -->
            <div v-if="card.retreat !== undefined && card.retreat !== null" class="detail-group">
              <h3>Coût de retraite</h3>
              <div class="retreat-cost">
                <span v-for="i in card.retreat" :key="i" class="energy-icon retreat">⚪</span>
                <span v-if="card.retreat === 0">Aucun</span>
              </div>
            </div>

            <!-- Légalité -->
            <div v-if="card.legal" class="detail-group">
              <h3>Légalité</h3>
              <div class="legal-info">
                <div class="legal-item">
                  <span class="legal-format">Standard:</span>
                  <span :class="['legal-status', card.legal.standard ? 'legal' : 'illegal']">
                    {{ card.legal.standard ? '✓ Légal' : '✗ Illégal' }}
                  </span>
                </div>
                <div class="legal-item">
                  <span class="legal-format">Étendu:</span>
                  <span :class="['legal-status', card.legal.expanded ? 'legal' : 'illegal']">
                    {{ card.legal.expanded ? '✓ Légal' : '✗ Illégal' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Variantes -->
            <div v-if="card.variants" class="detail-group">
              <h3>Variantes</h3>
              <div class="variants-list">
                <span v-if="card.variants.normal" class="variant-badge">Normal</span>
                <span v-if="card.variants.reverse" class="variant-badge">Reverse</span>
                <span v-if="card.variants.holo" class="variant-badge">Holo</span>
                <span v-if="card.variants.firstEdition" class="variant-badge">1ère Édition</span>
                <span v-if="card.variants.wPromo" class="variant-badge">W Promo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardImageUrl } from '../services/imageService'

const route = useRoute()
const router = useRouter()
const card = ref(null)
const loading = ref(true)
const error = ref(null)

const getCardImage = (imageUrl) => {
  return getCardImageUrl(imageUrl, 'high', 'webp')
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  e.target.parentElement.classList.add('image-error')
}

const goBack = () => {
  router.back()
}

const goToSet = (setId) => {
  if (setId) {
    router.push({ name: 'Set', params: { id: setId } })
  }
}

const fetchCard = async () => {
  try {
    loading.value = true
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
.card-detail-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
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

.back-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  margin-bottom: 2rem;
}

.back-button:hover {
  background: #2980b9;
}

.card-container {
  min-height: 70vh;
}

.card-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-image-section {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: sticky;
  top: 2rem;
}

.card-image-large {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-placeholder-large {
  width: 100%;
  aspect-ratio: 63/88;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
  border-radius: 12px;
  font-size: 4rem;
  font-weight: bold;
  color: #999;
}

.image-error {
  background: linear-gradient(135deg, #ffe0e0 0%, #fff5f5 100%);
}

.card-info-section {
  overflow-y: auto;
  max-height: 85vh;
}

.card-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #3498db;
}

.card-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.card-number {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-group {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.detail-group h3 {
  font-size: 1.1rem;
  color: #3498db;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-group p {
  font-size: 1.1rem;
  color: #2c3e50;
  margin: 0.25rem 0;
}

.serie-name {
  color: #7f8c8d !important;
  font-size: 1rem !important;
}

.set-link {
  cursor: pointer;
  color: #3498db !important;
  font-weight: 600 !important;
  transition: color 0.2s;
}

.set-link:hover {
  color: #2980b9 !important;
  text-decoration: underline;
}

.types-list,
.weakness-list,
.resistance-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.type-badge,
.weakness-badge,
.resistance-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.type-badge {
  background: #3498db;
  color: white;
}

.weakness-badge {
  background: #e74c3c;
  color: white;
}

.resistance-badge {
  background: #27ae60;
  color: white;
}

.hp-value {
  font-size: 1.5rem !important;
  font-weight: bold;
  color: #e74c3c !important;
}

.effect-text {
  line-height: 1.6;
  font-style: italic;
}

.attacks {
  background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
}

.attack-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.attack-item:last-child {
  margin-bottom: 0;
}

.attack-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.attack-cost {
  display: flex;
  gap: 0.25rem;
}

.energy-icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: #f39c12;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 0.7rem;
  font-weight: bold;
}

.attack-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
  flex: 1;
}

.attack-damage {
  font-weight: bold;
  font-size: 1.2rem;
  color: #e74c3c;
}

.attack-effect {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.5rem;
}

.abilities {
  background: linear-gradient(135deg, #f5f5ff 0%, #e8e8ff 100%);
}

.ability-item {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.ability-item:last-child {
  margin-bottom: 0;
}

.ability-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ability-type {
  padding: 0.25rem 0.75rem;
  background: #9b59b6;
  color: white;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.ability-name {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
  flex: 1;
}

.ability-effect {
  color: #7f8c8d;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-top: 0.5rem;
}

.regulation-mark {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #34495e;
  color: white;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem !important;
}

.retreat-cost {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.energy-icon.retreat {
  background: #95a5a6;
}

.legal-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legal-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
}

.legal-format {
  font-weight: 600;
  min-width: 100px;
}

.legal-status {
  font-weight: bold;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
}

.legal-status.legal {
  background: #d4edda;
  color: #155724;
}

.legal-status.illegal {
  background: #f8d7da;
  color: #721c24;
}

.variants-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.variant-badge {
  padding: 0.5rem 1rem;
  background: #f39c12;
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

@media (max-width: 968px) {
  .card-content {
    grid-template-columns: 1fr;
  }

  .card-image-section {
    position: relative;
    top: 0;
  }

  .card-info-section {
    max-height: none;
  }

  .card-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .card-detail-view {
    padding: 1rem;
  }

  .card-content {
    padding: 1.5rem;
  }
}
</style>
