import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { useProject } from '@/contexts/ProjectContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useStoryState } from '@/contexts/StoryStateContext'
import { buildChapterOverviews, type ChapterOverview, type ChapterPlan } from '@/lib/storyEngine'
import { buildChapterPlanPrompt, parseChapterPlanOutput } from '@/lib/prompts/storyEngine'
import { StorageService } from '@/services/storage'
import { generateWithProvider } from '@/services/ai'

type StoryEngineContextValue = {
  chapters: ChapterOverview[]
  plans: Record<string, ChapterPlan>
  isGenerating: Record<string, boolean>
  generateChapterPlan: (chapterId: string) => Promise<void>
}

const StoryEngineContext = createContext<StoryEngineContextValue | null>(null)

const STORAGE_NAMESPACE = 'storyEngine'

type StoredPlans = Record<string, ChapterPlan>

export function StoryEngineProvider({ children }: { children: React.ReactNode }) {
  const { documents, currentProjectId } = useProject()
  const { items: historyItems, log: logHistory } = useHistory()
  const { state: storyState } = useStoryState()
  const { settings } = useSettings()
  const [plans, setPlans] = useState<Record<string, ChapterPlan>>({})
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({})

  const chapters = useMemo(() => buildChapterOverviews(documents), [documents])

  useEffect(() => {
    const load = async () => {
      if (!currentProjectId) {
        setPlans({})
        setIsGenerating({})
        return
      }
      await StorageService.ready()
      const stored = await StorageService.getObject<StoredPlans>(STORAGE_NAMESPACE, currentProjectId)
      setPlans(stored ?? {})
      setIsGenerating({})
    }

    void load()
  }, [currentProjectId])

  const persistPlans = useCallback(
    async (projectId: string, nextPlans: Record<string, ChapterPlan>) => {
      setPlans(nextPlans)
      await StorageService.setObject(STORAGE_NAMESPACE, projectId, nextPlans)
    },
    [],
  )

  const generateChapterPlan = useCallback(
    async (chapterId: string) => {
      if (!currentProjectId) return
      const chapter = chapters.find((item) => item.id === chapterId)
      if (!chapter) return

      setIsGenerating((prev) => ({ ...prev, [chapterId]: true }))
      const logVariant = `Chapter · ${chapter.title}`

      try {
        const recentHistory = historyItems.slice(0, 8)
        const prompt = buildChapterPlanPrompt({
          chapter,
          synopsis: storyState.synopsis,
          conflicts: storyState.activeConflicts,
          hooks: storyState.hooks,
          recentHistory,
        })

        const output = await generateWithProvider(
          settings.provider === 'deepseek'
            ? {
                provider: 'deepseek',
                prompt,
                projectId: currentProjectId,
                documentId: chapterId,
                tool: 'chapter-plan',
                variant: logVariant,
                model: (settings.model as 'deepseek-chat' | 'deepseek-reasoner') ?? 'deepseek-chat',
                temperature: settings.temperature,
                apiKey: settings.keys.deepseek,
                maxOutputTokens: 640,
                log: ({ projectId, documentId, tool, variant, input, output, model }) =>
                  logHistory({
                    projectId,
                    documentId,
                    tool: tool ?? 'chapter-plan',
                    variant,
                    input,
                    output,
                    model,
                  }),
              }
            : settings.provider === 'zhipu'
            ? {
                provider: 'zhipu',
                prompt,
                projectId: currentProjectId,
                documentId: chapterId,
                tool: 'chapter-plan',
                variant: logVariant,
                model: (settings.model as 'glm-4.6' | 'glm-4.5') ?? 'glm-4.6',
                temperature: settings.temperature,
                apiKey: settings.keys.zhipu,
                maxOutputTokens: 640,
                log: ({ projectId, documentId, tool, variant, input, output, model }) =>
                  logHistory({
                    projectId,
                    documentId,
                    tool: tool ?? 'chapter-plan',
                    variant,
                    input,
                    output,
                    model,
                  }),
              }
            : {
                provider: 'gemini',
                prompt,
                model: settings.model,
                apiKey: settings.keys.gemini,
                variant: logVariant,
                maxOutputTokens: 640,
                historyOptions: {
                  projectId: currentProjectId,
                  documentId: chapterId,
                  tool: 'chapter-plan',
                  variant: logVariant,
                  log: ({ projectId, documentId, tool, variant, input, output, model }) =>
                    logHistory({
                      projectId,
                      documentId,
                      tool: tool ?? 'chapter-plan',
                      variant,
                      input,
                      output,
                      model,
                    }),
                },
              },
        )

        const parsed = parseChapterPlanOutput(output)
        const nextPlan: ChapterPlan = {
          summary: parsed?.summary ?? output.slice(0, 280),
          beats: parsed?.beats ?? [],
          pacing: parsed?.pacing ?? 'balanced',
          notes: parsed?.notes ?? [],
          lastGenerated: Date.now(),
        }

        const nextPlans = { ...plans, [chapterId]: nextPlan }
        await persistPlans(currentProjectId, nextPlans)
      } catch (error) {
        console.error('[StoryEngine] 章节规划生成失败', error)
        // swallow error so按钮不会因为未捕获Promise而报错
      } finally {
        setIsGenerating((prev) => ({ ...prev, [chapterId]: false }))
      }
    },
    [
      chapters,
      currentProjectId,
      historyItems,
      logHistory,
      persistPlans,
      plans,
      settings.keys.deepseek,
      settings.keys.gemini,
      settings.model,
      settings.provider,
      settings.temperature,
      storyState.activeConflicts,
      storyState.hooks,
      storyState.synopsis,
    ],
  )

  const value = useMemo<StoryEngineContextValue>(
    () => ({
      chapters,
      plans,
      isGenerating,
      generateChapterPlan,
    }),
    [chapters, generateChapterPlan, plans, isGenerating],
  )

  return <StoryEngineContext.Provider value={value}>{children}</StoryEngineContext.Provider>
}

export function useStoryEngine() {
  const context = useContext(StoryEngineContext)
  if (!context) {
    throw new Error('useStoryEngine must be used within StoryEngineProvider')
  }
  return context
}


