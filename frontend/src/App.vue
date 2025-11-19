<template>
  <Header />
  <div class="app">
    <router-view />
  </div>
  <Footer />
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style>
.app {
  min-height: 100vh;
  color: #ffffff;
  overflow-x: hidden;
  background: linear-gradient(180deg, #000000 0%, #1a1a1a 50%, #000000 100%);
  padding: 8rem 0rem 0rem;

}
</style>
