import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useProject } from '@/contexts/ProjectContext'
import { useStoryBible } from '@/contexts/StoryBibleContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useSettings } from '@/contexts/SettingsContext'
import {
  applyStoryStateOverrides,
  buildStoryState,
  EMPTY_STORY_STATE,
  type StoryState,
  type StoryStateOverrides,
} from '@/lib/storyState'
import { buildStoryStateSummaryPrompt, parseStoryStateSummary } from '@/lib/prompts/storyState'
import { StorageService, type StorageNamespace } from '@/services/storage'
import { generateWithProvider } from '@/services/ai'

const OVERRIDES_NAMESPACE: StorageNamespace = 'storyState'

type StoryStateContextValue = {
  state: StoryState
  computed: StoryState
  overrides: StoryStateOverrides
  isRefreshing: boolean
  aiCooldownMs: number | null
  aiLastRunAt: number | null
  refresh: (options?: { useAI?: boolean }) => Promise<void>
  updateOverrides: (partial: StoryStateOverrides) => Promise<void>
  clearOverrides: () => Promise<void>
}

const StoryStateContext = createContext<StoryStateContextValue | null>(null)

const sanitizeOverrides = (overrides: StoryStateOverrides): StoryStateOverrides => {
  const next: StoryStateOverrides = {}
  if (overrides.synopsis && overrides.synopsis.trim().length > 0) {
    next.synopsis = overrides.synopsis.trim()
  }
  if (Array.isArray(overrides.activeConflicts) && overrides.activeConflicts.length > 0) {
    next.activeConflicts = overrides.activeConflicts
  }
  if (Array.isArray(overrides.hooks) && overrides.hooks.length > 0) {
    next.hooks = overrides.hooks
  }
  if (typeof overrides.lastSummary === 'string' && overrides.lastSummary.trim().length > 0) {
    next.lastSummary = overrides.lastSummary.trim()
  }
  return next
}

