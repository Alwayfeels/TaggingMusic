import { createApp } from 'vue'
import App from './App.vue'
import naive from 'naive-ui'
import router from './router/index.js'
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'
import './index.css'
import localforage from 'localforage'
import { createPinia } from 'pinia'
import Menus from 'vue3-menus';

localforage.config({
    driver: localforage.INDEXEDDB,
    name: 'TaggingMusic' // 给当前项目的存储空间命名为forage
});

createApp(App)
    .use(router)
    .use(naive)
    .use(Menus)
    .use(createPinia())
    .mount('#app')
