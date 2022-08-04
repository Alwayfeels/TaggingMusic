<template>
  <div class="home">
    <div style="width: 400px; margin: 20px">
      恭喜你找到了一个测试页面
    </div>
    <n-button @click="restart">reStart</n-button>
    <div class="w-96">
      <n-progress type="line" :percentage="progress.percentage" :indicator-placement="'inside'"
        :processing="progress.percentage < 100" :status="progress.status" />
      <div class="text-center transition-all" :class="progress.tips.class">
        {{ progress.tips.ctx }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch, h, onMounted } from 'vue'
import { NProgress, NButton } from 'naive-ui';
// import { useProgress } from '@/store/progress';

// const progress = useProgress()

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
    if (progress.taskList.find(e => e.status === 'error')) {
      return 'error'
    } else if (progress.percentage >= 100) {
      return 'success'
    } else {
      return 'default'
    }
  }),
  taskList: [
    { name: 'step1', percentage: 10, status: false },
    { name: 'step2', percentage: 20, status: false },
    { name: 'step3', percentage: 30, status: false },
    { name: 'step4', percentage: 40, status: false },
  ],
})

onMounted(() => {
  mainProgress();
})

const mockPromise = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const mainProgress = async () => {
  const step1 = await mockPromise(1000);
  setProgressDone('step1')
  const step2 = await mockPromise(2000);
  setProgressDone('step2')
  const step3 = await mockPromise(1000);
  setProgressError('step3')
  return false;
  const step4 = await mockPromise(2000);
  setProgressDone('step4')
}

const setProgressDone = (name) => {
  let progressItem = progress.taskList.find(e => e.name === name)
  if (progressItem) {
    progressItem.status = 'done'
    progress.percentage += progressItem.percentage
    progress.tips.ctx = `已完成 ${name}`
    progress.tips.type = 'success'
  } else {
    console.error(`setProgressDone: ${name} task 不存在`)
  }
}

const setProgressError = (name) => {
  let progressItem = progress.taskList.find(e => e.name === name)
  if (progressItem) {
    progressItem.status = 'error'
    progress.tips.ctx = `执行 ${name} 时出错了😭`
    progress.tips.type = 'error'
  } else {
    console.error(`setProgressError: ${name} task 不存在`)
  }
}
</script>
