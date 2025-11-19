<template>
  <div class="landing-page">
    <main class="page-shell">
      <PageHero
        badge="✨ Votre collection Pokémon commence ici"
        title="Gérez votre collection avec PokeVault"
        subtitle="Ne perdez plus jamais une carte. Organisez, suivez et valorisez votre collection Pokémon."
      >
        <template #title>
          Gérez votre collection<br />avec PokeVault
        </template>
        <template #actions>
          <router-link to="/sets" class="btn btn-primary">Découvrir les sets</router-link>
          <a href="#features" class="btn btn-secondary">En savoir plus</a>
        </template>
        <template #visual>
          <div class="glow-orb"></div>
          <FloatingCards />
        </template>
      </PageHero>

      <!-- Features Section -->
      <section id="features" class="features">
      <div class="features-grid">
        <FeatureCard
          v-for="feature in features"
          :key="feature.title"
          :icon="feature.icon"
          :title="feature.title"
          :description="feature.description"
        />
      </div>
      </section>

      <!-- Stats Section -->
      <StatHighlights :stats="homeStats" />

      <!-- CTA Section -->
      <section class="final-cta">
      <h2>Prêt à commencer votre collection ?</h2>
      <p>Rejoignez PokeVault dès aujourd'hui et ne perdez plus jamais une carte.</p>
      <router-link to="/sets" class="btn btn-primary btn-large">Parcourir les sets</router-link>
      </section>
    </main>
  </div>
</template>

<script setup>
import FloatingCards from '@/components/FloatingCards.vue'
import FeatureCard from '@/components/FeatureCard.vue'
import PageHero from '@/components/PageHero.vue'
import StatHighlights from '@/components/StatHighlights.vue'

const features = [
  {
    icon: '📚',
    title: 'Base de données complète',
    description: 'Accédez à toutes les cartes Pokémon, séries et sets synchronisés avec TCGdex.'
  },
  {
    icon: '🎯',
    title: 'Gestion intuitive',
    description: 'Organisez votre collection facilement avec une interface moderne et rapide.'
  },
  {
    icon: '🔍',
    title: 'Recherche avancée',
    description: 'Trouvez rapidement vos cartes par nom, série, type ou rareté.'
  },
  {
    icon: '📊',
    title: 'Suivi de collection',
    description: "Visualisez votre progression et les cartes qu'il vous manque."
  }
]

const homeStats = [
  { value: '10K+', label: 'Cartes référencées' },
  { value: '100+', label: 'Sets disponibles' },
  { value: '20+', label: 'Séries complètes' }
]
</script>

<style scoped>
/* Features Section */
.features {
  padding: 8rem 2rem;
  background: rgba(0, 0, 0, 0.2);
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  grid-auto-rows: minmax(200px, 1fr);
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  overflow: hidden;
  background: rgba(5, 5, 5, 0.35);
}

/* Final CTA */
.final-cta {
  padding: 8rem 2rem 8rem;
  text-align: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.final-cta h2 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
}

.final-cta p {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .features {
    padding: 4rem 1.5rem;
  }
  
  .final-cta {
    padding: 4rem 1.5rem;
  }
}
</style>