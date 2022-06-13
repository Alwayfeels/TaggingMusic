<template>
  <div class="top-bar w-full h-20 flex items-center">
    <div class="text-2xl">Tagging Music</div>
    <div class="ml-2 rounded-full bg-gray-400 text-white px-2 py-0.5">beta</div>
    <div class="ml-auto flex items-center">
      <div v-if="state.profile" class="user-info flex items-center mr-4">
        <div class="user-name mr-4 flex items-center flex-col">
          <span>{{ state.profile.nickname }}</span>
          <div v-if="state.isOutLine" class="rounded-full text-white bg-gray-400 px-2 py-0.5 text-xs">离线</div>
        </div>
        <img class="user-avatar rounded" :src="`${state.profile.avatarUrl}?param=40y40`" alt="avatar">
      </div>
      <n-button class="mr-2" size="large" strong type="success" @click="togglePlayBar">{{ showPlayBar ? '隐藏播放器' :
          '显示播放器'
      }}</n-button>
      <n-button class="mr-2" size="large" strong type="info" @click="state.showTaggingDialog = true">生成tag歌单
      </n-button>
      <n-button size="large" strong type="error" @click="state.showLoginDialog = true">
        {{ state.isLogin ? '切换用户' : '登录' }}
      </n-button>
    </div>
    <QRLoginDialog v-model:showDialog="state.showLoginDialog" @refreshLoginStatus="getUserInfo" />
    <TaggingSongDialog v-model:showDialog="state.showTaggingDialog" />
  </div>
</template>

<script setup>
import api from '@/api/http'
import { computed, onBeforeMount, reactive } from 'vue';
import { NButton } from 'naive-ui';
import QRLoginDialog from '@/components/QRLoginDialog.vue';
import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
import localforage from 'localforage';
import { usePlayerStore } from '@/store/player';

// 全局player store
const globalPlayer = usePlayerStore()
const togglePlayerBar = () => {
  globalPlayer.togglePlayer()
}

const state = reactive({
  showLoginDialog: false,
  showTaggingDialog: false,
  profile: null,
  account: null,
  isOutLine: false,
  isLogin: computed(() => {
    return Boolean(state.profile)
  }),
});

// init user info;
onBeforeMount(async () => {
  state.profile = await localforage.getItem('profile');
  state.account = await localforage.getItem('account');
  if (!state.profile) {
    getUserInfo();
  }
});

// 获取用户数据
const getUserInfo = async () => {
  const res = await api.get('login/status');
  if (res.data?.profile) {
    state.profile = res.data.profile;
    state.account = res.data.account
    localforage.setItem('profile', res.data.profile);
    localforage.setItem('account', res.data.account);
  }
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