<template>
  <article class="feature-card" :class="{ 'is-static': !interactive }">
    <div class="icon-wrapper" v-if="icon">
      <span class="icon" aria-hidden="true">{{ icon }}</span>
    </div>
    <div class="text-wrapper">
      <h3 class="title">{{ title }}</h3>
      <p class="description">
        <slot>{{ description }}</slot>
      </p>
    </div>
  </article>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  interactive: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.feature-card {
  position: relative;
  padding: 2.25rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  margin: -0.5px;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 0;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: background 0.3s ease, transform 0.3s ease, border-color 0.3s ease;
}

.feature-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 20px;
  opacity: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
  transition: opacity 0.3s ease;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.feature-card:hover::after {
  opacity: 1;
}

.feature-card.is-static:hover {
  transform: none;
  background: rgba(10, 10, 10, 0.85);
  border-color: rgba(255, 255, 255, 0.12);
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 -4px 12px rgba(0, 0, 0, 0.4);
}

.icon {
  font-size: 1.5rem;
}

.text-wrapper {
  text-align: left;
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem;
}

.description {
  color: rgba(255, 255, 255, 0.72);
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .feature-card {
    padding: 1.75rem;
    min-height: unset;
  }

  .title {
    font-size: 1.1rem;
  }
}
</style>
