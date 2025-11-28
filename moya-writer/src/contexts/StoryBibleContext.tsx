import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  StoryBible,
  StoryBibleBraindump,
  StoryBibleScene,
  StoryBibleSynopsis,
  StoryBibleWorldEntry,
} from '@/lib/types'
import { StorageService } from '@/services/storage'
import { useProject } from '@/contexts/ProjectContext'

type StoryBibleContextValue = {
  storyBible: StoryBible
  isLoading: boolean
  updateBraindump: (data: StoryBibleBraindump) => void
  updateSynopsis: (data: StoryBibleSynopsis) => void
  upsertScene: (scene: StoryBibleScene) => void
  upsertWorldEntry: (entry: StoryBibleWorldEntry) => void
}

const StoryBibleContext = createContext<StoryBibleContextValue | undefined>(
  undefined,
)

const DEMO_BIBLE: StoryBible = {
  braindump: {
    ideas: `- 主角“冯老师”使用影目 air3 与 AI 对抗
- 每次释放技能会影响城市电力
- AI 想要接管所有 AR 设备，引发失控风暴`,
    lastUpdated: Date.now() - 1000 * 60 * 30,
  },
  synopsis: {
    summary:
      '在霓虹都市，教师兼黑客冯老师借助影目 air3 与失控 AI 对抗，揭开其背后的阴谋，并带领学生们重构城市自由。',
    beats: [
      '引子：课堂实验失控，AI 露出端倪',
      '中段：冯老师与学生潜入数据之城，发现背后势力',
      '结尾：通过“记忆共鸣”修复 AI，与城市和解',
    ],
    lastGenerated: Date.now() - 1000 * 60 * 60 * 12,
  },
  characters: [
    {
      id: 'char_teacher',
      name: '冯老师',
      role: 'protagonist',
      hook: '拥有影目 air3，能与 AI 互动',
      goals: '守护学生与城市自由',
      secrets: '曾参与 AI 初始编程，留下后门',
      traits: ['沉稳', '前瞻', '顾家'],
      importance: 'high',
      lastUpdated: Date.now() - 1000 * 60 * 90,
    },
    {
      id: 'char_student',
      name: '小安',
      role: 'supporting',
      hook: '学生黑客，擅长社交工程',
      goals: '证明自己，帮助老师',
      secrets: '与失控 AI 有神秘链接',
      traits: ['好奇', '冲动', '乐观'],
      importance: 'medium',
      lastUpdated: Date.now() - 1000 * 60 * 120,
    },
  ],
  worldbuilding: [
    {
      id: 'world_city',
      kind: 'location',
      name: '蓝湾都市',
      description: '海港城市，被无处不在的 AR 层包裹',
      connections: ['world_corp', 'char_teacher'],
      lastUpdated: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'world_corp',
      kind: 'organization',
      name: '晨星集团',
      description: '影目 air3 的制造商，与 AI 疑似有关',
      connections: ['char_teacher', 'char_student'],
      lastUpdated: Date.now() - 1000 * 60 * 200,
    },
  ],
  outline: [
    {
      id: 'outline_1',
      title: '第一幕：光影课堂',
      summary: '授课事故暴露 AI 异常，冯老师决定调查。',
      order: 1,
    },
    {
      id: 'outline_2',
      title: '第二幕：数据之城潜行',
      summary: '团队潜入 AI 核心，遭遇内鬼。',
      order: 2,
    },
  ],
  scenes: [
    {
      id: 'scene_intro',
      title: '课堂暴走',
      purpose: '制造危机、展示能力',
      conflict: 'AI 控制学生终端，场面失控',
      outcome: '冯老师压制危机，却引来更大关注',
      status: 'draft',
      lastUpdated: Date.now() - 1000 * 60 * 45,
    },
  ],
  style: {
    genre: ['科幻', '悬疑'],
    tone: '紧张而充满希望',
    pov: 'third',
    tense: 'present',
    inspirations: ['攻壳机动队', '银翼杀手2049'],
    voiceNotes: '保持中文科幻质感，兼顾都市感与人文温度。',
  },
}

const createDefaultBible = (): StoryBible => JSON.parse(JSON.stringify(DEMO_BIBLE))

type StoryBibleProviderProps = {
  children: React.ReactNode
}

