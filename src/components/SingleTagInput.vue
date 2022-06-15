<template>
  <n-auto-complete size="small" ref="singleTagInput" v-model:value="state.inputValue" v-model:options="state.activeTags"
    :get-show="() => true" placeholder="请输入" @keypress.enter.prevent="enterHandler" @keydown.tab.prevent="tabHandler"
    @keydown.esc.prevent="onBlur" :on-blur="blurHandler" />
</template>

<script setup>
import localforage from "localforage";
import { NAutoComplete } from "naive-ui";
import {
  ref,
  computed,
  watch,
  nextTick,
  reactive,
} from "vue";
import { useGlobalData } from '@/store/globalData';
// 全局数据中心
const globalData = useGlobalData()
const emit = defineEmits(["change", "blur", "pressTab"]);

// 该组件应该是一个存粹的无状态输入组件
// 根据 globalData.tagList 中的数据联想
const singleTagInput = ref(null);

let state = reactive({
  inputValue: null,
  tagList: computed(() => {
    return globalData.tagList.map(e => ({ label: e.tagName, value: e.tagName }))
  }),
  activeTags: computed(() => {
    if (state.inputValue) {
      return state.tagList.filter(e => e.label.includes(state.inputValue))
    }
    return state.tagList
  }),
})

// 加载时 focus, 并展示所有 tag 供选择
watch(singleTagInput, (el) => {
  if (el)
    nextTick(() => {
      el.focus();
    });
});
// 键盘输入处理
function enterHandler(e) {
  emit("change", state.inputValue);
}
function tabHandler() {
  emit("pressTab", state.inputValue);
}
function blurHandler() {
  emit("blur", state.inputValue);
}
function onBlur() {
  singleTagInput.value.blur()
}
</script>