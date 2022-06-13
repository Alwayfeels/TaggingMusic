import { createRouter, createWebHistory } from 'vue-router'
import EntryView from '../views/EntryView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: EntryView
  },
  {
    path: '/main',
    name: 'main',
    component: () => import(/* webpackChunkName: "MainView" */ '../views/MainView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import(/* webpackChunkName: "TestView" */ '../views/TestView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
