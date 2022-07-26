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
const form = reactive({
  playlist: '',
  newPlaylistName: ''
})
const state = reactive({
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
  }
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
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      const res = mergePlaylist()
      if (res) {
        notification.success({
          message: '合并成功'
        })
      }
    }
  })
}
function onClose() {
  emits('update:showDialog', false)
}

// 合并歌单
function mergePlaylist() {
  const playlist = form.playlist
  const newPlaylistName = form.newPlaylistName
  const playlistIds = playlist.filter(e => e !== 'all')
  // 请求所有歌单的歌曲
  const songs = []
  playlistIds.map(async e => {
    globalData.getRemoteSonglist
    return res.data.playlist.tracks.map(e => e.id)
  })
}

</script>

<style lang="scss" scoped>
</style>