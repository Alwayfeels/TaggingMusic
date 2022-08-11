<template>
  <header>
    <TopBar />
  </header>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TopBar from './components/TopBar.vue';
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
</style>
