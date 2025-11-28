import { useEditor } from '@/contexts/EditorContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useProject } from '@/contexts/ProjectContext'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function HistoryPanel() {
  const { currentProjectId } = useProject()
  const { queueInsertion } = useEditor()
  const { items, isLoading, toggleStar, clearHistory } = useHistory()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="animate-pulse">加载历史记录...</span>
      </div>
    )
  }

  if (!currentProjectId) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        请先选择项目以查看生成历史。
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6 text-sm text-muted-foreground">
        暂无生成历史。待 AI 工具使用后，这里将展示生成卡片、收藏与插入操作。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>共 {items.length} 条历史记录</span>
        <button
          className="rounded border border-border px-2 py-1 text-xs transition hover:bg-muted"
          onClick={() => clearHistory(currentProjectId)}
        >
          清空当前项目历史
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border bg-card/60 p-4 text-sm text-foreground shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                工具：{item.tool}
                {item.variant ? ` · ${item.variant}` : ''} · 模型：{item.model} · 时间：
                {new Date(item.createdAt).toLocaleTimeString()}
              </span>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger className="rounded border border-border px-2 py-1 text-xs text-primary transition hover:bg-muted">
                    查看全文
                  </PopoverTrigger>
                  <PopoverContent align="end" className="max-h-96 overflow-y-auto text-sm leading-relaxed">
                    <h4 className="text-xs font-semibold text-muted-foreground">输入摘要</h4>
                    <p className="whitespace-pre-wrap text-sm">{item.input}</p>
                    <h4 className="mt-3 text-xs font-semibold text-muted-foreground">输出</h4>
                    <p className="whitespace-pre-wrap text-sm">{item.output}</p>
                  </PopoverContent>
                </Popover>
                <button
                  className="rounded border border-border px-2 py-1 text-xs transition hover:bg-muted"
                  onClick={() => queueInsertion(item.output)}
                >
                  插入
                </button>
                <button
                  className="rounded border border-border px-2 py-1 text-xs transition hover:bg-muted"
                  onClick={() => navigator.clipboard.writeText(item.output)}
                >
                  复制
                </button>
                <button
                  className={cn(
                    'rounded border px-2 py-1 text-xs transition',
                    item.starred
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:bg-muted',
                  )}
                  onClick={() => toggleStar(item.id)}
                >
                  {item.starred ? '★' : '☆'}
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <p className="line-clamp-3 whitespace-pre-wrap">
                输入摘要：{item.input}
              </p>
              <p className="line-clamp-4 whitespace-pre-wrap text-sm text-foreground">
                输出：{item.output}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
