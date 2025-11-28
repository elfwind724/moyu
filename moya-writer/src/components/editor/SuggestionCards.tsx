import { useEditor } from '@/contexts/EditorContext'
import { useHistory } from '@/contexts/HistoryContext'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

function getProviderLabel(model: string): { label: string; color: string } {
  if (model.startsWith('gemini')) {
    return { label: 'Gemini', color: 'bg-blue-100 text-blue-700 border-blue-200' }
  }
  if (model.startsWith('deepseek') || model.startsWith('deepseek')) {
    return { label: 'DeepSeek', color: 'bg-green-100 text-green-700 border-green-200' }
  }
  if (model.startsWith('glm')) {
    return { label: '智谱AI', color: 'bg-purple-100 text-purple-700 border-purple-200' }
  }
  return { label: 'AI', color: 'bg-gray-100 text-gray-700 border-gray-200' }
}

export function SuggestionCards() {
  const { items } = useHistory()
  const { queueInsertion } = useEditor()
  const suggestions = items.slice(0, 4)

  if (suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
        暂无建议。使用 AI 工具栏后，最近的输出会出现在这里供快速查看与插入。
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {suggestions.map((item) => {
        const providerInfo = getProviderLabel(item.model)
        return (
          <div key={item.id} className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-foreground shadow-sm">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${providerInfo.color}`}>
                  {providerInfo.label}
                </span>
                <span>
                  {item.tool}
                  {item.variant ? ` · ${item.variant}` : ''} · {new Date(item.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <Popover>
                <PopoverTrigger className="text-xs text-primary hover:underline">
                  查看全文
                </PopoverTrigger>
                <PopoverContent align="end" className="max-h-72 overflow-y-auto text-sm leading-relaxed">
                  <p className="whitespace-pre-wrap">{item.output}</p>
                </PopoverContent>
              </Popover>
            </div>
            <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-foreground">
              {item.output}
            </p>
            <button
              className="mt-3 rounded border border-border px-2 py-1 text-xs transition hover:bg-muted"
              onClick={() => queueInsertion(item.output)}
            >
              插入到文档
            </button>
          </div>
        )
      })}
    </div>
  )
}
