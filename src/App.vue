<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <!-- Header -->
    <header class="flex items-center justify-between mb-8">
      <div class="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 cute-shadow">
        <div class="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>
        </div>
        <div class="text-left">
          <h1 class="text-2xl font-bold text-gray-800">worker-tools</h1>
          <p class="text-sm text-gray-500">打工人的 tools</p>
        </div>
      </div>
      <button @click="openSettings" class="btn-press w-12 h-12 bg-white rounded-2xl cute-shadow hover:shadow-lg transition-shadow flex items-center justify-center group">
        <svg class="w-5 h-5 text-gray-500 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </button>
    </header>

    <!-- Tab Navigation -->
    <div class="bg-white rounded-2xl cute-shadow mb-6 p-2 relative">
      <div class="relative flex">
        <div
          id="tab-slider"
          class="tab-slider absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl"
          :style="{ left: `${currentTab * 33.333}%` }"
        ></div>
        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          @click="switchTab(index)"
          class="tab-btn flex-1 py-3 px-4 rounded-xl text-sm font-medium z-10 transition-colors"
          :class="currentTab === index ? 'text-white' : 'text-gray-500 hover:text-gray-700'"
        >
          <span class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="tab.icon"></svg>
            {{ tab.name }}
          </span>
        </button>
      </div>
    </div>

    <!-- Content Panels -->
    <div id="panels">
      <TodoPanel v-show="currentTab === 0" />
      <ClipboardPanel v-show="currentTab === 1" />
      <QRCodePanel v-show="currentTab === 2" />
    </div>

    <!-- Footer -->
    <footer class="text-center mt-8 text-sm text-gray-400">
      <p>worker-tools v1.0 · 数据存储在本地 IndexDB</p>
    </footer>

    <!-- Settings Panel -->
    <SettingsPanel :visible="settingsVisible" @close="closeSettings" @saved="onSettingsSaved" />

    <!-- Toast Container -->
    <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="px-6 py-3 rounded-xl text-white text-sm font-medium shadow-lg fade-in"
        :class="toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import SettingsPanel from './components/SettingsPanel.vue'
import TodoPanel from './components/TodoPanel.vue'
import ClipboardPanel from './components/ClipboardPanel.vue'
import QRCodePanel from './components/QRCodePanel.vue'
import { useClipboard } from './composables/useClipboard'
import { useToast } from './composables/useToast'

const { add: addClipboardItem } = useClipboard()
const { toasts } = useToast()

const currentTab = ref(0)
const settingsVisible = ref(false)

const tabs = [
  {
    id: 'todo',
    name: '待办',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>'
  },
  {
    id: 'clipboard',
    name: '剪贴板',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>'
  },
  {
    id: 'qrcode',
    name: '二维码',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>'
  }
]

const switchTab = (index) => {
  currentTab.value = index
}

const openSettings = () => {
  settingsVisible.value = true
}

const closeSettings = () => {
  settingsVisible.value = false
}

const onSettingsSaved = () => {
  // Settings saved, could emit to children if needed
}

const handlePaste = (e) => {
  const text = e.clipboardData?.getData('text')
  if (text) addClipboardItem(text)
}

onMounted(() => {
  document.addEventListener('paste', handlePaste)
})

onUnmounted(() => {
  document.removeEventListener('paste', handlePaste)
})
</script>
