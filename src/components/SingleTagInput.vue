<template>
  <n-auto-complete size="small" ref="singleTagInput" v-model:value="state.inputValue" v-model:options="state.activeTags"
    placeholder="请输入" @keypress.enter.prevent="enterHandler" @keydown.tab.prevent="tabHandler" :on-blur="blurHandler" />
</template>

<script setup>
import localforage from "localforage";
import { NAutoComplete } from "naive-ui";
import {
  ref,
  onMounted,
  watch,
  nextTick,
  reactive,
} from "vue";
const emit = defineEmits(["change", "blur", "pressTab"]);

// 该组件应该是一个存粹的无状态输入组件
// 根据 indexedDB.tag 中的数据联想
const singleTagInput = ref(null);
let state = reactive({
  tag: [],
  activeTags: [],
  inputValue: null
})

onMounted(() => {
  initTag()
})

// 初始化输入联想的tag
function initTag() {
  localforage.getItem('tag').then(data => {
    state.tag = data?.map(e => ({ label: e.tagName, value: e.tagName }))
    state.activeTags = state.tag
  })
}

// input输入处理
watch(state.inputValue, (inputVal) => {
  state.activeTags = state.tag.filter((e) => {
    return e.label && e.label.includes(inputVal);
  });
});
// 加载时 focus
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
</script>