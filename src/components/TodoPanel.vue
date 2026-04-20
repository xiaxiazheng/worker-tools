<template>
  <div class="panel fade-in">
    <div class="bg-white rounded-2xl cute-shadow p-6 mb-4">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">添加任务</h2>
      <div class="flex gap-3">
        <input
          v-model="newTodoText"
          type="text"
          placeholder="输入新任务..."
          class="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
          @keypress.enter="handleAddTodo"
        />
        <select v-model="newTodoPriority" class="px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none">
          <option value="low">低优先级</option>
          <option value="medium" selected>中优先级</option>
          <option value="high">高优先级</option>
        </select>
        <button
          @click="handleAddTodo"
          class="btn-press px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
        >
          添加
        </button>
      </div>
    </div>

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

    <div class="bg-white rounded-2xl cute-shadow p-6 mb-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">任务列表</h2>
        <span class="text-sm text-gray-400">{{ todos.length }} 项任务</span>
      </div>
      <div class="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
        <template v-if="todos.length === 0">
          <div class="text-center py-8 text-gray-400">
            <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <p>暂无任务</p>
          </div>
        </template>
        <template v-else>
          <div
            v-for="todo in todos"
            :key="todo.id"
            class="fade-in flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            :class="priorityColors[todo.priority]"
          >
            <button
              @click="toggleTodo(todo.id)"
              class="btn-press w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="todo.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'"
            >
              <svg v-if="todo.completed" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </button>
            <span class="flex-1 text-sm" :class="todo.completed ? 'line-through text-gray-400' : 'text-gray-700'">
              {{ escapeHtml(todo.text) }}
            </span>
            <button @click="removeTodo(todo.id)" class="btn-press p-2 text-red-400 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="删除">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>

    <div class="bg-white rounded-2xl cute-shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">生成日报</h2>
      <button
        @click="generateReport"
        class="btn-press w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
        </svg>
        基于已完成任务生成日报
      </button>
      <div v-if="reportContent" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">生成结果</span>
          <button @click="copyReport" class="text-sm text-indigo-500 hover:text-indigo-600">复制</button>
        </div>
        <div v-html="reportContent" class="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 max-h-96 overflow-y-auto prose prose-sm max-w-none"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTodos } from '../composables/useTodos'
import { useSettings } from '../composables/useSettings'
import { useToast } from '../composables/useToast'
import { escapeHtml, getPriorityLabel } from '../utils'
import { marked } from 'marked'

const { todos, load: loadTodos, add: addTodo, toggle: toggleTodo, remove: removeTodo } = useTodos()
const { hasAiConfig } = useSettings()
const { show: showToast } = useToast()

const newTodoText = ref('')
const newTodoPriority = ref('medium')
const reportContent = ref('')

const priorityColors = {
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low'
}

onMounted(() => {
  loadTodos()
})

const handleAddTodo = async () => {
  if (!newTodoText.value.trim()) return
  await addTodo(newTodoText.value.trim(), newTodoPriority.value)
  newTodoText.value = ''
}

const generateReport = async () => {
  const apiUrl = localStorage.getItem('fe-tools-api-url')
  const model = localStorage.getItem('fe-tools-model')
  const apiKey = localStorage.getItem('fe-tools-api-key')

  if (!apiUrl || !model || !apiKey) {
    showToast('请先在设置中配置完整信息', 'error')
    return
  }

  const completedTodos = todos.value.filter(t => t.completed)
  const pendingTodos = todos.value.filter(t => !t.completed)

  if (completedTodos.length === 0) {
    showToast('暂无已完成的任务', 'error')
    return
  }

  reportContent.value = '<div class="text-center py-4"><div class="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><p class="mt-2 text-gray-500">正在生成...</p></div>'

  const completedList = completedTodos.map(t => `- ${t.text} [${getPriorityLabel(t.priority)}]`).join('\n')
  const pendingList = pendingTodos.length > 0 ? pendingTodos.map(t => `- ${t.text} [${getPriorityLabel(t.priority)}]`).join('\n') : '无'

  const prompt = `根据以下任务数据，用一句话生成今日日报。自动按优先级（高→中→低）聚合描述已完成的任务，突出重点。

已完成任务：
${completedList}

待处理任务：
${pendingList}

要求：
- 用一句话总结今日工作成果
- 按优先级从高到低描述
- 不要添加任何未提供的信息
- 不要使用表格或列表，用流畅的句子描述`

  try {
    const response = await fetch('http://localhost:3000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiUrl, model, apiKey, prompt, max_tokens: 1024 })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`)
    }

    const data = await response.json()
    const textItem = data.content?.find(item => item.type === 'text')
    const content = textItem ? textItem.text : JSON.stringify(data)
    reportContent.value = marked.parse(content)
  } catch (error) {
    reportContent.value = `<div class="text-red-500">生成失败: ${error.message}</div>`
  }
}

const copyReport = () => {
  const content = document.querySelector('#report-content')?.innerText || ''
  navigator.clipboard.writeText(content).then(() => {
    showToast('报告已复制到剪贴板')
  })
}
</script>
