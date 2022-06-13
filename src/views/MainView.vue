<template>
  <n-layout class="main-container" :class="showPlayBar ? 'min-height' : 'full-height'" has-sider>
    <n-layout-sider collapse-mode="width" :collapsed-width="120" :width="320" show-trigger="arrow-circle"
      content-style="padding: 24px;" bordered :native-scrollbar="false">
      <n-spin :show="state.playlistLoading">
        <n-menu v-model:value="state.currSonglistId" :root-indent="36" :indent="12" :options="state.menuOptions"
          :render-icon="renderMenuIcon" :render-label="renderMenuLabel" :on-update:value="activeMenuChange" />
      </n-spin>
    </n-layout-sider>
    <n-layout-content content-style="padding: 24px;" :native-scrollbar="false">
      <SongTable class="h-full" v-model:tableData="state.songlist" v-model:loading="state.songlistLoading" />
    </n-layout-content>
  </n-layout>
</template>

<script setup>
import SongTable from '@/components/SongTable.vue';
import { h, onMounted, reactive } from 'vue';
import api from '@/api/http';
import localforage from 'localforage';
import { NMenu } from 'naive-ui';
import { useVModel } from '@vueuse/core'

// 绑定播放栏目
const props = defineProps({
  showPlayBar: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:showPlayBar'])
const showPlayBar = useVModel(props, 'showPlayBar', emit)

const state = reactive({
  profile: null,
  currSonglistId: null,
  playlist: [], // 歌单列表
  playlistLoading: false,
  songlist: [], // 歌曲列表
  songlistLoading: false,
  menuOptions: [],
});

onMounted(async () => {
  state.playlistLoading = true;
  state.profile = await localforage.getItem('profile');
  let playlist = await localforage.getItem('playlist');
  if (!playlist) {
    playlist = await getUserPlayList();
  }
  state.playlist = playlist
  state.playlistLoading = false;
  // 首选第一个playlist
  initMenuOption()
  state.currSonglistId = state.playlist[0].id
  getSonglist()
})

const activeMenuChange = (key, item) => {
  state.currSonglistId = key
  getSonglist()
}
const renderMenuIcon = (option) => {
  return h('img', { src: option.coverImgUrl, class: 'w-8 h-8' })
}
const renderMenuLabel = (option) => {
  return h('span', {}, option.label)
}
const getUserPlayList = async () => {
  const res = await api.getSync('/user/playlist', {
    uid: state.profile.userId
  });
  if (res.playlist) {
    localforage.setItem('playlist', res.playlist);
    // 根据playlist构建menuOptions
    return res.playlist
  }
}

const initMenuOption = () => {
  state.menuOptions = state.playlist.map(item => {
    return {
      key: item.id,
      label: item.name,
      coverImgUrl: item.coverImgUrl + '?param=32y32'
    }
  })
  console.log(state.menuOptions);
}
// 先搜索本地, 没有则请求服务器
const getSonglist = async () => {
  state.songlistLoading = true
  let targetId = state.currSonglistId;
  const songs = await localforage.getItem('songlist_' + targetId);
  if (!songs) {
    const res = await api.getSync('/playlist/track/all', {
      id: state.currSonglistId
    });
    console.log('initSonglist', res);
    state.songlist = res.songs
    localforage.setItem('songlist_' + targetId, res.songs);
  } else {
    state.songlist = songs
  }
  state.songlistLoading = false
}
</script>
<style lang="scss" scoped>
.main-container {
  overflow: hidden;
  transition: height 0.5s ease-out;

  :v-deep(.n-scrollbar-content) {
    height: 100%;
  }
}
.full-height {
  height: calc(100vh - 5rem);
}
.min-height {
  height: calc(100vh - 10rem);
}
</style>