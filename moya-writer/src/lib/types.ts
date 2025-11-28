export type Project = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export type DocumentType = 'chapter' | 'scene' | 'note' | 'reference' | 'folder'

export type Document = {
  id: string
  projectId: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
  wordCount: number
  type: DocumentType
  parentId: string | null
  order: number
}

export type StoryBibleBraindump = {
  ideas: string
  lastUpdated: number
}

export type StoryBibleSynopsis = {
  summary: string
  beats: string[]
  lastGenerated: number | null
}

export type StoryBibleCharacter = {
  id: string
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'other'
  hook: string
  goals: string
  secrets: string
  traits: string[]
  importance: 'high' | 'medium' | 'low'
  lastUpdated: number
}

export type StoryBibleWorldEntry = {
  id: string
  kind: 'location' | 'organization' | 'item' | 'rule'
  name: string
  description: string
  connections: string[]
  lastUpdated: number
}

export type StoryBibleOutlineNode = {
  id: string
  title: string
  summary: string
  order: number
  children?: StoryBibleOutlineNode[]
}

export type StoryBibleScene = {
  id: string
  title: string
  purpose: string
  conflict: string
  outcome: string
  status: 'draft' | 'revised' | 'done'
  lastUpdated: number
}

export type StoryBibleStyle = {
  genre: string[]
  tone: string
  pov: 'first' | 'third' | 'omniscient' | 'second' | 'mixed'
  tense: 'past' | 'present' | 'future'
  inspirations: string[]
  voiceNotes: string
}

export type StoryBible = {
  braindump: StoryBibleBraindump
  synopsis: StoryBibleSynopsis
  characters: StoryBibleCharacter[]
  worldbuilding: StoryBibleWorldEntry[]
  outline: StoryBibleOutlineNode[]
  scenes: StoryBibleScene[]
  style: StoryBibleStyle
}

export type EditorSelection = {
  anchorOffset: number
  focusOffset: number
}

export type EditorContextState = {
  currentDocumentId: string | null
  isDirty: boolean
}

export type GenerationHistoryItem = {
  id: string
  projectId: string
  documentId: string | null
  tool: 'write' | 'rewrite' | 'describe' | 'expand' | 'brainstorm' | 'twist' | 'shrink' | 'chapter-plan' | 'custom'
  variant?: string
  input: string
  output: string
  model: string
  createdAt: number
  starred: boolean
}


