<template>
  <div class="view-container flex flex-col items-center w-full ml-10">
    <div class="screen-view items-center pt-20">
      <div class="flex">
        <div class="flex flex-col">
          <h1 class="text-5xl mt-12">Tagging Music</h1>
          <p class="text-2xl text-slate-400 test-class">使用 Tag 标记歌曲，然后快速生成歌单</p>
          <div class="flex ml-8 my-16">
            <NButton class="my-4" type="primary" secondary size="large" @click="toIntro">
              <span>使用方法</span>
              <n-icon class="ml-2" :size="24" :component="ArrowCircleDown24Filled" />
            </NButton>
            <NButton class="ml-4 my-4" type="primary" size="large" @click="toMainView">
              <span>开始使用</span>
              <n-icon class="ml-2" :size="20" :component="ArrowCircleRight24Filled" />
            </NButton>
          </div>
        </div>
        <div class="flex-1">
          <DemoAnimate />
        </div>
      </div>
      <n-divider />
      <div class="detail flex flex-1">
        <div v-for="(item, index) in detailInfo" :key="index" class="flex-1 px-4">
          <div class="title text-xl">{{ item.title }}</div>
          <div class="content mt-4 text-slate-500">
            <p v-for="row in item.content" :key="row">{{ row }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footer pt-40 w-full flex justify-center">
    <span class="mr-2">MIT Licensed | Copyright © 2022-present</span>
    <a href="https://github.com/yyx990803" target="_blank" rel="noopener noreferrer">Alwayfeels</a>
  </div>
</template>

<script setup lang="ts">
import { NButton, NDivider, NIcon } from "naive-ui";
import { ref, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router'
import DemoAnimate from '@/components/DemoAnimate.vue'
import { ArrowCircleDown24Filled, ArrowCircleRight24Filled } from '@vicons/fluent'

const app = getCurrentInstance()
const router = useRouter()

const detailInfo = ref([
  {
    title: '技术栈',
    content: [
      'Tagging Music 基于 NeteaseCloudMusicApi 开发（目前只支持网易云），使用 indexedDB 缓存数据（新增云端存储）。',
      '清除浏览器缓存将会丢失所有Tag数据，清除缓存前请记得保存数据避免数据丢失。',
      '技术栈(前端)：Vue3(compositionApi) + Typescript + Vite + Pinia + NaiveUI + TailwindCSS',
      '技术栈(其他)：express, mongoDB, Localforage, Cypress'
    ]
  },
  {
    title: '开发原因',
    content: [
      '网易云音乐的歌单快速导入是基于古老的多选框构建的',
      '如果想要把歌曲分类成不同的维度来创建歌单：比如『粤语/男/情歌』，分类会十分麻烦。并且如果再想创建『粤语/女/情歌』那么所有的工作必须从头开始。',
      'TaggingMusic 灵感来自 flomo, 使用可重复利用的标签来分类歌曲，快速创建歌单。',
      '本项目仅供本人学习讨论使用，不保证后续的维护和开发'
    ]
  }
])

function toMainView() {
  router.push('/home')
}

function toIntro() {
  (app as any).proxy.$notification.create({
    type: 'error',
    title: "在做了在做了!",
    duration: 3000
  })
}
</script>

<style lang="scss" scoped>
.view-container {
  box-sizing: border-box;
  padding: 0 20%;
  height: calc(100vh - 80px);
  min-width: 800px;

  .screen-view {
    height: 100%;
    overflow: hidden;
  }

  .footer {}
}
</style>