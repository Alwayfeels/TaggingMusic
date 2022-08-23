<template>
  <NDynamicTags ref="dynamicTags" v-model:value="state.val" @mousedown.self="onClickHandler" @click.stop=""
    :on-update:value="onTagsChange">
    <template #input="{ submit, deactivate }">
      <TagInput @pressEnter="onEnterHandler($event, submit, deactivate)"
        @pressTab="onTabHandler($event, submit, deactivate)" @blur="onBlurHandler($event, submit, deactivate)">
      </TagInput>
    </template>
    <template #trigger="{ activate, disabled }">
      <n-button size="small" type="primary" dashed :disabled="disabled" @click.stop="activate()">
        添加
      </n-button>
    </template>
  </NDynamicTags>
</template>

<script setup lang="ts">
import { NDynamicTags, NSelect, NButton } from "naive-ui";
import { ref, h, computed, nextTick, watch, reactive, toRaw } from "vue";
import type { Ref } from 'vue'
import TagInput from "@/components/TagInput.vue";
import { useGlobalData } from '@/store/globalData';
import type { Song, TaggedSong } from "@/store/types";
// 全局数据中心
const globalData = useGlobalData()

const props = defineProps({
  // 是否仅仅作为input使用，不储存至indexDb
  inputOnly: {
    type: Boolean,
    default: false,
  },
  value: Array, // 父组件 v-model 的值
  songId: Number, // 根据歌曲 id 初始化标签
  song: Object // 歌曲信息
});

interface State {
  val: string[]
}
const state: State = reactive({
  val: []
})

const emits = defineEmits(['update:value', 'change'])

const dynamicTags = ref()

// 监听 songId 初始化 state.val
watch(() => props.songId, async (propSongId) => {
  if (!propSongId) return;
  const taggedSong = globalData.taggedSongs?.find(song => song.id === props.songId)
  if (taggedSong) {
    state.val = [...taggedSong.tags]
  } else {
    state.val = []
  }
}, {
  immediate: true
})

// 监听 globalData.setTagsInTaggedSongs 更新组件 value
globalData.$onAction(
  ({ name, store, args, after, onError }) => {
    after(() => {
      if (name === 'setTagsInTaggedSongs' && args[0] === props.songId) {
        state.val = store.taggedSongs.find(e => e.id === props.songId)?.tags || []
      }
    })
  }
)

/** 
 * @desc 标签 change 事件处理
 */
function onTagsChange(newVal: string[]) {
  // 重复值不生效
  if (newVal.length !== Array.from(new Set(newVal)).length) {
    return;
  }
  if (props.inputOnly) {
    emits('update:value', newVal);
    return;
  }
  globalData.setTagsInTaggedSongs(props.songId as number, newVal, props.song)
  emits('change', newVal);
  state.val = newVal
}

/** 
 * @desc enter 按键事件处理
 */
function onEnterHandler(tag: string, submit: any, deactivate: any) {
  // tag = tag.trim()
  tag ? submit(tag) : deactivate();
}

/** 
 * @desc tab 按键事件处理
 */
function onTabHandler(tag: string, submit: any, deactivate: any) {
  // when you press tab, save and open next <tagInput>
  // tag = tag.trim()
  if (!tag) return false;
  tag ? submit(tag) : deactivate();
  // focus next <tagInput>
  setTimeout(() => {
    dynamicTags.value.showInput = true
  }, 0);
}

/** 
 * @desc click 点击事件处理
 */
function onClickHandler() {
  if (dynamicTags.value.showInput) return false
  setTimeout(() => {
    dynamicTags.value.showInput = !dynamicTags.value.showInput
  }, 0);
}

/** 
 * @desc blur 失焦事件处理
 */
function onBlurHandler($event: string, submit: any, deactivate: any) {
  // if (globalData.appConfig.removeTagOnBlur) {
  deactivate()
  //   return;
  // }
  // onEnterHandler($event, submit, deactivate)
}

</script>