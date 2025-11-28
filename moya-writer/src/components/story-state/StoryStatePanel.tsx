import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useStoryState } from '@/contexts/StoryStateContext'
import { RefreshCw, PencilLine } from 'lucide-react'

const linesToText = (lines: string[]) => lines.join('\n')
const textToLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

export function StoryStatePanel() {
  const {
    state,
    computed,
    overrides,
    isRefreshing,
    aiCooldownMs,
    refresh,
    updateOverrides,
    clearOverrides,
  } = useStoryState()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draftSynopsis, setDraftSynopsis] = useState('')
  const [draftConflicts, setDraftConflicts] = useState('')
  const [draftHooks, setDraftHooks] = useState('')
  const [draftSummary, setDraftSummary] = useState('')

  const hasOverrides = useMemo(
    () =>
      Boolean(overrides.synopsis || overrides.lastSummary || overrides.activeConflicts || overrides.hooks),
    [overrides.activeConflicts, overrides.hooks, overrides.lastSummary, overrides.synopsis],
  )

  useEffect(() => {
    if (isEditing) {
      setDraftSynopsis(overrides.synopsis ?? state.synopsis ?? '')
      setDraftConflicts(linesToText(overrides.activeConflicts ?? state.activeConflicts ?? []))
      setDraftHooks(linesToText(overrides.hooks ?? state.hooks ?? []))
      setDraftSummary(overrides.lastSummary ?? state.lastSummary ?? '')
    }
  }, [isEditing, overrides.activeConflicts, overrides.hooks, overrides.lastSummary, overrides.synopsis, state.activeConflicts, state.hooks, state.lastSummary, state.synopsis])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const parsedConflicts = textToLines(draftConflicts)
      const parsedHooks = textToLines(draftHooks)
      await updateOverrides({
        synopsis: draftSynopsis.trim() ? draftSynopsis.trim() : undefined,
        activeConflicts: parsedConflicts.length > 0 ? parsedConflicts : undefined,
        hooks: parsedHooks.length > 0 ? parsedHooks : undefined,
        lastSummary: draftSummary.trim() ? draftSummary.trim() : undefined,
      })
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    setIsSaving(true)
    try {
      await clearOverrides()
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const renderTitle = (label: string, overridden: boolean) => (
    <p className="text-xs font-semibold text-muted-foreground">
      {label}
      {overridden ? (
        <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          已手动调整
        </span>
      ) : null}
    </p>
  )

  return (
    <div className="h-full rounded-[28px] border border-border bg-card/45 p-5 text-sm text-foreground shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">剧情状态</h3>
          <p className="max-w-[320px] text-xs text-muted-foreground">
            整合 Story Bible、文档与历史脉络的即时摘要。手动调整可覆盖关键剧情，再点击刷新同步到 AI。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-8 gap-1 px-3 text-xs"
            onClick={() => setIsEditing((prev) => !prev)}
            disabled={isSaving}
          >
            <PencilLine className="h-3.5 w-3.5" />
            {isEditing ? '取消编辑' : '手动调整'}
          </Button>
          <Button
            variant="outline"
            className="h-8 gap-1 px-3 text-xs"
            disabled={isRefreshing || isSaving || Boolean(aiCooldownMs && aiCooldownMs > 0)}
            onClick={() => refresh({ useAI: true }).catch((error) => {
              console.warn('[StoryStatePanel] 刷新失败', error)
            })}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {isRefreshing
              ? '刷新中…'
              : aiCooldownMs && aiCooldownMs > 0
              ? `等待 ${Math.ceil(aiCooldownMs / 1000)}s`
              : '重新整理'}
          </Button>
        </div>
      </header>

      {aiCooldownMs && aiCooldownMs > 0 ? (
        <p className="mt-2 text-[11px] text-muted-foreground">为节省 Token，AI 刷新限每 60 秒一次</p>
      ) : null}

      {hasOverrides ? (
        <p className="mt-2 text-xs text-primary">已启用手动覆盖，AI 调用将以自定义内容为准。</p>
      ) : null}

      {isEditing ? (
        <div className="mt-4 space-y-4">
          <section className="space-y-2">
            {renderTitle('故事概要', Boolean(overrides.synopsis))}
            <textarea
              className="h-28 w-full resize-none rounded-lg border border-border bg-background/70 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={draftSynopsis}
              onChange={(event) => setDraftSynopsis(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">可总结当前主线或近期目标。</p>
          </section>

          <section className="space-y-2">
            {renderTitle('当前冲突列表', Boolean(overrides.activeConflicts))}
            <textarea
              className="h-24 w-full resize-none rounded-lg border border-border bg-background/70 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={draftConflicts}
              onChange={(event) => setDraftConflicts(event.target.value)}
              placeholder="每行一条冲突/矛盾"
            />
          </section>

          <section className="space-y-2">
            {renderTitle('悬念 / 钩子', Boolean(overrides.hooks))}
            <textarea
              className="h-24 w-full resize-none rounded-lg border border-border bg-background/70 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={draftHooks}
              onChange={(event) => setDraftHooks(event.target.value)}
              placeholder="每行一条钩子或未解之谜"
            />
          </section>

          <section className="space-y-2">
            {renderTitle('最近剧情摘要', Boolean(overrides.lastSummary))}
            <textarea
              className="h-28 w-full resize-none rounded-lg border border-border bg-background/70 p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              value={draftSummary}
              onChange={(event) => setDraftSummary(event.target.value)}
              placeholder="可手动概述上一场景/章节"
            />
          </section>

          <div className="flex flex-wrap gap-2">
            <Button
              className="h-9 px-4 text-xs"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '保存中…' : '保存覆盖'}
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4 text-xs"
              onClick={handleClear}
              disabled={isSaving}
            >
              清除覆盖
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <section>
            {renderTitle('故事概要', Boolean(overrides.synopsis))}
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{state.synopsis || '暂无概要'}</p>
            {!overrides.synopsis && computed.synopsis && computed.synopsis !== state.synopsis ? (
              <p className="mt-1 text-xs text-muted-foreground">自动分析：{computed.synopsis}</p>
            ) : null}
          </section>

          <section>
            {renderTitle('当前冲突', Boolean(overrides.activeConflicts))}
            {state.activeConflicts.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-relaxed">
                {state.activeConflicts.map((item, index) => (
                  <li key={index} className="rounded-lg bg-background/70 p-2 text-xs text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">暂无记录，可通过“手动调整”补充当前矛盾。</p>
            )}
            {!overrides.activeConflicts && computed.activeConflicts.length > 0 ? (
              <div className="mt-2 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
                自动分析建议：
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {computed.activeConflicts.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section>
            {renderTitle('已埋钩子', Boolean(overrides.hooks))}
            {state.hooks.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm leading-relaxed">
                {state.hooks.map((item, index) => (
                  <li key={index} className="rounded-lg bg-background/70 p-2 text-xs text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">暂无钩子，可在手动调整中加入。</p>
            )}
            {!overrides.hooks && computed.hooks.length > 0 ? (
              <div className="mt-2 rounded-lg bg-muted/40 p-2 text-[11px] text-muted-foreground">
                自动分析建议：
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {computed.hooks.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section>
            {renderTitle('最近剧情片段', Boolean(overrides.lastSummary))}
            <details className="mt-2 rounded-xl border border-border bg-background/50 p-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">展开查看</summary>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{state.lastSummary || '暂无文本记录'}</p>
            </details>
          </section>
        </div>
      )}
    </div>
  )
}
