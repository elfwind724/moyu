import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react'

import { useProject } from '@/contexts/ProjectContext'

type HighlightSpan = {
  id: string
  start: number
  end: number
}

type EditorContextValue = {
  currentDocumentId: string | null
  content: string
  setContent: (content: string) => void
  setSelectionText: (text: string) => void
  selectionText: string
  addHighlight: (span: HighlightSpan) => void
  highlights: HighlightSpan[]
  queueInsertion: (text: string) => void
  pendingInsertion: string | null
  clearPendingInsertion: () => void
  isDirty: boolean
  save: () => void
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined)

type EditorProviderProps = {
  children: React.ReactNode
}

export function EditorProvider({ children }: EditorProviderProps) {
  const { currentDocumentId, currentDocument, updateDocumentContent } = useProject()
  const [draftContent, setDraftContent] = useState(currentDocument?.content ?? '')
  const [selectionText, setSelectionTextState] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [highlights, setHighlights] = useState<HighlightSpan[]>([])
  const [pendingInsertion, setPendingInsertion] = useState<string | null>(null)

  useEffect(() => {
    setDraftContent(currentDocument?.content ?? '')
    setIsDirty(false)
  }, [currentDocument?.id])

  const setDraft = useCallback(
    (content: string) => {
      setDraftContent(content)
      setIsDirty(content !== (currentDocument?.content ?? ''))
    },
    [currentDocument?.content],
  )

  const saveDraft = useCallback(() => {
    if (currentDocumentId) {
      updateDocumentContent(currentDocumentId, draftContent)
      setIsDirty(false)
    }
  }, [currentDocumentId, draftContent, updateDocumentContent])

  const queueInsertion = useCallback((text: string) => {
    setPendingInsertion(text)
  }, [])

  const clearPendingInsertion = useCallback(() => {
    setPendingInsertion(null)
  }, [])

  const value = useMemo<EditorContextValue>(
    () => ({
      currentDocumentId,
      content: draftContent,
      setContent: setDraft,
      setSelectionText: setSelectionTextState,
      selectionText,
      addHighlight: (span: HighlightSpan) =>
        setHighlights((prev) => [...prev.filter((item) => item.id !== span.id), span]),
      highlights,
      queueInsertion,
      pendingInsertion,
      clearPendingInsertion,
      isDirty,
      save: saveDraft,
    }),
    [
      clearPendingInsertion,
      currentDocumentId,
      draftContent,
      highlights,
      isDirty,
      pendingInsertion,
      queueInsertion,
      saveDraft,
      selectionText,
      setDraft,
    ],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditor() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider')
  }
  return context
}
