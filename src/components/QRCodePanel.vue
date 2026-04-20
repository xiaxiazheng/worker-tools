<template>
  <div class="panel fade-in">
    <div class="bg-white rounded-2xl cute-shadow p-6 mb-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">输入内容</h2>
      <div class="flex gap-3">
        <input
          v-model="qrInput"
          type="text"
          placeholder="输入 URL 或文本..."
          class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          @input="generateQR"
        />
        <select v-model="qrSize" @change="generateQR" class="px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none">
          <option value="150">150px</option>
          <option value="200" selected>200px</option>
          <option value="250">250px</option>
          <option value="300">300px</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-2xl cute-shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">二维码</h2>
        <button
          @click="downloadQR"
          class="btn-press px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          下载
        </button>
      </div>
      <div class="flex items-center justify-center min-h-[250px] bg-gray-50 rounded-xl">
        <div v-if="!qrInput" class="text-center text-gray-400">
          <svg class="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
          </svg>
          <p>输入内容生成二维码</p>
        </div>
        <div v-else ref="qrContainer" class="flex items-center justify-center"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import QRCode from 'qrcodejs'
import { useToast } from '../composables/useToast'

const { show: showToast } = useToast()

const qrInput = ref('')
const qrSize = ref(200)
const qrContainer = ref(null)
let currentQR = null
let qrDataUrl = ''

const generateQR = () => {
  if (!qrInput.value) {
    qrDataUrl = ''
    return
  }

  if (currentQR) {
    currentQR.clear()
  }

  currentQR = new QRCode(qrContainer.value, {
    text: qrInput.value,
    width: parseInt(qrSize.value),
    height: parseInt(qrSize.value),
    colorDark: '#4F46E5',
    colorLight: '#FFFFFF',
    correctLevel: QRCode.CorrectLevel.M
  })

  setTimeout(() => {
    const img = qrContainer.value?.querySelector('img')
    if (img) {
      qrDataUrl = img.src
    } else {
      const canvas = qrContainer.value?.querySelector('canvas')
      if (canvas) {
        qrDataUrl = canvas.toDataURL('image/png')
      }
    }
  }, 100)
}

const downloadQR = () => {
  if (!qrDataUrl) {
    showToast('请先生成二维码', 'error')
    return
  }

  const link = document.createElement('a')
  link.download = 'worker-tools-qrcode.png'
  link.href = qrDataUrl
  link.click()
  showToast('二维码已下载')
}
</script>
