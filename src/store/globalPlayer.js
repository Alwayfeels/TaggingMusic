import { defineStore } from "pinia";
import api from '@/api/http'
import { useGlobalData } from '@/store/globalData';
import { computed } from 'vue';

export const useGlobalPlayer = defineStore("globalPlayer", {
  state: () => {
    return {
      isPlaying: false, // 是否正在播放
      loading: false, // 是否正在加载歌曲
      currentTime: 0, // 当前播放时间
      duration: 0, // 歌曲总时长
      isPlayerShow: true, // 播放器是否显示
      currPlayIndex: null, // 当前播放歌曲索引
      playerList: computed(() => {
        return useGlobalData().songlist;
      }), // 播放列表
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
    initPlayerList(songlist) {
      this.playerList = songlist
    },
    setPlayIndex(index) {
      if (typeof index !== 'number') {
        console.error('setPlayIndex: index is not a number')
        return false
      }
      this.currPlayIndex = index
      if (this.playerList[index].is404) {
        window.$notification.error({
          title: `「${this.currPlaySong.name}」 暂无音源`,
          duration: 3000
        })
      }
    },
    /** 
     * @desc 加载 currPlaySong 的歌曲
     * @params id 
     */
    async loadCurrPlaySong() {
      if (!this.currPlaySong?.id) {
        console.error('currPlaySong is null')
        return
      }
      if (this.currPlaySong?.url) {
        console.warn('currPlaySong was already loaded')
        return
      }
      const index = this.currPlayIndex
      const song = this.currPlaySong
      const readySong = await this.getSongUrl(song) // 添加url属性
      if (readySong.url) {
        this.playerList[index] = readySong;
        return true;
      } else {
        this.playerList[index].unable = true;
        // 暂无权限
        window.$notification.error({
          title: `「${this.currPlaySong.name}」 暂无音源`,
          duration: 3000
        })
        return false;
      }
    },
    // async pushSong(song) {
    //   let readySong = await this.getSongUrl(song) // 带有url属性
    //   if (this.currPlayIndex != null) {
    //     this.playerList.unshift(readySong);
    //     this.currPlayIndex = 0
    //   } else {
    //     // 将push的歌曲插入到playerList末尾
    //     this.playerList.push(readySong);
    //   }
    // },
    async getSongUrl(song) {
      this.loading = true;
      const res = await api.getRemote('/song/url', { id: song.id, br: 320000 })
      this.loading = false;
      let songUrl = res.data[0].url
      song.url = songUrl // ready to play
      return song
    },
    // async addPlaySong(song) {
    //   const res = await api.getRemote('/song/url', { id: song.id, br: 320000 })
    //   let songUrl = res.data[0].url
    //   song.url = songUrl
    //   let isSongExist = this.playerList.some(item => item.id === song.id);
    //   if (isSongExist) {
    //     const index = this.playerList.findIndex(item => item.id === song.id);
    //     this.currPlayIndex = index;
    //   } else {
    //     this.playerList.push(song);
    //   }
    //   if (this.playerList.length > 0) {
    //     this.isPlayerShow = true
    //   }
    // },
    // removePlayerList(id) {
    //   if (!id) {
    //     console.error('removePlayerList id is required')
    //     return false;
    //   }
    //   this.playerList = this.playerList.filter(item => item.id != id)
    // },
    showLoading() {
      this.loading = true
    },
    hideLoading() {
      this.loading = false
    },
    play() {
      this.isPlaying = true
    },
    pause() {
      this.isPlaying = false
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
