<template>
  <div class="play-bar w-full h-20 fixed bottom-0" :class="{ 'hidden-playbar': !globalState.player.isShow }">
    <div class="bookmark flex items-center justify-center absolute cursor-pointer"
      @click="globalState.player.isShow = !globalState.player.isShow">
      <n-icon :component="globalState.player.isShow ? CaretDown24Filled : CaretUp24Filled" />
    </div>
    <div class="w-full h-full px-10 flex items-center justify-center">
      <!-- 歌曲信息 -->
      <img v-if="globalState.player.active?.al?.picUrl" :src="`${globalState.player.active?.al?.picUrl}?param=64y64`"
        class="w-16 h-16" alt="">
      <div class="ml-4 flex flex-col">
        <div class="text-lg max-w-sm flex items-center">
          <span class="truncate">{{ globalState.player.active?.name }}</span>
          <NTag v-if="globalState.player.active?.fee == 8" type="warning" size="small"
            class="ml-2 mini-tag float-right">VIP
          </NTag>
        </div>
        <div class="max-w-sm truncate">{{ globalState.player.active?.ar?.map((e: any) => e.name)?.join(' / ') }}</div>
      </div>
      <!-- 播放控制 -->
      <div class="ml-4 flex items-center">
        <n-spin :show="globalState.player.isLoading">
          <n-icon-wrapper :class="globalState.player.active ? 'cursor-pointer' : 'cursor-not-allowed'" :size="48"
            :border-radius="24" @click="() => { globalState.player.isPlaying ? audioPause() : audioPlay() }">
            <n-icon v-if="globalState.player.isPlaying" :size="24" :component="Pause48Filled" />
            <n-icon v-else :size="24" :component="Play48Filled" />
          </n-icon-wrapper>
        </n-spin>
        <n-icon size="24" color="#18a058" class="p-2 cursor-pointer" :component="Next24Filled"
          @click="globalState.setNextSong" />
      </div>
      <!-- 进度条 -->
      <div class="w-96 ml-6 pt-1 flex flex-col">
        <n-slider v-model:value="progress.currentTime" :max="globalState.player.duration"
          :format-tooltip="timeFormatter" :step="1" :onUpdate:value="dragHandler" @mousedown="dragHandlerStart"
          @mouseup="dragHandlerEnd" />
        <div class="mt-2 flex justify-between">
          <span>320kbps</span>
          <span>{{ processInfo }}</span>
        </div>
      </div>
      <!-- 音量 -->
      <div class="volume ml-16 flex w-36 items-center">
        <n-icon class="cursor-pointer mr-2" size="24" :component="volume.volumeComponent" @click="onVolumnMute" />
        <n-slider v-model:value="volume.val" :max="100" :step="1" />
      </div>
      <!-- 播放列表 -->
      <n-popover trigger="click" :to="false" display-directive="show">
        <template #trigger>
          <n-icon class="cursor-pointer ml-4" size="24" :component="TextBulletListLtr24Filled" />
        </template>
        <div class="w-full p-1 mb-1 flex justify-between">
          <div>播放列表 {{`(${globalState.player.playlist.length})`}}</div>
          <div class="text-green-800 hover:underline cursor-pointer" @click="setPlaylistScrollTop">跳转到播放歌曲</div>
        </div>
        <div class="player-list w-full pt-1">
          <n-scrollbar ref="playerlistRef" style="max-height: 300px">
            <div class="flex w-full items-center cursor-pointer hover:bg-gray-100 box-border p-2 mr-2"
              v-for="(item, index) in globalState.player.playlist" :key="item.id" @click="onPlaylistClick(index)">
              <n-icon v-if="globalState.player.active.id === item.id" color="#18a058" class="float-left" :size="16"
                :component="Play12Filled" />
              <div class="pl-1 flex-1 text-gray-500 leading-4">{{ `${index+1}. ${item.name}` }}</div>
              <!-- <div class="pr-2 text-red-400 justify-items-end leading-4 hover:underline"
                @click="onRemovePlaylist(item)">
                删除</div> -->
            </div>
          </n-scrollbar>
        </div>
      </n-popover>
      <!-- 播放模式 -->
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-icon class="cursor-pointer ml-4" size="24" :component="PlayModeComponent" @click="onPlayModeChange" />
        </template>
        {{ globalState.player.playMode }}
      </n-tooltip>
      <!-- 快捷输入 Taginput -->
      <!-- <div class="input-tag flex-1 ml-16">
        <TagInputGroup :songId="globalState.player.active.id" :song="globalState.player.active"></TagInputGroup>
      </div> -->
      <!-- 仅展示的 TagInput -->
      <NDynamicTags class="ml-8 w-80" :closable="false" type="success" v-model:value="playingSongTags">
        <template #trigger="{}"></template>
      </NDynamicTags>
    </div>
    <!-- 播放器实例 -->
    <audio ref="audio" :src="globalState.player.active?.url" @ended="globalState.setNextSong()"
      @canplay="audioGetDuration" @timeupdate="audioTimeUpdate" style="display: none"
      :loop="globalState.player.playMode === PlayMode.SINGLE"></audio>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, nextTick, getCurrentInstance } from 'vue'
