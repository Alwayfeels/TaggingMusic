<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="生成tag歌单"
        size="huge" :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
        <div class="flex justify-center items-center flex-col">
            <n-select v-model:value="state.choosedTag" multiple :options="state.tagOptions" />
        </div>
        <template #footer>
        </template>
    </n-modal>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import SingleTagInput from "@/components/SingleTagInput.vue";
import api from '@/api/http'

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
})
onMounted(async () => {
    const res = await api.get('/tags/list');
    state.tagOptions = res.data.map(item => {
        return {
            label: item.name,
            value: item.id
        }
    })
})
// methods
const showChangeHandler = (show) => {
    emits('update:showDialog', show)
}
</script>