<template>
  <NAutoComplete size="small" ref="tagInput" v-model:value="state.val" v-model:options="state.activeTags"
    :get-show="() => true" placeholder="请输入Tag, 按下enter确认" @keyup.enter.prevent="onEnterHandler"
    @keydown.tab.exact="onTabHandler" @keydown.shift.tab="onShiftTabHandler" @keydown.esc.prevent="onEscHandler"
    @keyup.space.prevent="onSpaceHandler" @keyup.ctrl.enter.prevent="onCtrlEnterHandler" @keyup.ctrl.s.prevent="onEnterHandler"
    :on-blur="onBlurHandler" />
</template>

<script setup lang='ts'>
import { NAutoComplete } from "naive-ui";
import { ref, computed, watch, nextTick, reactive } from "vue";
import { useGlobalData } from '@/store/globalData';
import type { TagInputState, LabelValue, TagRef } from '@/store/types';

const globalData = useGlobalData()
const emit = defineEmits(["change", "blur", "pressTab", "pressEnter", "pressCtrlEnter", "pressShiftTab"]);

// 该组件应该是一个存粹的无状态输入组件

const state: TagInputState = reactive({
  val: '',
  tagList: computed(() => {
    return globalData.tagList?.map((e: TagRef) => ({ label: e.name, value: e.name })) || []
  }),
  activeTags: computed(() => {
    if (state.val) {
      return state.tagList?.filter((e: LabelValue) => e.label.includes(state.val)) || []
    }
    return state.tagList
  }),
})

// 根据 globalData.tagList 中的数据联想
const tagInput = ref();

// 组件加载完成时自动 focus
watch(tagInput, (el) => {
  if (el)
    nextTick(() => {
      el.focus();
    });
});

// 键盘输入处理
function onEnterHandler() {
  const val = state.val.trim()
  if (val) {
    emit("pressEnter", state.val);
  }
}
function onSpaceHandler() {
  onEnterHandler()
}
function onTabHandler() {
  emit("pressTab");
}
function onShiftTabHandler() {
  emit("pressShiftTab");
}
function onBlurHandler() {
  emit("blur", state.val);
}
function onEscHandler() {
  tagInput.value.blur()
}
function onCtrlEnterHandler() {
  const val = state.val.trim()
  if (val) {
    emit("pressCtrlEnter", state.val);
  } else {
    emit("pressTab");
  }
}
</script>