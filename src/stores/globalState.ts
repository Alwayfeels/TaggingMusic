import { defineStore } from 'pinia'

/** 
 * @desc 全局状态
 * 
 */
export const useGlobalState = defineStore({
  id: 'globalState',
  state: () => ({
    user: {
      isLogged: false
    },
    showTopBar: false,
    topBar: {
      showSearch: true
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
