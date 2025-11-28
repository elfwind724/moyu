import { useMemo } from 'react'

import { useStoryEngine } from '@/contexts/StoryEngineContext'
import { Button } from '@/components/ui/button'
import { EMPTY_CHAPTER_PLAN } from '@/lib/storyEngine'
import { Loader2, RefreshCcw, Sparkles } from 'lucide-react'

const pacingLabel: Record<string, string> = {
  fast: '快节奏',
  slow: '慢节奏',
  balanced: '平衡节奏',
}

const formatTimestamp = (timestamp: number | null) => {
  if (!timestamp) return '尚未生成'
  return new Date(timestamp).toLocaleString()
}

export function ChapterPlannerPanel() {
  const { chapters, plans, isGenerating, generateChapterPlan } = useStoryEngine()

  const hasChapters = chapters.length > 0

  const orderedChapters = useMemo(() => [...chapters].sort((a, b) => a.order - b.order), [chapters])

  if (!hasChapters) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Sparkles className="h-6 w-6" />
        <p>当前项目还没有章节文档。请先在左侧大纲中新建章节，再生成剧情规划。</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Story Engine</p>
        <h2 className="text-base font-semibold text-foreground">Chapter Planner · 剧情章节规划</h2>
        <p className="text-xs text-muted-foreground">
          基于当前章节与场景内容，自动生成剧情节奏与剧情节点建议，协助你把控故事走向。
        </p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {orderedChapters.map((chapter, index) => {
          const plan = plans[chapter.id] ?? EMPTY_CHAPTER_PLAN
          const generating = Boolean(isGenerating[chapter.id])
          const hasPlan = Boolean(plan.summary) || plan.beats.length > 0 || plan.notes.length > 0
          const pacingText = pacingLabel[plan.pacing] ?? plan.pacing

          return (
            <section
              key={chapter.id}
              className="rounded-3xl border border-border bg-card/40 p-5 text-sm text-foreground shadow-sm"
            >
              <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Chapter {index + 1}</p>
                  <h3 className="text-lg font-semibold">{chapter.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    长度约 {chapter.wordCount} 字 · 场景 {chapter.scenes.length} 个
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-8 gap-2 px-3 text-xs"
                    disabled={generating}
                    onClick={() => generateChapterPlan(chapter.id)}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> 生成中…
                      </>
                    ) : hasPlan ? (
                      <>
                        <RefreshCcw className="h-3.5 w-3.5" /> 重新整理
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" /> 生成建议
                      </>
                    )}
                  </Button>
                </div>
              </header>

              <div className="mt-4 space-y-3">
                <section className="space-y-2 rounded-2xl border border-dashed border-border bg-background/70 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">章节概览</p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {chapter.contentPreview || '暂无章节正文，可先撰写内容再生成规划。'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>规划版本：{hasPlan ? formatTimestamp(plan.lastGenerated) : '尚未生成'}</span>
                    {hasPlan && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                        节奏建议：{pacingText}
                      </span>
                    )}
                  </div>
                </section>

                <section className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">包含场景</p>
                  {chapter.scenes.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border bg-card/30 p-3 text-xs text-muted-foreground">
                      暂无场景，可在左侧章节树为该章节添加场景。
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {chapter.scenes.map((scene) => (
                        <li
                          key={scene.id}
                          className="rounded-xl border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground"
                        >
                          <span className="font-medium text-foreground">{scene.title}</span>
                          <span className="mx-2 text-muted-foreground/70">·</span>
                          <span>{scene.wordCount} 字</span>
                          {scene.contentPreview && (
                            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                              {scene.contentPreview}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {hasPlan ? (
                  <section className="space-y-3 rounded-2xl border border-primary/40 bg-primary/5 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-primary/80">AI 剧情规划摘要</p>
                      <p className="text-sm leading-relaxed text-primary/90">{plan.summary}</p>
                    </div>
                    {plan.beats.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary/80">剧情节点建议</p>
                        <ol className="space-y-1 text-sm text-primary/90">
                          {plan.beats.map((beat, beatIndex) => (
                            <li key={`${chapter.id}-beat-${beatIndex}`} className="flex gap-2">
                              <span className="mt-[2px] inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-primary/20 text-[11px] font-semibold">
                                {beatIndex + 1}
                              </span>
                              <span className="flex-1 leading-relaxed">{beat}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {plan.notes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-primary/80">节奏与优化提示</p>
                        <ul className="space-y-1 text-sm text-primary/90">
                          {plan.notes.map((note, noteIndex) => (
                            <li key={`${chapter.id}-note-${noteIndex}`} className="flex gap-2">
                              <span>•</span>
                              <span className="leading-relaxed">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ) : (
                  <section className="rounded-2xl border border-dashed border-border bg-card/30 p-4 text-xs text-muted-foreground">
                    点击“生成建议”后将提供剧情节点、节奏建议与优化提示，帮助你更快掌握章节结构。
                  </section>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}


