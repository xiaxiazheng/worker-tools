<template>
  <div class="panel fade-in">
    <div class="bg-white rounded-2xl cute-shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">剪贴板历史</h2>
        <button @click="handleClear" class="btn-press text-sm text-gray-500 hover:text-red-500 transition-colors">清空全部</button>
      </div>
      <div class="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
        <template v-if="items.length === 0">
          <div class="text-center py-8 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p>暂无剪贴板记录</p>
            <p class="text-xs mt-1">复制内容后会自动记录</p>
          </div>
        </template>
        <template v-else>
          <div
            v-for="item in items"
            :key="item.id"
            class="fade-in flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-700 break-all line-clamp-3">{{ escapeHtml(item.content) }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(item.timestamp) }}</p>
            </div>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="handleCopy(item.content)"
                class="btn-press p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                title="复制"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                </svg>
              </button>
              <button
                @click="removeItem(item.id)"
                class="btn-press p-2 text-red-400 hover:bg-red-50 rounded-lg"
                title="删除"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useClipboard } from '../composables/useClipboard'
import { useToast } from '../composables/useToast'
import { escapeHtml, formatTime } from '../utils'

const { items, load, remove: removeItem, clear } = useClipboard()
const { show: showToast } = useToast()

onMounted(() => {
  load()
})

const handleCopy = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    showToast('已复制到剪贴板')
  })
}

const handleClear = async () => {
  await clear()
}
</script>
