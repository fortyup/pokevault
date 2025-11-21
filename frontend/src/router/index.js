import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sets from '../views/Sets.vue'
import Set from '../views/Set.vue'
import Card from '../views/Card.vue'
import Cards from '../views/Cards.vue'
import CardsByIllustrator from '../views/CardsByIllustrator.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/sets',
    name: 'Sets',
    component: Sets
  },
  {
    path: '/set/:id',
    name: 'Set',
    component: Set
  },
  {
    path: '/cards',
    name: 'Cards',
    component: Cards
  },
  {
    path: '/cards/name/:name',
    name: 'CardsByName',
    component: Cards
  },
  {
    path: '/illustrations/:illustrator',
    name: 'CardsByIllustrator',
    component: CardsByIllustrator
  },
  {
    path: '/card/:id',
    name: 'Card',
    component: Card
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
