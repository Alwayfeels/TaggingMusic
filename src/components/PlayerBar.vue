<template>
  <div class="play-bar w-full h-20 fixed bottom-0" :class="{ 'hidden-playbar': !globalState.player.isShow }">
    <div class="bookmark flex items-center justify-center absolute cursor-pointer" @click="globalState.player.togglePlayer">
      <n-icon :component="globalState.player.isShow ? CaretDown24Filled : CaretUp24Filled" />
    </div>
    <div class="w-full h-full px-10 flex items-center justify-center">
      <!-- 歌曲信息 -->
      <img v-if="globalState.player.currPlaySong?.al?.picUrl" :src="`${globalState.player.currPlaySong?.al?.picUrl}?param=64y64`"
        class="w-16 h-16" alt="">
      <div class="ml-4 flex flex-col">
        <div class="text-lg max-w-sm flex items-center">
          <span class="truncate">{{ globalState.player.currPlaySong?.name }}</span>
          <NTag v-if="globalState.player.currPlaySong?.fee == 8" type="warning" size="small" class="ml-2 mini-tag float-right">VIP
          </NTag>
        </div>
        <div class="max-w-sm truncate">{{ globalState.player.currPlaySong?.ar?.map(e => e.name)?.join(' / ') }}</div>
      </div>
      <!-- 播放控制 -->
      <div class="ml-4 flex items-center">
        <!-- <n-icon size="24" class="cursor-not-allowed" :component="Previous24Filled" @click="play" /> -->
        <n-spin :show="globalState.player.isLoading">
          <n-icon-wrapper :size="48" :border-radius="24">
            <n-icon class="cursor-pointer" v-if="globalState.player.isPlaying" :size="24" :component="Pause48Filled"
              @click="audioPause" />
            <n-icon v-else :class="globalState.player.currPlaySong ? 'cursor-pointer' : 'cursor-not-allowed'" :size="24"
              :component="Play48Filled" @click="audioPlay" />
          </n-icon-wrapper>
        </n-spin>
        <n-icon size="24" color="#18a058" class="p-2 cursor-pointer" :component="Next24Filled" @click="setNextIndex" />
      </div>
      <!-- 进度条 -->
      <div class="w-96 ml-6 pt-1 flex flex-col">
        <n-slider v-model:value="state.currentTime" :max="globalState.player.duration" :format-tooltip="timeFormatter"
          :step="1" :onUpdate:value="dragHandler" @mousedown="dragHandlerStart" @mouseup="dragHandlerEnd" />
        <div class="mt-2 flex justify-between">
          <span>320kbps</span>
          <span>{{ processInfo }}</span>
        </div>
      </div>
      <!-- 音量 -->
      <div class="volume ml-16 flex w-36 items-center">
        <n-icon class="cursor-pointer mr-2" size="24" :component="state.volumeComponent" @click="onVolumnMute" />
        <n-slider v-model:value="state.volume" :max="100" :step="1" />
      </div>
      <!-- 播放列表 -->
      <n-popover trigger="click" :to="false" display-directive="show">
        <template #trigger>
          <n-icon class="cursor-pointer ml-4" size="24" :component="TextBulletListLtr24Filled" />
        </template>
        <div class="w-full p-1 mb-1 flex justify-between">
          <div>播放列表</div>
          <div class="text-green-800 hover:underline cursor-pointer" @click="setPlaylistScrollTop">跳转到播放歌曲</div>
        </div>
        <div class="player-list w-full pt-1">
          <n-scrollbar ref="playerlistRef" style="max-height: 300px">
            <div class="flex w-full items-center cursor-pointer hover:bg-gray-100 box-border p-2 mr-2"
              v-for="(item, index) in globalState.player.playerList" :key="item.id" @click="onPlaylistClick(index)">
              <n-icon v-if="globalState.player.currPlaySong.id === item.id" color="#18a058" :size="16"
                :component="Play12Filled" />
              <div class="pl-1 flex-1 text-gray-500 leading-4">{{ item.name }}</div>
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
          <n-icon class="cursor-pointer ml-4" size="24" :component="state.playModeComponent"
            @click="onPlayModeChange" />
        </template>
        {{ state.playMode }}
      </n-tooltip>
      <!-- 快捷 Taginput -->
      <div class="input-tag flex-1 ml-16">
        <!-- <TagInput :songId="globalState.player.currPlaySong?.id" :songInfo="globalState.player.currPlaySong"
          @change="updateAllTagInput"></TagInput> -->
      </div>
    </div>
    <!-- 播放器实例 -->
    <audio ref="audio" :src="globalState.player.currPlaySong?.url" @canplay="getDuration" @pause="audioPause"
      @timeupdate="timeupdate" @play="audioPlay" style="display: none" :loop="state.playMode === '单曲循环'"></audio>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { ArrowRepeatAll16Regular, Previous24Filled, Play48Filled, Pause48Filled, AnimalCat24Regular, TextBulletListLtr24Filled, Play12Filled } from '@vicons/fluent'
import { useGlobalState } from '@/store/globalState';
import { useGlobalData } from '@/store/globalData';
import { IosVolumeHigh, IosVolumeLow, IosVolumeMute, IosVolumeOff } from '@vicons/ionicons4'
import { RepeatOnce, ArrowsShuffle } from '@vicons/tabler'
import { CaretUp24Filled, CaretDown24Filled, Next24Filled } from '@vicons/fluent'
import { NIcon, NSlider, NIconWrapper, NTag } from 'naive-ui'
// import TagInput from './TagInput.vue';

const globalState = useGlobalState()
const globalData = useGlobalData()
const audio = ref(null)