import { ArrowRepeatAll16Regular, Previous24Filled, Play48Filled, Pause48Filled, AnimalCat24Regular, TextBulletListLtr24Filled, Play12Filled } from '@vicons/fluent'
import { useGlobalState } from '@/store/globalState';
import { useGlobalData } from '@/store/globalData';
import { IosVolumeHigh, IosVolumeLow, IosVolumeMute, IosVolumeOff } from '@vicons/ionicons4'
import { RepeatOnce, ArrowsShuffle } from '@vicons/tabler'
import { CaretUp24Filled, CaretDown24Filled, Next24Filled } from '@vicons/fluent'
import { NIcon, NSlider, NIconWrapper, NTag } from 'naive-ui'
import TagInputGroup from './TagInputGroup.vue';
import { PlayMode, type TaggedSong } from '@/store/types'
import { useRoute } from 'vue-router'

const app = getCurrentInstance()

const route = useRoute()
const globalState = useGlobalState()
const globalData = useGlobalData()

const state = reactive({
  inputTag: [], // 快捷输入标签
})
const playingSongTags = computed(() => {
  const activeSong = globalState.player.active
  if (activeSong?.tags?.length) {
    return activeSong?.tags
  }
  const taggedSong: TaggedSong | null = globalData.taggedSongs.find(e => e.id === activeSong.id) || null
  return taggedSong ? taggedSong.tags : []
})

/** 
 * @desc 根据 globalState 修改播放状态
 */
watch(() => globalState.player.isPlaying, (val: boolean) => {
  val ? audioPlay() : audioPause()
})

/** 
 * @desc 进度条
 * =============================================================== 
 */
interface Progress {
  val: number;
  isDrag: boolean;
  currentTime: number;
}
const progress: Progress = reactive({
  val: 0,
  isDrag: false,
  currentTime: computed({
    get() {
      return progress.isDrag ? progress.val : globalState.player.currentTime
    },
    set(val) {
      progress.val = val
    }
  }),
})

function dragHandler(val: number) {
  progress.val = val
}

function dragHandlerStart() {
  progress.isDrag = true
}

function dragHandlerEnd() {
  globalState.player.currentTime = progress.val
  audio.value.currentTime = progress.val
  progress.isDrag = false
}

// 播放进度条下方 时间格式化
const processInfo = computed(() => {
  const curr = timeFormatter(Math.floor(progress.currentTime))
  const dura = timeFormatter(Math.floor(globalState.player.duration))
  return `${curr || '--'} / ${dura || '--'}`
})

// 时间格式化
const timeFormatter = (value: number) => {
  if (value === 0) return '00:00'
  const minute = Math.floor(value / 60)
  const second = Math.floor(value % 60)
  return `${minute}:${second < 10 ? '0' + second : second}`
}

/**
 * @params 播放音乐时，弹出播放器 playerBar
 */
watch(() => globalState.player.isPlaying, (isPlaying: boolean) => {
  if (isPlaying) {
    globalState.player.isShow = true
  }
})

/** 
 * @desc 播放器控制
 */
