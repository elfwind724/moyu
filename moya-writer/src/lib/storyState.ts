import type { GenerationHistoryItem } from '@/lib/types'

export type StoryState = {
  synopsis: string
  activeConflicts: string[]
  hooks: string[]
  lastSummary: string
}

export type StoryStateOverrides = Partial<StoryState>

export const EMPTY_STORY_STATE: StoryState = {
  synopsis: '',
  activeConflicts: [],
  hooks: [],
  lastSummary: '',
}

/**
 * 从文档内容中提取简要概要（前200字）
 */
function extractDocumentSummary(content: string): string {
  if (!content || content.trim().length === 0) {
    return ''
  }

  // 移除多余的空白字符
  const cleaned = content
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)

  // 如果内容很短，直接返回
  if (cleaned.length < 100) {
    return cleaned
  }

  // 尝试在句号或段落结尾截断
  const lastSentenceEnd = Math.max(
    cleaned.lastIndexOf('。'),
    cleaned.lastIndexOf('！'),
    cleaned.lastIndexOf('？'),
    cleaned.lastIndexOf('.'),
    cleaned.lastIndexOf('!'),
    cleaned.lastIndexOf('?'),
  )

  if (lastSentenceEnd > 50) {
    return cleaned.slice(0, lastSentenceEnd + 1)
  }

  return cleaned
}

export function buildStoryState(params: {
  synopsis: string
  recentHistory: GenerationHistoryItem[]
  recentDocument: string
}): StoryState {
  const { synopsis, recentHistory, recentDocument } = params

  const conflicts: string[] = []
  const hooks: string[] = []

  recentHistory.slice(0, 10).forEach((entry) => {
    if (entry.tool === 'expand' && entry.variant?.includes('冲突')) {
      conflicts.push(entry.output)
    }
    if (entry.tool === 'expand' && entry.variant?.includes('钩子')) {
      hooks.push(entry.output)
    }
    if (entry.tool === 'write' && entry.variant?.includes('悬念')) {
      hooks.push(entry.output)
    }
  })

  const lastSummary = recentDocument.slice(-800)

  // 优先使用文档内容生成的概要
  // 如果文档有内容（即使很少），也优先显示文档内容，而不是显示不相关的Story Bible模板
  const documentSummary = extractDocumentSummary(recentDocument)
  
  // 检测是否是硬编码的默认模板（包含"霓虹都市"和"冯老师"）
  const isHardcodedTemplate = synopsis && synopsis.includes('霓虹都市') && synopsis.includes('冯老师') && synopsis.includes('影目 air3')
  
  const effectiveSynopsis =
    documentSummary.length > 0
      ? documentSummary
      : recentDocument.trim().length > 0
      ? recentDocument.trim().slice(0, 200) // 如果提取失败，至少显示原始内容的前200字
      : isHardcodedTemplate
      ? '（暂无故事概要，请开始在编辑器中写作，或点击"重新整理"生成）' // 如果Story Bible是硬编码模板，不显示
      : synopsis || '（暂无故事概要，请在 Story Bible 中填写或点击"重新整理"生成）'

  return {
    synopsis: effectiveSynopsis,
    activeConflicts: conflicts.slice(0, 3),
    hooks: hooks.slice(0, 3),
    lastSummary,
  }
}

export function applyStoryStateOverrides(base: StoryState, overrides: StoryStateOverrides): StoryState {
  return {
    synopsis: overrides.synopsis ?? base.synopsis,
    activeConflicts: overrides.activeConflicts ?? base.activeConflicts,
    hooks: overrides.hooks ?? base.hooks,
    lastSummary: overrides.lastSummary ?? base.lastSummary,
  }
}
