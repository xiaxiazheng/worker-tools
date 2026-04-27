<template>
  <div>
    <div
      id="settings-overlay"
      class="fixed inset-0 bg-black/30 z-40 overlay"
      :class="{ 'opacity-0 pointer-events-none': !visible }"
      @click="$emit('close')"
    ></div>
    <div
      id="settings-panel"
      class="side-panel fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50"
      :class="{ 'translate-x-full': !visible, 'translate-x-0': visible }"
    >
      <div class="p-6 h-full flex flex-col">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-800">设置</h2>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto scrollbar-hide">
          <div class="space-y-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-3">AI 设置</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">API Host</label>
                  <input
                    v-model="localSettings.apiHost"
                    type="text"
                    placeholder="https://api.minimaxi.com"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">API 类型</label>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="localSettings.provider"
                        value="anthropic"
                        class="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                      />
                      <span class="text-sm text-gray-700">Anthropic</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        v-model="localSettings.provider"
                        value="openai"
                        class="w-4 h-4 text-indigo-500 focus:ring-indigo-400"
                      />
                      <span class="text-sm text-gray-700">OpenAI / GPT</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">模型名称</label>
                  <input
                    v-model="localSettings.model"
                    type="text"
                    placeholder="MiniMax-M2.7"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
                  <input
                    v-model="localSettings.apiKey"
                    type="password"
                    placeholder="输入 API Key"
                    class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              @click="handleSave"
              class="btn-press w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              保存设置
            </button>

            <p v-if="status" class="text-sm text-center" :class="statusClass">{{ status }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSettings } from '../composables/useSettings'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'saved'])

const { getSettings, saveSettings } = useSettings()

const localSettings = ref(getSettings())
const status = ref('')
const statusClass = ref('text-emerald-500')

watch(() => props.visible, (val) => {
  if (val) {
    localSettings.value = getSettings()
    status.value = ''
  }
})

const handleSave = () => {
  saveSettings(localSettings.value)
  status.value = '✓ 设置已保存'
  statusClass.value = 'text-emerald-500'
  emit('saved')

  setTimeout(() => {
    status.value = ''
  }, 2000)
}
</script>
