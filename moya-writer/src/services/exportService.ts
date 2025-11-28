import type { Document, Project, StoryBible, GenerationHistoryItem } from '@/lib/types'
import type { ChapterPlan } from '@/lib/storyEngine'
import { StorageService } from './storage'

export type ExportedProject = {
  version: string
  exportedAt: number
  project: Project
  documents: Document[]
  storyBible: StoryBible
  history: GenerationHistoryItem[]
  storyState?: {
    synopsis?: string
    activeConflicts?: string[]
    hooks?: string[]
    lastSummary?: string
  }
  chapterPlans?: Record<string, ChapterPlan>
}

export const ExportService = {
  /**
   * 导出项目为 JSON 文件
   */
  async exportProject(projectId: string): Promise<ExportedProject> {
    await StorageService.ready()

    // 获取项目信息
    const projects = await StorageService.getObject<Project[]>('projects', 'all')
    const project = projects?.find((p) => p.id === projectId)
    if (!project) {
      throw new Error(`项目 ${projectId} 不存在`)
    }

    // 获取项目数据
    const documents = (await StorageService.getObject<Document[]>('documents', projectId)) ?? []
    const storyBible = (await StorageService.getObject<StoryBible>('storyBible', projectId)) ?? {
      braindump: { ideas: '', lastUpdated: Date.now() },
      synopsis: { summary: '', beats: [], lastGenerated: null },
      characters: [],
      worldbuilding: [],
      outline: [],
      scenes: [],
      style: {
        genre: [],
        tone: '',
        pov: 'third',
        tense: 'past',
        inspirations: [],
        voiceNotes: '',
      },
    }
    const history = (await StorageService.getObject<GenerationHistoryItem[]>('history', projectId)) ?? []
    const storyStateData = await StorageService.getObject<{
      synopsis?: string
      activeConflicts?: string[]
      hooks?: string[]
      lastSummary?: string
    }>('storyState', projectId)
    const storyState = storyStateData ?? undefined
    const chapterPlans = (await StorageService.getObject<Record<string, ChapterPlan>>('storyEngine', projectId)) ?? {}

    const exported: ExportedProject = {
      version: '1.0.0',
      exportedAt: Date.now(),
      project,
      documents,
      storyBible,
      history,
      storyState,
      chapterPlans,
    }

    return exported
  },

  /**
   * 下载导出的项目文件
   */
  downloadProject(data: ExportedProject, filename?: string) {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `${data.project.title}_${new Date(data.exportedAt).toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  /**
   * 从文件导入项目
   */
  async importProject(file: File): Promise<ExportedProject> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const text = event.target?.result
          if (typeof text !== 'string') {
            reject(new Error('文件读取失败'))
            return
          }
          const data = JSON.parse(text) as ExportedProject
          
          // 验证版本和基本结构
          if (!data.version || !data.project || !Array.isArray(data.documents)) {
            reject(new Error('无效的项目文件格式'))
            return
          }

          resolve(data)
        } catch (error) {
          reject(new Error(`解析文件失败: ${error instanceof Error ? error.message : String(error)}`))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  },

  /**
   * 将导入的项目数据保存到存储
   */
  async saveImportedProject(data: ExportedProject, newProjectId?: string): Promise<string> {
    await StorageService.ready()

    // 生成新项目 ID（如果未提供）
    const projectId = newProjectId ?? `project_${Date.now()}`
    
    // 更新项目信息
    const project: Project = {
      ...data.project,
      id: projectId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    // 更新文档 ID 并关联到新项目
    const documents: Document[] = data.documents.map((doc) => ({
      ...doc,
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      createdAt: doc.createdAt || Date.now(),
      updatedAt: doc.updatedAt || Date.now(),
    }))

    // 更新历史记录 ID
    const history: GenerationHistoryItem[] = data.history.map((item) => ({
      ...item,
      id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      createdAt: item.createdAt || Date.now(),
    }))

    // 保存所有数据
    const projects = (await StorageService.getObject<Project[]>('projects', 'all')) ?? []
    await StorageService.setObject('projects', 'all', [...projects.filter((p) => p.id !== projectId), project])
    
    await StorageService.setObject('documents', projectId, documents)
    await StorageService.setObject('storyBible', projectId, data.storyBible)
    await StorageService.setObject('history', projectId, history)
    
    if (data.storyState) {
      await StorageService.setObject('storyState', projectId, data.storyState)
    }
    
    if (data.chapterPlans) {
      await StorageService.setObject('storyEngine', projectId, data.chapterPlans)
    }

    return projectId
  },
}

