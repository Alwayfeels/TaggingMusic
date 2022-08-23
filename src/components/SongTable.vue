<template>
  <n-data-table ref="tableRef" class="songTable" :loading="loading" :columns="songTableColumns" :data="(tableData as any[])"
    :pagination="pagination" :bordered="false" :flex-height="true" :row-props="tConfig.rowProps"
    :row-class-name="rowClassName" pagination-behavior-on-filter="first" :paginate-single-page="false" />
</template>

<script setup lang="ts">
import { NDataTable, NAvatar, NTag } from "naive-ui";
import { h, ref, reactive, watch, nextTick } from "vue";
import { useGlobalState } from '@/store/globalState';
import { useGlobalData } from '@/store/globalData';
import type { Song } from '@/store/types';
import type { DataTableColumns } from 'naive-ui'
import TagInputGroup from '@/components/TagInputGroup.vue'

const globalState = useGlobalState()
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
  rowProps: (row: any) => {
    return {
      onClick: () => {
        globalState.setActiveSong({ id: row.id })
      }
    };
  }
})

// 页码根据 index 自动跳转到目标位置, scroll 到目标位置
const tableRef = ref()
watch(() => globalState.activeSongIdx, (index) => {
  if (index >= 0) {
    const pageNum: number = Math.ceil(index / pagination.pageSize)
    const rowHeight = 68;
    let scrollY: number = (index % pagination.pageSize) * rowHeight;
    if (scrollY > 3 * rowHeight) {
      scrollY = scrollY - 3 * rowHeight;
    }
    pagination.page = pageNum
    nextTick(() => {
      tableRef?.value.scrollTo({ top: scrollY })
    })
  }
})

/** 
 * @desc 分页器
 */
const pagination = reactive({
  page: 1,
  pageSize: 30,
  showSizePicker: true,
  pageSizes: [10, 30, 50],
  onChange: (page: number) => {
    pagination.page = page;
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.page = 1;
  }
});

function resetPager(): void {
  pagination.page = 1;
}

function rowClassName(row: any): string {
  let className = ''
  if (row?.id === globalState.songlist.active?.id) {
    className += 'playing-song'
    if (globalState.player.isPlaying) {
      className += ' song-playing';
    }
  }
  return className;
}

const songTableColumns: DataTableColumns = [
  {
    title: "歌曲名称",
    key: "name",
    minWidth: 200,
    width: 300,
    render(row: Song) {
      const needFee = row.fee == 1
      const node: any[] = [
        row.name
      ]
      if (needFee) {
        node.push(
          h(NTag, { type: 'warning', size: 'small', class: 'ml-2 mini-tag' }, () => 'VIP')
        )
      }
      return h('div', {}, node)
    }
  },
  {
    title: "封面",
    key: "al.picUrl",
    width: '80px',
    render(row: Song) {
      const songImgUrl = `${row.al.picUrl}?param=40y40`
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
    key: "id",
    minWidth: 100,
    render(row: Song) {
      return row.ar.map((artist: any) => artist.name).join(' / ')
    }
  },
  {
    title: "专辑",
    key: "al.id",
    minWidth: 100,
    render(row: Song) {
      return h('div', {}, row.al.name)
    }
  },
  {
    title: 'Tag',
    key: 'id',
    minWidth: 500,
    width: 700,
    render(row: Song) {
      return h(TagInputGroup, {
        songId: row.id,
        song: row
      })
    }
  }
]

</script>

<style lang="scss" scoped>
// 加宽 tag-input 组件的点击触发范围
.songTable {
  height: 100%;

  :deep(.playing-song) {
    background: linear-gradient(-45deg, #FCA5A5, #FCD34D, #6EE7B7, #93C5FD, #C4B5FD);
    background-size: 500% 500%;
    -webkit-animation: Gradient 15s linear infinite;
    -moz-animation: Gradient 15s linear infinite;
    animation: Gradient 15s linear infinite;
    animation-play-state: paused;
  }

  :deep(.song-playing) {
    animation-play-state: running;
  }

  // 消除默认白底样式
  :deep(.playing-song td) {
    background-color: transparent;
    background: transparent;
  }

  :deep(.playing-song:hover .n-data-table-td) {
    background-color: transparent;
    background: transparent;
  }
}

:deep(.n-data-table-tr .n-data-table-td) {
  cursor: url(@/assets/Play.svg) 8 8, pointer;
}

:deep(.n-data-table-tr .n-data-table-td:last-child) {
  padding: 0;
  cursor: pointer;
}

:deep(.n-data-table-tr .n-data-table-td:last-child .n-dynamic-tags) {
  padding: 18px;
}

:deep(.n-data-table__pagination) {
  padding-right: 80px;
}

@-webkit-keyframes Gradient {
  0% {
    background-position: 0% 50%
  }

  50% {
    background-position: 100% 50%
  }

  100% {
    background-position: 0% 50%
  }
}

@-moz-keyframes Gradient {
  0% {
    background-position: 0% 0%
  }

  50% {
    background-position: 0% 100%
  }

  100% {
    background-position: 0% 40%
  }
}

@keyframes Gradient {
  0% {
    background-position: 0% 50%
  }

  50% {
    background-position: 100% 50%
  }

  100% {
    background-position: 0% 50%
  }
}
</style>