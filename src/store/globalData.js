import { defineStore } from "pinia";
import api from '@/api/http'
import localforage from 'localforage';

// 整个应用的数据中心
export const useGlobalData = defineStore("globalData", {
  state: () => ({
    playlist: [], // 歌单列表
    songlist: [], // 歌单歌曲数据
    user: {}, // 用户信息
    tagList: [], // 标签列表
    taggedSong: [], // 已标记的歌曲列表
    playerList: [], // 播放列表
  }),
  getters: {
  },
  actions: {
    // 初始化 globalData
    async initGlobalData() {
      this.initTaggedSong()
      this.initTag()
      await this.initUser()
      await this.initPlaylist()
      await this.initSonglist(this.playlist[0].id)
    },
    // 初始化 已标记歌曲
    async initTaggedSong() {
      const taggedSong = await localforage.getItem('taggedSong')
      if (taggedSong) {
        this.taggedSong = taggedSong
      }
    },
    // 初始化所有标签
    async initTag() {
      const tagList = await localforage.getItem('tag')
      if (tagList) {
        this.tagList = tagList
      }
    },
    // 初始化 用户数据
    async initUser() {
      let [profile, account] = await Promise.all([
        localforage.getItem('profile'),
        localforage.getItem('account'),
      ])
      // 本地无数据时调用接口获取
      if (profile && account) {
        let userInfo = { profile, account, id: account.id }
        this.user = userInfo;
      } else {
        await this.getRemoteUserInfo()
      }
    },
    // 初始化 播放列表数据
    async initPlaylist() {
      let playlist = await localforage.getItem('playlist')
      if (playlist) {
        this.playlist = playlist;
      } else {
        await this.getRemotePlaylist()
      }
    },
    // 初始化 歌曲列表
    async initSonglist(playlistId) {
      if (!playlistId) {
        console.error('playlistId is required')
        return []
      }
      let songlist = await localforage.getItem(`songlist_${playlistId}`)
      if (songlist) {
        this.songlist = songlist;
      } else {
        await this.getRemoteSonglist(playlistId)
      }
    },
    // 获取远端用户信息, 返回数据并缓存到store, indexedDB
    async getRemoteUserInfo() {
      const res = await api.getRemote('login/status');
      if (res.data?.profile) {
        let profile = res.data.profile;
        let account = res.data.account
        this.user = {
          profile,
          account,
          id: account.id,
        }
        localforage.setItem('profile', profile)
        localforage.setItem('account', account)
        return { profile, account }
      } else {
        console.error('getRemoteUserInfo error: 可能用户未登录')
        return { profile: null, account: null }
      }
    },
    // 获取远端歌单列表, 返回数据并缓存到store, indexedDB
    async getRemotePlaylist() {
      if (!this.user.id) {
        console.error('this.user.id is required')
        return [];
      }
      const res = await api.getRemote('/user/playlist', {
        uid: this.user.id
      });
      if (res.playlist) {
        this.playlist = res.playlist;
        localforage.setItem('playlist', res.playlist);
        return res.playlist
      }
      console.error('getRemotePlaylist error')
      return []
    },
    // 获取远端歌单详情, 返回数据并缓存到store, indexedDB
    async getRemoteSonglist(playlistId = '') {
      if (!playlistId) {
        console.error('getRemoteSonglist error: playlistId is required')
        return []
      }
      const res = await api.getRemote('/playlist/track/all', {
        id: playlistId
      });
      this.songlist = res.songs
      localforage.setItem(`songlist_${playlistId}`, res.songs);
      return res.songs
    },
  }
});
