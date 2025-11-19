<template>
  <header class="glass-header">
    <div class="header-content">
      <router-link to="/" class="brand">
        <span class="brand-mark">
          <span class="brand-glyph" aria-hidden="true"></span>
        </span>
        <span class="brand-name">PokeVault</span>
      </router-link>

      <nav class="nav-pill">
        <a href="#pricing" class="nav-link">Prix</a>
        <a href="#company" class="nav-link">Entreprise</a>
        <a href="#blog" class="nav-link">Blog</a>
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
      <a href="#pricing" class="mobile-nav-link" @click="closeMenu">Prix</a>
      <a href="#company" class="mobile-nav-link" @click="closeMenu">Entreprise</a>
      <a href="#blog" class="mobile-nav-link" @click="closeMenu">Blog</a>
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

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
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

.brand {
  min-width: 150px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  color: #f5f5f5;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: -0.02em;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  position: relative;
  transition: color 0.2s ease, transform 0.2s ease;
}

.brand::after {
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

.brand:hover,
.brand:focus-visible {
  color: rgba(255, 255, 255, 0.95);
  background-color: rgba(255, 255, 255, 0.03);
}

.brand:hover::after,
.brand:focus-visible::after {
  opacity: 1;
  transform: scale(1);
}

.brand-mark {
  display: inline-flex;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #ffffff, #b7b7b7);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.56);
  align-items: center;
  justify-content: center;
}

.brand-glyph {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid rgba(0, 0, 0, 0.8);
  position: relative;
}

.brand-glyph::after {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.5);
}

.brand-name {
  font-size: 1.05rem;
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
