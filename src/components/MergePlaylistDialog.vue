<template>
  <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="{ width: '800px' }" title="合并歌单"
    :segmented="state.segmented" :on-update:show="showChangeHandler">
    <div class="mb-4 items-center">
      选择指定歌单，将其中所有的歌曲合并后生成新的歌单
      <div class="flex ml-2 mt-6 w-full items-center">
        <div class="w-24">被合并歌单：</div>
        <n-select size="small" multiple max-tag-count="responsive" v-model:value="state.playlist" :options="state.playlistOptions" />
      </div>
      <div class="flex ml-2 mt-2 w-full items-center">
        <div class="w-24">新歌单名称：</div>
        <n-input size="small" v-model:value="state.newPlaylistName" type="text" />
      </div>
    </div>
    <div class="mt-12 flex items-center justify-end">
      <n-button strong type="success" @click="generate">确认</n-button>
      <n-button class="ml-2" strong @click="closeDialog">关闭</n-button>
    </div>
  </n-modal>
</template>

<script setup>
import { computed, reactive, ref, watch, h } from 'vue'
import TagInput from "@/components/TagInput.vue";
import { NDataTable, NTag, NModal, NInput, NSelect, NButton, NPopover } from 'naive-ui';
import localforage from 'localforage';
import api from '@/api/http'
import { useGlobalData } from '@/store/globalData';
// 全局数据中心
const globalData = useGlobalData()

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  }
})
const emits = defineEmits(['update:showDialog'])

const state = reactive({
  playlistOptions: globalData.playlist.map(e => ({
    label: e.name,
    value: e.id
  })),
  playlist: [],
  newPlaylistName: ''
})

watch(() => props.showDialog, async (val) => {
  if (val) {
  }
})

function generate() {

}
function closeDialog() {
  emits('update:showDialog', false)
}
</script>

<style lang="scss" scoped>
</style>