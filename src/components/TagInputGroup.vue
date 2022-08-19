<template>
  <NDynamicTags ref="dynamicTags" v-model:value="state.tagInputVal" @mousedown.self="onClickHandler" @click.stop=""
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

const emits = defineEmits(['update:value', 'change'])

const dynamicTags = ref()
interface TagInputGroupState {
  tagInputVal: any[],
}
const state: TagInputGroupState = reactive({
  tagInputVal: [],
})

// 监听 songId 初始化 tagInputVal
watch(() => props.songId, async (propSongId) => {
  if (!propSongId) return;
  const taggedSong = globalData.taggedSongs?.find(song => song.id === propSongId)
  if (taggedSong) {
    state.tagInputVal = [...taggedSong.tags]
  } else {
    state.tagInputVal = []
  }
}, {
  immediate: true
})

/** 
 * @desc 标签 change 事件处理
 */
function onTagsChange(newVal: string[]) {
  // 重复值不生效
  // if (newVal.length !== Array.from(new Set(newVal)).length) {
  //   return;
  // }
  if (props.inputOnly) {
    emits('update:value', newVal);
    return;
  }
  if (newVal.length < state.tagInputVal.length) {
    // need remove tag
    const needRemoveTags = state.tagInputVal.filter(x => {
      return !newVal.includes(x)
    })
    removeTag(needRemoveTags)
  }
  state.tagInputVal = newVal
  emits('change', newVal);
}

/** 
 * @desc enter 按键事件处理
 */
function onEnterHandler(tag: string, submit: any, deactivate: any) {
  // tag = tag.trim()
  tag ? submit(tag) : deactivate();
  if (!props.inputOnly) {
    insertTag(tag);
  }
}

/** 
 * @desc tab 按键事件处理
 */
function onTabHandler(tag: string, submit: any, deactivate: any) {
  // when you press tab, save and open next <tagInput>
  // tag = tag.trim()
  if (!tag) return false;
  tag ? submit(tag) : deactivate();
  if (!props.inputOnly) {
    insertTag(tag);
  }
  // focus 下一个 tagInput
  setTimeout(() => {
    dynamicTags.value.showInput = true
  }, 0);
}

/** 
 * @desc 组件点击事件处理
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

/** 
 * @desc 插入标签到 globalData.taggedSongs[?].tags , 同步至 indexedDb
 */
async function insertTag(tagName: string) {
  if (typeof tagName !== "string") {
    console.error("insertTag(): tagName must be string", tagName)
    return false;
  }
  const taggedSongs = globalData.taggedSongs || [];
  // tag 插入的目标歌曲 id
  const songId = props.songId;
  const songIndex: number = taggedSongs.findIndex((e) => e.id === songId);

  // 目标 TaggedSong 已经存在，则更新 tags， 否则初始化
  if (songIndex >= 0) {
    taggedSongs[songIndex].tags.push(tagName);
  } else {
    // 使用 toRaw 函数将 reactive 对象转换为原始对象, 防止内部引用对象被转换为 proxy 对象
    const newTaggedSong = {
      ...toRaw(props.song),
      tags: [tagName]
    }
    taggedSongs.push(newTaggedSong)
  }
  nextTick(() => globalData.saveTaggedSongs())
}

/** 
 * @desc 删除标签到 globalData.taggedSongs[?].tags , 同步至 indexedDb
 */
function removeTag(tags: string[]) {
  const taggedSongs = globalData.taggedSongs || [];
  const songId = props.songId;
  const updateSong = taggedSongs.find((e) => e.id === songId);
  if (updateSong) {
    updateSong.tags = updateSong.tags.filter(tag => !tags.includes(tag));
    nextTick(() => globalData.saveTaggedSongs())
  }
}
</script>