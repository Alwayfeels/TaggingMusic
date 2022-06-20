import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'
import './index.css'
import localforage from 'localforage'
import { createPinia } from 'pinia'

localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'forage' // 给当前项目的存储空间命名为forage
});

createApp(App)
    .use(router)
    .use(createPinia())
    .mount('#app')
