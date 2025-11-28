import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { StorageService } from '@/services/storage'
import { hasGeminiKey } from '@/services/gemini'
import { hasDeepSeekKey } from '@/services/deepseek'
import { hasZhipuKey } from '@/services/zhipu'

type ApiKeys = {
  gemini?: string
  deepseek?: string
  zhipu?: string
}

export type AiSettings = {
  provider: 'gemini' | 'deepseek' | 'zhipu'
  model: string
  temperature: number
  suggestionCount: 1 | 2 | 3
  outputLength: number
  keys: ApiKeys
  parallelProviders?: Array<'gemini' | 'deepseek' | 'zhipu'>
}

const DEFAULT_SETTINGS: AiSettings = {
  provider: hasDeepSeekKey() ? 'deepseek' : hasGeminiKey() ? 'gemini' : hasZhipuKey() ? 'zhipu' : 'deepseek',
  model: hasDeepSeekKey() ? 'deepseek-chat' : hasZhipuKey() ? 'glm-4.6' : 'gemini-1.5-pro',
  temperature: 0.7,
  suggestionCount: 2,
  outputLength: 160,
  keys: {
    gemini: hasGeminiKey() ? import.meta.env.VITE_GEMINI_API_KEY : undefined,
    deepseek: hasDeepSeekKey() ? import.meta.env.VITE_DEEPSEEK_API_KEY : undefined,
    zhipu: hasZhipuKey() ? import.meta.env.VITE_ZHIPU_API_KEY : undefined,
  },
  parallelProviders: [],
}

type SettingsContextValue = {
  settings: AiSettings
  isLoading: boolean
  updateAi: (partial: Partial<Omit<AiSettings, 'keys'>>) => void
  setApiKey: (provider: 'gemini' | 'deepseek' | 'zhipu', key: string | undefined) => void
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

const SETTINGS_KEY = 'ai-settings'

type SettingsProviderProps = {
  children: React.ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      await StorageService.ready()
      const stored = await StorageService.getObject<AiSettings>('settings', SETTINGS_KEY)
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored, keys: { ...DEFAULT_SETTINGS.keys, ...stored.keys } })
      } else {
        await StorageService.setObject('settings', SETTINGS_KEY, DEFAULT_SETTINGS)
      }
      setIsLoading(false)
    }

    void load()
  }, [])

  const persist = async (next: AiSettings) => {
    setSettings(next)
    await StorageService.setObject('settings', SETTINGS_KEY, next)
  }

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      isLoading,
      updateAi: (partial) => {
        const next = { ...settings, ...partial }
        void persist(next)
      },
      setApiKey: (provider, key) => {
        const trimmed = key?.trim()
        const nextKeys = { ...settings.keys, [provider]: trimmed || undefined }
        let next: AiSettings = { ...settings, keys: nextKeys }

        if (trimmed) {
          if (provider === 'deepseek') {
            next = {
              ...next,
              provider: 'deepseek',
              model: next.model.startsWith('deepseek') ? next.model : 'deepseek-chat',
            }
          }
          if (provider === 'gemini') {
            next = {
              ...next,
              provider: 'gemini',
              model: next.model.startsWith('gemini') ? next.model : 'gemini-1.5-pro',
            }
          }
          if (provider === 'zhipu') {
            next = {
              ...next,
              provider: 'zhipu',
              model: next.model.startsWith('glm') ? next.model : 'glm-4.6',
            }
          }
        }

        void persist(next)
      },
    }),
    [isLoading, settings],
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
