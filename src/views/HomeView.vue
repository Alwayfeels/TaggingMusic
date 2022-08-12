<template>
  <n-layout class="main-container" :class="globalState.user.isLogged ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider v-if="globalState.user.isLogged" collapse-mode="width" :collapsed-width="120" :width="320"
      show-trigger="arrow-circle" content-style="padding: 24px;" bordered v-menus:right="menus"
      :native-scrollbar="false">
      <n-spin :show="state.playlistLoading">
        <n-menu v-model:value="state.currSonglistId" :root-indent="36" :indent="12" key-field="id"
          :options="globalData.playlist" :render-icon="renderMenuIcon" :render-label="renderMenuLabel"
          :on-update:value="activeMenuChange" />
      </n-spin>
    </n-layout-sider>
    <n-layout-content v-if="globalState.user.isLogged" content-style="padding: 24px; height: 100%;" :native-scrollbar="false"
      v-menus:right="menus">
      <SongTable ref="songTableRef" class="h-full" v-model:tableData="globalData.songlist"
        v-model:loading="state.songlistLoading" />
    </n-layout-content>
    <n-layout-content v-else content-style="padding: 24px;">
      <Unlogin />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
// import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive, ref, shallowRef, computed } from 'vue';
import { directive } from 'vue3-menus';
import { NMenu, NLayout, NLayoutContent, NSpin, NLayoutSider, NScrollbar } from 'naive-ui';
// import { useGlobalPlayer } from '@/store/globalPlayer';
import { useGlobalData } from '@/store/globalData';
import { useGlobalState } from '@/store/globalState';
// import Unlogin from '../components/Unlogin.vue';
// import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
// import TaggingPlaylistDialog from '@/components/TaggingPlaylistDialog.vue';
// import MergePlaylistDialog from '@/components/MergePlaylistDialog.vue';
// import PlayMusicBar from '@/components/PlayMusicBar.vue';
import { useNotification } from 'naive-ui'

// 全局数据中心
const globalData = useGlobalData()
// 全局应用状态
const globalState = useGlobalState()

</script>

<style scoped>

</style>