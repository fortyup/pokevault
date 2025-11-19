<template>
  <div class="card-showcase">
    <div 
      v-for="(card, index) in cards" 
      :key="card.id"
      :class="['floating-card', `card-${index + 1}`]"
    >
      <CardImage
        v-if="card.image"
        :imageUrl="card.image"
        :alt="card.name"
        quality="high"
        loading="eager"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CardImage from '@/components/CardImage.vue'

const cards = ref([
  { 
    id: 1, 
    name: 'Zekrom', 
    image: 'https://assets.tcgdex.net/fr/sv/sv10.5b/172/high.webp' 
  },
  { 
    id: 2, 
    name: 'Victini', 
    image: 'https://assets.tcgdex.net/fr/sv/sv10.5b/171/high.webp' 
  },
  { 
    id: 3, 
    name: 'Reshiram', 
    image: 'https://assets.tcgdex.net/fr/sv/sv10.5w/173/high.webp' 
  }
])
</script>

<style scoped>
.card-showcase {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  padding: 0 24px;
}

.floating-card {
  --offset: 0px;
  --rotation: 0deg;
  --card-size: 280px;
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: float 6s ease-in-out infinite;
  overflow: hidden;
  transition: transform 0.3s ease;
  transform: translate(calc(-50% + var(--offset)), -50%) rotate(var(--rotation));
}

.floating-card::after {
  content: '';
  position: absolute;
  inset: -30%;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0));
  mix-blend-mode: screen;
  opacity: 0.25;
  animation: shimmerSweep 4.5s linear infinite;
  pointer-events: none;
  border-radius: 16px;
}

.floating-card :deep(.card-image) {
  display: block;
  width: auto;
  height: auto;
  max-width: var(--card-size);
  border-radius: 16px;
}

.card-1 {
  --offset: -240px;
  --rotation: -8deg;
  z-index: 1;
  animation-delay: 0s;
}

.card-2 {
  --offset: 0px;
  --rotation: 0deg;
  z-index: 3;
  animation-delay: 0.2s;
}

.card-3 {
  --offset: 240px;
  --rotation: 8deg;
  z-index: 2;
  animation-delay: 0.4s;
}

@keyframes float {
  0%, 100% {
    transform: translate(calc(-50% + var(--offset, 0px)), -50%) rotate(var(--rotation)) translateY(0);
  }
  50% {
    transform: translate(calc(-50% + var(--offset, 0px)), -50%) rotate(var(--rotation)) translateY(-20px);
  }
}

@keyframes shimmerSweep {
  0% {
    transform: translateX(-120%) rotate(10deg);
    opacity: 0;
  }
  35% {
    opacity: 0.45;
  }
  70% {
    transform: translateX(120%) rotate(10deg);
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-card {
    animation: none;
  }

  .floating-card::after {
    animation: none;
  }
}

@media (max-width: 1024px) {
  .card-showcase {
    min-height: 320px;
    padding: 0 16px;
  }

  .floating-card {
    --card-size: 240px;
  }

  .card-1 {
    --offset: 0px;
  }

  .card-3 {
    --offset: 0px;
  }
}

@media (max-width: 640px) {
  .card-showcase {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(320px, 90vw, 440px);
    height: auto;
    padding: 48px 0 64px;
    overflow: visible;
    perspective: 1100px;
    width: min(90vw, 360px);
    max-width: 360px;
    margin: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  .card-showcase::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 236, 179, 0.35), rgba(255, 117, 189, 0.15) 55%, rgba(37, 99, 235, 0.05));
    filter: blur(70px);
    z-index: 0;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .floating-card {
    position: absolute;
    left: 50%;
    top: 50%;
    --offset: 0px;
    --card-size: min(90vw, 320px);
    width: var(--card-size);
    max-width: 100%;
    margin: 0;
    transform: translate(-50%, -50%)
      translate3d(0, var(--stack-translateY, 0px), 0)
      scale(var(--stack-scale, 1))
      rotateX(var(--stack-tilt, 8deg))
      rotateZ(var(--stack-rotation, 0deg));
    transform-origin: center;
    animation: boosterFloat 6s ease-in-out infinite;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.55);
    z-index: var(--stack-z, 1);
    overflow: hidden;
  }

  .floating-card::after {
    content: '';
    position: absolute;
    inset: -30%;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 255, 255, 0));
    mix-blend-mode: screen;
    opacity: 0.25;
    animation: shimmerSweep 4.5s linear infinite;
    pointer-events: none;
    border-radius: 16px;
  }

  .floating-card :deep(.card-image) {
    width: 100%;
    max-width: 100%;
    height: auto;
  }

  .card-1 {
    --stack-translateY: calc(-40px - 4vw);
    --stack-scale: 0.92;
    --stack-tilt: 12deg;
    --stack-rotation: -9deg;
    --stack-z: 1;
  }

  .card-2 {
    --stack-translateY: 0px;
    --stack-scale: 1;
    --stack-tilt: 8deg;
    --stack-rotation: 0deg;
    --stack-z: 3;
  }

  .card-3 {
    --stack-translateY: calc(40px + 4vw);
    --stack-scale: 0.92;
    --stack-tilt: 12deg;
    --stack-rotation: 9deg;
    --stack-z: 2;
  }
}

@media (max-width: 420px) {
  .floating-card {
    --card-size: min(100%, 280px);
  }
}
</style>
