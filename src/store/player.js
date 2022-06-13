import { defineStore } from "pinia";
import api from '@/api/http'

export const usePlayerStore = defineStore("player", {
  state: () => {
    return {
      isPlayerShow: false,
      count: 0,
      currPlayIndex: 0,
      playList: [],
    };
  },
  getters: {
    currPlaySong: (state) => {
      return state.playList[state.currPlayIndex];
    }
  },
  actions: {
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
