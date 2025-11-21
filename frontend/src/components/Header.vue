<template>
  <header class="glass-header">
    <div class="header-content">
      <router-link to="/" class="brand">
        <img
          src="@/assets/pokevault_logo.svg"
          alt="PokeVault"
          class="brand-logo"
        >
      </router-link>

      <nav class="nav-pill">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="Rechercher des cartes..."
            class="search-input"
          />
          <button @click="handleSearch" class="search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
        <a href="#changelog" class="nav-link">Journal des modifications</a>
        <router-link to="/sets" class="nav-link">Sets</router-link>
      </nav>

      <div class="header-actions">
        <router-link to="/sets" class="btn-cta">Se connecter</router-link>
      </div>

      <button class="mobile-menu-btn" @click="toggleMenu" aria-label="Menu">
        <span class="hamburger" :class="{ 'is-open': isMenuOpen }"></span>
      </button>
    </div>

    <div class="mobile-menu" :class="{ 'is-open': isMenuOpen }">
      <div class="mobile-search">
        <input 
          type="text" 
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          placeholder="Rechercher des cartes..."
          class="search-input"
        />
        <button @click="handleSearch" class="search-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
      </div>
      <a href="#changelog" class="mobile-nav-link" @click="closeMenu">Journal des modifications</a>
      <router-link to="/sets" class="mobile-nav-link" @click="closeMenu">Sets</router-link>
      <div class="mobile-actions">
        <router-link to="/sets" class="btn-cta" @click="closeMenu">Se connecter</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMenuOpen = ref(false)
const searchQuery = ref('')

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/cards',
      query: { search: searchQuery.value.trim() }
    })
    closeMenu()
  }
}
</script>

<style scoped>

.glass-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(120deg, rgba(5, 5, 5, 0.300), rgba(28, 28, 28, 0.300));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-content {
  max-width: 1340px;
  width: 100%;
  margin: 0 auto;
  padding: 0.85rem 2.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.brand-logo {
  height: 32px;
  width: auto;
  display: block;
}

.nav-pill {
  display: flex;
  align-items: center;
  gap: 1.75rem;
  padding: 0.4rem 1.1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.search-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.search-container:focus-within {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.15);
}

.search-input {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.92rem;
  outline: none;
  width: 200px;
  padding: 0.25rem 0.5rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.search-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.nav-link {
  position: relative;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  transition: color 0.2s ease, transform 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(255, 255, 255, 0.12);
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: -1;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: rgba(255, 255, 255, 0.92);
  background-color: rgba(255, 255, 255, 0.03);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  opacity: 1;
  transform: scale(1);
}

.header-actions {
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.btn-login {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.92rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.35rem 0.75rem;
}

.btn-login:hover {
  color: #ffffff;
}

.btn-cta {
  position: relative;
  background: linear-gradient(135deg, #f7f7f7, #dcdcdc);
  color: #0b0b0b;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  overflow: hidden;
}

.btn-cta:hover {
  transform: translateY(-0.5px);
  color: #1a1a1a;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.4);
}

.btn-cta::after {
  content: '';
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.35), transparent 60%);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}

.btn-cta:hover::after {
  opacity: 1;
  transform: scale(1);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  z-index: 1001;
}

.hamburger {
  display: block;
  width: 22px;
  height: 2px;
  background: #ffffff;
  position: relative;
  transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 2px;
  background: #ffffff;
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -7px;
}

.hamburger::after {
  bottom: -7px;
}

.hamburger.is-open {
  background: transparent;
}

.hamburger.is-open::before {
  top: 0;
  transform: rotate(45deg);
}

.hamburger.is-open::after {
  bottom: 0;
  transform: rotate(-45deg);
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0;
  background: rgba(5, 5, 5, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-menu.is-open {
  max-height: 500px;
  padding: 1rem 0;
}

.mobile-nav-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 1rem 2.5rem;
  transition: all 0.2s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.03);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0 2.5rem;
}

.mobile-actions .btn-login,
.mobile-actions .btn-cta {
  width: 100%;
  text-align: center;
  padding: 0.75rem;
}

.mobile-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 2.5rem 1rem;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mobile-search .search-input {
  flex: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-pill,
  .header-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
  
  .header-content {
    padding: 0.75rem 1.5rem;
  }
}

@media (max-width: 1024px) and (min-width: 769px) {
  .nav-pill {
    gap: 1.2rem;
    padding: 0.35rem 0.85rem;
  }

  .header-content {
    padding: 0.75rem 2rem;
  }
}
</style>
