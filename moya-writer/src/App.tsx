import { useMemo } from 'react'

import { WritingEditor } from '@/components/editor/WritingEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { SuggestionCards } from '@/components/editor/SuggestionCards'
import { AppLayout } from '@/components/layout/AppLayout'
import { useEditor } from '@/contexts/EditorContext'
import { useProject } from '@/contexts/ProjectContext'
import { AiConfigPanel } from '@/components/settings/AiConfigPanel'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { StoryStatePanel } from '@/components/story-state/StoryStatePanel'
import { StoryBiblePanel } from '@/components/layout/StoryBiblePanel'
import { BookMarked, SlidersHorizontal, Workflow } from 'lucide-react'
import { ChapterPlannerPanel } from '@/components/story-engine/ChapterPlannerPanel'

function App() {
  const { isDirty } = useEditor()
  const { currentProject, currentDocument, isLoading } = useProject()

  const dockPanels = useMemo(
    () => [
      {
        id: 'story-bible',
        title: 'Story Bible',
        description: '赛博天鹅绒 · 查看角色、世界观与大纲资料。',
        icon: BookMarked,
        content: <StoryBiblePanel />,
      },
      {
        id: 'chapter-planner',
        title: '剧情规划',
        description: 'Story Engine · 生成章节剧情节点与节奏建议。',
        icon: Workflow,
        content: <ChapterPlannerPanel />,
      },
      {
        id: 'ai-config',
        title: 'AI 配置',
        description: '粘贴 API Key、切换模型与创意度。',
        icon: SlidersHorizontal,
        content: <AiConfigPanel />,
      },
    ],
    [],
  )

  const rightColumn = (
    <div className="grid h-full grid-cols-[1fr_1fr] gap-4">
      <div className="flex flex-col min-w-0">
        <StoryStatePanel />
      </div>
      <div className="flex flex-col gap-4 min-w-0">
        <section className="rounded-3xl border border-border bg-card/30 p-4">
          <h3 className="text-base font-semibold text-foreground">最新建议</h3>
          <p className="mt-1 text-xs text-muted-foreground">展示最近 4 条 AI 生成结果，可一键插入或复制。</p>
          <div className="mt-3">
            <SuggestionCards />
          </div>
        </section>
        <section className="rounded-3xl border border-border bg-card/30 p-4">
          <h3 className="text-base font-semibold text-foreground">生成历史</h3>
          <p className="mt-1 text-xs text-muted-foreground">浏览全部 AI 生成记录，支持收藏、复制与插入。</p>
          <div className="mt-3">
            <HistoryPanel />
          </div>
        </section>
      </div>
    </div>
  )

  return (
    <AppLayout dockPanels={dockPanels} rightColumn={rightColumn} rightColumnWidthClass="w-[720px]">
      <section className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Sprint 4 · 编辑器集成
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            Lexical 编辑器已接入，欢迎继续写作
          </h1>
          <p className="text-base text-muted-foreground">
            当前项目：{currentProject?.title ?? '未选择'} · 当前文档：{currentDocument?.title ?? '未选择'} · 状态：
            {isDirty ? ' 有未保存更改' : ' 已同步'}
          </p>
        </header>

        {isLoading ? (
          <div className="flex h-[480px] items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
            数据加载中...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex-1 space-y-4">
              <EditorToolbar />
              <WritingEditor />
            </div>
          </div>
        )}
      </section>
    </AppLayout>
  )
}

export default App
