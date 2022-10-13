<template>
  <n-layout class="main-container" :class="player.isShow ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider v-if="user.isLogin" collapse-mode="width" :collapsed-width="120" :width="320"
      show-trigger="arrow-circle" content-style="padding: 24px;" bordered v-menus:right="rightMenus"
      :native-scrollbar="false">
      <n-spin :show="playlist.isLoading">
        <n-menu v-if="playlist.active?.id" v-model:value="playlist.active.id" :root-indent="36" :indent="12"
          key-field="id" :options="playlist.data" :render-icon="renderMenuIcon" :render-label="renderMenuLabel"
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
</template>

<script setup lang="ts">
import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive, ref, nextTick, watch } from 'vue';
import { directive } from 'vue3-menus';
import { NMenu, NLayout, NLayoutContent, NSpin, NLayoutSider, NScrollbar } from 'naive-ui';
import { useGlobalData } from '@/store/globalData';
import { useGlobalState } from '@/store/globalState';
import Unlogin from '@/components/UnLogin.vue';

// 全局数据中心
const globalData = useGlobalData()
// 全局应用状态
const globalState = useGlobalState()
const { playlist, songlist, user, player } = globalState

/**
 * @desc: 初始化 homeView 数据
 */
async function initHomeView() {
  // init taggedSongs, userInfo
  globalData.initTaggedSongs();
  await globalData.initUserInfo(false)
  // init playlist
  if (globalData.user.account?.id) {
    const playlist = await globalData.initPlaylist()
    globalState.playlist.data = playlist
    globalState.playlist.active = playlist[0]
  }
  // init songlist, player
  const songlist = await globalData.getSonglist(globalState.playlist.active?.id || null) || []
  globalState.songlist.data = songlist;
  globalState.songlist.active = songlist[0] || {}
  globalState.player.playlist = songlist;
  globalState.player.active = songlist[0] || {}
}
initHomeView()

/**
 * @desc: 监听 键盘操作
 */
onMounted(() => {
  document.onkeyup = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      globalState.revokeTags()
    }
    if (e.ctrlKey && e.key === 'y') {
      globalState.unRevokeTags()
    }
  }
})

/** 
 * @desc 右键菜单配置
 */
const rightMenus = reactive({
  menus: [
    // 菜单使用示例：https://github.com/xfy520/vue3-menus
    {
      label: "刷新歌单列表",
      tip: '(左侧)',
      click: async () => {
        globalState.playlist.isLoading = true
        await globalData.initPlaylist(true)
        globalState.playlist.isLoading = false
      }
    }, {
      label: "刷新当前歌单",
      tip: '(右侧)',
      click: async () => {
        const activePlaylistId = globalState.playlist.active.id || null
        globalState.playlist.isLoading = true
        await globalData.getSonglist(activePlaylistId, 1000, true)
        globalState.playlist.isLoading = false
      }
    }, {
      label: "撤销上一次 tags 输入",
      tip: 'ctrl + z',
      click: () => {
        globalState.revokeTags()
      }
    }, {
      label: "回退上一次 tags 输入",
      tip: 'ctrl + y',
      click: () => {
        globalState.unRevokeTags()
      }
    },
    // {
    //   label: '选择 tag 导入到当前歌单',
    //   tip: '',
    //   click: () => {
    //     // state.showTaggingDialog = true
    //   }
    // }, {
    //   label: '歌单全体添加或删除 tag',
    //   tip: '',
    //   click: () => {
    //     // state.showTaggingPlaylistDialog = true
    //   }
    // }
  ]
})

/** 
 * @desc 左侧歌单 active change 事件
 */
const songTableRef = ref()
const activeMenuChange = async (id: number, item: any) => {
  globalState.playlist.active = item
  const newSonglist = await globalData.getSonglist(id, item.trackCount) || []
  // 同时修改 songlist 和 playerList
  globalState.songlist.data = newSonglist;
  globalState.player.playlist = newSonglist;

  globalState.setSonglistActive({ index: 0 })
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