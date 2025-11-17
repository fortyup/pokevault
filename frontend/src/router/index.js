import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Sets from '../views/Sets.vue'
import Set from '../views/Set.vue'
import Card from '../views/Card.vue'

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
