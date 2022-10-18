<template>
  <NDynamicTags ref="dynamicTags" v-model:value="state.val" :on-update:value="onTagsChange">
    <template #input="{ submit, deactivate }">
      <TagInput @pressEnter="onEnterHandler($event, submit, deactivate)" @pressTab="onTabHandler(submit, deactivate)"
        @blur="onBlurHandler($event, submit, deactivate)"
        @pressCtrlEnter="onCtrlEnterHandler($event, submit, deactivate)"
        @pressShiftTab="onShiftTabHandler($event, submit, deactivate)">
      </TagInput>
    </template>
    <template #trigger="{ activate, disabled }">
      <n-button size="small" type="primary" dashed :disabled="disabled" @click.stop="onAddBtnClick(activate)">
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
import { useGlobalState } from '@/store/globalState';
import type { Song, TaggedSong } from "@/store/types";
// 全局数据中心
const globalData = useGlobalData()
const globalState = useGlobalState()

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
  const taggedSongs = globalData.taggedSongs?.find(song => song.id === props.songId)
  if (taggedSongs) {
    state.val = [...taggedSongs.tags]
  } else {
    state.val = []
  }
}, {
  immediate: true
})

// 监听 activeTagInputSongId 初始化 tagInput focus 状态
watch(() => globalState.songlist.activeTagInputSong, (activeTagInputSong) => {
  if (activeTagInputSong?.id === null) return
  if (activeTagInputSong?.id === props.songId) {
    focusTagInputGroup()
  }
})

// 监听 globalData.setTagsInTaggedSongs 更新组件初始值 default value
globalData.$onAction(
  ({ name, store, args, after, onError }) => {
    after(() => {
      const isTagsSettled = name === 'setTagsInTaggedSongs' && args[0] === props.songId
      const isTagsDownload = name === 'downloadTaggedSongs'
      const isTagImport = name === 'importTaggedSong'
      if (isTagsSettled || isTagsDownload || isTagImport) {
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
  // when you press enter, save and activating next <tagInput>
  if (!tag) return false;
  tag ? submit(tag) : deactivate();
  // focus next <tagInput>
  focusTagInputGroup()
}

/** 
 * @desc tab 按键事件处理
 */
function onTabHandler(submit: any, deactivate: any) {
  // when you press tab, activating <tagInput> in next row
  // return directly if this is the last song
  // if (globalState.activeSongIdx + 1 >= globalState.songlist.data.length) return false;
  if (globalState.songlist.activeTagInputSong === null) return;
  // focus <tagInput> in next row
  focusNextTagInput()
}

/**
 * @desc: Shift + tab 事件处理
 */
function onShiftTabHandler(tag: string, submit: any, deactivate: any) {
  // return directly if this is the first song
  // if (globalState.activeSongIdx <= 0) return false;
  if (globalState.songlist.activeTagInputSong === null) return;
  // focus <tagInput> in prev row
  focusPrevTagInput()
}

/**
 * @desc: ctrl + enter 按键事件处理
 */
function onCtrlEnterHandler(tag: string, submit: any, deactivate: any) {
  // when you press ctrl + enter, save tags and activating <tagInput> in next row
  tag ? submit(tag) : deactivate();
  // return directly if this is the last song
  if (globalState.activeSongIdx + 1 >= globalState.songlist.data.length) return false;
  if (globalState.songlist.activeTagInputSong === null) return;
  // focus next <tagInput> in next row
  focusNextTagInput()
}

/**
 * @desc: focus tagInput on NextSong
 * @desc: 激活当前焦点下一行的 tagInput
 */
function focusNextTagInput() {
  const tagInputActiveIdx = globalState.songlist.data.findIndex(e => e.id === globalState.songlist.activeTagInputSong?.id)
  const nextSong = globalState.songlist.data[tagInputActiveIdx + 1];
  globalState.songlist.activeTagInputSong = nextSong || null;
}

/**
 * @desc: focus tagInput on PrevSong
 * @desc: 激活当前焦点上一行的 tagInput
 */
function focusPrevTagInput() {
  const tagInputActiveIdx = globalState.songlist.data.findIndex(e => e.id === globalState.songlist.activeTagInputSong?.id)
  const prevSong = globalState.songlist.data[tagInputActiveIdx - 1];
  globalState.songlist.activeTagInputSong = prevSong || null;
}

/** 
 * @desc 组件空白处（非 add 按钮）被点击事件处理，激活 tagInput
 */
function onTagGroupClick() {
  focusTagInputGroup()
}
/**
 * @desc: 点击 add 按钮事件处理, 激活 tagInput
 */
function onAddBtnClick(activate: any) {
  setActiveTagInputSong()
  activate()
}

/**
 * @desc: 设置 ActiveTagInputSong 为 props.songId 的 Song
 */
function setActiveTagInputSong() {
  // update globalState
  const activeTagInputSong = globalState.songlist.data.find(e => e.id === props.songId) ?? null;
  globalState.songlist.activeTagInputSong = activeTagInputSong;
}
/**
 * @desc: 激活 TagInput 状态 - create and focus <TagInput>
 * @desc: 同时存储激活Song数据
 */
function focusTagInputGroup() {
  if (dynamicTags.value.showInput) return false
  setActiveTagInputSong()
  setTimeout(() => {
    dynamicTags.value.showInput = !dynamicTags.value.showInput
  }, 0);
}

/** 
 * @desc blur 失焦事件处理
 */
function onBlurHandler($event: string, submit: any, deactivate: any) {
  deactivate()
  // if (globalData.appConfig.removeTagOnBlur) {
  //   deactivate()
  //   return;
  // }
  // onEnterHandler($event, submit, deactivate)
}

</script>