<template>
    <div class="scroll-wrapper" @click.right.prevent="">
        <div class="scroll-content row-moving">
            <div class="w-1/3 py-4" v-for="v in [1,2,3]" :key="v">
                <div class="row flex justify-around normal-row" :class="{'cross-row': rowIdx % 2=== 0}"
                    v-for="(screen, rowIdx) in screenConfig" :key="rowIdx">
                    <div class="px-6 py-2 mx-4 my-2 inline-block scroll-btn"
                        v-for="(item, index) in list.slice(screen.start, screen.end)" :key="index"
                        :class="{'scroll-btn-selected': item.state === 'selected', 'scroll-btn-disabled': item.state === 'disabled'}"
                        @click.exact="onTagClick(rowIdx * tagsPerRow + index)"
                        @click.right.prevent="onTagRightClick(rowIdx * tagsPerRow + index)">
                        {{`${item.name} (${item.ref})`}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { NButton, NIcon, NTag } from "naive-ui";
import { h, Transition, ref, onMounted, computed, watch, toRaw } from "vue";
import { useGlobalData } from '@/store/globalData'
import localforage from "localforage";
import { LayoutDistributeVertical } from "@vicons/tabler";

const globalData = useGlobalData()

const emits = defineEmits(['change'])

// ================= 配置
const tagRow = 3;
const tagsPerRow = 4;

// ================
const screenConfig = Array(tagRow).fill(null).map((e, index) => ({
    start: (index * tagsPerRow),
    end: ((index + 1) * tagsPerRow)
}))

const list = ref<any[]>([])

onMounted(async () => {
    const taggedSongs: any[] = await localforage.getItem("taggedSongs") || [];

    const tagArray = (taggedSongs.map(item => item.tags) as any[]).flat()
    const tagList: any[] = []
    tagArray.forEach((tag: string) => {
        const index = tagList.findIndex(item => item.name === tag)
        if (index >= 0) {
            (tagList[index].ref as number) += 1
        } else {
            tagList.push({
                name: tag,
                ref: 1,
                state: null
            })
        }
    })
    list.value = tagList
})


let activeTags: any[] = [];
/**
 * @desc: 左键点击 tags
 */
function onTagClick(index: number) {
    const targetTag = list.value[index]
    targetTag.state = targetTag.state !== 'selected' ? 'selected' : null
    const exist = activeTags.find(e => e.name === targetTag.name)
    if (exist) {
        exist.state = targetTag.state;
    } else {
        activeTags.push(toRaw(targetTag))
    }
    activeTags = activeTags.filter((e: any) => e.state)
    emits('change', activeTags)
}

/**
 * @desc: 右键点击 tags
 */
function onTagRightClick(index: number) {
    const targetTag = list.value[index]
    targetTag.state = targetTag.state !== 'disabled' ? 'disabled' : null
    const exist = activeTags.find(e => e.name === targetTag.name)
    if (exist) {
        exist.state = targetTag.state;
    } else {
        activeTags.push(toRaw(targetTag))
    }
    activeTags = activeTags.filter((e: any) => e.state)
    emits('change', activeTags)
}

/**
 * @desc: 修改 tag state
 */
function changeTagState(name: string, state: string) {
    const targetTag = list.value.find(e => e.name === name)
    targetTag.state = state
}

const tagsCondition = computed(() => {
    const selected: string[] = [];
    const disabled: string[] = [];
    const raw: object[] = []
    list.value.forEach(tag => {
        if (tag.state === null) return;
        raw.push(tag)
        if (tag.state === 'selected') {
            selected.push(tag.name)
        } else if (tag.state === 'disabled') {
            disabled.push(tag.name)
        }
    })
    return { selected, disabled, raw }
})

// const tagList = computed(() => {
//     if (globalData.tagList.length) {
//         list.value = JSON.parse(JSON.stringify(globalData.tagList))
//         return globalData.tagList || []
//     }
//     return []
// })
defineExpose({ changeTagState })
</script>

<style lang="scss" scoped>
.scroll-wrapper {
    overflow: hidden;
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 0 20px #eee;
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

// .scroll-btn:hover {
//     background-color: rgba(24, 160, 88, 0.22);
//     color: #18a058;
// }

@keyframes moveRightAnimation {
    from {
        transform: translateX(0px);
    }

    to {
        transform: translateX(33.333%);
    }
}
</style>