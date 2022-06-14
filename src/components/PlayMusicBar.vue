<template>
  <div class="play-bar w-full h-20 fixed z-10 bottom-0" :class="{ 'hidden-playbar': !globalPlayer.isPlayerShow }">
    <div class="w-full h-full px-10 flex items-center justify-center">
      <img v-if="globalPlayer.currPlaySong?.al?.picUrl" :src="`${globalPlayer.currPlaySong?.al?.picUrl}?param=64y64`"
        class="w-16 h-16" alt="">
      <div class="ml-4 flex items-center">
        <n-icon size="24" :component="Previous24Filled" @click="play" />
        <n-spin :show="globalPlayer.loading">
          <n-icon v-if="globalPlayer.isPlay" size="48" :component="Pause48Filled" @click="pause" />
          <n-icon v-else size="48" :component="Play48Filled" @click="play" />
        </n-spin>
        <n-icon size="24" :component="Next24Filled" />
      </div>
      <div class="ml-4 flex flex-col">
        <div class="text-lg">{{ globalPlayer.currPlaySong?.name }}</div>
        <div>{{ globalPlayer.currPlaySong?.ar?.map(e => e.name)?.join(' / ') }}</div>
      </div>
      <div class="w-96 ml-4">
        <n-slider v-model:value="state.playerSlider" :max="state.playerSliderMax" :format-tooltip="timeFormatter"
          :step="1" />
      </div>
    </div>
    <audio ref="audio" :src="player.url" @canplay="getDuration" @pause="pause" @timeupdate="timeupdate" @play="play"
      style="display: none"></audio>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Next24Filled, Previous24Filled, Play48Filled, Pause48Filled } from '@vicons/fluent'
import api from '@/api/http'
import { usePlayerStore } from '@/store/player';

const globalPlayer = usePlayerStore()
const audio = ref(null)

const player = reactive({
  url: ''
})
const state = reactive({
  musicId: 1900054586,
  playlist: [],
  songData: null,
  playerSlider: computed(() => globalPlayer.currentTime),
  playerSliderMax: computed(() => {
    if (!globalPlayer.duration || typeof globalPlayer.duration !== 'number') return 0
    return Number((globalPlayer.duration / 1000).toFixed(0))
  }),
  playOption: {
    duration: 213440, // 歌曲总时长，毫秒
    songName: 'Song Name',
    artist: ['aaa', 'bbb'],
    src: '',
    title: '',
    coverRotate: true
  }
})
onMounted(async () => {
  // const res = await api.getSync('/song/url', { id: state.musicId, br: 320000 })
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
watch(() => globalPlayer.isPlay, (val) => {
  if (val) {
    audio.value.play()
  } else {
    audio.value.pause()
  }
})

globalPlayer.$onAction(async ({ name, globalPlayer, args, after, onError }) => {
  if (name === 'setCurrentSong') {
    let songId = args[0].id
    const res = await api.getSync('/song/url', { id: songId, br: 320000 })
    let songUrl = res.data[0].url
    player.url = songUrl
  }
})

function play() {
  globalPlayer.isPlay = true;
  audio.value.play()
}
function pause() {
  globalPlayer.isPlay = false;
  audio.value.pause()
}
// function audioPlay() {
//   player.isPlay = true;
//   audio.value.play();
// };
// // 暂停音乐
// function audioPause() {
//   player.isPlay = false;
//   audio.value.pause();
// };
/**
 * 控制播放按钮
 * 通过paused属性，判断当前音频播放状态
 */
// function controlPlay() {
//   if (!audio.value.paused) {
//     audio.value.pause(); // 停止播放
//   } else {
//     audio.value.play(); // 开始播放
//   }
// };
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
  const second = value % 60
  return `${minute < 10 ? '0' + minute : minute}:${second < 10 ? '0' + second : second}`
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