<template>
  <n-notification-provider>
    <div id="app">
      <TopBar class="fixed shadow z-10" />
      <router-view class="mt-20" />
    </div>
  </n-notification-provider>
</template>

<script setup>
import TopBar from '@/components/TopBar.vue';
import { useGlobalData } from './store/globalData';

const globalData = useGlobalData()
globalData.init()
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
</script>

<style>
#app {
  overflow: hidden;
  font-family: "Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  /* font-family: Avenir, Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

html {
  overflow-y: scroll;
}

.mini-tag {
  height: 16px;
  padding: 0 4px;
}

/* 滚动槽 */
/* ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
}

::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.12);
  -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
} */
</style>
