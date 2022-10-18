import { defineStore } from 'pinia'
import { computed, nextTick } from 'vue'
import { useGlobalData } from './globalData'
import { PlayMode, type GlobalState, type Song } from './types'
// import { thottle } from 'lodash'

/** 
 * @desc 全局状态
 * @tips 应用中所有的状态存储
 */
export const useGlobalState = defineStore({
  id: 'globalState',
  state: (): GlobalState => ({
    user: {
      isLogin: computed<boolean>(() => Boolean(useGlobalData().user.account?.id)),
      isVip: computed<boolean>(() => useGlobalData().user.account?.vipType === 10)
    },
    topBar: {
      isShow: false,
      isShowSearch: true,
      tagsIsSync: false
    },
    playlist: {
      isShow: false,
      isLoading: false,
      data: [],
      active: {
        id: null
      }
    },
    songlist: {
      isShow: true,
      isLoading: false,
      data: [],
      active: {},
      activeTagInputSong: null,
      tagsHistory: [],
      historyIndex: 0,
    },
    player: {
      playlist: [],
      active: {},
      isShow: false,
      isLoading: false,
      isPlaying: false,
      currentTime: 0,
      playMode: PlayMode.LOOP,
      duration: 0
    }
  }),
  getters: {
    // 歌单列表 active
    activePlaylistIdx: (state) => {
      return state.playlist.data.findIndex(item => item.id === state.playlist.active.id)
    },
    // 歌曲列表 active
    activeSongIdx: (state) => {
      return state.songlist.data.findIndex(item => item.id === state.songlist.active.id)
    },
    // 播放列表 active
    activePlayingSongIdx: (state) => {
      return state.player.playlist.findIndex(item => item.id === state.player.active.id)
    },
  },
  actions: {
    /** 
     * @desc 初始化全局状态
     */
    async init() {
      const globalData = useGlobalData()
      globalData.welcome() // 访问统计
      await globalData.initUserInfo(false)
    },

    /** 
     * @desc 从 player.playlist 中设置 player.active 的歌曲, 并获取歌曲 url，然后播放歌曲
     * 支持通过 index 或 id 查找，优先 id
     */
    async setPlayerActiveSong(config: { index?: number, id?: number, autoPlay?: boolean }) {
      config = { autoPlay: true, ...config }
      if (!this.player.playlist.length) {
        console.error('setPlayerActiveSong error: playerList is empty', config)
        return false;
      }
      let active: any = null // song need to set
      // search
      const searchSonglist = this.player.playlist
      if (typeof config.id === 'number' && config.id >= 0) {
        active = searchSonglist.find(item => item.id === config.id)
      } else if (typeof config.index === 'number' && config.index >= 0) {
        active = searchSonglist[config.index];
      } else {
        console.error('setPlayerActiveSong: params is wrong', config)
        return false;
      }
      // set value
      if (!active) {
        console.error('set song is not found');
        return false;
      }
      this.player.active = active
      // fetch song Url
      await this.getActiveSongUrl()
      if (config.autoPlay) {
        await nextTick()
        this.player.isPlaying = true
      }
      return true
    },

    /**
     * @desc: 设置 songlist.active
     * @desc: 设置完成后会自动调用 setPlayerActiveSong 
     * 支持通过 index 或 id 查找，优先 id
     */
    setSonglistActive(config: { index?: number, id?: number, autoPlay?: boolean }) {
      config = { autoPlay: true, ...config }
      let active = null;
      // search
      const searchSonglist = this.songlist.data
      if (typeof config.id === 'number' && config.id >= 0) {
        active = searchSonglist.find(item => item.id === config.id)
      } else if (typeof config.index === 'number' && config.index >= 0) {
        active = searchSonglist[config.index];
      } else {
        console.error('setSonglistActive: params is wrong')
        return false;
      }

      if (!active) {
        console.error('set song is not found in songlist.data');
        return false;
      }
      this.songlist.active = active
      // set player.active, SYNC songlist.data & player.playlist
      if (this.player.playlist.length === 0) {
        this.player.playlist = this.songlist.data;
      }
      this.setPlayerActiveSong({ id: active.id })
    },

    /**
     * @desc: 设置播放器 - 歌单列表
     */
    setPlayerPlaylist(songlist: Song[]) {
      this.player.playlist = songlist;
    },

    /** 
     * @desc 获取活动中的歌曲的详情（url）
     */
    async getActiveSongUrl(force = false) {
      // thottle(async () => {
      const song = this.player.active
      if (!song.id) return false;
      if (!force && song.url) return false;
      this.player.isLoading = true;
      song.url = await useGlobalData().getSongUrl(song) || null
      this.player.isLoading = false;
      return song
      // }, 100)
    },

    /** 
     * @desc 播放下一首
     */
    async setNextSong() {
      if (this.player.playMode === PlayMode.LOOP) {
        const index = this.player.playlist.findIndex(item => item.id === this.player.active.id)
        const nextIdx = (index + 1) % this.player.playlist.length
        return this.setPlayerActiveSong({ index: nextIdx })
      }
      if (this.player.playMode === PlayMode.RANDOM) {
        const nextIdx = Math.floor(Math.random() * this.player.playlist.length);
        return this.setPlayerActiveSong({ index: nextIdx })
      }
      if (this.player.playMode === PlayMode.SINGLE) {
        return this.setPlayerActiveSong({ id: this.player.active.id })
      }
    },

    /**
     * @desc: 新增 tags 操作历史数据
     */
    addTagsHistory(id: number, name: string, newTags: string[], oldTags: string[] = []) {
      const newHistoryItem = { id, name, newTags, oldTags };
      if (this.songlist.historyIndex !== 0) {
        this.songlist.tagsHistory.splice(0, this.songlist.historyIndex, newHistoryItem)
        return
      }
      this.songlist.tagsHistory.unshift(newHistoryItem);
    },

    /**
     * @desc: 撤销 tags 操作 ctrl+z
     */
    revokeTags() {
      const { tagsHistory, historyIndex } = this.songlist;
      if (historyIndex >= tagsHistory.length) {
        console.error('can not Revoke')
        return;
      }
      const { id, oldTags } = tagsHistory[historyIndex]
      useGlobalData().setTagsInTaggedSongs(id, oldTags, undefined, false)
      this.songlist.historyIndex++
    },

    /**
     * @desc: 反撤销 tags 操作 ctrl+y
     */
    unRevokeTags() {
      if (this.songlist.historyIndex <= 0) {
        console.error('can not unRevoke')
        return;
      }
      this.songlist.historyIndex--
      const { tagsHistory, historyIndex } = this.songlist;
      const { id, newTags } = tagsHistory[historyIndex]
      useGlobalData().setTagsInTaggedSongs(id, newTags, undefined, false)
    }
  }
})
