<template>
  <div v-show="progress.isShow" class="w-full">
    <n-progress type="line" :percentage="progress.percentage" :indicator-placement="'inside'"
      :processing="progress.percentage < 100" :status="progress.status" />
    <div class="text-center transition-all" :class="progress.tips.class">
      {{ progress.tips.ctx }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, h, onMounted, defineExpose } from 'vue'
import { NProgress } from 'naive-ui';

defineExpose({
  setProgressTask,
  setProgressDone,
  setProgressError
})

const TIP_CLASS_MAP = {
  success: 'text-green-600',
  error: 'text-red-500'
}
const progress = reactive({
  percentage: 0,
  isShow: false,
  isError: false,
  tips: {
    ctx: '正在启动任务...',
    type: 'info', // success | error
    class: computed(() => {
      return TIP_CLASS_MAP[progress.tips.type] || '';
    })
  },
  status: computed(() => {
    if (progress.taskList.find(e => e.error)) {
      return 'error'
    } else if (progress.percentage >= 100) {
      return 'success'
    } else {
      return 'default'
    }
  }),
  taskList: [],
})

const mockPromise = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

function resetProgress() {
  progress.percentage = 0
  progress.isError = false
  progress.tips.ctx = '正在启动任务...'
  progress.tips.type = 'info'
  progress.taskList = []
}

function hideProgress() {
  progress.isShow = false
  resetProgress()
}

function showProgress() {
  progress.isShow = true
}

// Interface TaskList {
//   name: string;
//   percentage: number <= 100;
// }
function setProgressTask(taskList) {
  // 如果 taskList有没有 percentage 属性的元素，则均分设置
  let noPercentItem = taskList.filter(e => !e.percentage)
  if (noPercentItem.length > 0) {
    const remain = 100 - taskList.reduce((acc, e) => acc + (e.percentage || 0), 0)
    if (remain >= 0) {
      taskList.forEach(e => {
        if (e.percentage === undefined) {
          e.percentage = remain / noPercentItem.length
        }
      })
    }
  }
  taskList.forEach(e => {
    e.isDone = false
    e.isError = false
  })
  progress.taskList = taskList
}

// 设置任务完成
function setProgressDone(name) {
  if (progress.isError) return false;
  let progressItem = progress.taskList.find(e => e.name === name)
  if (progressItem) {
    progressItem.isDone = true
    let percentage = Math.round((progress.percentage + progressItem.percentage) * 10) / 10
    progress.percentage = percentage > 100 ? 100 : percentage
    progress.tips.ctx = `已完成 ${name}`
    progress.tips.type = 'success'
  } else {
    console.error(`setProgressDone: ${name} task 不存在`)
  }
}

// 设置任务错误
function setProgressError(name) {
  let progressItem = progress.taskList.find(e => e.name === name)
  if (progressItem) {
    progressItem.isError = true
    progress.isError = true
    progress.tips.ctx = `执行 ${name} 时出错了😭`
    progress.tips.type = 'error'
  } else {
    console.error(`setProgressError: ${name} task 不存在`)
  }
}

</script>
