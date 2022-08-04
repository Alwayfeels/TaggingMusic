<template>
  <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="{ width: '800px' }" title="删除歌单"
    :on-update:show="showChangeHandler">
    <div class="mb-4 text-red-400">删除操作无法撤回，请谨慎操作</div>
    <NDataTable class="delete-table" ref="deleteTableRef" :bordered="false" :flex-height="true"
      :columns="deleteTableColumns" :data="globalData.playlist" />
    <div class="mt-12 flex items-center justify-end">
      <n-button class="ml-2" type="primary" strong @click="onClose">关闭</n-button>
    </div>
  </n-modal>
</template>

<script setup>
import { computed, reactive, ref, watch, h } from 'vue'
import TagInput from "@/components/TagInput.vue";
import { NTag, NModal, NInput, NSelect, NButton, NPopconfirm, NDataTable, useNotification } from 'naive-ui';
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
    default: true
  }
})
const emits = defineEmits(['update:showDialog'])

const deleteTableColumns = [
  { title: '歌单名称', key: 'name', minWidth: 200, },
  { title: '歌曲数量', key: 'trackCount', width: 150, },
  {
    title: '操作', key: 'operation',
    width: 120,
    render(row) {
      return h(
        NPopconfirm,
        {
          positiveText: '删除',
          negativeText: '取消',
          onPositiveClick: async () => {
            let res = await globalData.deletePlaylist(row.id)
            if (res) {0
              notification.success({
                title: '远端删除成功',
                content: '你还有最后的机会使用本地缓存进行备份',
                duration: 5000
              })
            }
          },
        },
        {
          default: () => '删除后无法恢复，确定删除歌单？',
          trigger: () => h(NButton, {
            type: 'error'
          }, () => '删除')
        }
      )
    }
  },
]

function onClose() {
  emits('update:showDialog', false)
}

function showChangeHandler(show) {
  emits('update:showDialog', show)
}

</script>

<style lang="scss" scoped>
.delete-table {
  height: 500px;
}

:deep(.table-body) {
  max-height: 500px;
  overflow-y: auto;
}
</style>
