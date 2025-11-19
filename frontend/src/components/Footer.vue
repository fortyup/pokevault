<template>
    <footer class="footer">
        <div class="footer__glow"></div>
        <div class="footer__content">
            <div class="footer__brand">
                <span class="footer__logo">PokeVault</span>
                <p class="footer__tagline">
                    Gérez votre collection, suivez vos sets et gardez un œil sur chaque carte rare.
                </p>
                <div class="footer__actions">
                    <router-link to="/sets" class="btn btn-primary btn-small">Explorer les sets</router-link>
                    <router-link to="/card/preview" class="btn btn-secondary btn-small">Rechercher une carte</router-link>
                </div>
            </div>

            <nav class="footer__links">
                <div class="footer__links-column">
                    <p class="footer__column-label">Navigation</p>
                    <router-link to="/" class="footer__link yellow-link">Accueil</router-link>
                    <router-link to="/sets" class="footer__link yellow-link">Sets</router-link>
                    <a href="#features" class="footer__link yellow-link">Fonctionnalités</a>
                </div>
                <div class="footer__links-column">
                    <p class="footer__column-label">Ressources</p>
                    <a href="https://www.tcgdex.net/" target="_blank" rel="noreferrer" class="footer__link yellow-link">TCGdex</a>
                    <a href="mailto:test" class="footer__link yellow-link">Contact</a>
                    <a href="https://github.com/fortyup/pokevault" target="_blank" rel="noreferrer" class="footer__link yellow-link">GitHub</a>
                </div>
            </nav>

            <div class="footer__meta">
                <span>© {{ currentYear }} PokeVault</span>
                <span class="footer__separator">•</span>
                <span>Données synchronisées avec TCGdex et d'autres API Pokémon</span>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
    position: relative;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent 55%),
        #030508;
    padding: 3rem 1.5rem 2.5rem;
    color: #f1f5f9;
    overflow: hidden;
}

.footer__glow {
    position: absolute;
    inset: auto auto -120px 50%;
    transform: translateX(-50%);
    width: 520px;
    height: 520px;
    /* background: radial-gradient(circle, rgba(250, 204, 21, 0.18), transparent 70%); */
    filter: blur(40px);
    pointer-events: none;
}

.footer__content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 2.5rem;
    align-items: start;
}

.footer__brand {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.footer__logo {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #facc15;
}

.footer__tagline {
    font-size: 0.95rem;
    color: rgba(241, 245, 249, 0.75);
    max-width: 460px;
}

.footer__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.footer__links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 1.5rem;
}

.footer__links-column {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.footer__column-label {
    font-size: 0.75rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(241, 245, 249, 0.45);
    margin-bottom: 0.65rem;
}

.footer__link {
    color: rgba(241, 245, 249, 0.85);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s ease;
    position: relative;
    padding-left: 0.75rem;
}

.footer__link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(250, 204, 21, 0.4);
    transition: background 0.2s ease, transform 0.2s ease;
}

.footer__link:hover {
    color: #facc15;
}

.footer__link:hover::before {
    background: #facc15;
    transform: translateY(-50%) scale(1.2);
}

.footer__meta {
    grid-column: 1 / -1;
    margin-top: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 0.85rem;
    color: rgba(241, 245, 249, 0.55);
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
    align-items: center;
}

.footer__separator {
    opacity: 0.4;
}

@media (max-width: 768px) {
    .footer__content {
        grid-template-columns: 1fr;
    }

    .footer__actions {
        flex-direction: column;
    }

    .footer__links {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 520px) {
    .footer {
        padding: 2.5rem 1.25rem 2rem;
    }

    .footer__links {
        grid-template-columns: 1fr;
    }
}
</style>