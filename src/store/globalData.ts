import { defineStore } from "pinia";
import api from '@/api/http'
import localforage from "localforage";
import { computed, toRaw } from "vue";
import { FlashSettings20Filled } from "@vicons/fluent";
import type { GlobalData, UserInfo, Song, TagRef, TaggedSong } from "@/store/types";
import { useGlobalState } from "@/store/globalState";

/** 
 * @desc 全局数据存储
 * @tips 该文件是唯一和 indexedDB 交互的入口
 */

export const useGlobalData = defineStore({
  id: 'globalData',
  state: (): GlobalData => ({
    user: {
      profile: {},
      account: {}
    },
    playlist: [],
    songlist: [],
    taggedSongs: []
  }),
  getters: {
    tagList: (state) => {
      const tagArray = state.taggedSongs.map(item => item.tags).flat()
      const tagList: TagRef[] = []
      tagArray.forEach((tag: string) => {
        const index = tagList.findIndex(item => item.name === tag)
        if (index >= 0) {
          (tagList[index].ref as number) += 1
        } else {
          tagList.push({
            name: tag,
            ref: 1
          })
        }
      })
      localforage.setItem('tagList', tagList)
      return tagList
    },
  },
  actions: {
    /** 
     * @desc 初始化 globalData
     */
    async init() {
      this.getUserInfo()
      this.initTaggedSongs()
      await this.setPlaylist()
    },
    /** 
     * @desc 获取用户信息
     */
    async getUserInfo(force = false) {
      let profile, account = null
      if (!force) {
        [profile, account] = await Promise.all([localforage.getItem("profile"), localforage.getItem("account")]);
        if (profile && account) {
          // const userInfo: UserInfo = { profile, account, id: account?.id };
          const userInfo: UserInfo = { profile, account };
          this.user = userInfo;
          return userInfo;
        }
      }
      // API Call
      const res = await api.get("login/status");
      if (res.data?.profile) {
        profile = res.data.profile;
        account = res.data.account;
        // const userInfo: UserInfo = { profile, account, id: account?.id };
        const userInfo: UserInfo = { profile, account };
        this.user = userInfo
        localforage.setItem("profile", profile);
        localforage.setItem("account", account);
        return userInfo;
      } else {
        console.warn('getRemoteUserInfo error: 可能用户未登录')
        return false
      }
    },
    /** 
     * @desc 初始化已标记歌曲信息
     */
    async initTaggedSongs() {
      const taggedSongs: TaggedSong[] = await localforage.getItem("taggedSongs") || [];
      if (taggedSongs) {
        this.taggedSongs = taggedSongs;
      }
    },
    /** 
     * @desc 获取用户所有歌单
     */
    async setPlaylist(force = false) {
      let playlist = null
      if (!force) {
        playlist = await localforage.getItem("playlist");
        if (playlist) {
          this.playlist = playlist
          return playlist
        }
      }
      if (!this.user.account.id) {
        console.warn('setPlaylist error: 用户id不存在')
        return false
      }
      // API Call
      const res = await api.get("/user/playlist", {
        uid: this.user.account.id,
      });
      playlist = res.playlist
      this.playlist = playlist;
      localforage.setItem('playlist', playlist);
      return playlist
    },
    /** 
     * @desc 获取目标歌单所有歌曲
     */
    async getSonglist(id: number | null, force = false, setStore = true) {
      if (!id) return false
      useGlobalState().songlist.isLoading = true
      let songlist: Song[] | null
      if (!force) {
        songlist = await localforage.getItem(`songlist_${id}`);
        if (songlist) {
          this.songlist = songlist
          useGlobalState().songlist.isLoading = false
          return songlist
        }
      }
      // API Call
      const res = await api.get("/playlist/track/all", {
        id,
      });
      songlist = res.songs;
      songlist = songlist || []
      // 过滤不需要的属性
      songlist = songlist.map(item => ({
        id: item.id,
        name: item.name,
        ar: item.ar,
        al: item.al,
        fee: item.fee,
      }))
      localforage.setItem(`songlist_${id}`, songlist);
      if (songlist && setStore) {
        this.songlist = songlist;
      }
      useGlobalState().songlist.isLoading = false
      return songlist
    },
    /** 
     * @desc 获取歌曲详情和url
     */
    async getSongUrl(song: Song, force = false) {
      if (!song.id) return;
      if (force || song.url) return;
      const detail = await api.get('/song/url', { id: song.id, br: 320000 });
      if (detail?.data[0]?.url) {
        const url = detail.data[0].url;
        return url
      }
      return false
    },
    /** 
     * @desc 保存 taggedSongs 到 indexedDB
     */
    saveTaggedSongs(taggedSongs?: TaggedSong[]) {
      localforage.setItem("taggedSongs", toRaw(taggedSongs || this.taggedSongs));
    }
  }
})

