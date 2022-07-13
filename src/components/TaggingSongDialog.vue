<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="生成tag歌单"
        size="huge" :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
        <n-spin :show="state.loading">
            <div class="mb-4 flex items-center">
                <span class="w-40"> 选择 tag 生成歌单：</span>
                <n-input v-if="state.isCreatePlaylist" v-model:value="state.songlistName" type="text"
                    placeholder="歌单名称" />
                <n-input v-else :value="props.playlist.name" disabled type="text" />
            </div>
            <div class="flex justify-center items-center">
                <n-icon size="24" class="success-icon" :component="CheckboxChecked24Filled"/>
                <n-select filterable clearable :placeholder="'需要包含的tag'" v-model:value="state.includedTag" multiple
                    :options="state.tagOptions" />
                <n-icon size="24" class="ml-4 error-icon" :component="DismissSquare24Filled"/>
                <n-select class="ml-2" filterable clearable :placeholder="'禁止包含的tag'" v-model:value="state.disabledTag"
                    multiple :options="state.tagOptions" />
                <n-button class="ml-2" strong secondary type="success" @click="generatePreview">预览</n-button>
            </div>
            <div class="mt-2 preview-table" v-if="state.previewSonglist.length > 0">
                <n-data-table class="h-full" :columns="state.tableColumn" :flex-height="true"
                    :data="state.previewSonglist" :pagination="pagination" :bordered="false" />
            </div>
            <n-divider />
            <div class="mt-4 flex items-center justify-end">
                <n-popover placement="top" trigger="manual" :show="state.showTips">
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

<script setup>
import { computed, onMounted, reactive, watch, h } from 'vue'
import { NDataTable, NTag, NModal, NInput, NSelect, NButton, NPopover } from 'naive-ui';
import { CheckboxChecked24Filled, DismissSquare24Filled } from '@vicons/fluent'
import localforage from 'localforage';
import api from '@/api/http'
import { useGlobalData } from '@/store/globalData';
// 全局数据中心
const globalData = useGlobalData()

const props = defineProps({
    showDialog: {
        type: Boolean,
        default: false
    },
    playlist: {
        type: Object,
        default: null
    },
})
const emits = defineEmits(['update:showDialog'])

const state = reactive({
    isCreatePlaylist: computed(() => {
        return !Boolean(props.playlist)
    }),
    songlistName: '',
    tips: '',
    loading: false,
    showTips: false,
    includedTag: [],
    disabledTag: [],
    tagOptions: [],
    bodyStyle: {
        width: '800px'
    },
    segmented: {
        content: 'soft',
        footer: 'soft'
    },
    previewSonglist: [], // 预览生成的歌单
    tableColumn: [
        { title: '歌曲名称', key: 'name', width: 200, },
        { title: '歌手', key: 'artist', width: 160, },
        {
            title: 'tag', render(row) {
                const tags = row.tagName.map(tag => {
                    return h(NTag,
                        { class: 'mr-2' },
                        () => tag
                    )
                })
                return tags
            }
        },
    ]
})
const pagination = reactive({
    page: 1,
    pageSize: 10,
    showSizePicker: true,
    pageSizes: [10, 20, 30],
    onChange: (page) => {
        pagination.page = page;
    },
    onUpdatePageSize: (pageSize) => {
        pagination.pageSize = pageSize;
        pagination.page = 1;
    }
});

watch(() => props.showDialog, async (val) => {
    if (val) {
        state.tagOptions = globalData.tagList.map(item => {
            return {
                label: item.tagName,
                value: item.tagName
            }
        })
    }
})

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
    if (state.isCreatePlaylist) {
        generateSonglist() // 生成新的歌单
    } else {
        insertSonglist() // 插入原有的歌单
    }
}
async function generateSonglist() {
    state.loading = true;
    const songlist = await api.get('playlist/create', { name: state.songlistName });
    if (songlist.id) {
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlist.id, tracks: state.previewSonglist.map(item => item.songId).join(',') });
        if (res) {
            closeDialog()
        }
    }
    state.loading = false;
}
async function insertSonglist() {
    let songlistId = props.playlist?.id;
    if (songlistId) {
        state.loading = true;
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlistId, tracks: state.previewSonglist.map(item => item.songId).join(',') });
        if (res) {
            closeDialog()
        } else {
            console.error('playlist/tracks file:', JSON.stringify(res))
        }
        state.loading = false;
    }
}

function closeDialog() {
    clearState();
    emits('update:showDialog', false)
}
function clearState() {
    state.songlistName = '';
    state.includedTag = [];
    state.disabledTag = [];
    state.previewSonglist = [];
}

function showChangeHandler(show) {
    if (!show) clearState();
    emits('update:showDialog', show)
}
async function generatePreview() {
    if (state.includedTag.length === 0) {
        window.$notification.warning({
            title: '错误',
            content: '至少选择一个包含的标签才能生成',
            duration: 3000
        })
    }
    // 生成预览table
    const taggedSong = await localforage.getItem('taggedSong');
    const includedTag = state.includedTag;
    const disabledTag = state.disabledTag;
    const songlist = taggedSong.filter(song => {
        let hasIncludedTag = song.tagName.filter(tag => includedTag.includes(tag))?.length > 0;
        let hasDisabledTag = song.tagName.filter(tag => disabledTag.includes(tag))?.length > 0;
        return hasIncludedTag && !hasDisabledTag;
    })
    state.previewSonglist = songlist;
}
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

</style>