<template>
  <div>
    <slot></slot>
    <NModal v-model:show="showDialog" class="custom-card" preset="card" :style="dialogBodyStyle" title="登录" size="huge"
      :bordered="false" :on-update:show="showChangeHandler">
      <div class="flex justify-center items-center flex-col">
        <p>请使用手机端网易云音乐扫码登录</p>
        <NSpin :show="QR_State.QRloading">
          <!-- <img v-if="state.qrData" :src="state.qrData.data?.qrimg" alt="登录二维码" @click="refreshQRcode">
          <div v-else class="bg-stripes flex items-center justify-center" @click="refreshQRcode">
            <p v-if="state.QRLoginState === QRLoginStateMap.Failed">二维码加载失败</p>
          </div> -->
          <div class="bg-stripes flex items-center justify-center" @click="refreshQRcode">
            <p v-if="QR_State.QRLoginState === QRStateEnum.Failed">二维码加载失败</p>
          </div> 
        </NSpin>
        <p>{{ QR_State.QRCodeTips }}</p>
      </div>
      <template #footer>
        <p class="text-sm text-gray-500">虽然后续可能支持其他的登录方式，但是扫码登录总归是安全的</p>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { NModal, NSpin, useNotification } from 'naive-ui'
import api from '@/api/http'

const dialogBodyStyle = {
  width: '600px'
}
/** 
 * @desc 二维码登录状态
 */
enum QRStateEnum {
  Loading,
  Loaded,
  Scaning,
  Success,
  Failed,
  Overtime
}
const QRLoginTipsMap = new Map([
  [QRStateEnum.Loading, '二维码正在加载中，请先喝个茶...'],
  [QRStateEnum.Loaded, '请扫描二维码并在手机上确认'],
  [QRStateEnum.Scaning, '正在扫描二维码...'],
  [QRStateEnum.Success, '扫描成功，请在手机上确认'],
  [QRStateEnum.Failed, '二维码加载失败，请点击二维码刷新'],
  [QRStateEnum.Overtime, '二维码已过期，请点击二维码刷新']
])
interface QRLoginState {
  QRLoginState: QRStateEnum,
  QRloading: boolean,
  QRCodeTips: string,
}
const QR_State: QRLoginState = reactive({
  QRLoginState: QRStateEnum.Loading,
  QRloading: computed(() => [QRStateEnum.Loading, QRStateEnum.Scaning].includes(QR_State.QRLoginState)),
  QRCodeTips: computed((): string => {
    return QRLoginTipsMap.get(QR_State.QRLoginState) || ''
  })
})

/** 
 * @desc 显隐控制
 */
const showDialog = ref(false)
function showChangeHandler(show: boolean) {
  showDialog.value = show
}

async function getLoginInfo() {
  // QR_State.QRLoginState = QRStateEnum.Loading
  // // get key
  //   const key = await api.get('/login/qr/key')
}

function refreshQRcode() {
  console.log('refreshQRcode')
}

defineExpose({
  showDialog
})
</script>

<style lang="scss" scoped>
.bg-stripes {
    color: #888;
    margin: 15px;
    width: 150px;
    height: 150px;
    background-image: linear-gradient(45deg, var(--stripes-color) 12.5%, transparent 12.5%, transparent 50%, var(--stripes-color) 50%, var(--stripes-color) 62.5%, transparent 62.5%, transparent 100%);
    background-size: 5.66px 5.66px;
    --stripes-color: #18a058;
}
</style>