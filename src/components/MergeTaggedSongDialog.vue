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
            <!-- 创建 / 导入歌单 -->
            <n-input-group class="mb-4">
                <n-select type="primary" v-model:value="state.generateMode" :style="{ width: '130px' }"
                    :options="([{ label: '新建歌单', value: GenerateMode.Create }, { label: '合入歌单', value: GenerateMode.Merge }] as any[])" />
                <n-input v-if="state.generateMode === GenerateMode.Create" placeholder="请输入新建的歌单名"
                    v-model:value="state.songlistName" />
                <n-select v-else placeholder="请选择合入的歌单" v-model:value="state.mergePlaylistId" type="primary"
                    :options="state.playlistOptions" />
            </n-input-group>
            <div class="flex justify-center items-center">
                <n-icon size="24" class="success-icon" :component="CheckboxChecked24Filled" />
                <n-select class="ml-2 tag-select" filterable clearable :placeholder="'需要包含的tag'"
                    v-model:value="state.includedTag" multiple :options="state.tagOptions" max-tag-count="responsive"
                    :on-update:show="(show) => show || generatePreview()" />
                <n-icon size="24" class="ml-4 error-icon" :component="DismissSquare24Filled" />
                <n-select class="ml-2 tag-select" filterable clearable :placeholder="'需要剔除的tag'"
                    v-model:value="state.disabledTag" multiple :options="state.tagOptions" max-tag-count="responsive"
                    :on-update:show="(show) => show || generatePreview()" />
            </div>
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
import { MdAnalytics } from '@vicons/ionicons4';
import { createDiscreteApi } from 'naive-ui'

const app = getCurrentInstance()
// 全局数据中心
const globalData = useGlobalData()

const props = defineProps({
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
// onMounted(() => {
//     initTagsOptions()
// })

// function initTagsOptions() {
//     state.tagOptions = globalData.tagList.map(item => {
//         return {
//             label: item.name,
//             value: item.name
//         }
//     })
// }

interface State {
    tagOptions?: any[],
    [key: string]: any
}
const state: State = reactive({
    generateMode: GenerateMode.Create,
    playlistOptions: globalData.playlist.map((e: any) => ({
        label: e.name,
        value: e.id
    })),
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
        return ''
    }),
    loading: false,
    showTips: false,
    includedTag: [],
    disabledTag: [],
    tagOptions: [],
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
                    { class: 'mr-2' },
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
        state.tips = '生成的歌单名称需要填一下呢'
        state.showTips = true
        setTimeout(() => {
            state.showTips = false
        }, 1500)
        return false;
    }
    if (state.previewSonglist.length === 0) {
        state.tips = '先点一下预览呢'
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
async function generateSonglist() {
    state.loading = true;
    const songlist = await api.get('playlist/create', { name: state.songlistName });
    if (songlist.id) {
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlist.id, tracks: state.previewSonglist.map((item: any) => item.songId).join(',') });
        if (res) {
            closeDialog()
        }
    }
    state.loading = false;
}
async function insertSonglist() {
    const songlistId: number = props.playlist?.id;
    if (songlistId) {
        state.loading = true;
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlistId, tracks: state.previewSonglist.map((item: any) => item.songId).join(',') });
        if (res) {
            closeDialog()
        } else {
            console.error('playlist/tracks file:', JSON.stringify(res))
        }
        state.loading = false;
    }
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
    const songlist = taggedSongs.filter(song => {
        const hasIncludedTag = song.tags.filter((tag: string) => includedTag.includes(tag))?.length > 0;
        const hasDisabledTag = song.tags.filter((tag: string) => disabledTag.includes(tag))?.length > 0;
        return hasIncludedTag && !hasDisabledTag;
    })
    state.previewSonglist = songlist;
}

defineExpose({
    showDialog
})
</script>

<style lang="scss" scoped>
.preview-table {
    height: 35rem;
}

.success-icon {
    color: rgb(14, 122, 13)
}

.error-icon {
    color: #B91C1C
}

.tag-select {
    max-width: calc(50% - 40px);
}
</style>