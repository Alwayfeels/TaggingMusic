<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="{ width: '800px' }" size="huge"
        :bordered="false" :segmented="{ content: 'soft', footer: 'soft' }" :on-update:show="showChangeHandler">
        <template #header>
            <div class="flex items-center">
                <div class="mr-2">生成tag歌单</div>
                <n-popover trigger="hover">
                    <template #trigger>
                        <n-icon size="24" class="text-green-700 cursor-pointer" :component="BookQuestionMark20Filled" />
                    </template>
                    <div>这个功能可以按照你的需要，将所有含有指定 tag 歌曲，剔除指定的 tag 后，按照需要生成新的歌单，或者导入指定的歌单</div>
                </n-popover>
            </div>
        </template>
        <n-spin :show="state.loading">
            <!-- tips -->
            <!-- 创建 / 导入歌单选择 -->
            <n-input-group class="mb-4">
                <n-select type="primary" v-model:value="state.generateMode" :style="{ width: '130px' }"
                    :options="([{ label: '新建歌单', value: GenerateMode.Create }, { label: '合入歌单', value: GenerateMode.Merge }] as any[])" />
                <n-input v-if="state.generateMode === GenerateMode.Create" placeholder="请输入新建的歌单名"
                    v-model:value="state.songlistName" />
                <n-select v-else placeholder="请选择合入的歌单" v-model:value="state.mergePlaylistId" type="primary"
                    :options="state.playlistOptions" />
            </n-input-group>
            <!-- tag 选择 -->
            <div class="flex justify-center items-center">
                <n-icon size="24" class="ml-4 success-color" :component="CheckboxChecked24Filled" />
                <n-select class="ml-2 w-full mb-2" filterable clearable :placeholder="'含有该 tag 的歌曲都会被收录 (必填)'"
                    v-model:value="state.includedTag" multiple :options="state.tagOptions" max-tag-count="responsive"
                    :on-update:show="(show) => show || generatePreview()" />
            </div>
            <div class="flex justify-center items-center">
                <n-icon size="24" class="ml-4 warning-color" :component="CheckboxChecked24Filled" />
                <n-select class="ml-2 tag-select" filterable clearable :placeholder="'不含该 tag 的歌曲都会被剔除 (选填)'"
                    v-model:value="state.requiredTag" multiple :options="state.tagOptions" max-tag-count="responsive"
                    :on-update:show="(show) => show || generatePreview()" />
                <n-icon size="24" class="ml-4 error-color" :component="DismissSquare24Filled" />
                <n-select class="ml-2 tag-select" filterable clearable :placeholder="'含有该 tag 的歌曲都会被剔除 (选填)'"
                    v-model:value="state.disabledTag" multiple :options="state.tagOptions" max-tag-count="responsive"
                    :on-update:show="(show) => show || generatePreview()" />
            </div>
            <!-- 预览 table -->
            <div class="mt-4 preview-table" v-if="state.previewSonglist.length > 0">
                <n-data-table class="h-full" :columns="tableColumn" :flex-height="true" :data="state.previewSonglist"
                    :pagination="pagination" :bordered="false" />
            </div>
            <n-divider />
            <div class="mt-4 flex items-center justify-end">
                <n-popover placement="top" trigger="hover">
                    <template #trigger>
                        <n-button class="ml-2" strong type="success" @click="submit">生成</n-button>
                    </template>
                    <span>{{ state.tips }}</span>
                </n-popover>
                <n-button class="ml-2" strong type="error" @click="closeDialog">取消</n-button>
            </div>
        </n-spin>
    </n-modal>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch, h, ref, getCurrentInstance } from 'vue'
import { NDataTable, NTag, NModal, NInput, NSelect, NButton, NPopover } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import { CheckboxChecked24Filled, DismissSquare24Filled, BookQuestionMark20Filled } from '@vicons/fluent'
import localforage from 'localforage';
import api from '@/api/musicApi'
import { useGlobalData } from '@/store/globalData';
import { useGlobalState } from "@/store/globalState";
import { MdAnalytics } from '@vicons/ionicons4';
import { createDiscreteApi } from 'naive-ui'
import { filterSongWithTag } from '@/assets/tool'

const app = getCurrentInstance()
// 全局数据中心
const globalData = useGlobalData()
const globalState = useGlobalState()

const props = defineProps({
    // 选填：导入到某个指定歌单使用
    playlist: {
        type: Object,
        default: null
    },
})

enum GenerateMode {
    Create,
    Merge
}

/** 
 * @desc 初始化 tagOptions
 */
const showDialog = ref(false)

