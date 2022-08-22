<template>
  <div class="top-bar w-full h-20 flex items-center justify-center">
    <!-- Title -->
    <NIcon class="cursor-pointer mr-6" size="32" :component="LogoGithub" @click="toGithub" />
    <div class="text-2xl cursor-pointer" @click="toEntry">Tagging Music</div>
    <div class="ml-2 rounded-full bg-gray-400 text-white px-2 py-0.5">beta</div>
    <!-- Search -->
    <div class="mx-8 flex-1 flex justify-center">
      <SearchBar />
    </div>
    <!-- User -->
    <div class="user-info flex items-center mr-4" v-if="globalData.user.profile?.nickname">
      <div class="mr-4">
        <div class="font-medium">{{ globalData.user.profile?.nickname }}</div>
        <NTag v-if="globalState.user.isVip" type="warning" size="small" class="mini-tag float-right">
          VIP</NTag>
      </div>
      <img class="user-avatar rounded" :src="`${globalData.user.profile?.avatarUrl}?param=40y40`" alt="avatar">
    </div>
    <!-- Login -->
    <NButton class="ml-2" size="large" strong type="error" @click="onLogin">
      {{ globalState.user.isLogin ? '切换用户' : '登录' }}
    </NButton>
    <LoginDialog ref="LoginDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NButton, NIcon, NTag } from 'naive-ui';
import { LogoGithub } from '@vicons/ionicons4'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalData } from '@/store/globalData'
import { useGlobalState } from '@/store/globalState'
import SearchBar from '@/components/SearchBar.vue'
import LoginDialog from '@/components/LoginDialog.vue'
// import { createDiscreteApi } from 'naive-ui'

// const { notification } = createDiscreteApi(['notification'])
// function openN() {
//   notification.create({
//       type: 'error',
//       title: "该歌曲暂无音源",
//       duration: 3000
//     })
// }

const route = useRoute()
const router = useRouter()
const globalData = useGlobalData()
const globalState = useGlobalState()

const LoginDialogRef = ref()
function onLogin() {
  LoginDialogRef.value.showDialog = true
}

function toGithub() {
  window.open('https://github.com/Alwayfeels/TaggingMusic', '_blank')
}

function toEntry() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.top-bar {
  background-color: white;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
  padding: 0 40px;
}
</style>