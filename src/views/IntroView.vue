<template>
  <div class="view-container flex flex-col items-center justify-center w-full">
    <div class="screen-view flex items-center justify-start">
      <div class="flex shrink-0 mr-8 flex-col max-w-md">
        <h1 class="text-5xl mt-12">Tagging Music</h1>
        <p class="text-2xl text-slate-400 test-class">使用 Tag 标记歌曲，然后快速生成歌单</p>
        <div class="flex ml-4 my-16">
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
      <div class="h-full flex flex-col justify-end demoAnimate">
        <DemoAnimate ref="demoAnimateRef" class="w-full" @change='onTagChange' />
        <div class="my-4 w-full overflow-hidden">
          <NDynamicTags class="w-full" v-model:value="activeTags" :render-tag="renderTag">
            <template #trigger="{}"></template>
          </NDynamicTags>
        </div>
        <div class="flex items-center pb-12">
          <NPopover trigger="hover">
            <template #trigger>
              <n-icon size="24" class="text-green-700 cursor-pointer" :component="BookQuestionMark20Filled" />
            </template>
            <div style="width: 300px;">
              <div class="font-bold mb-4">Demo 使用方法</div>
              <div class="mb-2 flex justify-between">
                <NTag type="success">左键点击</NTag>
                <span>含有该 tag 的歌曲都会被收录</span>
              </div>
              <div class="mb-2 flex justify-between">
                <NTag type="warning">ctrl + 左键</NTag>
                <span>不含该 tag 的歌曲都会被剔除</span>
              </div>
              <div class="flex justify-between">
                <NTag type="error">右键点击</NTag>
                <span>含有该 tag 的歌曲都会被剔除</span>
              </div>
            </div>
          </NPopover>
          <div v-if="activeTags.length" class="flex items-center">
            <div class="search-result">有 {{canPlaySong.length}} 首歌曲符合你的要求，要试听吗?</div>
            <NButton class="ml-4" type="success" size="tiny" @click="playPreview">
              <span>随便听听</span>
              <n-icon class="ml-2" :size="20" :component="Play12Filled" />
            </NButton>
          </div>
          <div v-else>
            如何使用：点击上方的 tag, 随机推送歌曲
          </div>
        </div>
      </div>
    </div>
    <div class="screen-view flex flex-col items-center justify-start">
      <n-divider />
      <div class="detail flex flex-1">
        <div v-for="(item, index) in detailInfo" :key="index" class="desc-view flex-1 px-4">
          <div class="title text-xl">{{ item.title }}</div>
          <div class="content mt-4 text-slate-500">
            <p v-for="row in item.content" :key="row">{{ row }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer flex justify-center">
      <span class="mr-2">MIT Licensed | Copyright © 2022-present</span>
      <a href="https://github.com/Alwayfeels" target="_blank" rel="noopener noreferrer">Alwayfeels</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NDivider, NIcon, NDynamicTags, NTag, NPopover } from "naive-ui";
import { BookQuestionMark20Filled } from '@vicons/fluent'
import { ref, getCurrentInstance, reactive, h, computed, onMounted, watch, toRaw } from "vue";
import { useRouter } from "vue-router";
import DemoAnimate from "@/components/DemoAnimate.vue";
import { useGlobalData } from '@/store/globalData'
import { filterSongWithTag } from '@/assets/tool'
import localforage from "localforage";
import { ArrowCircleDown24Filled, ArrowCircleRight24Filled, Play12Filled } from "@vicons/fluent";
import { useGlobalState } from "@/store/globalState";
import type { Song } from '@/store/types';

const app = getCurrentInstance();
const router = useRouter();
const globalData = useGlobalData()
const globalState = useGlobalState()

const detailInfo = ref([
  {
    title: "技术栈 (Tech Stack)",
    content: [
      "Tagging Music 基于 NeteaseCloudMusicApi 开发（目前只支持网易云），使用 indexedDB 缓存数据（新增云端存储）。",
      "清除浏览器缓存将会丢失所有Tag数据，清除缓存前请记得保存数据避免数据丢失。",
      "技术栈(前端)：Vue3(compositionApi) + Typescript + Vite + Pinia + NaiveUI + TailwindCSS",
      "技术栈(其他)：express, mongoDB, Localforage, Cypress",
    ],
  },
  {
    title: "开发原因 (User Story)",
    content: [
      "网易云音乐的歌单快速导入是基于古老的多选框构建的",
      "如果想要把歌曲分类成不同的维度来创建歌单：比如『粤语/男/情歌』，分类会十分麻烦。并且如果再想创建『粤语/女/情歌』那么所有的工作必须从头开始。",
      "TaggingMusic 灵感来自 flomo, 使用可重复利用的标签来分类歌曲，快速创建歌单。",
      "本项目仅供本人学习讨论使用，不保证后续的维护和开发",
    ],
  },
]);

function toMainView() {
  router.push("/home");
}

function toIntro() {
  (app as any).proxy.$notification.create({
    type: "error",
    title: "在做了在做了!",
    duration: 3000,
  });
}

/**
 * @desc demoAnimate
 */

const activeTags = ref<{ label: string; value: string; }[]>([])

const demoAnimateRef = ref()
function onTagChange(data: any) {
  activeTags.value = data.map((e: any) => ({
    label: e.name,
    value: e.state
  }))
}
function renderTag(tag: { label: string; value: string }, index: number) {
  const STATE_MAP: any = {
    'selected': 'success',
    'required': 'warning',
    'disabled': 'error'
  }
  return h(NTag, {
    type: STATE_MAP[tag.value] || '',
    disabled: false,
    closable: true,
    onClose: () => {
      demoAnimateRef.value.changeTagState(tag.label, null)
      activeTags.value.splice(index, 1)
    }
  }, {
    default: () => tag.label
  })
}

let taggedSongs: any[] = []
onMounted(async () => {
  taggedSongs = await localforage.getItem("taggedSongs") || [];
})

const canPlaySong = computed(() => {
  const includedTags: string[] = []
  const disabledTags: string[] = []
  const requiredTags: string[] = []
  activeTags.value.forEach(tag => {
    if (tag.value === 'selected') includedTags.push(tag.label)
    else if (tag.value === 'disabled') disabledTags.push(tag.label)
    else if (tag.value === 'required') requiredTags.push(tag.label)
  })
  const songlist: Song[] = filterSongWithTag(taggedSongs, includedTags, requiredTags, disabledTags)
  return songlist
})

/**
 * @desc playRandom
 */
function playPreview() {
  globalState.player.playlist = canPlaySong.value;
  globalState.setPlayerActiveSong({ index: 0 })
}

</script>

<style lang="scss" scoped>
.view-container {
  box-sizing: border-box;
  height: calc(100vh - 80px);
  overflow-x: hidden;
  overflow-y: auto;
  min-width: 1000px;
  padding-bottom: 20px;

  .screen-view {
    width: 100%;
    height: 100%;
    min-width: 1024px;
    max-width: 1280px;
  }

  .desc-view {
    min-width: 500px;
  }

  .demoAnimate {
    width: 600px;

    .scroll-btn-disabled {
      color: #d03050;
      background-color: rgba(208, 48, 80, 0.16)
    }

    .scroll-btn-selected {
      background-color: #36ad6a;
      color: #ffffff;
    }
  }

  // .scroll-wrapper {
  //   height: 100%;
  //   min-width: 500px;
  // }

  .footer {
    position: fixed;
    bottom: 0;
  }
}

@media screen and (max-width: 1280px) {
  .view-container {
    min-width: 800px;
    padding: 0 20px;
  }
}
</style>