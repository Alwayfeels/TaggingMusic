<template>
  <div class="top-bar w-full h-20 flex items-center">
    <n-icon class="cursor-pointer mr-2" size="32" :component="LogoGithub" @click="toGithub" />
    <div class="text-2xl cursor-pointer" @click="toGithub">Tagging Music</div>
    <div class="ml-2 rounded-full bg-gray-400 text-white px-2 py-0.5">beta</div>
    <!-- 搜索 -->
    <div  v-if="state.showControlBtn" class="mx-8 flex-1 flex justify-center">
      <n-input class="search-input" v-model:value="state.searchKey" round placeholder="搜索音乐 / 专辑 / 歌手" @keypress.enter="searchHandler" />
    </div>
    <div class="ml-auto flex items-center">
      <!--用户 -->
      <div v-if="globalData.user.profile" class="user-info flex items-center mr-4">
        <div class="user-name mr-4 flex items-center flex-col">
          <span>{{ globalData.user.profile.nickname }}</span>
          <div v-if="!state.isLogged" class="rounded-full text-white bg-gray-400 px-2 py-0.5 text-xs">离线</div>
        </div>
        <img class="user-avatar rounded" :src="`${globalData.user.profile.avatarUrl}?param=40y40`" alt="avatar">
      </div>
      <!--控制台 -->
      <n-button v-if="state.showControlBtn" class="mr-2" secondary size="large" strong type="success"
        @click="togglePlayerBar">
        {{ globalPlayer.isPlayerShow ? '隐藏播放器' : '显示播放器' }}
      </n-button>
      <n-button v-if="state.showControlBtn" secondary class="mr-2" size="large" strong type="info"
        @click="refreshSonglist">
        刷新歌单列表</n-button>
      <n-button v-if="state.showControlBtn" secondary class="mr-2" size="large" strong type="info"
        @click="exportTaggedSong">导出Tag</n-button>
      <n-button v-if="state.showControlBtn" secondary class="mr-2" size="large" strong type="info"
        @click="importTaggedSong">导入Tag</n-button>
      <n-button v-if="state.showControlBtn" class="mr-2" size="large" strong type="info"
        @click="state.showTaggingDialog = true">生成tag歌单</n-button>
      <n-button size="large" strong type="error" @click="state.showLoginDialog = true">
        {{ state.isLogged ? '切换用户' : '登录' }}
      </n-button>
    </div>
    <QRLoginDialog v-model:showDialog="state.showLoginDialog" @refreshLoginStatus="refreshLoginStatus" />
    <TaggingSongDialog v-model:showDialog="state.showTaggingDialog" />
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, reactive } from 'vue';
import { NButton, NIcon, useNotification } from 'naive-ui';
import QRLoginDialog from '@/components/QRLoginDialog.vue';
import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
import localforage from 'localforage';
import { usePlayerStore } from '@/store/player';
import { useGlobalData } from '@/store/globalData';
import { useRouter, useRoute } from 'vue-router'
import { LogoGithub } from '@vicons/ionicons4'

// 全局数据中心
const globalData = useGlobalData()
const route = useRoute()
const router = useRouter()

// 全局player store
const globalPlayer = usePlayerStore()
const togglePlayerBar = () => {
  globalPlayer.togglePlayer()
}

const notification = useNotification()
const state = reactive({
  searchKey: '',
  showControlBtn: computed(() => {
    return state.isMainPage && state.isLogged
  }),
  isMainPage: computed(() => {
    return route.path === '/main'
  }),
  showLoginDialog: false,
  showTaggingDialog: false,
  isLogged: computed(() => {
    return Boolean(globalData.user.account)
  }),
});
async function searchHandler() {
  notification.error({
    title: '在做了在做了 QAQ',
    duration: 3000,
  })
  // globalData.searchSong(state.searchKey)
}
// 登录后重新init globalData
const refreshLoginStatus = async () => {
  globalData.init()
}
// refresh songlist
function refreshSonglist() {
  globalData.getRemotePlaylist()
}
// export tagged song
async function exportTaggedSong() {
  await globalData.exportTaggedSong()
  notification.success({
    title: "成功",
    content: '导出完成！',
    duration: 3000
  })
}
// import tagged song
async function importTaggedSong() {
  let res = await globalData.importTaggedSong()
  notification.success({
    title: "成功",
    content: '导入完成！刷新页面可查看',
    duration: 3000
  })
}
function toGithub() {
  window.open('https://github.com/Alwayfeels/TaggingMusic', '_blank')
}
</script>

<style lang="scss" scoped>
.top-bar {
  background-color: white;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
  padding: 0 40px;

  .user-name {
    font-weight: 500;
  }
  .search-input {
    max-width: 400px;
  }
}
</style>