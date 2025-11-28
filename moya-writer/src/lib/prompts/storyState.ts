import type { StoryStateOverrides } from '@/lib/storyState'
import type { GenerationHistoryItem } from '@/lib/types'

const clampText = (text: string, limit: number) => {
  if (!text) return ''
  if (text.length <= limit) return text
  return text.slice(-limit)
}

const buildHistoryDigest = (history: GenerationHistoryItem[], limit: number) =>
  history
    .slice(0, limit)
    .map((item) => {
      const label = [item.tool, item.variant].filter(Boolean).join(' · ')
      const content = clampText(item.output, 220)
      return `- ${label}: ${content}`
    })
    .join('\n')

export function buildStoryStateSummaryPrompt(params: {
  synopsis: string
  recentDocument: string
  history: GenerationHistoryItem[]
  overrides: StoryStateOverrides
}) {
  const { synopsis, recentDocument, history, overrides } = params
  const summarySource = clampText(recentDocument, 1400)
  const historyDigest = buildHistoryDigest(history, 5)
  const manualNotes = [
    overrides.synopsis ? `手动概要：${overrides.synopsis}` : null,
    overrides.activeConflicts?.length ? `手动冲突：${overrides.activeConflicts.join(' / ')}` : null,
    overrides.hooks?.length ? `手动钩子：${overrides.hooks.join(' / ')}` : null,
    overrides.lastSummary ? `手动剧情摘要：${overrides.lastSummary}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `你是一名资深华语小说故事编辑，请根据提供的资料产出当前剧情状态摘要。

【重要提示】
- **必须优先分析"最近章节片段"的实际内容**，而不是依赖"故事圣经概要"的模板
- 如果文档内容与故事背景不一致，以文档内容为准
- 概要应该反映当前文档中实际发生的情节，而不是预设的模板

【目标】
1. 用 120-160 字概括当前剧情，保持张力。
2. 列出 2-3 条仍在进行或待解决的冲突。
3. 列出 2-3 条尚未收束的钩子/悬念。
4. 概述最近章节的关键事件，方便续写。
5. 输出必须是合法 JSON，不要添加额外解释。

【最近章节片段】（优先分析此内容）
${summarySource || '（暂无正文片段）'}

【故事圣经概要】（仅供参考，可能与实际文档不一致）
${synopsis || '（暂无概要）'}

【最近 AI 生成摘要】
${historyDigest || '（暂无历史记录）'}

${manualNotes ? `【作者手动补充】\n${manualNotes}\n` : ''}

【输出 JSON 模板】
{
  "synopsis": "120-160 字剧情概括",
  "conflicts": ["冲突1", "冲突2"],
  "hooks": ["钩子1", "钩子2"],
  "latestSummary": "最近章节关键事件（100-150 字）"
}`
}

const extractJson = (text: string): any | null => {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null
  try {
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.warn('[StoryState] 无法解析 AI 返回 JSON', error)
    return null
  }
}

export function parseStoryStateSummary(output: string): StoryStateOverrides | null {
  const data = extractJson(output)
  if (!data || typeof data !== 'object') return null

  const synopsis = typeof data.synopsis === 'string' ? data.synopsis.trim() : undefined
  const conflicts = Array.isArray(data.conflicts)
    ? data.conflicts.map((item: unknown) => String(item ?? '').trim()).filter(Boolean)
    : undefined
  const hooks = Array.isArray(data.hooks)
    ? data.hooks.map((item: unknown) => String(item ?? '').trim()).filter(Boolean)
    : undefined
  const latestSummary = typeof data.latestSummary === 'string' ? data.latestSummary.trim() : undefined

  if (!synopsis && (!conflicts || conflicts.length === 0) && (!hooks || hooks.length === 0) && !latestSummary) {
    return null
  }

  return {
    synopsis,
    activeConflicts: conflicts && conflicts.length > 0 ? conflicts : undefined,
    hooks: hooks && hooks.length > 0 ? hooks : undefined,
    lastSummary: latestSummary,
  }
}

