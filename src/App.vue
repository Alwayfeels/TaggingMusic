<template>
  <n-notification-provider>
    <header>
      <TopBar />
    </header>
    <RouterView />
  </n-notification-provider>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopBar from './components/TopBar.vue';
import { useGlobalData } from '@/stores/globalData'

const globalData = useGlobalData()
globalData.initGlobalData()

</script>

<style>
html {
  overflow: hidden;
}

body {
  margin: 0;
}

#app {
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.mini-tag {
  height: 16px;
  padding: 0 4px;
}
</style>
