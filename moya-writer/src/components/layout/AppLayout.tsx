import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'

import { Sidebar } from './Sidebar'
import { cn } from '@/lib/utils'

type DockPanel = {
  id: string
  title: string
  content: React.ReactNode
  description?: string
  icon?: LucideIcon
}

type AppLayoutProps = {
  children: React.ReactNode
  dockPanels?: DockPanel[]
  rightColumn?: React.ReactNode
  rightColumnWidthClass?: string
}

export function AppLayout({ children, dockPanels = [], rightColumn, rightColumnWidthClass }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeDockId, setActiveDockId] = useState<string | null>(null)

  const activePanel = useMemo(
    () => dockPanels.find((panel) => panel.id === activeDockId) ?? null,
    [dockPanels, activeDockId],
  )

  const toggleDock = (panelId: string) => {
    setActiveDockId((prev) => (prev === panelId ? null : panelId))
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {dockPanels.length > 0 && (
        <div className="flex items-center gap-2 border-b border-border bg-card/60 px-4 py-2">
          {dockPanels.map((panel) => {
            const isActive = panel.id === activeDockId
            const Icon = panel.icon
            return (
              <button
                key={panel.id}
                onClick={() => toggleDock(panel.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-border bg-background/70 text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                <span>{panel.title}</span>
              </button>
            )
          })}
        </div>
      )}
      <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 shadow-sm">
        <button
          className="rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? '隐藏侧栏' : '显示侧栏'}
        </button>
        <h1 className="text-lg font-semibold tracking-tight">墨语写作 · MoYu Writer</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="rounded-md border border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">
            保存
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="hidden h-full w-64 border-r border-border bg-muted/50 p-4 lg:block">
            <Sidebar />
          </aside>
        )}
        {!sidebarOpen && (
          <button
            className="absolute left-2 top-16 z-10 rounded-md border border-border bg-card px-3 py-1 text-xs text-muted-foreground shadow hover:bg-muted"
            onClick={() => setSidebarOpen(true)}
          >
            打开侧栏
          </button>
        )}

        <main className="flex-1 overflow-y-auto bg-background">
          <div className={cn('mr-auto flex w-full flex-col gap-6 pb-24 pt-6 pl-6 pr-6 lg:pl-10 lg:pr-10', rightColumn ? 'max-w-4xl' : 'max-w-5xl')}>
            {children}
          </div>
        </main>

        {rightColumn ? (
          <aside
            className={cn(
              'hidden h-full border-l border-border bg-muted/30 p-6 pr-12 lg:block',
              rightColumnWidthClass ?? 'w-[640px]',
            )}
          >
            <div className="h-full overflow-y-auto pb-16">{rightColumn}</div>
          </aside>
        ) : null}

        {dockPanels.length > 0 && (
          <aside
            className={cn(
              'fixed right-0 top-[56px] z-30 h-[calc(100vh-56px)] w-[360px] transform border-l border-border bg-background shadow-2xl transition-transform duration-300',
              activePanel ? 'translate-x-0' : 'translate-x-full',
            )}
          >
            {activePanel && (
              <div className="flex h-full flex-col">
                <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activePanel.title}</p>
                    {activePanel.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">{activePanel.description}</p>
                    ) : null}
                  </div>
                  <button
                    className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
                    onClick={() => setActiveDockId(null)}
                  >
                    收起
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4">{activePanel.content}</div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  )
}



