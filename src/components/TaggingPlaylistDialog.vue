<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="为所有歌曲操作 Tag"
        size="huge" :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
          <div class="mb-4 flex items-center">
              <span class="w-48"> 为该歌单的所有歌曲 tag：</span>
          </div>
          <TagInput v-model:value="state.inputTag" :inputOnly="true"></TagInput>
          <div class="mt-12 flex items-center justify-end">
              <NPopover placement="top" trigger="manual" :show="state.showTips">
                  <template #trigger>
                      <n-button class="ml-2" strong type="success" @click="submit">生成</n-button>
                  </template>
                  <span>{{ state.tips }}</span>
              </NPopover>
              <n-button class="ml-2" strong type="error" @click="closeDialog">取消</n-button>
          </div>
    </n-modal>
</template>

<script setup>
import { computed, reactive, watch, h } from 'vue'
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
    },
    playlist: {
        type: Object,
        default: null
    },
})
const emits = defineEmits(['update:showDialog'])

const state = reactive({
    inputTag: [],
    // ==============
    tips: '',
    showTips: false,
    bodyStyle: {
        width: '800px'
    },
    segmented: {
        content: 'soft',
        footer: 'soft'
    },
})

// methods
function submit() {
    if (state.isCreatePlaylist) {
        generateSonglist() // 生成新的歌单
    } else {
        insertSonglist() // 插入原有的歌单
    }
}
function closeDialog() {
    clearState();
    emits('update:showDialog', false)
}
function showChangeHandler(show) {
    if (!show) clearState();
    emits('update:showDialog', show)
}
</script>

<style lang="scss" scoped>
</style>