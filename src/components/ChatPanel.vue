<template>
  <div class="panel fade-in">
    <div v-if="!hasAiConfig()" class="bg-amber-50 rounded-2xl cute-shadow p-6 mb-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-amber-800">AI 功能需要配置</p>
          <p class="text-xs text-amber-600 mt-0.5">点击右上角设置按钮配置 API Key</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl cute-shadow p-6 mb-4 flex flex-col" style="height: 500px;">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">AI 对话</h2>
        <button
          v-if="messages.length > 0"
          @click="clearMessages"
          class="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          清空对话
        </button>
      </div>

      <div ref="messagesContainer" class="flex-1 overflow-y-auto scrollbar-hide space-y-4 mb-4">
        <template v-if="messages.length === 0">
          <div class="text-center py-8 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p>开始和 AI 对话吧</p>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(msg, index) in messages"
            :key="index"
            class="flex gap-3"
            :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
          >
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="msg.role === 'user' ? 'bg-indigo-500' : 'bg-gray-200'"
            >
              <svg v-if="msg.role === 'user'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <svg v-else class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <div
              class="max-w-[75%] px-4 py-3 rounded-2xl text-sm"
              :class="msg.role === 'user' ? 'bg-indigo-500 text-white' : msg.isError ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'"
            >
              <!-- Reasoning content (思考过程) -->
              <div v-if="msg.reasoningContent" class="mb-3 pb-3 border-b border-gray-200">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                  </svg>
                  <div class="text-xs text-gray-500 italic leading-relaxed" v-html="formatMessage(msg.reasoningContent)"></div>
                </div>
              </div>
              <!-- Main content -->
              <div v-html="formatMessage(msg.content)"></div>
            </div>
          </div>
        </template>
        <div v-if="isLoading" class="flex gap-3">
          <div class="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <div class="bg-gray-100 px-4 py-3 rounded-2xl">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="输入消息..."
          class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          :disabled="isLoading"
          @keypress.enter="handleSend"
        />
        <button
          @click="handleSend"
          :disabled="isLoading || !inputMessage.trim()"
          class="btn-press px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useChat } from '../composables/useChat'
import { marked } from 'marked'

const { messages, isLoading, hasAiConfig, sendMessage, clearMessages } = useChat()

const inputMessage = ref('')
const messagesContainer = ref(null)

const formatMessage = (content) => {
  return marked.parse(content)
}

const handleSend = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  const text = inputMessage.value
  inputMessage.value = ''
  await sendMessage(text)
  await nextTick()
  scrollToBottom()
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(messages, () => {
  nextTick(() => scrollToBottom())
}, { deep: true })
</script>
