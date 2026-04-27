import { ref } from 'vue'
import { useSettings } from './useSettings'
import { useToast } from './useToast'

export function useChat() {
  const { getSettings, hasAiConfig } = useSettings()
  const { show: showToast } = useToast()

  const messages = ref([])
  const isLoading = ref(false)

  // Parse content with <thinking> tags
  const parseContent = (rawContent) => {
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/)
    if (thinkMatch) {
      return {
        reasoningContent: thinkMatch[1].trim(),
        content: rawContent.replace(/<think>[\s\S]*?<\/think>/, '').trim()
      }
    }
    return { reasoningContent: '', content: rawContent }
  }

  const sendMessage = async (content) => {
    if (!content.trim()) return

    const settings = getSettings()
    if (!settings.apiHost || !settings.model || !settings.apiKey) {
      showToast('请先在设置中配置 AI', 'error')
      return
    }

    // Build URL based on provider type
    const path = settings.provider === 'openai' ? '/v1/chat/completions' : '/v1/messages'
    const apiUrl = `${settings.apiHost.replace(/\/$/, '')}${path}`

    // Add user message
    messages.value.push({
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    })

    isLoading.value = true

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl,
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          prompt: content.trim(),
          max_tokens: 4096
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API 请求失败 (${response.status})`)
      }

      const data = await response.json()

      let rawContent
      let reasoningContent = ''
      if (settings.provider === 'openai') {
        // OpenAI format: { choices: [{ message: { content: "...", reasoning_content: "..." } }] }
        rawContent = data.choices?.[0]?.message?.content || ''
        reasoningContent = data.choices?.[0]?.message?.reasoning_content || ''
      } else {
        // Anthropic format: { content: [{ type: "text", text: "..." }, { type: "thinking", thinking: "...", signature: "..." }] }
        const textItem = data.content?.find(item => item.type === 'text')
        rawContent = textItem ? textItem.text : JSON.stringify(data)
        // Check for thinking item at array level
        const thinkingItem = data.content?.find(item => item.type === 'thinking')
        if (thinkingItem?.thinking) {
          reasoningContent = thinkingItem.thinking
        }
      }

      // Parse thinking tags from content (for OpenAI text format with <thinking> tags)
      if (!reasoningContent) {
        const parsed = parseContent(rawContent)
        reasoningContent = parsed.reasoningContent
        rawContent = parsed.content
      }

      messages.value.push({
        role: 'assistant',
        content: rawContent,
        reasoningContent: reasoningContent,
        timestamp: Date.now()
      })
    } catch (error) {
      messages.value.push({
        role: 'assistant',
        content: `错误: ${error.message}`,
        timestamp: Date.now(),
        isError: true
      })
    } finally {
      isLoading.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    isLoading,
    hasAiConfig,
    sendMessage,
    clearMessages
  }
}
