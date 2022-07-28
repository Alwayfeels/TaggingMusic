<template>
  <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="{ width: '800px' }" title="合并歌单"
    :segmented="state.segmented" :on-update:show="showChangeHandler">
    <div class="mb-4">选择指定歌单，将其中所有的歌曲合并后生成新的歌单</div>
    <n-form ref="formRef" :model="form" :rules="state.rules">
      <n-form-item path="playlist" label="被合并歌单：">
        <n-select size="small" multiple filterable max-tag-count="responsive" v-model:value="form.playlist"
          :options="state.playlistOptions" />
      </n-form-item>
      <n-form-item path="newPlaylistName" label="被合并歌单：">
        <n-input size="small" v-model:value="form.newPlaylistName" type="text" />
      </n-form-item>
    </n-form>
    <Progress ref="progressRef" />
    <div class="mt-12 flex items-center justify-end">
      <n-button strong type="success" @click="onSubmit">确认</n-button>
      <n-button class="ml-2" strong @click="onClose">关闭</n-button>
    </div>
  </n-modal>
</template>

<script setup>
import { computed, reactive, ref, watch, h } from 'vue'
import TagInput from "@/components/TagInput.vue";
import { NDataTable, NTag, NModal, NInput, NSelect, NButton, NPopover, useNotification } from 'naive-ui';
import localforage from 'localforage';
import api from '@/api/http'
import { useGlobalData } from '@/store/globalData';
import Progress from '@/components/Progress.vue';

// 全局数据中心
const globalData = useGlobalData()
const notification = useNotification()

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:showDialog'])

const formRef = ref(null);
const progressRef = ref(null);

const form = reactive({
  playlist: [],
  newPlaylistName: ''
})
const state = reactive({
  showProgress: false,
  playlistOptions: computed(() => {
    const options = globalData.playlist.map(e => ({
      label: e.name,
      value: e.id,
      disabled: state.playlist?.includes('all')
    }))
    options.unshift({
      label: '全部歌单',
      value: 'all'
    })
    return options
  }),
  rules: {
    playlist: [
      { required: true, message: '请选择歌单' }
    ],
    newPlaylistName: [
      { required: true, message: '请输入歌单名称' }
    ]
  },
  playlist_Map: computed(() => {
    const map = {}
    globalData.playlist.forEach(e => {
      map[e.id] = e
    })
    return map
  }),
})
watch(() => form.playlist, (next, prev) => {
  if (next.includes('all') && !prev.includes('all')) {
    form.playlist = state.playlistOptions.map(e => e.value)
  }
  if (prev.includes('all') && !next.includes('all')) {
    form.playlist = []
  }
})

watch(() => props.showDialog, async (val) => {
  if (val) {
  }
})

function onSubmit() {
  mergePlaylist()
  // formRef.value?.validate(async (errors) => {
  //   if (!errors) {
  //     mergePlaylist()
  //     // const res = mergePlaylist()
  //     // if (res) {
  //     //   notification.success({
  //     //     message: '合并成功'
  //     //   })
  //     // }
  //   }
  // })
}
function onClose() {
  emits('update:showDialog', false)
}

const mockPromise = (time, res) => {
  console.log('请求发送，time=', time)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res)
    }, time)
  })
}
async function mergePlaylist() {
  const playlistIds = form.playlist.filter(e => e !== 'all')
  const progressTask = playlistIds.map(id => ({
    name: `歌单 ${state.playlist_Map[id].name} 加载完成`,
    percentage: Math.round((70 / playlistIds.length * 10).toFixed(1)) / 10
  }))
  progressTask.push({ name: '正在新建歌单', percentage: 1 })
  progressTask.push({ name: '新歌单创建完成', percentage: 29 })
  progressRef.value?.setProgressTask(progressTask)
  console.log('progressTask', progressTask)
  state.showProgress = true
  // =======
  // const requests = playlistIds.map(async id => {
  //   const name = `歌单 ${state.playlist_Map[id].name} 加载完成`
  //   return mockPromise(100, name).then(res => {
  //     console.log('mockPromis =>', res)
  //     progressRef.value?.setProgressDone(name)
  //   })
  // })
  // =======
  for(let i = 0; i < playlistIds.length; i++) {
    const id = playlistIds[i]
    const name = `歌单 ${state.playlist_Map[id].name} 加载完成`
    const resName = await mockPromise(200, name)
    progressRef.value?.setProgressDone(resName)
  }
  // console.log('requests>>>>>', requests)
  // const res = await Promise.all(requests)
  // console.log('All请求完成，res=', res)
  progressRef.value?.setProgressDone('正在新建歌单')
  await mockPromise(1000)
  progressRef.value?.setProgressDone('新歌单创建完成')
  await mockPromise(1000)
}

// 合并歌单
async function mergePlaylist1() {
  const playlist = form.playlist
  const newPlaylistName = form.newPlaylistName
  const playlistIds = playlist.filter(e => e !== 'all')
  // 设置进度条task
  const progressTask = playlistIds.map(id => ({
    name: `歌单 ${state.playlist_Map[id].name} 加载完成`,
    percentage: Math.floor(70 / playlistIds.length)
  }))
  progressTask.push({ name: '新歌单创建完成', percentage: 30 })
  progressRef.value?.setProgressTask(progressTask)
  state.showProgress = true
  // 请求所有歌单的歌曲
  const songs = []
  playlistIds.forEach(async (id) => {
    let name = `歌单 ${state.playlist_Map[id].name} 加载完成`
    globalData.getRemoteSonglist(id).then(res => {
      progressRef.value.setProgressDone(name)
      songs.push(...res.songs?.map(e => e.id))
    })
    // 根据 res 状态设置进度
    if (res) {
      progressRef.value.setProgressDone(name)
      songs.push(...res.songs?.map(e => e.id))
    } else {
      progressRef.value.setProgressError(name)
    }
  })
  songs = Array.from(new Set(songs));
  const createRes = await globalData.createPlaylist(newPlaylistName, songs);
  progressRef.value?.setProgressDone('新歌单创建完成')
}

// 请求所有歌单的歌曲，并设置进度条
async function getAllPlaylist(playlistIds) {
  const songs = [] // merge歌单的歌曲Id集合
  playlistIds.forEach(async (id) => {
    let name = `歌单 ${state.playlist_Map[id].name} 加载完成`
    const res = await globalData.getRemoteSonglist(id);
    // 根据 res 状态设置进度
    if (res) {
      progressRef.value.setProgressDone(name)
      songs.push(...res.songs?.map(e => e.id))
    } else {
      progressRef.value.setProgressError(name)
    }
  })
  return songs
}

function showChangeHandler(show) {
  emits('update:showDialog', show)
}

</script>

<style lang="scss" scoped>
</style>