<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="生成tag歌单"
        size="huge" :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
        <div class="mb-4">选择 tag 生成歌单：</div>
        <div class="flex justify-center items-center">
            <n-select filterable clearable :placeholder="'please select your tag'" v-model:value="state.choosedTag"
                multiple :options="state.tagOptions" />
            <n-button class="ml-2" strong secondary type="success" @click="generatePreview">预览</n-button>
        </div>
        <div class="mt-2" v-if="state.songlist.length > 0">
            <n-data-table :columns="state.tableColumn" :data="state.songlist" :pagination="state.pagination"
                :bordered="false" />
        </div>
        <template #footer>
            <div class="flex items-center justify-end">
                <n-button class="ml-2" strong type="success">生成</n-button>
                <n-button class="ml-2" strong type="error">取消</n-button>
            </div>
        </template>
    </n-modal>
</template>

<script setup>
import { computed, onMounted, reactive, watch, h } from 'vue'
import SingleTagInput from "@/components/SingleTagInput.vue";
import { NDataTable, NTag } from 'naive-ui';
import localforage from 'localforage';

const props = defineProps({
    showDialog: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(['update:showDialog'])

const state = reactive({
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