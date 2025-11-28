import type { ChapterOverview } from '@/lib/storyEngine'
import type { GenerationHistoryItem } from '@/lib/types'

export type ChapterPlanResult = {
  summary: string
  beats: string[]
  pacing: string
  notes: string[]
}

type ChapterPlanContext = {
  chapter: ChapterOverview
  synopsis: string
  conflicts: string[]
  hooks: string[]
  recentHistory: GenerationHistoryItem[]
}

export function buildChapterPlanPrompt({ chapter, synopsis, conflicts, hooks, recentHistory }: ChapterPlanContext) {
  const sceneLines = chapter.scenes
    .map(
      (scene, index) =>
        `${index + 1}. ${scene.title}（${scene.wordCount} 字）- ${scene.contentPreview || '暂无内容概述'}`,
    )
    .join('\n')

  const historyLines = recentHistory
    .filter((item) => item.tool === 'expand' || item.tool === 'brainstorm' || item.tool === 'chapter-plan')
    .slice(0, 5)
    .map((item) => `- ${item.tool}${item.variant ? `·${item.variant}` : ''}: ${item.output.slice(0, 80)}...`)
    .join('\n')

  const conflictsText = conflicts.length > 0 ? conflicts.join('; ') : '暂无记录'
  const hooksText = hooks.length > 0 ? hooks.join('; ') : '暂无记录'

  return `你是一名中文科幻写作的剧情总设计师，请为当前章节生成剧情规划建议。

输出严格使用 JSON，结构如下：
{
  "summary": "章节概览（不超过120字）",
  "beats": ["按照时间顺序的关键剧情节点，每条不超过40字，3-5条"],
  "pacing": "节奏建议（fast|balanced|slow 之一，可附解释）",
  "notes": ["给作者的提醒或补充建议，每条不超过40字，2-4条"]
}

---
章节标题：${chapter.title}
章节字数：约 ${chapter.wordCount} 字
章节当前文本概览：${chapter.contentPreview || '暂无内容'}

章节包含场景：
${sceneLines || '暂无场景，请同时给出构思建议'}

故事概要：${synopsis || '暂无'}
当前冲突：${conflictsText}
已有钩子：${hooksText}

相关历史生成（供参考）：
${historyLines || '暂无'}

请分析章节定位、节奏、张力，并根据上下文填充 JSON。不要输出解释性文字。`
}

export function parseChapterPlanOutput(raw: string): ChapterPlanResult | null {
  const trimmed = raw.trim()
  try {
    const jsonStart = trimmed.indexOf('{')
    const jsonEnd = trimmed.lastIndexOf('}')
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('No JSON object found')
    }
    const candidate = trimmed.slice(jsonStart, jsonEnd + 1)
    const parsed = JSON.parse(candidate)
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : ''
    const beats = Array.isArray(parsed.beats) ? parsed.beats.filter((item: unknown) => typeof item === 'string') : []
    const pacing = typeof parsed.pacing === 'string' ? parsed.pacing.trim() : 'balanced'
    const notes = Array.isArray(parsed.notes) ? parsed.notes.filter((item: unknown) => typeof item === 'string') : []
    return {
      summary,
      beats,
      pacing: pacing || 'balanced',
      notes,
    }
  } catch (error) {
    console.warn('[StoryEngine] Failed to parse plan output, will fallback to plain text', error)
    return null
  }
}


