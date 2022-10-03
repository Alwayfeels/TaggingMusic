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
    <!-- Tag Handler -->
    <NButton v-if="globalState.user.isLogin" class="mx-2" size="large" strong type="success" @click="onGenerate">
      生成tag歌单
    </NButton>
    <NDropdown :options="tagStoreOptions">
      <NButton size="large" strong type="info" >歌曲 Tags 存储</NButton>
    </NDropdown>
    <!-- Login -->
    <NButton class="ml-2" size="large" strong type="error" @click="onLogin">
      {{ globalState.user.isLogin ? '切换用户' : '登录' }}
    </NButton>
    <LoginDialog ref="LoginDialogRef" />
    <MergeTaggedSongDialog ref="mergeTaggedSongRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, getCurrentInstance, h } from 'vue'
import type { Component } from 'vue'
import storeApi from '@/api/storeApi'
import { NButton, NIcon, NTag, NDropdown } from 'naive-ui';
import { LogoGithub } from '@vicons/ionicons4'
import { CloudArrowDown20Regular, CloudArrowUp20Regular } from '@vicons/fluent'
import { FileUpload, FileDownload } from '@vicons/tabler'
import { useRouter, useRoute } from 'vue-router'
import { useGlobalData } from '@/store/globalData'
import { useGlobalState } from '@/store/globalState'
import SearchBar from '@/components/SearchBar.vue'
import LoginDialog from '@/components/LoginDialog.vue'
import MergeTaggedSongDialog from '@/components/MergeTaggedSongDialog.vue'
const route = useRoute()
const router = useRouter()
const globalData = useGlobalData()
const globalState = useGlobalState()
const app = getCurrentInstance()


/** 
 * @desc button handler
 */
const LoginDialogRef = ref()
async function onLogin() {
  LoginDialogRef.value.showDialog = true
}

const mergeTaggedSongRef = ref()
function onGenerate() {
  mergeTaggedSongRef.value.showDialog = true
}

/** 
 * @desc router handler
 */
function toGithub() {
  window.open('https://github.com/Alwayfeels/TaggingMusic', '_blank')
}

function toEntry() {
  globalData.point({ desc: 'click title', profile: globalData.user?.profile || null })
  router.push('/')
}

/**
 * @params tagStoreOptions
 */
const renderIcon = (icon: Component) => {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}
const tagStoreOptions = [
  {
    label: '上传 tags',
    key: 'upload',
    icon: renderIcon(CloudArrowUp20Regular),
    props: {
      onClick: onUploadTaggedSongs
    }
  },
  {
    label: '下载 tags',
    key: 'download',
    icon: renderIcon(CloudArrowDown20Regular),
    props: {
      onClick: globalData.downloadTaggedSongs
    }
  },
  {
    label: '导出 tags',
    key: 'export',
    icon: renderIcon(FileDownload),
    props: {
      onClick: globalData.exportTaggedSong
    }
  },
  {
    label: '导入 tags',
    key: 'import',
    icon: renderIcon(FileUpload),
    props: {
      onClick: globalData.importTaggedSong
    }
  },
]
/**
 * @desc: 上传 Tag
 */
async function onUploadTaggedSongs() {
  const res = await globalData.uploadTaggedSong()
  if (res.code === 200) {
    (app as any).proxy.$notification.create({
      type: 'success',
      title: "上传成功",
      duration: 3000
    })
  }
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