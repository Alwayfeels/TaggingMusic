<template>
  <div class="view-container  w-full mt-2 ml-10">
    <p>这里是一个介绍页，在做了在做了</p>
    <p>使用方法：登录 -> 查看歌单 -> 点击播放音乐 -> 记录你的tag -> 右上角点击生成歌单</p>
  </div>
</template>

<script setup>
import playMusicBar from '@/components/PlayMusicBar.vue';
import { reactive } from 'vue';

const state = reactive({
  activeKey: null,
  collapsed: true,
})
</script>

<style lang="scss" scoped>
</style>