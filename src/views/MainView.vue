<template>
  <n-layout class="main-container" :class="globalPlayer.isPlayerShow ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider v-if="state.isLogin" collapse-mode="width" :collapsed-width="120" :width="320"
      show-trigger="arrow-circle" content-style="padding: 24px;" bordered v-menus:right="menus"
      :native-scrollbar="false">
      <n-spin :show="state.playlistLoading">
        <n-menu v-model:value="state.currSonglistId" :root-indent="36" :indent="12" key-field="id"
          :options="globalData.playlist" :render-icon="renderMenuIcon" :render-label="renderMenuLabel"
          :on-update:value="activeMenuChange" />
      </n-spin>
    </n-layout-sider>
    <n-layout-content v-if="state.isLogin" content-style="padding: 24px; height: 100%;" :native-scrollbar="false"
      v-menus:right="menus">
      <SongTable class="h-full" v-model:tableData="globalData.songlist" v-model:loading="state.songlistLoading" />
    </n-layout-content>
    <n-layout-content v-else content-style="padding: 24px;">
      <Unlogin />
    </n-layout-content>
  </n-layout>
  <TaggingSongDialog v-model:showDialog="state.showTaggingDialog" :playlist="state.currSonglist" />
</template>

<script setup>
import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive, ref, shallowRef, computed } from 'vue';
import { directive } from 'vue3-menus';
import { NMenu, NLayout, NLayoutContent, NSpin, NLayoutSider, NScrollbar } from 'naive-ui';
import { usePlayerStore } from '@/store/player';
import { useGlobalData } from '@/store/globalData';
import Unlogin from '../components/Unlogin.vue';
import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
import { useNotification } from 'naive-ui'

window.$notification = useNotification()
// 全局数据中心
const globalData = useGlobalData()
// 全局player store
const globalPlayer = usePlayerStore()

const state = reactive({
  isLogin: computed(() => Boolean(globalData.user.id)),
  showTaggingDialog: false,
  currSonglistId: null,
  currSonglist: null,
  playlistLoading: false,
  songlistLoading: false
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
    }, {
      label: '选择 tag 导入到当前歌单',
      tip: '',
      click: () => {
        state.showTaggingDialog = true
      }
    }
  ]
})

onMounted(async () => {
  state.currSonglist = globalData.playlist[0] || null;
  state.currSonglistId = globalData.playlist[0]?.id || null;
})

const activeMenuChange = async (key, item) => {
  state.currSonglist = item
  state.currSonglistId = key
  await globalData.initSonglist(key)
}
const renderMenuIcon = (option) => {
  return h('img', { src: option.coverImgUrl, class: 'w-8 h-8' })
}
const renderMenuLabel = (option) => {
  console.log(option);
  let el = h('div', {style: 'display: flex;'},  { default: () => [
    h('div', {style: 'flex: 1; text-overflow: ellipsis;'}, option.name),
    h('div', {style: 'margin: 0 0.5rem;'}, option.trackCount)
  ]})
  return el
}

// 订阅 action 设置 loading
globalData.$onAction(({
  name, // action 的名字
  store, // store 实例
  args, // 调用这个 action 的参数
  after, // 在这个 action 执行完毕之后，执行这个函数
  onError, // 在这个 action 抛出异常的时候，执行这个函数
}) => {
  if (name === 'initSonglist') {
    state.songlistLoading = true
  }
  if (name === 'initPlaylist') {
    state.playlistLoading = true
  }
  after(result => {
    if (name === 'initSonglist') {
      state.songlistLoading = false
    }
    if (name === 'initPlaylist') {
      state.playlistLoading = true
    }
  })
})

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
// :v-deep(.custom-menu) {
//   display: flex;

//   :v-deep(.custom-menu-text) {
//     flex: 1;
//     text-overflow: ellipsis;
//     overflow: hidden;
//   }
//   :v-deep(.track-count) {
//     margin-left: 0.5rem;

//   }
// }

</style>