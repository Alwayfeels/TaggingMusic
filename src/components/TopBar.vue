<template>
  <div class="top-bar w-full h-20 flex items-center">
    <n-icon class="cursor-pointer mr-6" size="32" :component="LogoGithub" @click="toGithub" />
    <div class="text-2xl cursor-pointer" @click="toEntry">Tagging Music</div>
    <div class="ml-2 rounded-full bg-gray-400 text-white px-2 py-0.5">beta</div>
    <!-- 搜索 -->
    <div v-if="state.showControlBtn" class="mx-8 flex-1 flex justify-center">
      <n-input class="search-input" v-model:value="state.searchKey" round placeholder="搜索表格中的音乐 / 专辑 / 歌手"
        @keypress.enter="searchHandler" />
    </div>
    <div class="ml-auto flex items-center">
      <!--用户 -->
      <div v-if="globalData.user.profile" class="user-info flex items-center mr-4">
        <div class="user-name mr-4 flex items-center flex-col">
          <span>{{ globalData.user.profile.nickname }}</span>
          <div v-if="!state.isLogged" class="rounded-full text-white bg-gray-400 px-2 py-0.5 text-xs">离线</div>
        </div>
        <img class="user-avatar rounded" :src="`${globalData.user.profile.avatarUrl}?param=40y40`" alt="avatar">
      </div>
      <!--控制台 -->
      <n-button v-if="state.showControlBtn" secondary class="mr-2" size="large" strong type="info"
        @click="globalData.toggleRemoveTagOnBlur">{{ globalData.appConfig.removeTagOnBlur ? "取消输入时删除tab" : "取消输入时保留tab" }}
      </n-button>
      <NDropdown v-if="state.showControlBtn" trigger="hover" size="large" :options="jsonOptions"
        @select="jsonHandleSelect">
        <n-button size="large" secondary strong type="info">导入/导出 Tag</n-button>
      </NDropdown>
      <NDropdown v-if="state.showControlBtn" trigger="hover" size="large" :options="operatorOpitons"
        @select="onOperatorSelect">
        <n-button class="ml-2" size="large" strong type="info">歌单操作</n-button>
      </NDropdown>
      <n-button class="ml-2" size="large" strong type="error" @click="state.showLoginDialog = true">
        {{ state.isLogged ? '切换用户' : '登录' }}
      </n-button>
    </div>
    <QRLoginDialog v-model:showDialog="state.showLoginDialog" @refreshLoginStatus="refreshLoginStatus" />
    <TaggingSongDialog v-model:showDialog="state.showTaggingDialog" />
    <DeletePlaylistDialog v-model:showDialog="state.showDeleteDialog" />
  </div>
</template>

<script setup>
import { computed, onBeforeMount, onMounted, reactive, h } from 'vue';
import { NButton, NIcon, useNotification, NDropdown } from 'naive-ui';
import QRLoginDialog from '@/components/QRLoginDialog.vue';
import TaggingSongDialog from '@/components/TaggingSongDialog.vue';
import DeletePlaylistDialog from '@/components/DeletePlaylistDialog.vue';
import { useGlobalPlayer } from '@/store/globalPlayer';
import { useGlobalData } from '@/store/globalData';
import { useRouter, useRoute } from 'vue-router'
import { LogoGithub } from '@vicons/ionicons4'
import { FileUpload, FileDownload } from '@vicons/tabler'

// 全局数据中心
const globalData = useGlobalData()
const route = useRoute()
const router = useRouter()

const notification = useNotification()

// 组件状态
const state = reactive({
  searchKey: '',
  showControlBtn: computed(() => {
    return state.isMainPage && state.isLogged
  }),
  isMainPage: computed(() => {
    return route.path === '/main'
  }),
  showLoginDialog: false,
  showTaggingDialog: false,
  showDeleteDialog: false,
  isLogged: computed(() => {
    return Boolean(globalData.user.account)
  }),
});
async function searchHandler() {
  notification.error({
    title: '在做了在做了 QAQ',
    duration: 3000,
  })
  // globalData.searchSong(state.searchKey)
}
// 登录后重新init globalData
const refreshLoginStatus = async () => {
  globalData.init()
}
/** 
 * @desc 歌单操作列表
 * @params {  } 
 */
const operatorOpitons = [
  {
    label: '合并歌单',
    key: 'merge',
  },
  {
    label: '根据 tag 生成歌单',
    key: 'generate',
  },
  {
    label: '删除歌单',
    key: 'delete',
  }
]
function onOperatorSelect(key) {
  if (key === 'merge') {
    globalData.status.showMergeDialog = true
  } else if (key === 'generate') {
    state.showTaggingDialog = true
  } else if (key === 'delete') {
    state.showDeleteDialog = true
  }
}
/** 
 * @desc 数据导出和导入
 * @params {  } 
 */
function renderIcon(icon) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    });
  };
};
const jsonOptions = [
  {
    label: '导入 Tag',
    key: 'import',
    icon: renderIcon(FileUpload),
  }, {
    label: '导出 Tag',
    key: 'export',
    icon: renderIcon(FileDownload),
  }
]
const jsonHandleSelect = (key) => {
  if (key === 'export') {
    exportTaggedSong()
  } else if (key === 'import') {
    importTaggedSong()
  }
}
// export tagged song
function exportTaggedSong() {
  globalData.exportTaggedSong()
}
// import tagged song
function importTaggedSong() {
  globalData.importTaggedSong()
}
/** 
 * @desc 合并歌单
 * @params {  } 
 */
function showMergeDialog() {
  globalData.status.showMergeDialog = true
}
function toGithub() {
  window.open('https://github.com/Alwayfeels/TaggingMusic', '_blank')
}
function toEntry() {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.top-bar {
  background-color: white;
  box-sizing: border-box;
  border-bottom: 1px solid #eee;
  padding: 0 40px;

  .user-name {
    font-weight: 500;
  }

  .search-input {
    max-width: 400px;
  }
}
</style>
