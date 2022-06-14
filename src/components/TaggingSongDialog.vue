<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="生成tag歌单"
        size="huge" :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
        <n-spin :show="state.loading">
            <div class="mb-4 flex items-center">
                <span class="w-2/4"> 选择 tag 生成歌单：</span>
                <n-input v-model:value="state.songlistName" type="text" placeholder="歌单名称" />
            </div>
            <div class="flex justify-center items-center">
                <n-select filterable clearable :placeholder="'选择tag以预览'" v-model:value="state.choosedTag" multiple
                    :options="state.tagOptions" />
                <n-button class="ml-2" strong secondary type="success" @click="generatePreview">预览</n-button>
            </div>
            <div class="mt-2" v-if="state.songlist.length > 0">
                <n-data-table :columns="state.tableColumn" :data="state.songlist" :pagination="state.pagination"
                    :bordered="false" />
            </div>
        </n-spin>
        <template #footer>
            <div class="flex items-center justify-end">
                <n-popover placement="top" trigger="manual" :show="state.showTips">
                    <template #trigger>
                        <n-button class="ml-2" strong type="success" @click="submit">生成</n-button>
                    </template>
                    <span>{{ state.tips }}</span>
                </n-popover>
                <n-button class="ml-2" strong type="error" @click="emits('update:showDialog', false)">取消</n-button>
            </div>
        </template>
    </n-modal>
</template>

<script setup>
import { computed, onMounted, reactive, watch, h } from 'vue'
import SingleTagInput from "@/components/SingleTagInput.vue";
import { NDataTable, NTag } from 'naive-ui';
import localforage from 'localforage';
import api from '@/api/http'

const props = defineProps({
    showDialog: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(['update:showDialog'])

const state = reactive({
    songlistName: '',
    tips: '',
    loading: false,
    showTips: false,
    choosedTag: [],
    tagOptions: [],
    bodyStyle: {
        width: '600px'
    },
    segmented: {
        content: 'soft',
        footer: 'soft'
    },
    songlist: [], // 预览生成的歌单
    tableColumn: [
        { title: 'name', key: 'name' },
        { title: 'artist', key: 'artist' },
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
    pageSizes: [10, 20, 50, 100, 500],
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
        const res = await localforage.getItem('tag');
        state.tagOptions = res.map(item => {
            return {
                label: item.tagName,
                value: item.tagName
            }
        })
    }
})

// methods
function submit() {
    if (!state.songlistName) {
        state.tips = '生成的歌单名称需要填一下'
        state.showTips = true
        setTimeout(() => {
            state.showTips = false
        }, 1500)
        return false;
    }
    if (state.songlist.length === 0) {
        state.tips = '先点一下预览呢'
        state.showTips = true
        setTimeout(() => {
            state.showTips = false
        }, 1500)
        return false;
    }
    generateSonglist()
}
async function generateSonglist() {
    state.loading = true;
    const songlist = await api.get('playlist/create', { name: state.songlistName });
    if (songlist.id) {
        const res = await api.get('playlist/tracks', { op: 'add', pid: songlist.id, tracks: state.songlist.map(item => item.songId).join(',') });
        if (res) {
            emits('update:showDialog', false)
        }
    }
    state.loading = false;
}

function showChangeHandler(show) {
    emits('update:showDialog', show)
}
async function generatePreview() {
    // 根据choosedTag生成预览table
    const taggedSong = await localforage.getItem('taggedSong');
    const choosedTag = state.choosedTag;
    const songlist = taggedSong.filter(song => {
        // 交集
        let intersection = song.tagName.filter(tag => choosedTag.includes(tag));
        return intersection.length > 0;
    })
    state.songlist = songlist;
}
</script>