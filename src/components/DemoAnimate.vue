<template>
    <div class="scroll-wrapper" v-show="tagList.length" @click.right.prevent="">
        <div class="scroll-content row-moving">
            <div class="w-1/3 py-4" v-for="v in [1,2,3]" :key="v">
                <div class="row flex justify-around normal-row" :class="{'cross-row': rowIdx % 2=== 0}"
                    v-for="(rowIdx) in Array(tagRow).fill(null).map((e, index) => index)" :key="rowIdx">
                    <div class="px-6 py-2 mx-4 my-2 inline-block scroll-btn"
                        v-for="(item, index) in showTags.slice(rowIdx * tagsPerRow, (rowIdx+1) * tagsPerRow)"
                        :key="index" :class="{
                            'scroll-btn-selected': item.state === 'selected',
                            'scroll-btn-disabled': item.state === 'disabled',
                            'scroll-btn-required': item.state === 'required'
                        }" @click.exact="onTagClick(item.name, item.state)"
                        @click.right.exact.prevent="onTagRightClick(item.name, item.state)"
                        @click.ctrl.exact="onTagCtrlClick(item.name, item.state)">
                        <!-- {{`${item.name} (${item.ref})`}} -->
                        {{`${item.name}`}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NTag } from "naive-ui";
import { h, Transition, ref, onMounted, computed, watch, toRaw, reactive, nextTick } from "vue";
import { useGlobalData } from '@/store/globalData'
import storeApi from '@/api/storeApi'

const globalData = useGlobalData()

const emits = defineEmits(['change'])

// ================= 配置
const tagRow = 3;
const tagsPerRow = 5;

// 预览数据，tag
const tagList = ref<any[]>([])

// 换下一批 tags 展示
const showTagsSum = tagRow * tagsPerRow;
const showTagsIndex = reactive({
    start: 0,
    end: showTagsSum
});
// 单次显示的 tags 数目

// showTags.length should equal tagRow * tagsPerRow
const showTags = computed(() => {
    const { start, end } = showTagsIndex;
    const tagsSum = tagList.value.length
    if (end > start) {
        return tagList.value.slice(showTagsIndex.start, showTagsIndex.end) as any
    }
    return [...tagList.value.slice(showTagsIndex.start, tagsSum), ...tagList.value.slice(0, showTagsIndex.end)] as any
})

// 切换下一批标签
function changeDisplayTags() {
    const tagsSum = tagList.value.length
    if (showTagsSum >= tagsSum) return tagList.value;
    // need merge endItem and startItem
    if (showTagsIndex.end + showTagsSum >= tagsSum) {
        showTagsIndex.start = showTagsIndex.end;
        showTagsIndex.end = showTagsIndex.end + showTagsSum - tagsSum;
    } else {
        showTagsIndex.start = showTagsIndex.end;
        showTagsIndex.end = showTagsIndex.end + showTagsSum
    }
    console.log('showTags.value', showTags.value)
}

const taggedSongs = ref([])
onMounted(async () => {
    taggedSongs.value = await getPreviewData() || [];
    const tagArray = (taggedSongs.value.map((item: any) => item.tags) as any[]).flat()
    const tags: any[] = []
    tagArray.forEach((tag: string) => {
        const index = tags.findIndex(item => item.name === tag)
        if (index >= 0) {
            (tags[index].ref as number) += 1
        } else {
            tags.push({
                name: tag,
                ref: 1,
                state: null
            })
        }
    })
    tagList.value = tags
})

// data fetch
async function getPreviewData() {
    const res = await storeApi.get('/store/getPreviewData')
    if (res.code === 200) {
        return res.data
    }
    return false
}

// 选中的 tag
const activeTags: any[] = [];

/**
 * @desc: 事件处理
 */
// 左键点击 tags
function onTagClick(name: string, oldState: string) {
    const newState = oldState !== 'selected' ? 'selected' : null
    changeTagState(name, newState)
    setActiveTagState(name, newState)
}

// 右键点击 tags
function onTagRightClick(name: string, oldState: string) {
    const newState = oldState !== 'disabled' ? 'disabled' : null
    changeTagState(name, newState)
    setActiveTagState(name, newState)
}

// ctrl+左键点击
function onTagCtrlClick(name: string, oldState: string) {
    const newState = oldState !== 'required' ? 'required' : null
    changeTagState(name, newState)
    setActiveTagState(name, newState)
}

/**
 * @desc: 将传入 tag 存入 activeTag 中，在 emit change
 */
function setActiveTagState(name: string, state: string | null) {
    if (state === null) {
        const removeIndex: number = activeTags.findIndex(e => e.name === name)
        activeTags.splice(removeIndex, 1);
        emits('change', activeTags)
        return;
    }
    const existTag = activeTags.find(e => e.name === name)
    if (existTag) {
        existTag.state = state;
    } else {
        activeTags.push({ name, state })
    }
    emits('change', activeTags)
}

/**
 * @desc: 提供外部修改 tag state 的方法
 */
function changeTagState(name: string, state: string | null) {
    const targetTag = tagList.value.find(e => e.name === name)
    targetTag.state = state
}

defineExpose({ changeTagState, changeDisplayTags, taggedSongs })

</script>

<style lang="scss" scoped>
.scroll-wrapper {
    overflow: hidden;
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 0 12px rgba(24, 160, 88, 0.16);
}

.row-moving {
    animation: moveRightAnimation 10s linear infinite;
}

.scroll-wrapper:hover {
    .row-moving {
        animation-play-state: paused;
    }
}

.scroll-content {
    width: 300%;
    height: 100%;
    display: flex;
    translate: -33.333%;

    .normal-row {
        translate: -60px;
    }

    .cross-row {
        translate: -120px;
    }
}

.scroll-btn {
    background-color: rgba(24, 160, 88, 0.16);
    color: #18a058;
    border-radius: 4px;
    text-align: center;
    cursor: pointer;
}

.scroll-btn-disabled {
    color: #d03050;
    background-color: rgba(208, 48, 80, 0.16)
}

.scroll-btn-selected {
    background-color: #36ad6a;
    color: #ffffff;
}

.scroll-btn-required {
    background-color: rgba(240, 160, 32, 0.22);
    color: #f0a020
}

@keyframes moveRightAnimation {
    from {
        transform: translateX(0px);
    }

    to {
        transform: translateX(33.333%);
    }
}
</style>