export function StoryBibleProvider({ children }: StoryBibleProviderProps) {
  const { projects, currentProjectId } = useProject()
  const [storyBibleMap, setStoryBibleMap] = useState<Record<string, StoryBible>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (projects.length === 0) {
      return
    }

    const load = async () => {
      await StorageService.ready()
      const entries = await Promise.all(
        projects.map(async (project) => {
          const stored = await StorageService.getObject<StoryBible>(
            'storyBible',
            project.id,
          )
          const bible = stored ?? createDefaultBible()
          if (!stored) {
            await StorageService.setObject('storyBible', project.id, bible)
          }
          return [project.id, bible] as const
        }),
      )
      setStoryBibleMap((prev) => {
        const next = { ...prev }
        for (const [id, bible] of entries) {
          next[id] = bible
        }
        return next
      })
      setIsLoading(false)
    }

    void load()
  }, [projects])

  const persistBible = useCallback((projectId: string, bible: StoryBible) => {
    setStoryBibleMap((prev) => ({
      ...prev,
      [projectId]: bible,
    }))
    void StorageService.setObject('storyBible', projectId, bible)
  }, [])

  const updateBraindump = useCallback(
    (data: StoryBibleBraindump) => {
      if (!currentProjectId) return
      const current = storyBibleMap[currentProjectId] ?? createDefaultBible()
      const next = {
        ...current,
        braindump: { ...data, lastUpdated: Date.now() },
      }
      persistBible(currentProjectId, next)
    },
    [currentProjectId, persistBible, storyBibleMap],
  )

  const updateSynopsis = useCallback(
    (data: StoryBibleSynopsis) => {
      if (!currentProjectId) return
      const current = storyBibleMap[currentProjectId] ?? createDefaultBible()
      const next = {
        ...current,
        synopsis: { ...data, lastGenerated: Date.now() },
      }
      persistBible(currentProjectId, next)
    },
    [currentProjectId, persistBible, storyBibleMap],
  )

  const upsertScene = useCallback(
    (scene: StoryBibleScene) => {
      if (!currentProjectId) return
      const current = storyBibleMap[currentProjectId] ?? createDefaultBible()
      const exists = current.scenes.find((item) => item.id === scene.id)
      const nextScene: StoryBibleScene = {
        ...scene,
        lastUpdated: Date.now(),
      }
      const next = {
        ...current,
        scenes: exists
          ? current.scenes.map((item) => (item.id === scene.id ? nextScene : item))
          : [nextScene, ...current.scenes],
      }
      persistBible(currentProjectId, next)
    },
    [currentProjectId, persistBible, storyBibleMap],
  )

  const upsertWorldEntry = useCallback(
    (entry: StoryBibleWorldEntry) => {
      if (!currentProjectId) return
      const current = storyBibleMap[currentProjectId] ?? createDefaultBible()
      const exists = current.worldbuilding.find((item) => item.id === entry.id)
      const nextEntry: StoryBibleWorldEntry = {
        ...entry,
        lastUpdated: Date.now(),
      }
      const next = {
        ...current,
        worldbuilding: exists
          ? current.worldbuilding.map((item) =>
              item.id === entry.id ? nextEntry : item,
            )
          : [nextEntry, ...current.worldbuilding],
      }
      persistBible(currentProjectId, next)
    },
    [currentProjectId, persistBible, storyBibleMap],
  )

  const activeBible = useMemo<StoryBible>(() => {
    if (!currentProjectId) {
      return createDefaultBible()
    }
    return storyBibleMap[currentProjectId] ?? createDefaultBible()
  }, [currentProjectId, storyBibleMap])

  const value = useMemo<StoryBibleContextValue>(
    () => ({
      storyBible: activeBible,
      isLoading,
      updateBraindump,
      updateSynopsis,
      upsertScene,
      upsertWorldEntry,
    }),
    [activeBible, isLoading, updateBraindump, updateSynopsis, upsertScene, upsertWorldEntry],
  )

  return (
    <StoryBibleContext.Provider value={value}>
      {children}
    </StoryBibleContext.Provider>
  )
}

export function useStoryBible() {
  const context = useContext(StoryBibleContext)
  if (!context) {
    throw new Error('useStoryBible must be used within StoryBibleProvider')
  }
  return context
}
