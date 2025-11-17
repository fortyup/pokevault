<script>
import { getLogoUrl, getSymbolUrl } from '../services/imageService.js';

export default {
  name: 'SetBadge',
  props: {
    set: {
      type: Object,
      required: true
    },
    showLogo: {
      type: Boolean,
      default: true
    },
    showSymbol: {
      type: Boolean,
      default: true
    },
    showName: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    logoUrl() {
      return this.set?.logo ? getLogoUrl(this.set.logo) : '';
    },
    symbolUrl() {
      return this.set?.symbol ? getSymbolUrl(this.set.symbol) : '';
    }
  }
};
</script>

<template>
  <div class="set-badge">
    <img 
      v-if="showSymbol && symbolUrl" 
      :src="symbolUrl" 
      :alt="set.name"
      class="set-symbol"
      loading="lazy"
    />
    <span v-if="showName" class="set-name">{{ set.name }}</span>
    <img 
      v-if="showLogo && logoUrl" 
      :src="logoUrl" 
      :alt="set.name"
      class="set-logo"
      loading="lazy"
    />
  </div>
</template>

<style scoped>
.set-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.set-symbol {
  height: 20px;
  width: auto;
  vertical-align: middle;
}

.set-logo {
  height: 30px;
  width: auto;
  vertical-align: middle;
  opacity: 0.8;
}

.set-name {
  font-weight: 500;
}
</style>
