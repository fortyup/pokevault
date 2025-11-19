<template>
  <Header />
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