const playMode = {
  '顺序播放': ArrowRepeatAll16Regular,
  '单曲循环': RepeatOnce,
  '随机播放': ArrowsShuffle
}
const state = reactive({
  // playerlist: computed(() => {
  //   return globalState.player.playerList;
  // }), // 播放列表
  isPlaying: false, // 是否正在播放
  isProgressDrag: false, // 是否正在拖动进度条
  progressVal: 0,
  inputTag: [], // 快捷输入标签
  currentTime: computed({
    get() {
      if (state.isProgressDrag) {
        return state.progressVal
      } else {
        return globalState.player.currentTime
      }
    },
    set(val) {
      state.progressVal = val
    }
  }),
  volume: 100, // max 100
  beforeVolumn: 100,
  playMode: '顺序播放', // 播放模式
  playModeComponent: computed(() => {
    return playMode[state.playMode]
  }),
  volumeComponent: computed(() => {
    if (state.volume === 0) return IosVolumeOff
    if (state.volume < 25) return IosVolumeMute
    if (state.volume < 65) return IosVolumeLow
    return IosVolumeHigh
  }),
})

watch(() => globalState.player.isPlaying, (val) => {
  if (state.isPlaying !== val) {
    state.isPlaying = val
    val ? audioPlay() : audioPause()
  }
})

// 同步 player 中和 table 中 tagInput 组件的值
function updateAllTagInput(newTag) {
  console.log('updateAllTagInput', newTag)
  globalData.status.updateTagInput = new Date().getTime();
}

/** 
 * @desc 音量控制
 */
watch(() => state.volume, (val) => {
  audio.value.volume = val / 100
})
function onVolumnMute() {
  if (state.volume === 0) {
    state.volume = state.beforeVolumn
  } else {
    state.beforeVolumn = state.volume
    state.volume = 0
  }
}
/** 
 * @desc 播放进度条下方 时间格式化
 * @params {  } 
 */
const processInfo = computed(() => {
  const curr = timeFormatter(Math.floor(state.currentTime))
  const dura = timeFormatter(Math.floor(globalState.player.duration))
  return `${curr} / ${dura}`
})
// 时间格式化
const timeFormatter = (value) => {
  if (value === 0) return '00:00'
  const minute = Math.floor(value / 60)
  const second = Math.floor(value % 60)
  return `${minute}:${second < 10 ? '0' + second : second}`
}
/** 
 * @desc 播放进度条 拖动处理
 * @params {  } 
 */
function dragHandler(val) {
  state.progressVal = val
}
function dragHandlerStart() {
  state.isProgressDrag = true
}
function dragHandlerEnd() {
  globalState.player.currentTime = state.progressVal
  audio.value.currentTime = state.progressVal
  state.isProgressDrag = false
}
/** 
 * @desc currPlaySong 改变时，更新 audio src
 * @params {  } 
 */
watch(() => globalState.player.currPlayIndex, (val) => {
  if (globalState.player.currPlaySong.is404) {
    setTimeout(() => {
      setNextIndex()
    }, 3000);
  } else if (val) {
    audioPlay()
  }
}, { deep: true })
/** 
 * @desc Audio播放器 播放/暂停 事件
 */
async function audioPlay() {
  if (globalState.player.currPlaySong?.url) {
    audio.value?.play()
    state.isPlaying = true;
    globalState.player.isPlaying = true;
    return true;
  }
  if (globalState.player.currPlaySong?.is404) {
    window.$notification.error({
      title: "该歌曲暂无音源",
      duration: 3000
    })
    return false;
  }
  let canPlay = await globalState.player.loadCurrPlaySong();
  if (canPlay) {
    audio.value?.play()
    state.isPlaying = true;
    globalState.player.isPlaying = true;
  }
}

function audioPause() {
  audio.value?.pause()
  state.isPlaying = false;
  globalState.player.isPlaying = false;
}
/**
 * @desc 获取音乐时长
 */
const getDuration = () => {
  // 此时可以拿到音频时长（audio.value.duration）;
  console.log('此时可以拿到音频时长（' + audio.value.duration + '）')
  globalState.player.duration = audio.value.duration;
}
/**
 * @desc 更新当前时间
 * 如果当前音频进度 = 总时长，则自动播放下一首(根据 playMode)
 */
const timeupdate = (e) => {
  globalState.player.currentTime = e.target.currentTime;
  if (e.target.currentTime >= globalState.player.duration) {
    setNextIndex();
  }
};
/** 
 * @desc 根据播放模式播放下一首
 * @params {  } 
 */
function setNextIndex() {
  const playMode = state.playMode;
  if (playMode === '顺序播放') {
    let index = (globalState.player.currPlayIndex + 1) % globalState.player.playerList.length;
    globalState.player.setPlayIndex(index);
  } else if (playMode === '随机播放') {
    let index = Math.floor(Math.random() * globalState.player.playerList.length);
    globalState.player.setPlayIndex(index);
  }
}

/** 
 * @desc 播放列表相关
 * @params {  } 
 */
// 点击播放列表切歌
const playerlistRef = ref()
function onPlaylistClick(index) {
  globalState.player.setPlayIndex(index)
}
function setPlaylistScrollTop() {
  let scrollTop = globalState.player.currPlayIndex * 32;
  playerlistRef.value.scrollTo({ top: scrollTop })
}

/** 
 * @desc 播放模式切换
 * @params {  } 
 */
function onPlayModeChange() {
  let playMode = ['顺序播放', '单曲循环', '随机播放'];
  let index = playMode.indexOf(state.playMode);
  index = (index + 1) % playMode.length;
  state.playMode = playMode[index];
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