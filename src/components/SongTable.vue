<template>
  <n-data-table class="songTable" :loading="loading" :columns="songTableColumns" :data="tableData"
    :pagination="pagination" :bordered="false" :flex-height="true" :row-props="tConfig.rowProps"
    pagination-behavior-on-filter="first" :paginate-single-page="false" />
</template>

<script setup>
import { NDataTable, NButton } from "naive-ui";
import { h, ref, getCurrentInstance, reactive } from "vue";
import { getSongTableColumns } from "@/data/tableColumns";
import { usePlayerStore } from '@/store/player';

const globalPlayer = usePlayerStore()

const props = defineProps({
  tableData: {
    type: Array,
    default: () => {
      return [];
    }
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const tConfig = reactive({
  // 点击行后播放音乐
  rowProps: (row) => {
    return {
      onClick: () => {
        globalPlayer.insertSong(row)
        globalPlayer.isPlayerShow = true;
      }
    };
  }
})

const pagination = reactive({
  page: 1,
  pageSize: 30,
  showSizePicker: true,
  pageSizes: [10, 30, 50, 100, 500],
  onChange: (page) => {
    pagination.page = page;
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }
});

const tableInstance = getCurrentInstance();
const songTableColumns = ref(getSongTableColumns(tableInstance, () => props.tableData));

</script>

<style lang="scss" scoped>
// 加宽 tag-input 组件的点击触发范围
.songTable {
  height: 100%;
}

:deep(.n-data-table-tr .n-data-table-td) {
  cursor: url(@/assets/Play.png) 16 16, pointer;
}

:deep(.n-data-table-tr .n-data-table-td:last-child) {
  padding: 0;
  cursor: pointer;
}

:deep(.n-data-table-tr .n-data-table-td:last-child .n-dynamic-tags) {
  padding: 12px;
}
</style>