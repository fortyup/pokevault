<script>
import { getCardImageUrl, getLogoUrl, getSymbolUrl } from '../services/imageService.js';

export default {
  name: 'CardImage',
  props: {
    imageUrl: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Carte Pokémon'
    },
    quality: {
      type: String,
      default: 'high',
      validator: (value) => ['high', 'low'].includes(value)
    },
    format: {
      type: String,
      default: 'webp',
      validator: (value) => ['webp', 'png'].includes(value)
    },
    loading: {
      type: String,
      default: 'lazy',
      validator: (value) => ['lazy', 'eager'].includes(value)
    }
  },
  computed: {
    fullImageUrl() {
      return getCardImageUrl(this.imageUrl, this.quality, this.format);
    },
    // Fallback vers PNG si WebP n'est pas supporté
    fallbackImageUrl() {
      return this.format === 'webp' 
        ? getCardImageUrl(this.imageUrl, this.quality, 'png')
        : null;
    }
  }
};
</script>

<template>
  <picture>
    <source 
      v-if="format === 'webp' && fallbackImageUrl"
      type="image/webp" 
      :srcset="fullImageUrl"
    />
    <img 
      :src="fallbackImageUrl || fullImageUrl" 
      :alt="alt"
      :loading="loading"
      class="card-image"
    />
  </picture>
</template>

<style scoped>
picture {
  display: block;
  width: 100%;
  height: auto;
}

.card-image {
  width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
</style>
