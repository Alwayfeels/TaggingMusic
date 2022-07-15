<template>
  <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="为所有歌曲操作 Tag"
    size="huge" :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
    <div class="mb-4 flex items-center">
      <div class="flex items-center flex-row">
        将为
        <div class="text-green-700 mx-2 font-bold max-w-xs text-center text-ellipsis">{{ props.playlist?.name }}</div>
        歌单的所有歌曲的 tag 执行
      </div>
      <div class="w-20 mx-2">
        <n-select size="small" v-model:value="state.operation" :options="state.operationMap" />
      </div>
      <div class="ml-2">操作</div>
    </div>
    <div>
      <TagInput v-if="state.operation === 'add'" v-model:value="inputTag" :inputOnly="true"></TagInput>
      <n-select v-else filterable clearable :placeholder="'需要删除的tag'" v-model:value="deleteTag" multiple
        :options="state.tagOptions" />
    </div>
    <div class="mt-12 flex items-center justify-end">
      <NPopover placement="top" trigger="manual" :show="state.showTips">
        <template #trigger>
          <n-button class="ml-2" strong type="success" @click="submit">确认</n-button>
        </template>
        <span>{{ state.tips }}</span>
      </NPopover>
      <n-button class="ml-2" strong type="error" @click="closeDialog">取消</n-button>
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
  },
  playlist: {
    type: Object,
    default: null
  },
})
const emits = defineEmits(['update:showDialog'])

const inputTag = ref([]);
const deleteTag = ref([]);
const state = reactive({
  operation: 'remove',
  operationMap: [
    { label: '添加', value: 'add' },
    { label: '删除', value: 'remove' }
  ],
  tagOptions: [],
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

watch(() => props.showDialog, async (val) => {
  if (val) {
    state.tagOptions = globalData.tagList.map(item => {
      return {
        label: item.tagName,
        value: item.tagName
      }
    })
  }
})

// methods
async function submitAdd() {
  if (inputTag.value.length === 0) {
    state.tips = '请输入 tag'
    state.showTips = true
    setTimeout(() => {
      state.showTips = false
    }, 1000)
    return
  }
  const tags = inputTag.value;
  await globalData.batchAddTag([...tags]);
  window.$notification.success({
    title: "批量添加 tag 成功",
    duration: 3000
  })
  closeDialog();
}

async function submitDelete() {
  if (deleteTag.value.length === 0) {
    state.tips = '请选择 tag'
    state.showTips = true
    setTimeout(() => {
      state.showTips = false
    }, 1000)
    return
  }
  const tags = deleteTag.value;
  await globalData.batchRemoveTag([...tags]);
  window.$notification.success({
    title: "批量删除 tag 成功",
    duration: 3000
  })
  closeDialog();
}

function submit() {
  if (state.operation === 'add') {
    submitAdd();
  } else {
    submitDelete();
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
function clearState() {
  inputTag.value = [];
  state.tips = '';
  state.showTips = false;
}
</script>

<style lang="scss" scoped>
</style>