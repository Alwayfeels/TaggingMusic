import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useGlobalData } from './globalData'

/** 
 * @desc 全局状态
 * @tips 应用中所有的状态存储
 */
export const useGlobalState = defineStore({
  id: 'globalState',
  state: () => ({
    globalData: useGlobalData(),
    user: {
      isLogin: computed(() => Boolean(useGlobalData().user.account)),
      isVip: computed(() => useGlobalData().user.account?.vipType === 10)
    },
    topBar: {
      isShow: false,
      isShowSearch: true
    },
    playlist: {
      isShow: false,
      isLoading: false,
      data: computed(() => useGlobalData().playlist),
      active: null
    },
    songlist: {
      isShow: true,
      isLoading: false,
      data: [],
      active: null
    },
    player: {
      isShow: true,
      isLoading: false,
      isPlaying: false,
    }
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2
  },
  actions: {
    /** 
     * @desc 初始化全局状态
     */
    async init() {
      this.playlist.active = this.playlist.data[0];
      this.songlist.data = await this.globalData.getSonglist(this.playlist.active?.id || null)
    },
    /** 
     * @desc 设置正在播放的歌曲
     */
    setSonglistActive(config: { index?: number, id?: number }) {
      if (!this.songlist.data.length) {
        console.error('setSonglistActive error: songlist is empty')
        return;
      }
      if (config.id && config.id >= 0) {
        this.songlist.active = this.songlist.data.find(item => item.id === config.id)
      }
      if (config.index && config.index >= 0) {
        this.songlist.active = this.songlist.data[config.index || 0];
      }
    }
  }
})
