<template>
  <div class="top-bar w-full h-20 flex items-center">
    <div class="text-2xl">Tagging Music</div>
    <div class="ml-2 rounded-full bg-gray-400 text-white px-2 py-0.5">beta</div>
    <div class="ml-auto flex items-center">
      <div v-if="globalData.user.profile" class="user-info flex items-center mr-4">
        <div class="user-name mr-4 flex items-center flex-col">
          <span>{{ globalData.user.profile.nickname }}</span>
          <div v-if="!state.isLogged" class="rounded-full text-white bg-gray-400 px-2 py-0.5 text-xs">离线</div>
        </div>
        <img class="user-avatar rounded" :src="`${globalData.user.profile.avatarUrl}?param=40y40`" alt="avatar">
      </div>
      <n-button class="mr-2" secondary size="large" strong type="success" @click="togglePlayerBar">
        {{ globalPlayer.isPlayerShow ? '隐藏播放器' : '显示播放器' }}
      </n-button>
      <n-button v-if="state.isMainPage" secondary class="mr-2" size="large" strong type="info" @click="refreshSonglist">刷新歌单列表</n-button>
      <n-button v-if="state.isMainPage" class="mr-2" size="large" strong type="info" @click="state.showTaggingDialog = true">生成tag歌单</n-button>
      <n-button v-if="state.isMainPage" size="large" strong type="error" @click="state.showLoginDialog = true">
        {{ state.isLogged ? '切换用户' : '登录' }}
      </n-button>
    </div>
    <QRLoginDialog v-model:showDialog="state.showLoginDialog" @refreshLoginStatus="getUserInfo" />
    <TaggingSongDialog v-model:showDialog="state.showTaggingDialog" />
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, reactive } from 'vue';
import { NButton } from 'naive-ui';
import QRLoginDialog from '@/components/QRLoginDialog.vue';
import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
import localforage from 'localforage';
import { usePlayerStore } from '@/store/player';
import { useGlobalData } from '@/store/globalData';
import { useRouter, useRoute } from 'vue-router'
// 全局数据中心
const globalData = useGlobalData()
const route = useRoute()
const router = useRouter()

// 全局player store
const globalPlayer = usePlayerStore()
const togglePlayerBar = () => {
  globalPlayer.togglePlayer()
}

const state = reactive({
  isMainPage: computed(() => {
    return route.path === '/main'
  }),
  showLoginDialog: false,
  showTaggingDialog: false,
  isLogged: computed(() => {
    return Boolean(globalData.user.account)
  }),
});

// 获取用户数据, 优先从缓存中获取
const getUserInfo = async () => {
  let [profile, account] = await Promise.all([
    localforage.getItem('profile'),
    localforage.getItem('account'),
  ])
  if (!profile || !account) {
    ({ profile, account } = await globalData.getRemoteUserInfo())
  }
}
// refresh songlist
function refreshSonglist() {
  globalData.getRemotePlaylist()
}
</script>

<style lang="scss" scoped>
.top-bar {
  background-color: #cccccc;
  box-sizing: border-box;
  padding: 0 40px;

  .user-name {
    font-weight: 500;
  }
}
</style>