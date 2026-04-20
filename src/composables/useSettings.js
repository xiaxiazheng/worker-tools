export function useSettings() {
  const getSettings = () => {
    return {
      apiUrl: localStorage.getItem('fe-tools-api-url') || '',
      model: localStorage.getItem('fe-tools-model') || '',
      apiKey: localStorage.getItem('fe-tools-api-key') || ''
    }
  }

  const saveSettings = (settings) => {
    if (settings.apiUrl) localStorage.setItem('fe-tools-api-url', settings.apiUrl)
    else localStorage.removeItem('fe-tools-api-url')

    if (settings.model) localStorage.setItem('fe-tools-model', settings.model)
    else localStorage.removeItem('fe-tools-model')

    if (settings.apiKey) localStorage.setItem('fe-tools-api-key', settings.apiKey)
    else localStorage.removeItem('fe-tools-api-key')
  }

  const hasAiConfig = () => {
    return localStorage.getItem('fe-tools-api-key') && localStorage.getItem('fe-tools-api-url')
  }

  return { getSettings, saveSettings, hasAiConfig }
}
