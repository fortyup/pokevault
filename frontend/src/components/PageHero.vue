<template>
  <section class="page-hero" :class="`page-hero--${align}`">
    <div class="hero-content">
      <div v-if="badge || $slots.badge" class="badge">
        <slot name="badge">
          {{ badge }}
        </slot>
      </div>
      <h1 class="hero-title">
        <slot name="title">
          {{ title }}
        </slot>
      </h1>
      <p v-if="subtitle || $slots.subtitle" class="hero-subtitle">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </p>
      <div v-if="$slots.actions" class="cta-buttons">
        <slot name="actions" />
      </div>
    </div>
    <div v-if="$slots.visual" class="hero-visual">
      <slot name="visual" />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  badge: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  align: {
    type: String,
    default: 'center'
  }
})
</script>

<style scoped>
.page-hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem 3rem;
}

.page-hero--left {
  text-align: left;
  align-items: flex-start;
}

.page-hero--left .hero-content {
  margin-left: 0;
  margin-right: auto;
}

.page-hero--left .hero-subtitle {
  margin-left: 0;
  margin-right: 0;
}

.page-hero--left .cta-buttons {
  justify-content: flex-start;
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
  background: linear-gradient(135deg, #ffffff 0%, #b7b7b7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 640px;
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

.hero-visual {
  position: relative;
  margin-top: 4rem;
  width: 100%;
  max-width: 1000px;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}

.hero-visual :deep(.glow-orb) {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 320px;
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
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.85;
    transform: translate(-50%, -50%) scale(1.08);
  }
}

@media (max-width: 768px) {
  .page-hero {
    min-height: unset;
    padding: 3rem 1.5rem;
  }

  .hero-visual {
    min-height: 320px;
  }

  .cta-buttons {
    flex-direction: column;
  }
}
</style>
