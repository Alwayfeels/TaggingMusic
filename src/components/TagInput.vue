<template>
  <NDynamicTags ref="dynamicTags" v-model:value="state.tagInputVal" @mousedown.stop="clickHandler" @click.stop
    :on-update:value="dynamicTagsChange">
    <template #input="{ submit, deactivate }">
      <single-tag-input @change="changeHandler($event, submit, deactivate)"
        @pressTab="tabHandler($event, submit, deactivate)" @blur="blurHandler(deactivate)"></single-tag-input>
    </template>
    <template #trigger="{ activate, disabled }">
      <n-button size="small" type="primary" dashed :disabled="disabled" @click.stop="activate()">
        添加
      </n-button>
    </template>
  </NDynamicTags>
</template>

<script setup>
import { NDynamicTags, NSelect, NButton } from "naive-ui";
import { ref, h, computed, nextTick, watch, reactive } from "vue";
import SingleTagInput from "@/components/SingleTagInput.vue";
import localforage from "localforage";
import { useGlobalData } from '@/store/globalData';
// 全局数据中心
const globalData = useGlobalData()

const props = defineProps({
  songId: Number,
  songInfo: Object,
});

const dynamicTags = ref(null)
const state = reactive({
  tagInputVal: [],
})

// 监听 songId 初始化 tagInputVal
watch(() => props.songId, async (songId) => {
  let existSong = globalData.taggedSong?.find(e => e.songId === songId)
  if (existSong) {
    state.tagInputVal = existSong.tagName.map(e => e)
  } else {
    state.tagInputVal = []
  }
}, {
  immediate: true
})

// taginput 事件处理
function dynamicTagsChange(newVal) {
  // remove tag
  if (newVal.length < state.tagInputVal.length) {
    let needRemoveTag = state.tagInputVal.filter(x => !newVal.includes(x))
    removeTag(needRemoveTag)
    removeTagInTaggedSong(needRemoveTag)
  }
  state.tagInputVal = newVal
}
// singleTagInput 事件处理
function changeHandler(tag, submit, deactivate) {
  tag ? submit(tag) : deactivate();
  insertTag(tag);
  insertTaggedSongs(tag)
}
function tabHandler(tag, submit, deactivate) {
  // when you press tab, save and open next <tagInput>
  if (!tag) return false;
  tag ? submit(tag) : deactivate();
  insertTag(tag);
  insertTaggedSongs(tag)
  // focus 下一个 tagInput
  setTimeout(() => {
    dynamicTags.value.showInput = true
  }, 0);
}

// 点击外部 关闭/开启 tagInput
function clickHandler() {
  if (dynamicTags.value.showInput) return false
  setTimeout(() => {
    dynamicTags.value.showInput = !dynamicTags.value.showInput
  }, 0);
}
function blurHandler(deactivate) {
  deactivate()
}

// 数据处理
// 将tag插入indexedDB.tag
async function insertTag(tagName) {
  if (typeof tagName !== "string") {
    throw error("insertTag(): tagName must be string")
  };
  let _tags = await localforage.getItem("tag")
  _tags = _tags || []

  let tagExist = _tags.findIndex((e) => e.tagName === tagName);
  if (tagExist >= 0) {
    _tags[tagExist].ref++;
  } else {
    _tags.push({ tagName, ref: 1 });
  }
  globalData.tagList = _tags
  localforage.setItem("tag", _tags);
}
// 将tag插入indexedDB.taggedSongs
const insertTaggedSongs = async (tagName) => {
  if (typeof tagName !== "string") {
    throw error("insertTaggedSongs(): tagName must be string")
  };
  let taggedSong = await localforage.getItem('taggedSong');
  taggedSong = taggedSong ? taggedSong : [];
  let songId = props.songId;
  // 判断该songId是否已经存在
  let songExist = taggedSong.findIndex((e) => e.songId === songId);
  // 若已存在，则将tagName添加到taggedSong中，否则添加新的taggedSong
  if (songExist >= 0) {
    taggedSong[songExist].tagName.push(tagName);
  } else {
    taggedSong.push({ songId, tagName: [tagName], ...props.songInfo });
  }
  globalData.taggedSong = taggedSong
  // 存入indexedDB
  localforage.setItem('taggedSong', taggedSong);
}

// 删除taggedSong中的tag
const removeTagInTaggedSong = async (tags) => {
  let taggedSong = await localforage.getItem('taggedSong');
  taggedSong = taggedSong || [];
  let songId = props.songId;
  let songExist = taggedSong.findIndex((e) => e.songId === songId);
  if (songExist >= 0) {
    taggedSong[songExist].tagName = taggedSong[songExist].tagName.filter(x => !tags.includes(x));
  }
  globalData.taggedSong = taggedSong
  localforage.setItem("taggedSong", taggedSong);
}

// 删除一个或多个tag
// tag: string|string[]
const removeTag = async (tags) => {
  if (typeof tags === 'string') {
    tags = [tags]
  }
  let local_tags = await localforage.getItem("tag")
  local_tags = local_tags || [];
  tags.forEach(tag => {
    let tagIndex = local_tags.findIndex((e) => e.tagName === tag);
    if (tagIndex >= 0) {
      let tagRef = local_tags[tagIndex].ref;
      if (tagRef > 1) {
        local_tags[tagIndex].ref--;
      } else {
        local_tags[tagIndex].ref = 0;
      }
    };
  })
  // 清除ref=0的tag
  local_tags = local_tags.filter((e) => e.ref > 0);
  globalData.tagList = local_tags
  localforage.setItem("tag", local_tags);
}
</script>