export function StoryStateProvider({ children }: { children: React.ReactNode }) {
  const { storyBible } = useStoryBible()
  const { currentDocument, currentProjectId } = useProject()
  const { items } = useHistory()
  const { settings } = useSettings()
  const [computed, setComputed] = useState<StoryState>(EMPTY_STORY_STATE)
  const [overrides, setOverrides] = useState<StoryStateOverrides>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [aiLastRunAt, setAiLastRunAt] = useState<number | null>(null)
  const [aiCooldownMs, setAiCooldownMs] = useState<number | null>(null)

  useEffect(() => {
    if (!aiLastRunAt) {
      setAiCooldownMs(null)
      return
    }

    const updateRemaining = () => {
      const elapsed = Date.now() - aiLastRunAt
      const remaining = Math.max(0, 60000 - elapsed)
      setAiCooldownMs(remaining > 0 ? remaining : null)
    }

    updateRemaining()
    const timer = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timer)
  }, [aiLastRunAt])

  const refresh = useCallback(
    async (options?: { useAI?: boolean }) => {
      setIsRefreshing(true)
      try {
        // 优先基于文档内容生成故事状态，Story Bible 的概要仅作为参考
        const base = buildStoryState({
          synopsis: storyBible.synopsis.summary, // 作为fallback参考
          recentHistory: items,
          recentDocument: currentDocument?.content ?? '',
        })

        let next = base

        const shouldUseAI = options?.useAI === true
        const hasAIKey =
          (settings.provider === 'deepseek' && settings.keys.deepseek) ||
          (settings.provider === 'gemini' && settings.keys.gemini)

        if (shouldUseAI && hasAIKey && currentProjectId) {
          if (aiCooldownMs && aiCooldownMs > 0) {
            throw new Error('剧情状态刚刚刷新，请稍后再试（约 1 分钟间隔）。')
          }
          try {
            const prompt = buildStoryStateSummaryPrompt({
              synopsis: storyBible.synopsis.summary,
              recentDocument: currentDocument?.content ?? '',
              history: items,
              overrides,
            })

            const output = await generateWithProvider(
              settings.provider === 'deepseek'
                ? {
                    provider: 'deepseek',
                    prompt,
                    projectId: currentProjectId,
                    documentId: currentDocument?.id ?? null,
                    tool: 'brainstorm',
                    model: (settings.model as 'deepseek-chat' | 'deepseek-reasoner') ?? 'deepseek-chat',
                    temperature: settings.temperature,
                    apiKey: settings.keys.deepseek,
                    maxOutputTokens: 640,
                    log: () => {},
                  }
                : settings.provider === 'zhipu'
                ? {
                    provider: 'zhipu',
                    prompt,
                    projectId: currentProjectId,
                    documentId: currentDocument?.id ?? null,
                    tool: 'brainstorm',
                    model: (settings.model as 'glm-4.6' | 'glm-4.5') ?? 'glm-4.6',
                    temperature: settings.temperature,
                    apiKey: settings.keys.zhipu,
                    maxOutputTokens: 640,
                    log: () => {},
                  }
                : {
                    provider: 'gemini',
                    prompt,
                    model: settings.model,
                    apiKey: settings.keys.gemini,
                    maxOutputTokens: 640,
                    historyOptions: {
                      projectId: currentProjectId,
                      documentId: currentDocument?.id ?? null,
                      tool: 'brainstorm',
                      variant: '剧情摘要',
                      log: () => {},
                    },
                  },
            )

            const aiOverrides = parseStoryStateSummary(output)
            if (aiOverrides) {
              next = applyStoryStateOverrides(base, aiOverrides)
            }
            setAiLastRunAt(Date.now())
          } catch (error) {
            console.warn('[StoryState] AI 刷新失败，将使用本地摘要', error)
            throw error
          }
        }

        setComputed(next)
      } finally {
        setIsRefreshing(false)
      }
    },
    [
      currentDocument?.content,
      currentDocument?.id,
      currentProjectId,
      items,
      overrides,
      aiCooldownMs,
      settings.keys.deepseek,
      settings.keys.gemini,
      settings.model,
      settings.provider,
      settings.temperature,
      storyBible.synopsis.summary,
    ],
  )

  useEffect(() => {
    void refresh({ useAI: false })
  }, [refresh])

  useEffect(() => {
    if (!currentProjectId) {
      setOverrides({})
      return
    }

    const load = async () => {
      await StorageService.ready()
      const stored = await StorageService.getObject<StoryStateOverrides>(
        OVERRIDES_NAMESPACE,
        currentProjectId,
      )
      setOverrides(stored ?? {})
    }

    void load()
  }, [currentProjectId])

  const persistOverrides = useCallback(
    async (next: StoryStateOverrides) => {
      if (!currentProjectId) {
        setOverrides(next)
        return
      }
      const sanitized = sanitizeOverrides(next)
      setOverrides(sanitized)
      await StorageService.setObject(OVERRIDES_NAMESPACE, currentProjectId, sanitized)
    },
    [currentProjectId],
  )

  const updateOverrides = useCallback(
    async (partial: StoryStateOverrides) => {
      const next = { ...overrides, ...partial }
      await persistOverrides(next)
    },
    [overrides, persistOverrides],
  )

  const clearOverrides = useCallback(async () => {
    await persistOverrides({})
  }, [persistOverrides])

  const value = useMemo<StoryStateContextValue>(() => {
    const state = applyStoryStateOverrides(computed, overrides)
    return {
      state,
      computed,
      overrides,
      isRefreshing,
      aiCooldownMs,
      aiLastRunAt,
      refresh,
      updateOverrides,
      clearOverrides,
    }
  }, [aiCooldownMs, aiLastRunAt, clearOverrides, computed, isRefreshing, overrides, refresh, updateOverrides])

  return <StoryStateContext.Provider value={value}>{children}</StoryStateContext.Provider>
}

export function useStoryState() {
  const context = useContext(StoryStateContext)
  if (!context) {
    throw new Error('useStoryState must be used within StoryStateProvider')
  }
  return context
}
