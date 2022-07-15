<template>
  <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="{ width: '800px' }" title="合并歌单"
    :segmented="state.segmented" :on-update:show="showChangeHandler">
    <div class="mb-4 flex items-center">
      选择歌单，并将其中所有的歌曲合并后生成新的歌单
      <div class="ml-2 w-48">
        <n-select size="small" multiple v-model:value="state.playlist" :options="state.playlistOptions" />
      </div>
    </div>
    <div class="mt-12 flex items-center justify-center">
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
  playlist: []
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