import { defineStore } from "pinia";
import api from "@/api/http";
import localforage from "localforage";
import { useGlobalPlayer } from '@/store/globalPlayer';
// import useProgress from "@/store/progress";
// naive UI 就算用最新的 2.29.0 版本也会报错
// import { createDiscreteApi } from "naive-ui";

// const progress = useProgress()
// const { message, notification, dialog, loadingBar } = createDiscreteApi(["message", "dialog", "notification", "loadingBar"], {});
// 整个应用的数据中心
export const useGlobalData = defineStore("globalData", {
  state: () => ({
    removeTagOnBlur: false,
    playlist: [], // 歌单列表
    songlist: [], // 歌单歌曲数据
    user: {}, // 用户信息
    tagList: [], // 标签列表
    taggedSong: [], // 已标记的歌曲列表
    status: {
      updateTagInput: null,
      showMergeDialog: false,
    },
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
    // 更新登录状态
    async refreshLoginStatus() {
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
      const tagList = await this.updateTagFromTaggedSong();
      // const tagList = await localforage.getItem("tag");
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
    async initSonglist(playlistId = "") {
      if (!playlistId) {
        console.warn('playlistId is required')
        return []
      }
      let songlist = await this.getSonglist({ playlistId });
      // 筛选需要的key保留到store
      let needProps = ["id", "name", "al", "ar"];
      songlist = this.filterUsefulProps(songlist, needProps);
      this.songlist = songlist;
      return songlist;
    },
    // 获取歌单歌曲, 优先从本地获取，使用 force 直接从接口获取
    // config: {id: Number, force: Boolean}
    async getSonglist(config) {
      let { playlistId, force, setStore = false } = config;
      if (!playlistId) {
        console.error("getRemoteSonglist error: playlistId is required");
        return [];
      }
      if (force) {
        return await this.getRemoteSonglist({ playlistId, setStore });
      }
      let songlist = await localforage.getItem(`songlist_${playlistId}`);
      if (songlist) {
        this.songlist = songlist;
        return songlist;
      }
      return await this.getRemoteSonglist({ playlistId, setStore });
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
        localforage.setItem('playlist', playlist);
        return playlist
      }
      console.warn('getRemotePlaylist error')
      return []
    },
    // 根据 playlistId 获取远端歌单详情, 缓存到 indexedDB, 根据 setStore 是否储存到 store
    async getRemoteSonglist(config) {
      let { setStore, playlistId } = config;
      if (!playlistId) {
        console.error("getRemoteSonglist error: playlistId is required");
        return [];
      }
      const res = await api.getRemote("/playlist/track/all", {
        id: playlistId,
      });
      let songlist = res.songs;
      localforage.setItem(`songlist_${playlistId}`, songlist);
      if (songlist && setStore) {
        // 筛选需要的key保留到store
        let needProps = ["id", "name", "al", "ar"];
        this.songlist = this.filterUsefulProps(songlist, needProps);
      }
      return songlist;
    },
    // 导出TaggedSong
    async exportTaggedSong() {
      const exportTaggedSong = await localforage.getItem("taggedSong");
      if (exportTaggedSong === null) {
        window.$notification.warning({
          title: "失败",
          content: '当前没有任何带有标签的歌曲',
          duration: 3000
        })
        return false;
      }
      let link = document.createElement("a");
      link.download = "标签歌曲数据.json";
      link.href = "data:text/plain," + JSON.stringify(exportTaggedSong);
      link.click();
      window.$notification.success({
        title: "成功",
        content: '导出完成！',
        duration: 3000
      })
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
            window.$notification.success({
              title: "成功",
              content: '导入完成！',
              duration: 3000
            })
            resolve(data);
          };
        };
        input.click();
      })
    },
    // 筛选objArray中需要的prop，筛选后返回
    // objArray: object[]
    // props: string[]
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
    },
    // 根据taggedSong 重新生成 tag 以及 ref 次数
    async updateTagFromTaggedSong() {
      let taggedSong = await localforage.getItem("taggedSong");
      if (!taggedSong) return [];
      let allTag = [];
      taggedSong.forEach((song) => {
        if (song.tagName?.length) {
          song.tagName.forEach((tag) => {
            let existTag = allTag.find((item) => item.tagName === tag);
            if (existTag) {
              existTag.ref++;
            } else {
              allTag.push({ tagName: tag, ref: 1 });
            }
          })
        }
      })
      localforage.setItem("tag", allTag);
      return allTag;
    },
    // 批量给当前展示歌单添加 tag
    // tagName: string[]
    async batchAddTag(tagName = []) {
      if (!this.songlist.length || !tagName.length) {
        console.warn('batchSetTag: this.songlist and tagName are required')
        return false;
      }
      let taggedSong = await localforage.getItem("taggedSong") || [];
      for (let i = 0; i < this.songlist.length; i++) {
        let song = this.songlist[i];
        let existSong = taggedSong.find(e => e.songId === song.id);
        if (existSong) {
          // 如果歌曲已经存在tag，则添加tag后去重
          existSong.tagName = Array.from(new Set([...existSong.tagName, ...tagName]));
        } else {
          // 如果歌曲不存在tag，新增对象
          taggedSong.push({
            songId: song.id,
            name: song.name,
            artist: song.ar.map(artist => artist.name).join(' / '),
            album: song.al.name,
            tagName: tagName
          })
        }
      }
      await localforage.setItem("taggedSong", taggedSong);
      this.taggedSong = taggedSong;
      this.status.updateTagInput = new Date().getTime(); // 通知所有 tagInput 组件更新数据
      this.updateTagFromTaggedSong() // 重新统计 tag 的引用次数
    },
    // 批量给当前展示歌单删除 tag
    // tagName: string[]
    async batchRemoveTag(tagName = []) {
      if (!this.songlist.length || !tagName.length) {
        console.warn('batchSetTag: this.songlist and tagName are required')
        return false;
      }
      let taggedSong = await localforage.getItem("taggedSong") || [];
      for (let i = 0; i < this.songlist.length; i++) {
        let song = this.songlist[i];
        let existSong = taggedSong.find(e => e.songId === song.id);
        if (existSong) {
          // 如果歌曲已经存在tag，则删除tag后去重
          existSong.tagName = existSong.tagName.filter(tag => tagName.indexOf(tag) === -1);
        }
      }
      await localforage.setItem("taggedSong", taggedSong);
      this.taggedSong = taggedSong;
      this.status.updateTagInput = new Date().getTime(); // 通知所有 tagInput 组件更新数据
      this.updateTagFromTaggedSong() // 重新统计 tag 的引用次数
    },
    // 创建歌单
    async createPlaylist(name, songIds = []) {
      if (!name || !songIds.length) return false;
      const playlist = await api.getRemote("/playlist/create", { name });
      const res = await api.getRemote("/playlist/tracks", {
        op: "add",
        pid: playlist.id,
        tracks: songIds.join(',')
      })
      return res;
    },
    toggleRemoveTagOnBlur() {
      this.removeTagOnBlur = !this.removeTagOnBlur;
      return this.removeTagOnBlur
    }
  },
});
