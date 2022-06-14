import { defineStore } from "pinia";
import api from '@/api/http'

export const usePlayerStore = defineStore("player", {
  state: () => {
    return {
      loading: false,
      currentTime: 0,
      duration: 0,
      isPlay: false,
      isPlayerShow: false,
      count: 0,
      currPlayIndex: 0,
      playList: [],
    };
  },
  getters: {
    currPlaySong: (state) => {
      return state.playList[state.currPlayIndex] || {};
    }
  },
  actions: {
    setCurrentSong(song) {
      this.setPlayList(song)
    },
    setPlayList(playList) {
      this.playList = [playList]
    },
    showLoading() {
      this.loading = true
    }, 
    hideLoading() {
      this.loading = false
    },
    increment() {
      this.count++;
    },
    async addPlaySong(songObj) {
      const res = await api.getSync('/song/url', { id: songObj.id, br: 320000 })
      let songDataUrl = res.data[0].url
      songObj.url = songDataUrl
      this.playList.push(songObj);
      if (this.playList.length > 0) {
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
