<template>
  <n-layout class="main-container" :class="player.isShow ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider v-if="user.isLogin" collapse-mode="width" :collapsed-width="120" :width="320"
      show-trigger="arrow-circle" content-style="padding: 24px;" bordered v-menus:right="rightMenus"
      :native-scrollbar="false">
      <n-spin :show="playlist.isLoading">
        <n-menu v-if="playlist.active?.id" v-model:value="playlist.active.id" :root-indent="36" :indent="12" key-field="id"
          :options="playlist.data" :render-icon="renderMenuIcon" :render-label="renderMenuLabel"
          :on-update:value="activeMenuChange" />
      </n-spin>
    </n-layout-sider>
    <n-layout-content v-if="globalState.user.isLogin" content-style="padding: 24px; height: 100%;"
      :native-scrollbar="false" v-menus:right="rightMenus">
      <SongTable ref="songTableRef" class="h-full" v-model:tableData="songlist.data"
        v-model:loading="songlist.isLoading" />
    </n-layout-content>
    <n-layout-content v-else content-style="padding: 24px;">
      <Unlogin />
    </n-layout-content>
  </n-layout>
  <PlayerBar />
</template>

<script setup lang="ts">
import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive, ref, shallowRef, computed } from 'vue';
import { directive } from 'vue3-menus';
import { NMenu, NLayout, NLayoutContent, NSpin, NLayoutSider, NScrollbar } from 'naive-ui';
// import { useglobalState.player } from '@/store/globalState.player';
import { useGlobalData } from '@/store/globalData';
import { useGlobalState } from '@/store/globalState';
import Unlogin from '@/components/UnLogin.vue';
// import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
// import TaggingPlaylistDialog from '@/components/TaggingPlaylistDialog.vue';
// import MergePlaylistDialog from '@/components/MergePlaylistDialog.vue';
import PlayerBar from '@/components/PlayerBar.vue';

// 全局数据中心
const globalData = useGlobalData()
// 全局应用状态
const globalState = useGlobalState()
const { playlist, songlist, user, player } = globalState

/** 
 * @desc 右键菜单配置
 */
const rightMenus = reactive({
  menus: [
    // 菜单使用示例：https://github.com/xfy520/vue3-menus
    {
      label: "刷新左侧歌单列表",
      tip: '',
      click: async () => {
        // state.playlistLoading = true
        // await globalData.getRemotePlaylist()
        // state.playlistLoading = false
      }
    }, {
      label: "刷新右侧当前歌单",
      tip: '',
      click: async () => {
        // if (state.currSonglistId) {
        //   state.songlistLoading = true
        //   await globalData.getSonglist({
        //     playlistId: state.currSonglistId,
        //     force: true,
        //     setStore: true
        //   })
        //   state.songlistLoading = false
        // } else {
        //   console.warning('右键刷新失败，当前歌单id为空，请选择一个menu后再试')
        // }
      }
    }, {
      label: '选择 tag 导入到当前歌单',
      tip: '',
      click: () => {
        // state.showTaggingDialog = true
      }
    }, {
      label: '歌单全体添加或删除 tag',
      tip: '',
      click: () => {
        // state.showTaggingPlaylistDialog = true
      }
    }
  ]
})
/** 
 * @desc 左侧歌单点击事件
 */
const songTableRef = ref()
const activeMenuChange = async (id: number, item: any) => {
  globalState.playlist.active = item
  globalData.getSonglist(id, item.trackCount)
  songTableRef.value.resetPager()
}
/** 
 * @desc 菜单渲染函数
 */
const renderMenuIcon = (option: any) => {
  return h('img', { src: option.coverImgUrl, class: 'w-8 h-8' })
}
const renderMenuLabel = (option: any) => {
  const el = h('div', { style: 'display: flex;' }, {
    default: () => [
      h('div', { style: 'flex: 1; overflow: hidden; text-overflow: ellipsis;' }, option.name),
      h('div', { style: 'margin: 0 0.5rem;' }, option.trackCount)
    ]
  })
  return el
}
</script>

<style lang="scss" scoped>
.main-container {
  // margin-top: 5rem;
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