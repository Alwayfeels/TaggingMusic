<template>
  <header>
    <TopBar />
  </header>
  <RouterView />
  <PlayerBar />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopBar from './components/TopBar.vue';
import { useGlobalState } from '@/store/globalState';
import PlayerBar from '@/components/PlayerBar.vue';

const globalState = useGlobalState()

async function initApp() {
  await globalState.init()
}
initApp()

</script>

<style>
html {
  overflow: hidden;
}

body {
  margin: 0;
}

#app {
  overflow-y: hidden;
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
