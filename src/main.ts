import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import Menus from 'vue3-menus';
import naive from 'naive-ui'
import localforage from 'localforage'
import router from './router'
import './index.css'

localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'TaggingMusic' // 给当前项目的存储空间命名为forage
});

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
app.use(Menus)

app.mount('#app')
