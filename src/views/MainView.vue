<template>
  <n-layout class="main-container" :class="globalPlayer.isPlayerShow ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider collapse-mode="width" :collapsed-width="120" :width="320" show-trigger="arrow-circle"
      content-style="padding: 24px;" bordered :native-scrollbar="false">
      <n-spin :show="state.playlistLoading">
        <n-menu v-model:value="state.currSonglistId" :root-indent="36" :indent="12" key-field="id" :options="globalData.playlist"
          :render-icon="renderMenuIcon" :render-label="renderMenuLabel" :on-update:value="activeMenuChange" />
      </n-spin>
    </n-layout-sider>
    <n-layout-content content-style="padding: 24px;" :native-scrollbar="false">
      <SongTable class="h-full" v-model:tableData="globalData.songlist" v-model:loading="state.songlistLoading" />
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive } from 'vue';
import { NMenu } from 'naive-ui';
import { usePlayerStore } from '@/store/player';
import { useGlobalData } from '@/store/globalData';

// 全局数据中心
const globalData = useGlobalData()

// 全局player store
const globalPlayer = usePlayerStore()

const state = reactive({
  currSonglistId: null,
  playlistLoading: false,
  songlistLoading: false,
});

onMounted(async () => {
  state.currSonglistId = globalData.playlist[0].id || null;
})

const activeMenuChange = async (key, item) => {
  state.currSonglistId = key
  state.songlistLoading = true
  await globalData.getRemoteSonglist(key)
  state.songlistLoading = false
}
const renderMenuIcon = (option) => {
  return h('img', { src: option.coverImgUrl, class: 'w-8 h-8' })
}
const renderMenuLabel = (option) => {
  return h('span', {}, option.name)
}
</script>
<style lang="scss" scoped>
.main-container {
  overflow: hidden;
  transition: height 0.5s ease-out;

  :v-deep(.n-scrollbar-content) {
    height: 100%;
  }
}

.full-height {
  height: calc(100vh - 5rem);
}

.min-height {
  height: calc(100vh - 10rem);
}
</style>