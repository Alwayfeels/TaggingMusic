<template>
  <div class="play-bar w-full h-20 fixed z-10 bottom-0" :class="{ 'hidden-playbar': !globalPlayer.isPlayerShow }">
    <div class="w-full h-full px-10 flex items-center justify-center">
      <img v-if="globalPlayer.currPlaySong?.al?.picUrl" :src="`${globalPlayer.currPlaySong?.al?.picUrl}?param=64y64`"
        class="w-16 h-16" alt="">
      <div class="ml-4 flex items-center">
        <n-icon size="24" class="cursor-not-allowed" :component="Previous24Filled" @click="play" />
        <n-spin :show="globalPlayer.loading">
          <n-icon class="cursor-pointer" v-if="globalPlayer.isPlay" size="48" :component="Pause48Filled" @click="pause" />
          <n-icon class="cursor-pointer" v-else size="48" :component="Play48Filled" @click="play" />
        </n-spin>
        <n-icon size="24" class="cursor-not-allowed" :component="Next24Filled" />
      </div>
      <div class="ml-4 flex flex-col">
        <div class="text-lg">{{ globalPlayer.currPlaySong?.name }}</div>
        <div>{{ globalPlayer.currPlaySong?.ar?.map(e => e.name)?.join(' / ') }}</div>
      </div>
      <div class="w-96 ml-6 pt-1 flex flex-col">
        <n-slider v-model:value="globalPlayer.currentTime" :max="globalPlayer.duration" :format-tooltip="timeFormatter"
          :step="1" disabled />
        <div class="mt-2 flex justify-between">
          <span>320kbps</span>
          <span>{{processInfo}}</span>
        </div>
      </div>
    </div>
    <audio ref="audio" :src="globalPlayer.currPlaySong?.url" @canplay="getDuration" @pause="pause" @timeupdate="timeupdate" @play="play"
      style="display: none"></audio>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue'
import { Next24Filled, Previous24Filled, Play48Filled, Pause48Filled } from '@vicons/fluent'
import { usePlayerStore } from '@/store/player';

const globalPlayer = usePlayerStore()
const audio = ref(null)

const state = reactive({
  musicId: 1900054586,
  playlist: [],
  songData: null,
  playOption: {
    duration: 213440, // 歌曲总时长，毫秒
    songName: 'Song Name',
    artist: ['aaa', 'bbb'],
    src: '',
    title: '',
    coverRotate: true
  }
})
const processInfo = computed(() => {
  const curr = timeFormatter(Math.floor(globalPlayer.currentTime))
  const dura = timeFormatter(Math.floor(globalPlayer.duration))
  return `${curr} / ${dura}`
})

watch(() => globalPlayer.currPlaySong, (val) => {
  play()
}, { immediate: true })
onMounted(async () => {
  // const res = await api.getRemote('/song/url', { id: state.musicId, br: 320000 })
  // let songData = res.data[0]
  // state.songData = songData
  // player.src = songData.url
  // 初始化音乐播放器
  // const audio = new Audio()
  // audio.src = 'http://www.ytmp3.cn/down/56467.mp3'
  // audio.play()
  // audio.pause()
  // audio.currentTime = 0
  // audio.volume = 0.5
  // audio.loop = true
  // audio.play()
})
/**
 * 播放音乐
 */
// watch(() => globalPlayer.isPlay, (val) => {
//   if (val) {
//     audio.value.play()
//   } else {
//     audio.value.pause()
//   }
// })

function play() {
  globalPlayer.isPlay = true;
  audio.value?.play()
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

</script>

<style lang="scss" scoped>
.play-bar {
  transition: bottom 0.5s ease-out;
  box-shadow: 0 0 10px rgba($color: #000000, $alpha: 0.1);
}

.hidden-playbar {
  bottom: -80px
}
</style>