const audio = ref()

// 获取音乐时长
function audioGetDuration() {
  globalState.player.duration = audio.value.duration;
}

// 暂停
async function audioPause() {
  await audio.value?.pause()
  globalState.player.isPlaying = false;
}

// 播放
async function audioPlay() {
  if (globalState.player.active.url) {
    nextTick(() => {
      if (audio.value) {
        const playPromise = audio.value.play()
        playPromise.then(() => {
          globalState.player.isPlaying = true;
        }).catch((err: any) => {
          console.error(JSON.stringify(err))
          globalState.player.isPlaying = false;
        })
      }
    })
    return true;
  }
  if (globalState.player.active?.is404) {
    (app as any).proxy.$notification.create({
      type: 'error',
      title: "该歌曲暂无音源",
      duration: 3000
    })
    return false;
  }
  const canPlay = await globalState.setPlayerActiveSong({ index: globalState.activePlayingSongIdx });
  if (canPlay) {
    const playPromise = audio.value.play()
    playPromise.then(() => {
      globalState.player.isPlaying = true;
    }).catch((err: any) => {
      console.error(JSON.stringify(err))
      globalState.player.isPlaying = false;
    })
  }
}

// 更新当前时间
const audioTimeUpdate = (e: any) => {
  globalState.player.currentTime = e.target.currentTime;
};

// 播放歌曲变动时，播放新的歌曲
watch(() => globalState.activePlayingSongIdx, (val) => {
  if (globalState.player.active.is404) {
    setTimeout(() => {
      globalState.setNextSong()
    }, 3000);
  } else if (val) {
    audioPlay()
  }
}, { deep: true })

/** 
 * @desc 音量控制
 */
const volume = reactive({
  val: 100, // max 100
  beforeVal: 100,
  volumeComponent: computed(() => {
    if (volume.val === 0) return IosVolumeOff
    if (volume.val < 25) return IosVolumeMute
    if (volume.val < 65) return IosVolumeLow
    return IosVolumeHigh
  }),
})
watch(() => volume.val, (val) => {
  audio.value.volume = val / 100
})
function onVolumnMute() {
  if (volume.val === 0) {
    volume.val = volume.beforeVal
  } else {
    volume.beforeVal = volume.val
    volume.val = 0
  }
}

/** 
 * @desc 播放列表
 */
const playerlistRef = ref()
function onPlaylistClick(index: number) {
  globalState.setPlayerActiveSong({ index })
}
function setPlaylistScrollTop() {
  const scrollTop = globalState.activeSongIdx * 32;
  playerlistRef.value.scrollTo({ top: scrollTop })
}

/**
 * @desc 播放模式
 */
const playModeIcon = {
  [PlayMode.LOOP]: ArrowRepeatAll16Regular,
  [PlayMode.SINGLE]: RepeatOnce,
  [PlayMode.RANDOM]: ArrowsShuffle
}
const PlayModeComponent = computed(() => {
  return playModeIcon[globalState.player.playMode]
})
function onPlayModeChange() {
  const mode = [PlayMode.LOOP, PlayMode.SINGLE, PlayMode.RANDOM]
  const index = mode.indexOf(globalState.player.playMode);
  const nextIndex = (index + 1) % mode.length;
  globalState.player.playMode = mode[nextIndex];
}

</script>

<style lang="scss" scoped>
.play-bar {
  transition: bottom 0.5s ease-out;
  box-shadow: 0 0 10px rgba($color: #000000, $alpha: 0.1);
  z-index: 1000;
  background-color: #ffffff;
}

.hidden-playbar {
  bottom: -80px
}

.player-list {
  border-top: 1px solid rgba($color: #cccccc, $alpha: 0.5);
  width: 280px;
  overflow: hidden;
}

.bookmark {
  background-color: #ffffff;
  box-shadow: 0 -5px 10px rgba($color: #000000, $alpha: 0.1);
  border-radius: 4px 4px 0 0;
  width: 40px;
  height: 24px;
  right: 30px;
  top: -24px;
  z-index: 999;
}

.input-tag {
  overflow: hidden;
  max-width: 25%;
}
</style>