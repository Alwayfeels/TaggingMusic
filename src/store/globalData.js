import { defineStore } from "pinia";
import api from '@/api/http'
import localforage from 'localforage';

// 整个应用的数据中心
export const useGlobalData = defineStore("globalData", {
  state: () => {
    return {
      songlist: [], // 歌单列表
      songlistDetail: [], // 歌单歌曲数据
      userInfo: {}, // 用户信息
      tagList: [], // 标签列表
      taggedSongs: [], // 已标记的歌曲列表
    };
  },
  getters: {
  },
  actions: {
    // 获取远端用户信息
    async getRemoteUserInfo() {
      const res = await api.get('login/status');
      if (res.data?.profile) {
        let profile = res.data.profile;
        let account = res.data.account
        localforage.setItem('profile', profile)
        localforage.setItem('account', account)
        return { profile, account }
      }
      console.error('getRemoteUserInfo error')
      return false
    },
    // 获取远端歌单列表
    getRemoteSonglist() {

    },
    // 获取远端歌单详情
    getRemoteSonglistDetail() {

    },
  },
});
