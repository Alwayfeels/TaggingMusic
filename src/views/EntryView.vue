<template>
  <div class="view-container  w-full mt-2 ml-10">
    <p>这里是一个介绍页，在做了在做了</p>
    <p>使用方法：登录 -> 查看歌单 -> 点击播放音乐 -> 记录你的tag -> 右上角点击生成歌单</p>
    <NButton  type="primary" @click="toMainView">开始使用</NButton>
  </div>
</template>

<script setup>
import playMusicBar from '@/components/PlayMusicBar.vue';
import { NDataTable, NButton } from "naive-ui";
import { reactive } from 'vue';
import {useRouter, useRoute} from 'vue-router'

const router = useRouter()

const state = reactive({
  activeKey: null,
  collapsed: true,
})

function toMainView() {
  router.push('/main')
}
</script>

<style lang="scss" scoped>
</style>