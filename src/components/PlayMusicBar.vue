<template>
  <div class="play-bar w-full h-20 fixed z-10 bottom-0" :class="{ 'hidden-playbar': !globalPlayer.isPlayerShow }">
    <div class="w-full h-full px-10 flex items-center justify-center">
      <!-- 歌曲信息 -->
      <img v-if="globalPlayer.currPlaySong?.al?.picUrl" :src="`${globalPlayer.currPlaySong?.al?.picUrl}?param=64y64`"
        class="w-16 h-16" alt="">
      <div class="ml-4 flex flex-col">
        <div class="text-lg">{{ globalPlayer.currPlaySong?.name }}</div>
        <div>{{ globalPlayer.currPlaySong?.ar?.map(e => e.name)?.join(' / ') }}</div>
      </div>
      <!-- 播放控制 -->
      <div class="ml-4 flex items-center">
        <!-- <n-icon size="24" class="cursor-not-allowed" :component="Previous24Filled" @click="play" /> -->
        <n-spin :show="state.isLoading">
          <n-icon-wrapper :size="48" :border-radius="48">
            <n-icon class="cursor-pointer" v-if="globalPlayer.isPlay" :size="24" :component="Pause48Filled"
              @click="pause" />
            <n-icon v-else :class="globalPlayer.currPlaySong ? 'cursor-pointer' : 'cursor-not-allowed'" :size="24"
              :component="Play48Filled" @click="play" />
          </n-icon-wrapper>
        </n-spin>
        <!-- <n-icon size="24" class="cursor-not-allowed" :component="Next24Filled" /> -->
      </div>
      <!-- 进度条 -->
      <div class="w-96 ml-6 pt-1 flex flex-col">
        <n-slider v-model:value="state.currentTime" :max="globalPlayer.duration" :format-tooltip="timeFormatter"
          :step="1" :onUpdate:value="dragHandler" @mousedown="dragHandlerStart" @mouseup="dragHandlerEnd" />
        <div class="mt-2 flex justify-between">
          <span>320kbps</span>
          <span>{{ processInfo }}</span>
        </div>
      </div>
      <!-- 音量 -->
      <div class="volume ml-32 flex w-36 items-center">
        <n-icon class="cursor-pointer mr-2" size="24" :component="state.volumeComponent"
          @click="state.isMute = !state.isMute" />
        <n-slider v-model:value="state.volume" :max="100" :step="1" />
      </div>
      <!-- 播放列表 -->
      <n-popover trigger="click">
        <template #trigger>
          <n-icon class="cursor-pointer ml-4" size="24" :component="TextBulletListLtr24Filled"
            @click="togglePlaylist" />
        </template>
        <div class="w-full pb-1 mb-1" style="border-bottom: 1px solid #ccc">播放列表</div>
        <div class="player-list w-full">
          <div class="flex w-full hover:bg-gray-100 mb-2" v-for="item in globalPlayer.playerList" :key="item.id">
            <div class="pl-1 flex-1 text-gray-500">{{ item.name }}</div>
            <div class="pr-1 text-red-400 justify-items-end cursor-pointer hover:underline">删除</div>
          </div>
        </div>
      </n-popover>
    </div>
    <audio ref="audio" :src="globalPlayer.currPlaySong?.url" @canplay="getDuration" @pause="pause"
      @timeupdate="timeupdate" @play="play" style="display: none"></audio>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { Next24Filled, Previous24Filled, Play48Filled, Pause48Filled, AnimalCat24Regular, TextBulletListLtr24Filled } from '@vicons/fluent'
import { usePlayerStore } from '@/store/player';
import { IosVolumeHigh, IosVolumeLow, IosVolumeMute, IosVolumeOff } from '@vicons/ionicons4'
import { LogoGithub } from '@vicons/ionicons4'
import { NIcon, NSlider, NIconWrapper } from 'naive-ui'

const globalPlayer = usePlayerStore()
const audio = ref(null)

const state = reactive({
  isLoading: false, // 歌曲是否正在加载
  showPlaylist: false,
  playlist: [],
  isProgressDrag: false,
  progressVal: 0,
  currentTime: computed({
    get() {
      if (state.isProgressDrag) {
        return state.progressVal
      } else {
        return globalPlayer.currentTime
      }
    },
    set(val) {
      state.progressVal = val
    }
  }),
  volume: 100, // max 100
  isMute: false,
  volumeComponent: computed(() => {
    if (state.isMute) return IosVolumeOff
    if (state.volume < 25) return IosVolumeMute
    if (state.volume < 65) return IosVolumeLow
    return IosVolumeHigh
  }),
})

// 播放进度文字格式化
const processInfo = computed(() => {
  const curr = timeFormatter(Math.floor(state.currentTime))
  const dura = timeFormatter(Math.floor(globalPlayer.duration))
  return `${curr} / ${dura}`
})

// 控制音量大小
watch(() => state.volume, (val) => {
  audio.value.volume = val / 100
})
watch(() => state.isMute, (val) => {
  if (val === true) {
    audio.value.volume = 0
  } else {
    audio.value.volume = state.volume / 100
  }
})

watch(() => globalPlayer.currPlaySong, (song) => {
  if (!song) {
  } else if (song.url) {
    state.isLoading = false
    nextTick(() => {
      play()
    })
  } else {
    state.isLoading = true
  }
}, { immediate: true, deep: true })

function dragHandler(val) {
  state.progressVal = val
}
function dragHandlerStart() {
  state.isProgressDrag = true
}
function dragHandlerEnd() {
  globalPlayer.currentTime = state.progressVal
  audio.value.currentTime = state.progressVal
  state.isProgressDrag = false
}
function play() {
  if (globalPlayer.currPlaySong?.url) {
    globalPlayer.isPlay = true;
    audio.value?.play()
  }
}
function pause() {
  globalPlayer.isPlay = false;
  audio.value?.pause()
}
/**
 * 获取音乐时长
 */
const getDuration = () => {
  // 此时可以拿到音频时长（audio.value.duration）;
  console.log('此时可以拿到音频时长（' + audio.value.duration + '）')
  globalPlayer.duration = audio.value.duration;
}
/**
 * 更新当前时间
 * 如果当前音频进度 = 总时长，则自动播放下一首
 */
const timeupdate = (e) => {
  globalPlayer.currentTime = e.target.currentTime;
  // if (e.target.currentTime === player.endTime) {
  //   nextPlay();
  // }
};

const timeFormatter = (value) => {
  if (value === 0) return '00:00'
  const minute = Math.floor(value / 60)
  const second = Math.floor(value % 60)
  return `${minute}:${second < 10 ? '0' + second : second}`
}
// 切换播放列表显隐
function togglePlaylist() {
  state.showPlaylist = !state.showPlaylist
}

</script>

<style lang="scss" scoped>
.play-bar {
  transition: bottom 0.5s ease-out;
  box-shadow: 0 0 10px rgba($color: #000000, $alpha: 0.1);
}

.hidden-playbar {
  bottom: -80px
}

.player-list {
  height: 200px;
  width: 220px;
  max-height: 320px;
  max-width: 280px;
  overflow: hidden;
}
</style>