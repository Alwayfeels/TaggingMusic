<template>
  <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="{ width: '800px' }" title="合并歌单"
    :segmented="state.segmented" :on-update:show="showChangeHandler">
    <div class="mb-4">选择指定歌单，将其中所有的歌曲合并后生成新的歌单</div>
    <n-form ref="formRef" :model="form" :rules="state.rules">
      <n-form-item path="playlist" label="被合并歌单：">
        <n-select size="small" multiple filterable max-tag-count="responsive" v-model:value="form.playlist"
          :options="state.playlistOptions" :on-update:value="selectChange" />
      </n-form-item>
      <n-form-item path="newPlaylistName" label="新歌单名称：">
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
  isSelectAll: computed(() => {
    form.playlist?.includes('all')
  }),
  playlistOptions: computed(() => {
    const options = globalData.playlist.map(e => ({
      label: e.name,
      value: e.id,
      disabled: state.isSelectAll
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
// watch(() => form.playlist, (next, prev) => {
//   let isNextSelectAll = next.includes('all');
//   let isPrevSelectAll = prev.includes('all');
//   let userSelectAll = isNextSelectAll && !isPrevSelectAll;
//   let userRemoveAll = !isNextSelectAll && isPrevSelectAll;
//   if (userSelectAll) {
//     form.playlist = state.playlistOptions.map(e => e.value)
//   } else if (userRemoveAll) {
//     form.playlist = []
//   } else if (next.length === state.playlistOptions.length - 1) {
//     form.playlist = ['all']
//   } else if (prev.length === state.playlistOptions.length) {
//     let allIndex = next.indexOf('all');
//     if (allIndex > -1) {
//       next.splice(allIndex, 1)
//     }
//   }
// })

function selectChange(val, options) {
  let isCurrExistAll = val.includes('all');
  let isPrevExistAll = form.playlist.includes('all');
  let userSelectAll = isCurrExistAll && !isPrevExistAll;
  let userRemoveAll = !isCurrExistAll && isPrevExistAll;
  if (userSelectAll) {
    val = state.playlistOptions.map(e => e.value)
  } else if (userRemoveAll) {
    val = []
  } else if (isCurrExistAll && val.length !== state.playlistOptions.length) {
    let allIndex = val.indexOf('all');
    if (allIndex > -1) {
      val.splice(allIndex, 1)
    }
  } else if (!isCurrExistAll && val.length === state.playlistOptions.length - 1) {
    val.push('all')
  }
  form.playlist = val;
}

function onSubmit() {
  // TEST_mergePlaylist()
  // return false;
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      mergePlaylist()
      // const res = mergePlaylist()
      // if (res) {
      //   notification.success({
      //     message: '合并成功'
      //   })
      // }
    }
  })
}
function onClose() {
  emits('update:showDialog', false)
}

const mockPromise = (time, res) => {
  console.log('请求发送，time=', time)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res)
    }, Math.random() * time * 2)
  })
}
async function TEST_mergePlaylist() {
  const playlistIds = form.playlist.filter(e => e !== 'all')
  const progressTask = playlistIds.map(id => ({
    name: `${state.playlist_Map[id].name}`,
    percentage: Math.round((70 / playlistIds.length * 10).toFixed(1)) / 10
  }))
  progressTask.push({ name: '正在新建歌单', percentage: 1 })
  progressTask.push({ name: '新歌单创建完成', percentage: 29 })
  progressRef.value?.setProgressTask(progressTask)
  progressRef.value?.showProgress()
  console.log('progressTask', progressTask)
  let requests = []
  for (let i = 0; i < playlistIds.length; i++) {
    const id = playlistIds[i]
    const name = `${state.playlist_Map[id].name}`
    // const resName = await mockPromise(900, name)
    // progressRef.value?.setProgressDone(resName)
    requests.push(mockPromise(900, name).then(resName => {
      progressRef.value?.setProgressDone(resName)
      return Promise.resolve(resName)
    }))
  }
  console.log('requests', requests);
  debugger;
  Promise.all(requests).then(async res => {
    console.log('promise.all =>', res);
    progressRef.value?.setProgressDone('正在新建歌单')
    await mockPromise(1000)
    progressRef.value?.setProgressDone('新歌单创建完成')
    await mockPromise(1000)
  })
  // console.log('requests>>>>>', requests)
  // const res = await Promise.all(requests)
  // console.log('All请求完成，res=', res)
}

// 合并歌单
async function mergePlaylist() {
  const playlist = form.playlist
  const newPlaylistName = form.newPlaylistName
  const playlistIds = playlist.filter(e => e !== 'all')
  // 设置进度条task
  const progressTask = playlistIds.map(id => ({
    name: `${state.playlist_Map[id].name}`,
    percentage: Math.floor(70 / playlistIds.length)
  }))
  progressTask.push({ name: '构建歌单数据', percentage: 10 })
  progressTask.push({ name: '新歌单创建', percentage: 20 })
  progressRef.value?.setProgressTask(progressTask)
  progressRef.value?.showProgress()
  // 请求所有歌单的歌曲
  const requests = []
  playlistIds.forEach(async (id) => {
    let name = `${state.playlist_Map[id].name}`
    let req = globalData.getSonglist({ id }).then(res => {
      console.log('getSonglist', res)
      // 根据 res 状态设置进度
      if (res) {
        progressRef.value.setProgressDone(name)
        return Promise.resolve(res)
      } else {
        progressRef.value.setProgressError(name)
        return Promise.reject(res)
      }
    })
    requests.push(req);
  })
  Promise.all(requests).then(async resSongs => {
    // 所有歌曲ID
    progressRef.value.setProgressDone('构建歌单数据')
    let idSongs = resSongs.map(item => item.map(e => e.id)).flat()
    let songsSet = Array.from(new Set([...idSongs]));
    const createRes = await globalData.createPlaylist(newPlaylistName, songsSet);
    // const createRes = true
    if (createRes) {
      progressRef.value.setProgressDone('新歌单创建')
    } else {
      progressRef.value.setProgressError('新歌单创建')
    }
  })
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