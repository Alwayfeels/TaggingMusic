import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useGlobalData } from './globalData'
import { PlayMode, type GlobalState } from './types'

/** 
 * @desc 全局状态
 * @tips 应用中所有的状态存储
 */
export const useGlobalState = defineStore({
  id: 'globalState',
  state: (): GlobalState => ({
    user: {
      isLogin: computed<boolean>(() => Boolean(useGlobalData().user.account)),
      isVip: computed<boolean>(() => useGlobalData().user.account?.vipType === 10)
    },
    topBar: {
      isShow: false,
      isShowSearch: true
    },
    playlist: {
      isShow: false,
      isLoading: false,
      data: computed<any>(() => useGlobalData().playlist),
      active: {}
    },
    songlist: {
      isShow: true,
      isLoading: false,
      data: [],
      active: {}
    },
    player: {
      isShow: true,
      isLoading: false,
      isPlaying: false,
      currentTime: 0,
      playMode: PlayMode.LOOP,
      duration: 0
    }
  }),
  getters: {
    activePlaylistIdx: (state) => {
      return state.playlist.data.findIndex(item => item.id === state.playlist.active.id)
    },
    activeSongIdx: (state) => {
      return state.songlist.data.findIndex(item => item.id === state.songlist.active.id)
    }
  },
  actions: {
    /** 
     * @desc 初始化全局状态
     */
    async init() {
      this.playlist.active = this.playlist.data[0];
      this.setSonglist(this.playlist.active?.id || null)
    },
    /** 
     * @desc 设置歌曲列表（右侧table）
     */
    async setSonglist(id: number | null) {
      if (!id) return;
      this.songlist.data = await useGlobalData().getSonglist(id) || []
      this.songlist.active = this.songlist.data[0] || {}
    },
    /** 
     * @desc 设置正在播放的歌曲
     * 支持通过 index 或 id 查找，优先 id
     */
    async setActiveSong(config: { index?: number, id?: number }) {
      if (!this.songlist.data.length) {
        console.error('setActiveSong error: songlist is empty')
        return;
      }
      let active = null
      if (config.id && config.id >= 0) {
        active = this.songlist.data.find(item => item.id === config.id) || this.songlist.data[0]
      }
      else if (config.index && config.index >= 0) {
        active = this.songlist.data[config.index || 0];
      }
      else {
        return false;
      }
      this.songlist.active = active
      await this.getActiveSongUrl()
      this.player.isPlaying = true
    },
    /** 
     * @desc 获取歌曲详情（url）
     */
    async getActiveSongUrl(force = false) {
      const song = this.songlist.active
      if (!song.id) return false;
      if (!force && song.url) return false;
      this.player.isLoading = true;
      song.url = await useGlobalData().getSongUrl(song) || null
      this.player.isLoading = false;
      return song
    },
    /** 
     * @desc 播放下一首
     */
    async setNextSong() {
      if (this.player.playMode === PlayMode.LOOP) {
        const index = this.songlist.data.findIndex(item => item.id === this.songlist.active.id)
        const nextIdx = (index + 1) % this.songlist.data.length
        return this.setActiveSong({ index: nextIdx })
      }
      if (this.player.playMode === PlayMode.RANDOM) {
        const nextIdx = Math.floor(Math.random() * this.songlist.data.length);
        return this.setActiveSong({ index: nextIdx })
      }
      if (this.player.playMode === PlayMode.SINGLE) {
        return this.setActiveSong({ id: this.songlist.active.id })
      }
    }
  }
})
