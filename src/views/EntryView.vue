<template>
  <div class="view-container flex flex-col items-center w-full h-full mt-2 ml-10">
    <h1 class="text-5xl mt-32">Tagging Music</h1>
    <p class="text-2xl text-slate-400">使用 Tag 标记歌曲，快速生成丰富的分类歌单</p>
    <NButton class="my-4" type="primary" size="large" @click="toMainView">开始使用</NButton>
    <n-divider />
    <div class="detail flex flex-1">
      <div v-for="item in detailInfo" class="flex-1 px-4">
        <div class="title text-xl">{{ item.title }}</div>
        <div class="content mt-4 text-slate-500">
          <p v-for="row in item.content">{{ row }}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      MIT Licensed | Copyright © 2022-present
      <a href="https://github.com/yyx990803" target="_blank" rel="noopener noreferrer">Alwayfeels</a>
    </div>
  </div>
</template>

<script setup>
import playMusicBar from '@/components/PlayMusicBar.vue';
import { NDataTable, NButton } from "naive-ui";
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()

const detailInfo = ref([
  {
    title: '技术栈',
    content: [
      'Tagging Music 基于 NeteaseCloudMusicApi 开发（目前只支持网易云），使用 indexedDB 缓存数据。',
      '清除浏览器缓存将会丢失所有Tag数据，清除缓存前请记得导出数据避免数据丢失。',
      '技术栈：Vue3(setup-script) + Vite + Pinia + NaiveUI + TailwindCSS + Localforage，欢迎 star, fork 和 PR'
    ]
  },
  {
    title: '开发原因',
    content: [
      '网易云音乐的歌单快速导入是基于古老的多选框构建的',
      '如果想要把歌曲分类成不同的维度来创建歌单：比如『粤语/男/情歌』，分类会十分麻烦。并且如果再想创建『粤语/女/情歌』那么所有的工作必须从头开始。',
      'TaggingMusic 灵感来自 flomo, 使用可重复利用的标签来分类歌曲，快速创建歌单。'
    ]
  }
])

function toMainView() {
  router.push('/main')
}
</script>

<style lang="scss" scoped>
.view-container {
  box-sizing: border-box;
  padding: 0 20%;

  .footer {
    position: fixed;
    bottom: 10px;
  }
}
</style>