import { useProject } from '@/contexts/ProjectContext'
import { useStoryBible } from '@/contexts/StoryBibleContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function StoryBiblePanel() {
  const { currentProject, documents, isLoading: projectLoading } = useProject()
  const { storyBible, isLoading: bibleLoading, updateBraindump, updateSynopsis } = useStoryBible()
  const isLoading = projectLoading || bibleLoading
  const docCount = documents.length
  const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0)

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <span className="animate-pulse">加载 Story Bible 数据中...</span>
        <span>请稍候</span>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Story Bible
        </p>
        <h2 className="text-base font-semibold">{currentProject?.title ?? '未选定项目'}</h2>
        <div className="text-xs text-muted-foreground leading-relaxed">
          <p>Sprint 1.4 正在细化 Story Bible 数据结构，与编辑器保持联动。</p>
          {currentProject && (
            <p className="mt-1">
              当前项目共 {docCount} 篇文档 / 约 {totalWords} 字，Story Bible 将自动引用相关上下文。
            </p>
          )}
        </div>
      </header>

      <Tabs defaultValue="braindump" className="flex-1">
        <TabsList className="grid w-full grid-cols-3 gap-2 rounded-xl bg-muted p-1 text-xs sm:grid-cols-4">
          <TabsTrigger value="braindump" className="rounded-lg px-2 py-1.5">
            灵感倾倒
          </TabsTrigger>
          <TabsTrigger value="synopsis" className="rounded-lg px-2 py-1.5">
            故事概要
          </TabsTrigger>
          <TabsTrigger value="characters" className="rounded-lg px-2 py-1.5">
            角色
          </TabsTrigger>
          <TabsTrigger value="worldbuilding" className="rounded-lg px-2 py-1.5">
            世界观
          </TabsTrigger>
          <TabsTrigger value="outline" className="rounded-lg px-2 py-1.5">
            故事大纲
          </TabsTrigger>
          <TabsTrigger value="scenes" className="rounded-lg px-2 py-1.5">
            场景
          </TabsTrigger>
          <TabsTrigger value="style" className="rounded-lg px-2 py-1.5">
            体裁 & 风格
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="braindump"
          className="mt-4 flex h-full flex-col gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground"
        >
          <div className="space-y-2 leading-relaxed">
            <h3 className="text-base font-semibold text-foreground">灵感收集</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              写下你当前的灵感碎片，后续将接入 AI 扩写与标签分类。
            </p>
            <textarea
              className="h-40 w-full resize-none rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-ring"
              value={storyBible.braindump.ideas}
              onChange={(event) =>
                updateBraindump({
                  ...storyBible.braindump,
                  ideas: event.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              最近更新：{new Date(storyBible.braindump.lastUpdated).toLocaleString()}
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="synopsis"
          className="mt-4 flex h-full flex-col gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground"
        >
          <div className="space-y-2 leading-relaxed">
            <h3 className="text-base font-semibold text-foreground">故事概要</h3>
            <textarea
              className="h-28 w-full resize-none rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-ring"
              value={storyBible.synopsis.summary}
              onChange={(event) =>
                updateSynopsis({
                  ...storyBible.synopsis,
                  summary: event.target.value,
                })
              }
            />
            <div>
              <p className="text-xs font-semibold text-foreground">剧情节点</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground leading-relaxed">
                {storyBible.synopsis.beats.map((beat) => (
                  <li key={beat}>{beat}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              上次生成：{storyBible.synopsis.lastGenerated ? new Date(storyBible.synopsis.lastGenerated).toLocaleString() : '尚未生成'}
            </p>
          </div>
        </TabsContent>

        <TabsContent
          value="characters"
          className="mt-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground leading-relaxed"
        >
          <h3 className="text-base font-semibold text-foreground">角色总览</h3>
          <p className="text-xs leading-relaxed">
            冗余字段将用于 AI 自动引用角色特征。后续会加入角色编辑器与关系图。
          </p>
          <div className="grid gap-2">
            {storyBible.characters.map((character) => (
              <div
                key={character.id}
                className="rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{character.name}</p>
                  <span className="text-xs text-muted-foreground">{character.role}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">钩子：{character.hook}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">目标：{character.goals}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">秘密：{character.secrets}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  特质：{character.traits.join(' / ')}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="worldbuilding"
          className="mt-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground leading-relaxed"
        >
          <h3 className="text-base font-semibold text-foreground">世界观元素</h3>
          <p className="text-xs leading-relaxed">
            支持地点、组织、物品与规则。后续会加入分组与可视化关系图。
          </p>
          <div className="grid gap-2">
            {storyBible.worldbuilding.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{entry.name}</p>
                  <span className="text-xs text-muted-foreground">{entry.kind}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{entry.description}</p>
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  关联：{entry.connections.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="outline"
          className="mt-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground leading-relaxed"
        >
          <h3 className="text-base font-semibold text-foreground">故事大纲</h3>
          <ol className="space-y-2 text-xs leading-relaxed">
            {storyBible.outline
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((node) => (
                <li
                  key={node.id}
                  className="rounded-xl border border-border bg-background/70 p-3 text-foreground"
                >
                  <p className="font-semibold text-sm">
                    {node.order}. {node.title}
                  </p>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{node.summary}</p>
                </li>
              ))}
          </ol>
        </TabsContent>

        <TabsContent
          value="scenes"
          className="mt-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground leading-relaxed"
        >
          <h3 className="text-base font-semibold text-foreground">场景列表</h3>
          <div className="grid gap-2">
            {storyBible.scenes.map((scene) => (
              <div
                key={scene.id}
                className="rounded-xl border border-border bg-background/70 p-3 text-sm text-foreground"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{scene.title}</p>
                  <span className="text-xs text-muted-foreground">{scene.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">目的：{scene.purpose}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">冲突：{scene.conflict}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">结局：{scene.outcome}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="style"
          className="mt-4 space-y-3 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground leading-relaxed"
        >
          <h3 className="text-base font-semibold text-foreground">体裁与风格</h3>
          <div className="grid gap-2 text-xs text-muted-foreground leading-relaxed">
            <p>体裁：{storyBible.style.genre.join(' / ')}</p>
            <p>语气：{storyBible.style.tone}</p>
            <p>视角：{storyBible.style.pov}</p>
            <p>时态：{storyBible.style.tense}</p>
            <p>灵感参考：{storyBible.style.inspirations.join('、')}</p>
            <p>
              声线备注：
              <span className="text-foreground leading-relaxed">{storyBible.style.voiceNotes}</span>
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


