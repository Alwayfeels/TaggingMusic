import { defineStore } from "pinia";

// progress 管理应用所有的 progress 的数据
export const useProgress = defineStore("progress", {
  state: () => {
    return {
      mergeProgerss: {
        percent: 0,
        tips: '',
        status: 'default', // default, error, success
      }
    }
  },
  getters: {},
  action: {
    setMergeProgress(percent, tips, status) {
      this.mergeProgerss.percent = percent;
      if (tips) {
        this.mergeProgerss.tips = tips;
      }
      if (status) {
        this.mergeProgerss.status = status;
      }
    }
  }
})