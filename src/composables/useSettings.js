export function useSettings() {
  const getSettings = () => {
    return {
      apiHost: localStorage.getItem('fe-tools-api-host') || '',
      provider: localStorage.getItem('fe-tools-provider') || 'anthropic',
      model: localStorage.getItem('fe-tools-model') || '',
      apiKey: localStorage.getItem('fe-tools-api-key') || ''
    }
  }

  const saveSettings = (settings) => {
    if (settings.apiHost) localStorage.setItem('fe-tools-api-host', settings.apiHost)
    else localStorage.removeItem('fe-tools-api-host')

    if (settings.provider) localStorage.setItem('fe-tools-provider', settings.provider)
    else localStorage.removeItem('fe-tools-provider')

    if (settings.model) localStorage.setItem('fe-tools-model', settings.model)
    else localStorage.removeItem('fe-tools-model')

    if (settings.apiKey) localStorage.setItem('fe-tools-api-key', settings.apiKey)
    else localStorage.removeItem('fe-tools-api-key')
  }

  const hasAiConfig = () => {
    return localStorage.getItem('fe-tools-api-key') && localStorage.getItem('fe-tools-api-host')
  }

  return { getSettings, saveSettings, hasAiConfig }
}
