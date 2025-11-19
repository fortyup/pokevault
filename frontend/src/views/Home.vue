<template>
  <div class="landing-page">
    <main class="page-shell">
      <!-- Hero Section -->
      <section class="hero">
      <div class="hero-content">
        <div class="badge">
          ✨ Votre collection Pokémon commence ici
        </div>
        <h1 class="hero-title">
          Gérez votre collection<br />avec PokeVault
        </h1>
        <p class="hero-subtitle">
          Ne perdez plus jamais une carte. Organisez, suivez et valorisez votre collection Pokémon.
        </p>
        <div class="cta-buttons">
          <router-link to="/sets" class="btn btn-primary">Découvrir les sets</router-link>
          <a href="#features" class="btn btn-secondary">En savoir plus</a>
        </div>
      </div>
      
      <!-- Visual Element with Glow -->
      <div class="hero-visual">
        <div class="glow-orb"></div>
        <FloatingCards />
      </div>
      </section>

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
      <section class="stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">10K+</div>
          <div class="stat-label">Cartes référencées</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">100+</div>
          <div class="stat-label">Sets disponibles</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">20+</div>
          <div class="stat-label">Séries complètes</div>
        </div>
      </div>
      </section>

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
import Header from '@/components/Header.vue'
import FeatureCard from '@/components/FeatureCard.vue'

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
</script>

<style scoped>
/* Hero Section */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 2rem 4rem;
  text-align: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 2rem;
  animation: fadeInDown 0.6s ease-out;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #888888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.btn {
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  color: #000000;
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.1rem;
}

/* Hero Visual */
.hero-visual {
  position: relative;
  margin-top: 4rem;
  width: 100%;
  max-width: 1000px;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.glow-orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 300px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0.15) 30%,
    transparent 70%
  );
  filter: blur(60px);
  animation: pulse 4s ease-in-out infinite;
  pointer-events: none;
}

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

/* Stats Section */
.stats {
  padding: 6rem 2rem;
}

.stats-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  text-align: center;
}

.stat-number {
  font-size: 3.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #888888 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
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

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    min-height: 80vh;
    padding: 3rem 1.5rem;
  }
  
  .features {
    padding: 4rem 1.5rem;
  }
  
  .stats {
    padding: 4rem 1.5rem;
  }
  
  .final-cta {
    padding: 4rem 1.5rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    width: 100%;
  }
}
</style>