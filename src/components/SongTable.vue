<template>
  <n-spin :show="loading">
    <n-data-table class="commonTable" :columns="songTableColumns" :data="tableData" :pagination="pagination"
      :bordered="false" />
  </n-spin>
</template>

<script setup>
import { NDataTable, NButton } from "naive-ui";
import { h, ref, getCurrentInstance, reactive } from "vue";
import { getSongTableColumns } from "@/data/tableColumns";

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

const pagination = reactive({
  page: 1,
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100, 500],
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
:deep(.n-data-table-tr .n-data-table-td) {
  cursor: url(@/assets/Play.png) 0 0, pointer;
}
:deep(.n-data-table-tr .n-data-table-td:last-child) {
  padding: 0;
  cursor: pointer;
}
:deep(.n-data-table-tr .n-data-table-td:last-child .n-dynamic-tags) {
  padding: 12px;
}
</style>