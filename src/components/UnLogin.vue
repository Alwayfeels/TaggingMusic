<template>
  <div class="w-full h-full flex justify-center" v-menus:right="menus">
    <h1 class="text-2xl text-gray-400 mt-60">尚未登录，请点击右上角登录按钮登录</h1>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, shallowRef } from "vue";
import { directive } from 'vue3-menus';
import { useGlobalData } from '@/store/globalData';

const globalData = useGlobalData()

const menus = shallowRef({
  menus: [
    // 菜单使用示例：https://github.com/xfy520/vue3-menus
    {
      label: "刷新登陆状态",
      tip: '',
      click: () => {
        globalData.refreshLoginStatus()
      }
    }
  ]
})
</script>