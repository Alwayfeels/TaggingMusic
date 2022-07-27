<template>
  <div class="w-full">
    <n-progress type="line" :percentage="progress.percentage" :indicator-placement="'inside'"
      :processing="progress.percentage < 100" :status="progress.status" />
    <div class="text-center transition-all" :class="progress.tips.class">
      {{ progress.tips.ctx }}</div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, h, onMounted } from 'vue'
import { NProgress } from 'naive-ui';

const progress = reactive({
  percentage: 0,
  tips: {
    ctx: '正在启动任务...',
    type: 'info', // success, info, warning, error
    class: computed(() => {
      if (progress.tips.type === 'success') {
        return 'text-green-600'
      } else if (progress.tips.type === 'error') {
        return 'text-red-500'
      } else {
        return ''
      }
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
  taskList: [
    // { name: 'step1', percentage: 10, isDone: false, isError: false },
    // { name: 'step2', percentage: 20, isDone: false, isError: false },
    // { name: 'step3', percentage: 30, isDone: false, isError: false },
    // { name: 'step4', percentage: 40, isDone: false, isError: false }
  ],
})

// onMounted(() => {
//   mainProgress();
// })

const mockPromise = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

// const mainProgress = async () => {
//   const step1 = await mockPromise(1000);
//   setProgressDone('step1')
//   const step2 = await mockPromise(2000);
//   setProgressDone('step2')
//   const step3 = await mockPromise(1000);
//   setProgressError('step3')
//   return false;
//   const step4 = await mockPromise(2000);
//   setProgressDone('step4')
// }

// Interface TaskList {
//   name: string;
//   percentage: number <= 100;
// }
const setProgressTask = (taskList) => {
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
const setProgressDone = (name) => {
  let progressItem = progress.taskList.find(e => e.name === name)
  if (progressItem) {
    progressItem.isDone = true
    progress.percentage += progressItem.percentage
    progress.tips.ctx = `已完成 ${name}`
    progress.tips.type = 'success'
  } else {
    console.error(`setProgressDone: ${name} task 不存在`)
  }
}

// 设置任务错误
const setProgressError = (name) => {
  let progressItem = progress.taskList.find(e => e.name === name)
  if (progressItem) {
    progressItem.isError = true
    progress.tips.ctx = `执行 ${name} 时出错了😭`
    progress.tips.type = 'error'
  } else {
    console.error(`setProgressError: ${name} task 不存在`)
  }
}
</script>
