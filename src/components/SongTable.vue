<template>
  <n-data-table ref="tableRef" class="songTable" :loading="loading" :columns="songTableColumns" :data="tableData"
    :pagination="pagination" :bordered="false" :flex-height="true" :row-props="tConfig.rowProps"
    :row-class-name="rowClassName" pagination-behavior-on-filter="first" :paginate-single-page="false" />
</template>

<script setup>
import { NDataTable, NButton } from "naive-ui";
import { h, ref, getCurrentInstance, reactive, defineExpose, watch, nextTick } from "vue";
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
        let index = globalPlayer.playerList.findIndex(item => item.id === row.id)
        globalPlayer.setPlayIndex(index)
        globalPlayer.play()
      }
    };
  }
})

const tableRef = ref(null)
watch(() => globalPlayer.currPlayIndex, (index) => {
  // 页码根据 index 自动跳转到目标位置, scroll 到目标位置
  if (index >= 0) {
    let pageNum = Math.ceil(index / pagination.pageSize)
    const rowHeight = 68;
    let scrollPixel = (index % pagination.pageSize) * rowHeight;
    if (scrollPixel > 3 * rowHeight) {
      scrollPixel = scrollPixel - 3 * rowHeight;
    }
    pagination.page = pageNum
    nextTick(() => {
      tableRef.value.scrollTo({ top: scrollPixel })
    })
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

function rowClassName(row) {
  let className = '';
  if (row?.id === globalPlayer.currPlaySong?.id) {
    // className += 'bg-gradient-to-r from-green-200 to-blue-300 playing-song';
    className += 'playing-song'
    if (globalPlayer.isPlaying) {
      className += ' song-playing';
    }
  }
  return className;
}

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