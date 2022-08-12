import { defineStore } from 'pinia'
import { computed } from 'vue'
// import {useGlobalData} from './globalData'

/** 
 * @desc 全局状态
 * @tips 应用中所有的状态存储
 */
export const useGlobalState = defineStore({
  id: 'globalState',
  state: () => ({
    user: {
      isLogin: false
      // isLogin: computed(() => Boolean(useGlobalData().user.account))
    },
    topBar: {
      show: false,
      showSearch: true
    },
    playlist: {
      show: true,
      loading: false,
      data: [],
      active: null
    },
    songlist: {
      show: true,
      loading: false,
      data: [],
      active: null
    },
    player: {
      show: false,
      playlist: []
    }
  }),
  getters: {
    // doubleCount: (state) => state.counter * 2
  },
  actions: {
    // increment() {
    //   this.counter++
    // }
  }
})
