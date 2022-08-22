<template>
  <NModal v-model:show="showDialog" class="custom-card" preset="card" :style="dialogBodyStyle" title="登录" size="huge"
    :bordered="false">
    <div class="flex justify-center items-center flex-col">
      <p>请使用手机端网易云音乐扫码登录</p>
      <NSpin :show="QR_State.QRloading">
        <img v-if="QR_State.QRImg" :src="QR_State.QRImg" alt="登录二维码" @click="refreshQR">
        <div v-else class="bg-stripes flex items-center justify-center" @click="refreshQR">
          <p v-if="QR_State.QRLoginState === QRStateEnum.Failed">二维码加载失败</p>
        </div>
      </NSpin>
      <p>{{ QR_State.QRCodeTips }}</p>
    </div>
    <template #footer>
      <p class="text-sm text-gray-500">虽然后续可能支持其他的登录方式，但是扫码登录总归是安全的</p>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { NModal, NSpin } from 'naive-ui'
import { createDiscreteApi } from 'naive-ui'
import api from '@/api/http'

const { notification } = createDiscreteApi(['notification'])

const emits = defineEmits(['loginSuccess'])

/** 
 * @desc 显隐控制
 */
const showDialog = ref(false)
watch(() => showDialog.value, (isShow) => {
  if (isShow) {
    if (QR_State.QRImg) {
      QR_State.QRLoginState = QRStateEnum.Loaded
      getLoginStatus()
    } else {
      refreshQR()
    }
  }
})

/** 
 * @desc 刷新二维码
 */
function refreshQR() {
  loadQrImg(true)
}

/** 
 * @desc 初始化二维码状态
 */
async function loadQrImg(force = false) {
  QR_State.QRLoginState = QRStateEnum.Loading // 加载中
  const { code: keyCode, data: keyData } = await api.get('login/qr/key', {}, { useTimestamp: force })
  if (keyCode !== 200) {
    QR_State.QRLoginState = QRStateEnum.Failed
    return false
  }
  QR_State.unikey = keyData.unikey
  // 根据 unikey 获取二维码图片
  const { code: qrCode, data: qrData } = await api.get('login/qr/create', { key: keyData.unikey, qrimg: true }, { useTimestamp: force })
  if (qrCode !== 200) {
    QR_State.QRLoginState = QRStateEnum.Failed
    return false
  }
  // 二维码加载成功
  QR_State.QRImg = qrData.qrimg;
  QR_State.QRLoginState = QRStateEnum.Loaded;
  // 启动轮询
  getLoginStatus()
}

/** 
 * @desc 轮询扫码登录状态
 */
async function getLoginStatus(timer = 500) {
  if (!showDialog.value) false
  if (!QR_State.unikey) return false;
  console.log('///state', QR_State.QRLoginState)
  if ([QRStateEnum.Overtime, QRStateEnum.Success].includes(QR_State.QRLoginState)) return false;

  // 根据 unikey 查询扫码登录状态
  const { code } = await api.get('login/qr/check', { key: QR_State.unikey })

  // 800 为二维码过期,801 为等待扫码,802 为待确认,803 为授权登录成功(803 状态码下会返回 cookies)
  switch (code) {
    case 800:
      QR_State.QRLoginState = QRStateEnum.Overtime;
      break;
    case 801:
      QR_State.QRLoginState = QRStateEnum.Loaded;
      break;
    case 802:
      QR_State.QRLoginState = QRStateEnum.Scaning;
      break;
    case 803:
      QR_State.QRLoginState = QRStateEnum.Success;
      notification.create({
        type: 'success',
        title: "登录成功",
        duration: 3000
      })
      emits('loginSuccess')
      showDialog.value = false
      break;
  }
  // 递归
  if (showDialog.value) {
    setTimeout(() => {
      getLoginStatus()
    }, timer);
  }
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
  [QRStateEnum.Loaded, '请打开网易云音乐app，扫描二维码'],
  [QRStateEnum.Scaning, '扫描成功，请在手机上确认...'],
  [QRStateEnum.Success, '登录成功'],
  [QRStateEnum.Failed, '二维码加载失败，请点击二维码刷新'],
  [QRStateEnum.Overtime, '二维码已过期，请点击二维码刷新']
])

interface QRLoginState {
  unikey: string | null,
  QRImg: string | null,
  QRLoginState: QRStateEnum,
  QRloading: boolean,
  QRCodeTips: string,
}

// state: 二维码登录状态
const QR_State: QRLoginState = reactive({
  unikey: null,
  QRImg: null,
  QRLoginState: QRStateEnum.Loading,
  QRloading: computed(() => [QRStateEnum.Loading, QRStateEnum.Scaning].includes(QR_State.QRLoginState)),
  QRCodeTips: computed((): string => {
    return QRLoginTipsMap.get(QR_State.QRLoginState) || ''
  })
})

const dialogBodyStyle = {
  width: '600px'
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