import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { useProject } from '@/contexts/ProjectContext'
import type { GenerationHistoryItem } from '@/lib/types'
import { StorageService } from '@/services/storage'

const HISTORY_NAMESPACE = 'history'

type HistoryContextValue = {
  items: GenerationHistoryItem[]
  isLoading: boolean
  addItem: (item: Omit<GenerationHistoryItem, 'id' | 'createdAt' | 'starred'>) => void
  toggleStar: (id: string) => void
  clearHistory: (projectId: string) => void
  log: (entry: {
    projectId: string
    documentId: string | null
    tool: GenerationHistoryItem['tool']
    variant?: string
    input: string
    output: string
    model: string
  }) => void
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined)

type HistoryProviderProps = {
  children: React.ReactNode
}

export function HistoryProvider({ children }: HistoryProviderProps) {
  const { currentProjectId } = useProject()
  const [items, setItems] = useState<GenerationHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!currentProjectId) {
        setItems([])
        setIsLoading(false)
        return
      }
      await StorageService.ready()
      const stored = await StorageService.getObject<GenerationHistoryItem[]>(
        HISTORY_NAMESPACE,
        currentProjectId,
      )
      setItems(stored ?? [])
      setIsLoading(false)
    }

    void load()
  }, [currentProjectId])

  const persist = async (projectId: string, next: GenerationHistoryItem[]) => {
    setItems(next)
    await StorageService.setObject(HISTORY_NAMESPACE, projectId, next)
  }

  const value = useMemo<HistoryContextValue>(() => ({
    items,
    isLoading,
    addItem: (item) => {
      if (!currentProjectId) return
      const nextItem: GenerationHistoryItem = {
        id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        createdAt: Date.now(),
        starred: false,
        ...item,
        projectId: currentProjectId,
      }
      const nextItems = [nextItem, ...items]
      void persist(currentProjectId, nextItems)
    },
    toggleStar: (id) => {
      if (!currentProjectId) return
      const nextItems = items.map((entry) =>
        entry.id === id ? { ...entry, starred: !entry.starred } : entry,
      )
      void persist(currentProjectId, nextItems)
    },
    clearHistory: (projectId) => {
      void persist(projectId, [])
    },
    log: ({ projectId, documentId, tool, variant, input, output, model }) => {
      const nextItem: GenerationHistoryItem = {
        id: `history_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId,
        documentId,
        tool,
        variant,
        input,
        output,
        model,
        createdAt: Date.now(),
        starred: false,
      }
      const nextItems = [nextItem, ...items]
      void persist(projectId, nextItems)
    },
  }), [currentProjectId, isLoading, items])

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider')
  }
  return context
}
