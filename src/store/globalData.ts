import { defineStore } from "pinia";
import musicApi from '@/api/musicApi'
import storeApi from '@/api/storeApi'
import localforage from "localforage";
import { computed, toRaw } from "vue";
import { FlashSettings20Filled } from "@vicons/fluent";
import type { GlobalData, UserInfo, Song, TagRef, TaggedSong } from "@/store/types";
import { useGlobalState } from "@/store/globalState";
import app from '@/main'

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
      console.log('tagArray', tagArray);
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
     * @includes user, playlist, taggedSongs 属性
     */
    async init() {
      this.initTaggedSongs()
      await this.initUserInfo(true)
      if (this.user.account?.id) {
        await this.initPlaylist()
      }
    },
    /** 
     * @desc 初始化用户信息
     */
    async initUserInfo(force = false) {
      let profile, account = null
      if (!force) {
        [profile, account] = await Promise.all([localforage.getItem("profile"), localforage.getItem("account")]);
        if (profile && account) {
          const userInfo: UserInfo = { profile, account };
          this.user = userInfo;
          return userInfo;
        }
      }
      const res = await musicApi.get("login/status");
      // API Call
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
     * @desc 注销登录
     */
    async logout() {
      await musicApi.get("logout")
    },
    /** 
     * @desc 初始化已标记歌曲信息
     */
    async initTaggedSongs(): Promise<TaggedSong[]> {
      const taggedSongs: TaggedSong[] = await localforage.getItem("taggedSongs") || [];
      if (taggedSongs) {
        this.taggedSongs = taggedSongs;
      }
      return taggedSongs
    },
    /** 
     * @desc 保存 taggedSongs 到 indexedDB
     */
    setTaggedSongs(taggedSongs?: TaggedSong[]) {
      localforage.setItem("taggedSongs", toRaw(taggedSongs || this.taggedSongs));
    },
    /** 
     * @desc 保存 传入的 tags，到指定的 taggedSongs[id].tags 中
     * @cond 若无匹配的 id 或没有传入 id, 则创建新的 taggedSong 并初始化
     */
    setTagsInTaggedSongs(id: number, tags: string[], song?: Song): void {
      const existSong = this.taggedSongs.find(e => e.id === id)
      if (existSong) {
        existSong.tags = tags
        this.setTaggedSongs()
        return;
      }
      if (song) {
        // 新建 taggedSong 并初始化 tags
        this.taggedSongs.push({ tags, ...toRaw(song) })
        this.setTaggedSongs()
        return;
      }
      console.error('setTagsInTaggedSongs error: params is unvalid')
    },
    /** 
     * @desc 初始化用户所有歌单
     */
    async initPlaylist(force = false) {
      let playlist = null
      if (!force) {
        playlist = await localforage.getItem("playlist");
        if (playlist) {
          this.playlist = playlist
          return playlist
        }
      }
      if (!this.user.account.id) {
        console.warn('initPlaylist error: 用户id不存在')
        return false
      }
      // API Call
      const res = await musicApi.get("/user/playlist", {
        uid: this.user.account.id,
      });
      playlist = res.playlist
      this.playlist = playlist;
      localforage.setItem('playlist', playlist);
      return playlist
    },
    /** 
     * @desc 获取目标歌单所有歌曲
     * @tips 获取歌单接口单次最高获取 1000 首，否则会报错
     * @params id: 歌单id
     * @params force: 是否不使用本地存储直接调用接口
     * @params setStore: 是否将歌曲列表存入globalData
     * @params songNumber: 获取的歌曲数量, 大于1000将拆分请求
     */
    async getSonglist(id: number | null, songNum = 1000, force = false, setStore = true) {
      if (!id) return false
      useGlobalState().songlist.isLoading = true
      let songlist: Song[]
      if (!force) {
        songlist = await localforage.getItem(`songlist_${id}`) || [];
        if (songlist.length) {
          this.songlist = songlist
          useGlobalState().songlist.isLoading = false
          return songlist
        }
      }
      // API Call
      const requests = []
      for (let offset = 0; offset < songNum; offset += 1000) {
        requests.push(musicApi.get("/playlist/track/all", { id, limit: 1000, offset }))
      }
      const responses = await Promise.all(requests)
      songlist = []
      responses.forEach(res => {
        const songs = res?.songs || []
        songlist.push(...songs)
      })
      // // 过滤不需要的属性
      songlist = songlist.map(item => ({
        id: item.id,
        name: item.name,
        ar: item.ar,
        al: item.al,
        fee: item.fee,
      }))
      localforage.setItem(`songlist_${id}`, songlist);
      if (setStore) {
        this.songlist = songlist;
        useGlobalState().songlist.data = songlist
      }
      useGlobalState().songlist.isLoading = false
      return songlist
    },
    /** 
     * @desc 获取歌曲详情和url
     */
    async getSongUrl(song: Song, force = false) {
      if (!song.id) return;
      if (song.url && !force) return;
      const detail = await musicApi.get('/song/url', { id: song.id, br: 320000 });
      if (detail?.data[0]?.url) {
        const url = detail.data[0].url;
        return url
      }
      return false
    },
    /**
     * =============================== Store ==================================
     * @desc: 埋点
     * @params: {any}
     */
    async point(data: any) {
      await storeApi.post('/store', data);
    },
    /**
     * @desc: 页面被访问
     */
    async welcome() {
      await storeApi.get('/store/welcome')
    },
    /**
     * @desc 上传 Tags
     */
    async uploadTaggedSong() {
      const taggedSongs: TaggedSong[] = await localforage.getItem("taggedSongs") || [];
      const data = {
        taggedSongs,
        userId: this.user.profile.userId,
        profile: this.user.profile
      }
      const res = await storeApi.post('/store/postTaggedSongs', data)
      return res
    },
    /**
     * @desc 下载 Tags
     */
    async downloadTaggedSongs() {
      const userId = this.user.account.id;
      if (!userId) return false;
      const res = await storeApi.get('/store/getTaggedSongs', { userId })
      if (res.code === 200) {
        const remoteSongs = res.data.taggedSongs;

        // merge remote and local tags
        const sumSongs = [...remoteSongs, ...toRaw(this.taggedSongs)];
        for (let i = 0; i < sumSongs.length; i++) {
          const row = sumSongs[i];
          if (row === null) continue;

          // compare all next row.id is same or not
          for (let j = i + 1; j < sumSongs.length; j++) {
            const checkRow = sumSongs[j]

            // is same, merge tags and clear it
            if (checkRow && checkRow.id === row.id) {
              row.tags.push(...checkRow.tags)
              sumSongs[j] = null;
            }
          }

          // remove duplicate
          row.tags = Array.from(new Set([...row.tags]))
        }
        const newTaggedSongs = sumSongs.filter(e => e !== null)

        // save tags
        this.taggedSongs = newTaggedSongs;
        localforage.setItem('taggedSongs', newTaggedSongs)

        app?.config?.globalProperties?.$notification?.create({
          type: 'success',
          title: '加载完成！',
          duration: 3000
        })
      }
    },
    /**
     * @desc 导出TaggedSong
     */
    async exportTaggedSong() {
      const exportTaggedSong = await localforage.getItem("taggedSong");
      if (exportTaggedSong === null) {
        app?.config?.globalProperties?.$notification?.create({
          type: 'warning',
          title: "失败",
          content: '当前没有任何带有标签的歌曲',
          duration: 3000
        })
        return false;
      }
      const link = document.createElement("a");
      link.download = "标签歌曲数据.json";
      link.href = "data:text/plain," + JSON.stringify(exportTaggedSong);
      link.click();
      app?.config?.globalProperties?.$notification?.create({
        type: 'success',
        title: "成功",
        content: '导出完成！',
        duration: 3000
      })
    },
    /**
     * @desc 导入TaggedSong
     */
    async importTaggedSong() {
      const _this = this;
      return new Promise((resolve, reject) => {
        // 创建一个file input
        let input = document.createElement("input");
        // 绑定onchange事件
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
          const file = e.target?.files[0];
          if (!file) {
            input = null;
            reject('file is null')
          }
          // 当选择文件后，使用FileReader API读取文件，返回数据
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = (e) => {
            const data = JSON.parse(e.target?.result as string);
            localforage.setItem("taggedSong", data);
            _this.taggedSong = data;
            app?.config?.globalProperties?.$notification?.create({
              type: 'success',
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
  }
})

