<template>
    <n-modal v-model:show="showDialog" class="custom-card" preset="card" :style="state.bodyStyle" title="登录" size="huge"
        :bordered="false" :segmented="state.segmented" :on-update:show="showChangeHandler">
        <div class="flex justify-center items-center flex-col">
            <p>Recommand to use QRcode log in</p>
            <n-spin :show="state.isQRcodeLoading || state.isQRcodeScaning">
                <img v-if="state.qrData" :src="state.qrData.data?.qrimg" alt="登陆二维码"
                    @click="refreshQRcode">
                <div v-else class="bg-stripes flex items-center justify-center" @click="refreshQRcode">
                    <p v-if="state.isQRcodeFailed">二维码加载失败</p>
                </div>
            </n-spin>
            <p>{{ state.qrCodeTips }}</p>
        </div>
        <template #footer>
            <p>tagging music would not upload your personal data</p>
        </template>
    </n-modal>
</template>

<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
import api from '@/api/http'

const props = defineProps({
    showDialog: {
        type: Boolean,
        default: false
    }
})
const emits = defineEmits(['refreshLoginStatus'])

// state
const state = reactive({
    unikey: null,
    isQRcodeLoading: false, // 是否正在加载二维码
    isQRcodeLoaded: false, // 是否加载二维码成功
    isQRcodeFailed: false, // 是否加载二维码失败
    isQRcodeScaning: false, // 是否正在扫描二维码
    isQRcodeOvertime: false, // 是否二维码超时
    isPollingLoginStatus: false,
    bodyStyle: {
        width: '600px'
    },
    segmented: {
        content: 'soft',
        footer: 'soft'
    },
    qrData: null,
    qrCodeTips: computed(() => {
        if (state.isQRcodeOvertime) {
            return '二维码已过期，请点击二维码刷新'
        } else if (state.isQRcodeScaning) {
            return '扫描成功，请在手机上确认'
        } else if (state.isQRcodeFailed) {
            return '二维码加载失败，请点击二维码刷新'
        } else if (state.isQRcodeLoading) {
            return '二维码正在加载中，请先喝个茶'
        } else {
            return '请扫描二维码并在手机上确认'
        }
    })
})
// hooks
let closetimer = null
watch(() => props.showDialog, (val) => {
    console.log('showDialog', val)
    if (val) {
        clearTimeout(closetimer)
        initDialog()
    } else {
        // waiting fade out animation finished
        closetimer = setTimeout(() => {
            clearDialog()
        }, 1000);
    }
})

// mounted && destory
const initDialog = async () => {
    state.isQRcodeLoading = true
    // 获取key
    const key = await api.get('/login/qr/key')
    state.unikey = key.data.unikey
    console.log('key', state.unikey)
    // 根据key获取二维码
    const qrData = await api.get('login/qr/create', { key: state.unikey, qrimg: true })
    state.isQRcodeLoading = false
    if (qrData.code !== 200) {
        // 显示失败提示
        state.isQRcodeFailed = true
        return false;
    }
    // 显示二维码，轮询扫码进度
    state.qrData = qrData
    state.isPollingLoginStatus = true
    getLoginStatus()
}
const clearDialog = () => {
    console.log('timer clear !!!!!!!!!!!')
    state.qrData = null
    state.isQRcodeLoading = false
    state.isQRcodeLoaded = false
    state.isQRcodeFailed = false
    state.isQRcodeScaning = false
    state.isQRcodeOvertime = false
    state.isPollingLoginStatus = false
}

// methods
const showChangeHandler = (show) => {
    emits('update:showDialog', show)
}
const refreshQRcode = () => {
    state.isQRcodeLoading = true
    initDialog()
}
// polling to get login status
const getLoginStatus = async () => {
    const key = state.unikey
    const res = await api.get('login/qr/check', { key })
    if (!state.isPollingLoginStatus) return false
    // 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies)
    // isPollingLoginStatus 是否开启登录状态轮询
    switch (res.code) {
        case 800:
            state.isQRcodeOvertime = true
            state.isPollingLoginStatus = false
            break
        case 801:
            state.isQRcodeLoaded = true
            state.isPollingLoginStatus = true
            break
        case 802:
            state.isQRcodeScaning = true
            state.isPollingLoginStatus = true
            break
        case 803:
            state.isPollingLoginStatus = false
            emits('closeDialog')
            emits('refreshLoginStatus')
            break
    }
    if (state.isPollingLoginStatus) {
        setTimeout(() => {
            getLoginStatus()
        }, 1000);
    }
}

</script>

<style lang="scss" scoped>
.bg-stripes {
    color: #888;
    margin: 15px;
    width: 150px;
    height: 150px;
    background-image: linear-gradient(45deg, var(--stripes-color) 12.5%, transparent 12.5%, transparent 50%, var(--stripes-color) 50%, var(--stripes-color) 62.5%, transparent 62.5%, transparent 100%);
    background-size: 5.66px 5.66px;
    --stripes-color: rgba(14, 165, 233, 0.4);
}
</style>