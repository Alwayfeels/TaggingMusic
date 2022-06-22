<template>
  <n-layout class="main-container" :class="globalPlayer.isPlayerShow ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider v-if="isLogin" collapse-mode="width" :collapsed-width="120" :width="320" show-trigger="arrow-circle"
      content-style="padding: 24px;" bordered :native-scrollbar="false" v-menus:right="menus">
      <n-spin :show="state.playlistLoading">
        <n-menu v-model:value="state.currSonglistId" :root-indent="36" :indent="12" key-field="id"
          :options="globalData.playlist" :render-icon="renderMenuIcon" :render-label="renderMenuLabel"
          :on-update:value="activeMenuChange" />
      </n-spin>
    </n-layout-sider>
    <n-layout-content v-if="isLogin" content-style="padding: 24px; height: 100%;" :native-scrollbar="false"
      v-menus:right="menus">
      <SongTable class="h-full" v-model:tableData="globalData.songlist" v-model:loading="state.songlistLoading" />
    </n-layout-content>
    <n-layout-content v-else content-style="padding: 24px;">
      <Unlogin />
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive, ref, shallowRef } from 'vue';
import { directive } from 'vue3-menus';
import { NMenu, NLayout, NLayoutContent, NSpin, NLayoutSider } from 'naive-ui';
import { usePlayerStore } from '@/store/player';
import { useGlobalData } from '@/store/globalData';
import Unlogin from '../components/Unlogin.vue';

// 全局数据中心
const globalData = useGlobalData()

// 全局player store
const globalPlayer = usePlayerStore()

const isLogin = ref(Boolean(globalData.user.id))
const state = reactive({
  currSonglistId: null,
  playlistLoading: false,
  songlistLoading: false,
});

const menus = shallowRef({
  menus: [
    // 菜单使用示例：https://github.com/xfy520/vue3-menus
    {
      label: "刷新左侧歌单列表",
      tip: '',
      click: async () => {
        state.playlistLoading = true
        await globalData.getRemotePlaylist()
        state.playlistLoading = false
      }
    }, {
      label: "刷新右侧当前歌单",
      tip: '',
      click: async () => {
        if (state.currSonglistId) {
          state.songlistLoading = true
          await globalData.getRemoteSonglist(state.currSonglistId)
          state.songlistLoading = false
        } else {
          console.warning('右键刷新失败，当前歌单id为空，请选择一个menu后再试')
        }
      }
    }, {
      label: '显示/隐藏播放器',
      tip: '',
      click: () => {
        globalPlayer.togglePlayer()
      }
    }
  ]
})

onMounted(async () => {
  state.currSonglistId = globalData.playlist[0]?.id || null;
})

const activeMenuChange = async (key, item) => {
  state.currSonglistId = key
  state.songlistLoading = true
  await globalData.initSonglist(key)
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