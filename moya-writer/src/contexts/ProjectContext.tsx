import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

import type { Document, DocumentType, Project } from '@/lib/types'
import { StorageService } from '@/services/storage'
import { ExportService } from '@/services/exportService'

type ProjectContextValue = {
  projects: Project[]
  currentProject: Project | null
  documents: Document[]
  currentProjectId: string | null
  currentDocumentId: string | null
  currentDocument: Document | null
  isLoading: boolean
  switchProject: (projectId: string) => void
  openDocument: (documentId: string) => void
  updateDocumentContent: (documentId: string, content: string) => void
  createProject: (title: string) => void
  renameProject: (projectId: string, title: string) => void
  deleteProject: (projectId: string) => void
  createDocument: (options?: { title?: string; type?: DocumentType; parentId?: string | null }) => void
  renameDocument: (documentId: string, title: string) => void
  deleteDocuments: (documentIds: string[]) => void
  reorderDocument: (documentId: string, targetId: string, position: 'before' | 'after') => void
  moveDocuments: (documentIds: string[], targetParentId: string | null) => void
  exportProject: (projectId: string) => Promise<void>
  importProject: (file: File) => Promise<string>
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined)

const MOCK_PROJECTS: Project[] = [
  {
    id: 'project_demo_1',
    title: '赛博天鹅绒 · Cyber Velvet',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 6,
  },
  {
    id: 'project_demo_2',
    title: '孔雀王朝编年史',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
]

const MOCK_DOCUMENTS: Record<string, Document[]> = {
  project_demo_1: [
    {
      id: 'doc_demo_1',
      projectId: 'project_demo_1',
      title: '第01章 · 夜航日志',
      content: '课堂的空气被蓝白色的光谱切割，冯老师眼前的 AR 面板忽然闪烁。',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      updatedAt: Date.now() - 1000 * 60 * 60 * 6,
      wordCount: 1832,
      type: 'chapter',
      parentId: null,
      order: 0,
    },
    {
      id: 'doc_demo_2',
      projectId: 'project_demo_1',
      title: '角色设定 · 主角档案',
      content: '姓名：冯老师\n能力：影目 air3 三维交互，具备共鸣模块。',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
      updatedAt: Date.now() - 1000 * 60 * 60 * 2,
      wordCount: 945,
      type: 'note',
      parentId: null,
      order: 1,
    },
  ],
  project_demo_2: [
    {
      id: 'doc_demo_3',
      projectId: 'project_demo_2',
      title: '世界观碎片',
      content: '清晨的孔雀王朝被雾霭笼罩，旧神与新 AI 的契约摇摇欲坠。',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 13,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
      wordCount: 602,
      type: 'note',
      parentId: null,
      order: 0,
    },
  ],
}

const PROJECTS_KEY = 'all'

const ROOT_KEY = '__root__'

const defaultDocumentType = (doc: Partial<Document>, index: number): DocumentType => {
  if (doc.type) return doc.type
  const title = doc.title ?? ''
  if (/章|scene|scene/i.test(title)) return 'chapter'
  if (/角色|人物|character/i.test(title)) return 'note'
  return index === 0 ? 'chapter' : 'note'
}

const normalizeDocument = (doc: Partial<Document>, index: number): Document => {
  const content = doc.content ?? ''
  return {
    id: doc.id ?? `doc_${Date.now()}_${index}`,
    projectId: doc.projectId ?? 'unknown',
    title: doc.title ?? '未命名文档',
    content,
    createdAt: doc.createdAt ?? Date.now(),
    updatedAt: doc.updatedAt ?? Date.now(),
    wordCount: typeof doc.wordCount === 'number' ? doc.wordCount : content.length,
    type: defaultDocumentType(doc as Document, index),
    parentId: doc.parentId ?? null,
    order: typeof doc.order === 'number' ? doc.order : index,
  }
}

const assignSiblingOrder = (documents: Document[]): Document[] => {
  const grouped = new Map<string, Document[]>()
  for (const doc of documents) {
    const key = doc.parentId ?? ROOT_KEY
    const list = grouped.get(key)
    if (list) {
      list.push(doc)
    } else {
      grouped.set(key, [doc])
    }
  }

  const next: Document[] = []
  grouped.forEach((list) => {
    list
      .sort((a, b) => {
        if (a.order === b.order) {
          return a.createdAt - b.createdAt
        }
        return a.order - b.order
      })
      .forEach((doc, idx) => {
        next.push({ ...doc, order: idx })
      })
  })
  return next
}

const buildChildrenMap = (docs: Document[]) => {
  const map = new Map<string, string[]>()
  docs.forEach((doc) => {
    if (!doc.parentId) return
    const list = map.get(doc.parentId)
    if (list) {
      list.push(doc.id)
    } else {
      map.set(doc.parentId, [doc.id])
    }
  })
  return map
}

type ProjectProviderProps = {
  children: React.ReactNode
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [documentsMap, setDocumentsMap] = useState<Record<string, Document[]>>({})
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      await StorageService.ready()
      const storedProjects = await StorageService.getObject<Project[]>(
        'projects',
        PROJECTS_KEY,
      )
      const nextProjects = storedProjects?.length ? storedProjects : MOCK_PROJECTS
      if (!storedProjects || storedProjects.length === 0) {
        await StorageService.setObject('projects', PROJECTS_KEY, nextProjects)
      }

      const nextDocumentsMap: Record<string, Document[]> = {}
      for (const project of nextProjects) {
        const storedDocs = await StorageService.getObject<Document[]>(
          'documents',
          project.id,
        )
        const rawDocs = storedDocs ?? MOCK_DOCUMENTS[project.id] ?? []
        const normalizedDocs = rawDocs
          .map((doc, index) => normalizeDocument({ ...doc, projectId: project.id }, index))
          .sort((a, b) => {
            const parentA = a.parentId ?? 'root'
            const parentB = b.parentId ?? 'root'
            if (parentA === parentB) return a.order - b.order
            return parentA.localeCompare(parentB)
          })
        if (!storedDocs) {
          await StorageService.setObject('documents', project.id, normalizedDocs)
        }
        nextDocumentsMap[project.id] = normalizedDocs
      }

      setProjects(nextProjects)
      setDocumentsMap(nextDocumentsMap)
      const firstProjectId = nextProjects[0]?.id ?? null
      setCurrentProjectId(firstProjectId)
      setCurrentDocumentId(firstProjectId ? nextDocumentsMap[firstProjectId]?.[0]?.id ?? null : null)
      setIsLoading(false)
    }

    void load()
  }, [])

  const persistProjects = useCallback((next: Project[]) => {
    setProjects(next)
    void StorageService.setObject('projects', PROJECTS_KEY, next)
  }, [])

  const persistDocuments = useCallback((projectId: string, docs: Document[]) => {
    const normalizedDocs = docs.map((doc, index) => normalizeDocument({ ...doc, projectId }, index))
    const orderedDocs = assignSiblingOrder(normalizedDocs).sort((a, b) => {
      const parentA = a.parentId ?? 'root'
      const parentB = b.parentId ?? 'root'
      if (parentA === parentB) return a.order - b.order
      return parentA.localeCompare(parentB)
    })
    setDocumentsMap((prev) => ({
      ...prev,
      [projectId]: orderedDocs,
    }))
    void StorageService.setObject('documents', projectId, orderedDocs)
  }, [])

  const value = useMemo<ProjectContextValue>(() => {
    const currentProject = projects.find((project) => project.id === currentProjectId) ?? null
    const projectDocuments = currentProject ? documentsMap[currentProject.id] ?? [] : []
    const currentDocument = projectDocuments.find((doc) => doc.id === currentDocumentId) ?? null

    return {
      projects,
      currentProject,
      documents: projectDocuments,
      currentProjectId,
      currentDocumentId,
      currentDocument,
      isLoading,
      switchProject: (projectId: string) => {
        setCurrentProjectId(projectId)
        const firstDoc = documentsMap[projectId]?.[0]?.id ?? null
        setCurrentDocumentId(firstDoc)
      },
      openDocument: (documentId: string) => {
        setCurrentDocumentId(documentId)
      },
      updateDocumentContent: (documentId: string, content: string) => {
        const projectId = currentProjectId
        if (!projectId) return
        const docs = documentsMap[projectId] ?? []
        const updatedDocs = docs.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                content,
                wordCount: content.length,
                updatedAt: Date.now(),
              }
            : doc,
        )
        persistDocuments(projectId, updatedDocs)

        const nextProjects = projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                updatedAt: Date.now(),
              }
            : project,
        )
        persistProjects(nextProjects)
      },
      createProject: (title: string) => {
        const id = `project_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        const project: Project = {
          id,
          title,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        const nextProjects = [project, ...projects]
        persistProjects(nextProjects)
        persistDocuments(id, [])
        setCurrentProjectId(id)
        setCurrentDocumentId(null)
      },
      renameProject: (projectId: string, title: string) => {
        const nextProjects = projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                title,
                updatedAt: Date.now(),
              }
            : project,
        )
        persistProjects(nextProjects)
      },
      deleteProject: (projectId: string) => {
        if (!projects.some((project) => project.id === projectId)) return
        const nextProjects = projects.filter((project) => project.id !== projectId)
        const { [projectId]: _removed, ...restDocuments } = documentsMap
        persistProjects(nextProjects)
        setDocumentsMap(restDocuments)
        void StorageService.remove('documents', projectId)
        void StorageService.remove('storyBible', projectId)
        void StorageService.remove('history', projectId)
        void StorageService.remove('storyState', projectId)
        void StorageService.remove('storyEngine', projectId)

        if (currentProjectId === projectId) {
          const nextProjectId = nextProjects[0]?.id ?? null
          setCurrentProjectId(nextProjectId)
          setCurrentDocumentId(nextProjectId ? restDocuments[nextProjectId]?.[0]?.id ?? null : null)
        }
      },
      createDocument: (options) => {
        const projectId = currentProjectId
        if (!projectId) return
        const docs = documentsMap[projectId] ?? []
        const { title, type, parentId } = options ?? {}
        const docType: DocumentType = type ?? 'chapter'
        const targetParent = parentId ?? null
        const siblings = docs.filter((doc) => doc.parentId === targetParent)
        const nextOrder = siblings.length
        const nextId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        const newDoc: Document = {
          id: nextId,
          projectId,
          title: title ?? (docType === 'chapter' ? '新章节' : docType === 'scene' ? '新场景' : '新文档'),
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          wordCount: 0,
          type: docType,
          parentId: targetParent,
          order: nextOrder,
        }
        const updatedDocs = [...docs, newDoc]
        persistDocuments(projectId, updatedDocs)
        setCurrentDocumentId(nextId)

        const nextProjects = projects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                updatedAt: Date.now(),
              }
            : project,
        )
        persistProjects(nextProjects)
      },
      renameDocument: (documentId: string, title: string) => {
        const projectId = currentProjectId
        if (!projectId) return
        const docs = documentsMap[projectId] ?? []
        const updatedDocs = docs.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                title,
                updatedAt: Date.now(),
              }
            : doc,
        )
        persistDocuments(projectId, updatedDocs)
      },
      deleteDocuments: (documentIds) => {
        const projectId = currentProjectId
        if (!projectId || documentIds.length === 0) return
        const docs = documentsMap[projectId] ?? []
        const idSet = new Set(documentIds)
        const childrenMap = buildChildrenMap(docs)

        const collectDescendants = (id: string) => {
          const stack = [id]
          const collected = new Set<string>()
          while (stack.length > 0) {
            const current = stack.pop()
            if (!current || collected.has(current)) continue
            collected.add(current)
            const children = childrenMap.get(current) ?? []
            children.forEach((child) => stack.push(child))
          }
          return collected
        }

        const toDelete = new Set<string>()
        idSet.forEach((id) => {
          collectDescendants(id).forEach((item) => toDelete.add(item))
        })

        if (toDelete.size === 0) return

        const remaining = docs.filter((doc) => !toDelete.has(doc.id))
        persistDocuments(projectId, remaining)

        if (currentDocumentId && toDelete.has(currentDocumentId)) {
          setCurrentDocumentId(remaining[0]?.id ?? null)
        }
      },
      reorderDocument: (documentId, targetId, position) => {
        const projectId = currentProjectId
        if (!projectId) return
        const docs = documentsMap[projectId] ?? []
        const source = docs.find((doc) => doc.id === documentId)
        const target = docs.find((doc) => doc.id === targetId)
        if (!source || !target) return
        const sourceParent = source.parentId ?? null
        const targetParent = target.parentId ?? null
        if (sourceParent !== targetParent) return

        const remaining = docs.filter((doc) => doc.id !== documentId)
        const targetIndex = remaining.findIndex((doc) => doc.id === targetId)
        if (targetIndex === -1) return

        const insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
        const updatedDocs = [
          ...remaining.slice(0, insertIndex),
          { ...source, parentId: sourceParent, updatedAt: Date.now() },
          ...remaining.slice(insertIndex),
        ]

        persistDocuments(projectId, updatedDocs)
      },
      moveDocuments: (documentIds, targetParentId) => {
        const projectId = currentProjectId
        if (!projectId) return
        if (documentIds.length === 0) return

        const docs = documentsMap[projectId] ?? []
        const idSet = new Set(documentIds)
        if (targetParentId && idSet.has(targetParentId)) return

        const docMap = new Map(docs.map((doc) => [doc.id, doc]))
        const isDescendantOf = (candidateId: string, potentialAncestorId: string): boolean => {
          let cursor: string | null | undefined = candidateId
          while (cursor) {
            if (cursor === potentialAncestorId) return true
            cursor = docMap.get(cursor)?.parentId ?? null
          }
          return false
        }

        if (targetParentId && documentIds.some((docId) => isDescendantOf(targetParentId, docId))) {
          return
        }

        const remaining = docs.filter((doc) => !idSet.has(doc.id))
        const moving = docs
          .filter((doc) => idSet.has(doc.id))
          .map((doc) => ({ ...doc, parentId: targetParentId, updatedAt: Date.now() }))

        const updatedDocs = [...remaining, ...moving]
        persistDocuments(projectId, updatedDocs)
      },
      exportProject: async (projectId: string) => {
        try {
          const data = await ExportService.exportProject(projectId)
          ExportService.downloadProject(data)
        } catch (error) {
          console.error('[ProjectContext] 导出失败', error)
          throw error
        }
      },
      importProject: async (file: File) => {
        try {
          const data = await ExportService.importProject(file)
          const newProjectId = await ExportService.saveImportedProject(data)
          
          // 重新加载项目列表
          await StorageService.ready()
          const storedProjects = await StorageService.getObject<Project[]>(
            'projects',
            PROJECTS_KEY,
          )
          if (storedProjects) {
            setProjects(storedProjects)
            setCurrentProjectId(newProjectId)
            
            // 加载新项目的文档
            const importedDocs = await StorageService.getObject<Document[]>(
              'documents',
              newProjectId,
            )
            if (importedDocs) {
              setDocumentsMap((prev) => ({
                ...prev,
                [newProjectId]: importedDocs,
              }))
              setCurrentDocumentId(importedDocs[0]?.id ?? null)
            }
          }
          
          return newProjectId
        } catch (error) {
          console.error('[ProjectContext] 导入失败', error)
          throw error
        }
      },
    }
  }, [
    currentDocumentId,
    currentProjectId,
    documentsMap,
    isLoading,
    persistDocuments,
    persistProjects,
    projects,
  ])

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}


