<template>
  <div class="view-container flex justify-center flex-col w-full items-center">

  </div>
</template>

<script setup>
import playMusicBar from '@/components/PlayMusicBar.vue';
import { reactive } from 'vue';

const state = reactive({
  activeKey: null,
  collapsed: true,
})
</script>

<style lang="scss" scoped>
</style>