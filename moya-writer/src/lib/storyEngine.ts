import type { Document } from '@/lib/types'

export type SceneOverview = {
  id: string
  title: string
  wordCount: number
  order: number
  contentPreview: string
}

export type ChapterOverview = {
  id: string
  title: string
  wordCount: number
  order: number
  contentPreview: string
  scenes: SceneOverview[]
}

export type ChapterPlan = {
  summary: string
  beats: string[]
  pacing: string
  notes: string[]
  lastGenerated: number | null
}

export const EMPTY_CHAPTER_PLAN: ChapterPlan = {
  summary: '',
  beats: [],
  pacing: 'balanced',
  notes: [],
  lastGenerated: null,
}

const buildPreview = (content: string, length = 220) => {
  if (!content) return ''
  const trimmed = content.replace(/\s+/g, ' ').trim()
  return trimmed.length > length ? `${trimmed.slice(0, length)}…` : trimmed
}

export function buildChapterOverviews(documents: Document[]): ChapterOverview[] {
  const chapters = documents.filter((doc) => doc.type === 'chapter').sort((a, b) => a.order - b.order)
  const scenes = documents.filter((doc) => doc.type === 'scene')

  return chapters.map((chapter) => {
    const chapterScenes = scenes
      .filter((scene) => scene.parentId === chapter.id)
      .sort((a, b) => a.order - b.order)
      .map<SceneOverview>((scene) => ({
        id: scene.id,
        title: scene.title,
        wordCount: scene.wordCount,
        order: scene.order,
        contentPreview: buildPreview(scene.content, 180),
      }))

    return {
      id: chapter.id,
      title: chapter.title,
      wordCount: chapter.wordCount,
      order: chapter.order,
      contentPreview: buildPreview(chapter.content, 260),
      scenes: chapterScenes,
    }
  })
}


