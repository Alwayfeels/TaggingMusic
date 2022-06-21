import { defineStore } from "pinia";
import api from "@/api/http";
import localforage from "localforage";
// naive UI 就算用最新的 2.29.0 版本也会报错
// import { createDiscreteApi } from "naive-ui";

// const { message, notification, dialog, loadingBar } = createDiscreteApi(["message", "dialog", "notification", "loadingBar"], {});
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
  getters: {},
  actions: {
    // 初始化 globalData
    async init() {
      this.initTaggedSong();
      this.initTag();
      await this.initUser();
      if (this.user.id) {
        await this.initPlaylist();
        await this.initSonglist(this.playlist[0]?.id);
      }
    },
    // 初始化 已标记歌曲
    async initTaggedSong() {
      const taggedSong = await localforage.getItem("taggedSong");
      if (taggedSong) {
        this.taggedSong = taggedSong;
      }
    },
    // 初始化所有标签
    async initTag() {
      const tagList = await localforage.getItem("tag");
      if (tagList) {
        this.tagList = tagList;
      }
    },
    // 初始化 用户数据
    async initUser() {
      let [profile, account] = await Promise.all([localforage.getItem("profile"), localforage.getItem("account")]);
      // 本地无数据时调用接口获取
      if (profile && account) {
        let userInfo = { profile, account, id: account.id };
        this.user = userInfo;
      } else {
        await this.getRemoteUserInfo();
      }
    },
    // 初始化 播放列表数据
    async initPlaylist() {
      let playlist = await localforage.getItem("playlist");
      if (playlist) {
        // 筛选需要的key保留到store
        let needProps = ["id", "name", "coverImgUrl", "trackCount"];
        this.playlist = this.filterUsefulProps(playlist, needProps);
      } else {
        await this.getRemotePlaylist();
      }
    },
    // 初始化 歌曲列表
    async initSonglist(playlistId) {
      if (!playlistId) {
        console.warn('playlistId is required')
        return []
      }
      let songlist = await localforage.getItem(`songlist_${playlistId}`);
      if (songlist) {
        // 筛选需要的key保留到store
        let needProps = ["id", "name", "al", "ar"];
        this.songlist = this.filterUsefulProps(songlist, needProps);
      } else {
        await this.getRemoteSonglist(playlistId);
      }
    },
    // 获取远端用户信息, 返回数据并缓存到store, indexedDB
    async getRemoteUserInfo() {
      const res = await api.getRemote("login/status");
      if (res.data?.profile) {
        let profile = res.data.profile;
        let account = res.data.account;
        this.user = {
          profile,
          account,
          id: account.id,
        };
        localforage.setItem("profile", profile);
        localforage.setItem("account", account);
        return { profile, account };
      } else {
        console.warn('getRemoteUserInfo error: 可能用户未登录')
        return { profile: null, account: null }
      }
    },
    // 获取远端歌单列表, 返回数据并缓存到store, indexedDB
    async getRemotePlaylist() {
      if (!this.user.id) {
        console.warn('this.user.id is required')
        return [];
      }
      const res = await api.getRemote("/user/playlist", {
        uid: this.user.id,
      });
      let playlist = res.playlist;
      if (playlist) {
        // 筛选需要的key保留到store
        // let needProps = ["id", "name", "al", "ar"];
        let needProps = ["id", "name", "coverImgUrl", "trackCount"];
        this.playlist = this.filterUsefulProps(playlist, needProps);
        return playlist
      }
      console.warn('getRemotePlaylist error')
      return []
    },
    // 获取远端歌单详情, 返回数据并缓存到store, indexedDB
    async getRemoteSonglist(playlistId = "") {
      if (!playlistId) {
        console.error("getRemoteSonglist error: playlistId is required");
        return [];
      }
      const res = await api.getRemote("/playlist/track/all", {
        id: playlistId,
      });
      let songlist = res.songs;
      if (songlist) {
        // 筛选需要的key保留到store
        let needProps = ["id", "name", "al", "ar"];
        this.songlist = this.filterUsefulProps(songlist, needProps);
      }
      localforage.setItem(`songlist_${playlistId}`, songlist);
      return songlist;
    },
    // 导出TaggedSong
    async exportTaggedSong() {
      const exportTaggedSong = await localforage.getItem("taggedSong");
      let link = document.createElement("a");
      link.download = "标签歌曲数据.json";
      link.href = "data:text/plain," + JSON.stringify(exportTaggedSong);
      link.click();
    },
    // 导入TaggedSong
    async importTaggedSong() {
      let _this = this;
      return new Promise((resolve, reject) => {
        // 创建一个file input
        let input = document.createElement("input");
        // 绑定onchange事件
        input.type = "file";
        input.onchange = (e) => {
          let file = e.target.files[0];
          console.log('file = ', file)
          if (!file) {
            input = null;
            reject('file is null')
          }
          // 当选择文件后，使用FileReader API读取文件，返回数据
          let reader = new FileReader();
          reader.readAsText(file);
          reader.onload = (e) => {
            let data = JSON.parse(e.target.result);
            localforage.setItem("taggedSong", data);
            _this.taggedSong = data;
            resolve(data);
          };
        };
        input.click();
      })
    },
    // 筛选objArray中需要的prop，筛选后返回
    filterUsefulProps(objArray, usefulPropsArray) {
      return objArray.map((item) => {
        let newItem = {};
        usefulPropsArray.forEach((key) => {
          newItem[key] = item[key];
        });
        return newItem;
      });
    },
    async searchSong(key = '') {
      if (!key) {
        console.warn('searchSong: key is required')
        return [];
      }
      const res = await api.getRemote("/search", { keywords: key });
      console.log('res = ', res)
    }
  },
});
