<template>
  <NAutoComplete size="small" ref="singleTagInput" v-model:value="state.val" v-model:options="state.activeTags"
    :get-show="() => true" placeholder="请输入Tag, 按下enter确认" @keypress.enter.prevent="onEnterHandler"
    @keydown.tab.prevent="onTabHandler" @keydown.esc.prevent="onEscHandler" :on-blur="onBlurHandler" />
</template>

<script setup lang='ts'>
import { NAutoComplete } from "naive-ui";
import { ref, computed, watch, nextTick, reactive } from "vue";
import { useGlobalData } from '@/store/globalData';
import type { TagInputState, LabelValue, Tag } from '@/store/types';

const globalData = useGlobalData()
const emit = defineEmits(["change", "blur", "pressTab", "pressEnter"]);

// 该组件应该是一个存粹的无状态输入组件

const state: TagInputState = reactive({
  val: '',
  tagList: computed(() => {
    return globalData.tagList?.map((e: Tag) => ({ label: e.name, value: e.name })) || []
  }),
  activeTags: computed(() => {
    if (state.val) {
      return state.tagList?.filter((e: LabelValue) => e.label.includes(state.val)) || []
    }
    return state.tagList
  }),
})

// 根据 globalData.tagList 中的数据联想
const singleTagInput = ref();

// 组件加载完成时自动 focus
watch(singleTagInput, (el) => {
  if (el)
    nextTick(() => {
      el.focus();
    });
});

// 键盘输入处理
function onEnterHandler() {
  emit("pressEnter", state.val);
}
function onTabHandler() {
  emit("pressTab", state.val);
}
function onBlurHandler() {
  emit("blur", state.val);
}
function onEscHandler() {
  singleTagInput.value.blur()
}
</script>