interface State {
    tagOptions?: any[],
    [key: string]: any
}
const state: State = reactive({
    generateMode: GenerateMode.Create,
    playlistOptions: computed(() => {
        return globalState.playlist.data.map((e: any) => ({
            label: e.name,
            value: e.id
        }))
    }),
    isCreatePlaylist: computed(() => {
        return !!props.playlist?.name
    }),
    title: computed((): string => {
        return state.isCreatePlaylist ? '选择 tag 生成歌单：' : '选择 tag 导入歌单'
    }),
    songlistName: '', // 新建歌单名称
    mergePlaylistId: null, // 导入歌单ID
    tips: computed(() => {
        if (state.previewSonglist.length === 0) return '已选择的歌曲为空，请先选择歌曲tag'
        if (state.generateMode === GenerateMode.Create && !state.songlistName) return '请先输入新建歌单名称';
        if (state.generateMode === GenerateMode.Merge && !state.mergePlaylistId) return '请选择歌曲导入的歌单';
        return false
    }),
    loading: false,
    showTips: false,
    requiredTag: [],
    includedTag: [],
    disabledTag: [],
    tagOptions: computed(() => {
        return globalData.tagList.map(e => ({
            label: e.name,
            value: e.name
        }))
    }),
    previewSonglist: [], // 预览生成的歌单
})

/** 
 * @desc 分页
 */
const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 30],
    onChange: (page: number) => {
        pagination.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
        pagination.pageSize = pageSize;
        pagination.page = 1;
    }
});

/** 
 * @desc 预览 table 列配置
 */
const tableColumn: DataTableColumns = [
    { title: '歌曲名称', key: 'name', width: 200, },
    { title: '歌手', key: 'artist', width: 160, },
    {
        title: 'tag',
        key: 'tag',
        render(row: any) {
            const tags = row.tags.map((tag: string) => {
                return h(NTag,
                    { class: 'mr-2', type: 'success' },
                    () => tag
                )
            })
            return tags
        }
    }
]

// methods
function submit() {
    if (state.isCreatePlaylist && !state.songlistName) {
        state.tips = '生成的歌单名称为必填项'
        state.showTips = true
        setTimeout(() => {
            state.showTips = false
        }, 1500)
        return false;
    }
    if (state.previewSonglist.length === 0) {
        state.tips = '没有需要合入的歌曲'
        state.showTips = true
        setTimeout(() => {
            state.showTips = false
        }, 1500)
        return false;
    }
    if (state.generateMode === GenerateMode.Create) {
        generateSonglist() // 生成新的歌单
    } else {
        insertSonglist() // 插入原有的歌单
    }
}

/**
 * @desc: Submit： 生成新的歌单
 */
async function generateSonglist() {
    state.loading = true;
    const songlist = await api.get('playlist/create', { name: state.songlistName });
    if (songlist.id) {
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlist.id, tracks: state.previewSonglist.map((item: any) => item.id).join(',') });
        if (res) {
            closeDialog()
        }
    }
    state.loading = false;
    globalData.initPlaylist(true)
    return true
}

/**
 * @desc: Submit： 插入原有的歌单
 */
async function insertSonglist() {
    const songlistId: number = props.playlist?.id || state.mergePlaylistId;
    if (songlistId) {
        state.loading = true;
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlistId, tracks: state.previewSonglist.map((item: any) => item.id).join(',') });
        if (res) {
            closeDialog()
        } else {
            console.error('playlist/tracks file:', JSON.stringify(res))
        }
        state.loading = false;
        globalData.initPlaylist(true)
        return true
    }
    console.error('insertSonglist: songlistId is null')
}

function closeDialog() {
    showDialog.value = false;
    clearState();
    // emits('update:showDialog', false)
}
function clearState() {
    state.songlistName = '';
    state.includedTag = [];
    state.disabledTag = [];
    state.requiredTag = [];
    state.previewSonglist = [];
}

function showChangeHandler(show: boolean) {
    if (!show) clearState();
    showDialog.value = false;
    // emits('update:showDialog', show)
}

async function generatePreview() {
    if (state.includedTag.length === 0) {
        return false;
    }
    // 生成预览table
    const taggedSongs = globalData.taggedSongs;
    const includedTag = state.includedTag;
    const disabledTag = state.disabledTag;
    const requiredTag = state.requiredTag;
    const songlist = filterSongWithTag(taggedSongs, includedTag, requiredTag, disabledTag)
    state.previewSonglist = songlist;
}

// function renderTag ({ option, handleClose }: any, type: string) {
//     return h(
//         NTag,
//         {
//             type: type || '',
//             disabled: false,
//             closable: true,
//             onClose: () => {
//                 handleClose()
//             }
//         },
//         { default: () => option.label }
//     )
// }

defineExpose({
    showDialog
})
</script>

<style lang="scss" scoped>
.preview-table {
    height: 35rem;
}

.success-color {
    color: rgb(14, 122, 13)
}

.error-color {
    color: #B91C1C
}

.warning-color {
    color: #F0A020
}

.tag-select {
    max-width: calc(50% - 40px);
}
</style>