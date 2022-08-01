<template>
  <n-data-table class="songTable" :loading="loading" :columns="songTableColumns" :data="tableData"
    :pagination="pagination" :bordered="false" :flex-height="true" :row-props="tConfig.rowProps"
    pagination-behavior-on-filter="first" :paginate-single-page="false" />
</template>

<script setup>
import { NDataTable, NButton } from "naive-ui";
import { h, ref, getCurrentInstance, reactive, defineExpose } from "vue";
import { useGlobalPlayer } from '@/store/globalPlayer';
import { useGlobalData } from '@/store/globalData';

import { NAvatar, NTag } from 'naive-ui'
import TagInput from '@/components/TagInput.vue'

const globalPlayer = useGlobalPlayer()
const globalData = useGlobalData()
defineExpose({ resetPager })

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
        globalPlayer.playSong(row)
        globalPlayer.isPlayerShow = true;
      }
    };
  }
})

const pagination = reactive({
  page: 1,
  pageSize: 30,
  showSizePicker: true,
  pageSizes: [10, 30, 50],
  onChange: (page) => {
    pagination.page = page;
  },
  onUpdatePageSize: (pageSize) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }
});

function resetPager() {
  pagination.page = 1;
}

const tableInstance = getCurrentInstance();
const songTableColumns = [
  {
    title: "歌曲名称",
    key: "name",
    minWidth: 200,
    width: 300,
  },
  {
    title: "封面",
    key: "al.picUrl",
    width: '80px',
    render(row) {
      let songImgUrl = `${row.al.picUrl}?param=40y40`
      return h(
        NAvatar,
        {
          src: songImgUrl,
          class: 'img40',
        }
      )
    }
  },
  {
    title: "歌手",
    minWidth: 100,
    render(row) {
      return row.ar.map(artist => artist.name).join(' / ')
    }
  },
  {
    title: "专辑",
    minWidth: 100,
    render(row) {
      return h('div', {}, row.al.name)
    }
  },
  {
    title: 'Tag',
    minWidth: 500,
    width: 700,
    render(row, index) {
      return h(TagInput, {
        songId: row.id,
        songInfo: {
          name: row.name,
          artist: row.ar.map(artist => artist.name).join(' / '),
          album: row.al.name
        }
      })
    }
  }
]

</script>

<style lang="scss" scoped>
// 加宽 tag-input 组件的点击触发范围
.songTable {
  height: 100%;
}

:deep(.n-data-table-tr .n-data-table-td) {
  cursor: url(@/assets/Play.svg) 8 8, pointer;
}

:deep(.n-data-table-tr .n-data-table-td:last-child) {
  padding: 0;
  cursor: pointer;
}

:deep(.n-data-table-tr .n-data-table-td:last-child .n-dynamic-tags) {
  padding: 12px;
}
</style>