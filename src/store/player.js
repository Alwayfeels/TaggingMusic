import { defineStore } from "pinia";
import api from '@/api/http'
// import { useGlobalData } from '@/store/globalData';

// // 全局数据中心
// const globalData = useGlobalData()

export const usePlayerStore = defineStore("player", {
  state: () => {
    return {
      isPlay: false, // 是否正在播放
      loading: false, // 是否正在加载
      currentTime: 0, // 当前播放时间
      duration: 0, // 歌曲总时长
      isPlayerShow: false, // 播放器是否显示
      currPlayIndex: null, // 当前播放歌曲索引
      playerList: [], // 播放列表
    };
  },
  getters: {
    currPlaySong: (state) => {
      if (state.playerList.length) {
        state.currPlayIndex = state.currPlayIndex || 0;
        return state.playerList[state.currPlayIndex]
      }
      return null
    }
  },
  actions: {
    // 插入歌曲并播放
    async insertSong(song) {
      let insertIndex = this.currPlayIndex || 0;
      let id = song.id
      if (this.currPlayIndex != null) { 
        this.playerList.unshift(song);
        this.currPlayIndex = 0
      } else {
        // 将insert的歌曲插入到当前播放歌曲之前
        this.playerList.splice(this.currPlayIndex, 0, song);
      }
      let readySong = await this.getSongUrl(song) // 带有url属性
      this.playerList[insertIndex] = readySong;
    },
    async pushSong(song) {
      let readySong = await this.getSongUrl(song) // 带有url属性
      if (this.currPlayIndex != null) { 
        this.playerList.unshift(readySong);
        this.currPlayIndex = 0
      } else {
        // 将push的歌曲插入到playerList末尾
        this.playerList.push(readySong);
      }
    },
    async getSongUrl(song) {
      const res = await api.getRemote('/song/url', { id: song.id, br: 320000 })
      let songUrl = res.data[0].url
      song.url = songUrl // ready to play
      return song
    },
    showLoading() {
      this.loading = true
    }, 
    hideLoading() {
      this.loading = false
    },
    async addPlaySong(song) {
      const res = await api.getRemote('/song/url', { id: song.id, br: 320000 })
      let songUrl = res.data[0].url
      song.url = songUrl
      this.playerList.push(song);
      if (this.playerList.length > 0) {
        this.isPlayerShow = true
      }
    },
    play() {
      this.isPlay = true
    },
    pause() {
      this.isPlay = false
    },
    showPlayer() {
      this.isPlayerShow = true;
    },
    hidePlayer() {
      this.isPlayerShow = false;
    },
    togglePlayer() {
      this.isPlayerShow = !this.isPlayerShow;
    }
  },
});
