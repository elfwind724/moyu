import type { ComponentType, CSSProperties, FormEvent } from 'react'
import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { useProject } from '@/contexts/ProjectContext'
import type { Document, DocumentType, Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BookMarked,
  ChevronDown,
  ChevronRight,
  FilePlus,
  FileText,
  FolderPlus,
  GripVertical,
  Plus,
  StickyNote,
  Trash2,
  Download,
  Upload,
} from 'lucide-react'

type DocumentTreeNode = Document & { children: DocumentTreeNode[] }

const ALL_TYPES: DocumentType[] = ['chapter', 'scene', 'note', 'reference', 'folder']

const typeLabels: Record<DocumentType, string> = {
  chapter: '章节',
  scene: '场景',
  note: '笔记',
  reference: '资料',
  folder: '集合',
}

const typeMeta: Record<DocumentType, { label: string; icon: ComponentType<{ className?: string }> }> = {
  chapter: { label: '章节', icon: BookMarked },
  scene: { label: '场景', icon: FileText },
  note: { label: '笔记', icon: StickyNote },
  reference: { label: '资料', icon: FilePlus },
  folder: { label: '集合', icon: FolderPlus },
}

type FlattenedNode = { node: DocumentTreeNode; depth: number }

function buildDocumentTree(documents: Document[]): DocumentTreeNode[] {
  const nodeMap = new Map<string, DocumentTreeNode>()
  const roots: DocumentTreeNode[] = []

  documents.forEach((doc) => {
    nodeMap.set(doc.id, { ...doc, children: [] })
  })

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortNodes = (nodes: DocumentTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order)
    nodes.forEach((child) => sortNodes(child.children))
  }

  sortNodes(roots)
  return roots
}

function filterDocumentTree(nodes: DocumentTreeNode[], activeTypes: Set<DocumentType>): DocumentTreeNode[] {
  return nodes
    .map((node) => {
      const children = filterDocumentTree(node.children, activeTypes)
      const includeSelf = activeTypes.has(node.type)
      if (!includeSelf && children.length === 0) {
        return null
      }
      return { ...node, children }
    })
    .filter((node): node is DocumentTreeNode => node !== null)
}

function flattenDocumentTree(nodes: DocumentTreeNode[], depth = 0, acc: FlattenedNode[] = []): FlattenedNode[] {
  nodes.forEach((node) => {
    acc.push({ node, depth })
    if (node.children.length > 0) {
      flattenDocumentTree(node.children, depth + 1, acc)
    }
  })
  return acc
}

function buildChildrenMap(documents: Document[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  documents.forEach((doc) => {
    if (!doc.parentId) return
    const list = map.get(doc.parentId)
    if (list) {
      list.push(doc.id)
    } else {
      map.set(doc.parentId, [doc.id])
    }
  })
  return map
}

function collectDescendants(id: string, childrenMap: Map<string, string[]>, bucket: Set<string>) {
  const children = childrenMap.get(id)
  if (!children) return
  children.forEach((childId) => {
    if (bucket.has(childId)) return
    bucket.add(childId)
    collectDescendants(childId, childrenMap, bucket)
  })
}

export function Sidebar() {
  const {
    projects,
    currentProject,
    documents,
    currentDocumentId,
    isLoading,
    switchProject,
    openDocument,
    createDocument,
    createProject,
    renameProject,
    deleteProject,
    renameDocument,
    deleteDocuments,
    reorderDocument,
    moveDocuments,
    exportProject,
    importProject,
  } = useProject()

  const [projectName, setProjectName] = useState('')
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null)
  const [renameTarget, setRenameTarget] = useState<DocumentTreeNode | null>(null)
  const [renameInput, setRenameInput] = useState('')
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [docToDelete, setDocToDelete] = useState<DocumentTreeNode | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [activeTypes, setActiveTypes] = useState<DocumentType[]>(ALL_TYPES)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [moveDialogOpen, setMoveDialogOpen] = useState(false)
  const [moveTarget, setMoveTarget] = useState<'root' | string>('root')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const documentTree = useMemo(() => buildDocumentTree(documents), [documents])
  const activeTypeSet = useMemo(() => new Set(activeTypes), [activeTypes])
  const filteredTree = useMemo(() => filterDocumentTree(documentTree, activeTypeSet), [documentTree, activeTypeSet])
  const flattened = useMemo(() => flattenDocumentTree(filteredTree), [filteredTree])
  const visibleIds = useMemo(() => new Set(flattened.map((item) => item.node.id)), [flattened])

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visibleIds.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [visibleIds])

  const childrenMap = useMemo(() => buildChildrenMap(documents), [documents])
  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds])
  const disallowedTargets = useMemo(() => {
    const bucket = new Set<string>()
    selectedList.forEach((id) => {
      bucket.add(id)
      collectDescendants(id, childrenMap, bucket)
    })
    return bucket
  }, [selectedList, childrenMap])

  useEffect(() => {
    if (moveTarget !== 'root' && disallowedTargets.has(moveTarget)) {
      setMoveTarget('root')
    }
  }, [disallowedTargets, moveTarget])

  const chapterOptions = useMemo(() => documents.filter((doc) => doc.type === 'chapter'), [documents])
  const moveOptions = useMemo(
    () => chapterOptions.filter((chapter) => !disallowedTargets.has(chapter.id)),
    [chapterOptions, disallowedTargets],
  )

  const handleCreateProject = (event: FormEvent) => {
    event.preventDefault()
    if (!projectName.trim()) return
    createProject(projectName.trim())
    setProjectName('')
  }

  const handleRenameProject = (event: FormEvent) => {
    event.preventDefault()
    if (!renamingProjectId || !projectName.trim()) return
    renameProject(renamingProjectId, projectName.trim())
    setRenamingProjectId(null)
    setProjectName('')
  }

  const handleCreateChapter = useCallback(() => {
    const chapterNumber = documents.filter((doc) => doc.type === 'chapter' && !doc.parentId).length + 1
    createDocument({ title: `第${chapterNumber}章`, type: 'chapter', parentId: null })
  }, [createDocument, documents])

  const handleCreateNote = useCallback(() => {
    createDocument({ title: '新的笔记', type: 'note', parentId: null })
  }, [createDocument])

  const handleCreateScene = useCallback(
    (parentId: string) => {
      createDocument({ type: 'scene', parentId, title: '新场景' })
    },
    [createDocument],
  )

  const handleRenameDocument = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (!renameTarget || !renameInput.trim()) return
      renameDocument(renameTarget.id, renameInput.trim())
      setRenameTarget(null)
      setRenameInput('')
    },
    [renameDocument, renameInput, renameTarget],
  )

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }, [])

  const toggleType = useCallback((type: DocumentType) => {
    setActiveTypes((prev) => {
      const exists = prev.includes(type)
      if (exists && prev.length === 1) {
        return prev
      }
      const next = exists ? prev.filter((item) => item !== type) : [...prev, type]
      return next
    })
  }, [])

  const resetTypes = useCallback(() => {
    setActiveTypes(ALL_TYPES)
  }, [])

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return
    deleteDocuments(Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [deleteDocuments, selectedIds])

  const handleMoveSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault()
      if (selectedList.length === 0) return
      const targetParentId = moveTarget === 'root' ? null : moveTarget
      moveDocuments(selectedList, targetParentId)
      setMoveDialogOpen(false)
      setSelectedIds(new Set())
    },
    [moveDocuments, moveTarget, selectedList],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDraggingId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeNode = flattened.find((item) => item.node.id === active.id)
      const overNode = flattened.find((item) => item.node.id === over.id)
      if (!activeNode || !overNode) return

      const activeParent = activeNode.node.parentId ?? null
      const overParent = overNode.node.parentId ?? null
      if (activeParent !== overParent) {
        return
      }

      const activeIndex = flattened.findIndex((item) => item.node.id === activeNode.node.id)
      const overIndex = flattened.findIndex((item) => item.node.id === overNode.node.id)
      const position = activeIndex < overIndex ? 'after' : 'before'
      reorderDocument(activeNode.node.id, overNode.node.id, position)
    },
    [flattened, reorderDocument],
  )

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="animate-pulse">加载项目数据中...</span>
      </div>
    )
  }

  const activeTypeCount = activeTypes.length
  const selectedCount = selectedIds.size
  const canConfirmMove =
    selectedList.length > 0 && (moveTarget === 'root' || moveOptions.some((option) => option.id === moveTarget))

  return (
    <div className="flex h-full flex-col gap-6">
      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">项目</p>
            <p className="text-xs text-muted-foreground">点击切换项目，可新建或重命名。</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-8 px-2 text-xs">
                新建项目
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新项目</DialogTitle>
                <DialogDescription>输入项目名称，新项目将出现在列表顶部。</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <Input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="项目名称"
                  autoFocus
                />
                <DialogFooter className="space-y-2 pt-2">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">
                      取消
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={!projectName.trim()}>
                    创建
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>
        <div className="space-y-1">
          {projects.map((project) => {
            const isActive = project.id === currentProject?.id
            return (
              <Dialog key={project.id}>
                <DialogTrigger asChild>
                  <button
                    onClick={() => switchProject(project.id)}
                    className={cn(
                      'flex w-full flex-col rounded-xl border px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'border-primary/50 bg-primary/5 text-primary'
                        : 'border-border bg-card/60 text-foreground hover:bg-card',
                    )}
                  >
                    <span className="text-sm font-semibold">{project.title}</span>
                    <span className="text-xs text-muted-foreground">
                      更新时间 · {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>重命名项目</DialogTitle>
                    <DialogDescription>修改项目标题，方便组织作品。</DialogDescription>
                  </DialogHeader>
                  <form
                    onSubmit={(event) => {
                      setRenamingProjectId(project.id)
                      setProjectName(project.title)
                      handleRenameProject(event)
                    }}
                    className="space-y-4"
                  >
                    <Input
                      defaultValue={project.title}
                      onChange={(event) => setProjectName(event.target.value)}
                    />
                    <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-1 border-red-200 text-xs text-red-500 hover:bg-red-50"
                        onClick={() => setProjectToDelete(project)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> 删除项目
                      </Button>
                      <DialogClose asChild>
                        <Button type="button" variant="ghost">
                          取消
                        </Button>
                      </DialogClose>
                      <Button type="submit">保存</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={async () => {
              if (!currentProject?.id) return
              setIsExporting(true)
              try {
                await exportProject(currentProject.id)
              } catch (error) {
                console.error('导出失败', error)
                alert('导出失败，请查看控制台')
              } finally {
                setIsExporting(false)
              }
            }}
            disabled={!currentProject || isExporting}
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? '导出中...' : '导出项目'}
          </Button>
          <Button
            variant="outline"
            className="h-8 gap-1.5 px-3 text-xs"
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.json'
              input.onchange = async (event) => {
                const file = (event.target as HTMLInputElement).files?.[0]
                if (!file) return
                setIsImporting(true)
                try {
                  await importProject(file)
                  alert('导入成功！')
                } catch (error) {
                  console.error('导入失败', error)
                  alert(`导入失败: ${error instanceof Error ? error.message : String(error)}`)
                } finally {
                  setIsImporting(false)
                }
              }
              input.click()
            }}
            disabled={isImporting}
          >
            <Upload className="h-3.5 w-3.5" />
            {isImporting ? '导入中...' : '导入项目'}
          </Button>
        </div>
      </section>

      <section className="flex-1 space-y-3 overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">文档结构</p>
            <p className="text-xs text-muted-foreground">章节、场景与笔记将统一呈现，可折叠管理。</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-8 gap-1 px-2 text-xs" onClick={handleCreateChapter}>
              <FolderPlus className="h-3.5 w-3.5" /> 章节
            </Button>
            <Button variant="outline" className="h-8 gap-1 px-2 text-xs" onClick={handleCreateNote}>
              <StickyNote className="h-3.5 w-3.5" /> 笔记
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            className={cn('h-7 px-3 text-xs', activeTypeCount === ALL_TYPES.length ? 'text-primary' : 'text-muted-foreground')}
            onClick={resetTypes}
          >
            全部
          </Button>
          {ALL_TYPES.map((type) => (
            <Button
              key={type}
              variant="outline"
              className={cn(
                'h-7 px-3 text-xs',
                activeTypeSet.has(type) ? 'border-primary text-primary' : 'text-muted-foreground',
              )}
              onClick={() => toggleType(type)}
            >
              {typeLabels[type]}
            </Button>
          ))}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <span>已选择 {selectedCount} 个节点</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="h-7 px-3 text-xs border-red-200 text-red-500 hover:bg-red-50"
                onClick={handleDeleteSelected}
              >
                删除
              </Button>
              <Button
                variant="outline"
                className="h-7 px-3 text-xs"
                onClick={() => setMoveDialogOpen(true)}
                disabled={!selectedCount}
              >
                批量移动
              </Button>
              <Button variant="ghost" className="h-7 px-3 text-xs" onClick={clearSelection}>
                清空
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 overflow-y-auto pr-1">
          {filteredTree.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-xs text-muted-foreground">
              当前筛选条件下无文档，可调整类型或新建内容。
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={flattened.map((item) => item.node.id)} strategy={verticalListSortingStrategy}>
              {filteredTree.map((node) => (
                <DocumentTreeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  activeId={currentDocumentId}
                  selectedIds={selectedIds}
                  onOpen={openDocument}
                  onRename={(target) => {
                    setRenameTarget(target)
                    setRenameInput(target.title)
                  }}
                  onDelete={(target) => {
                    setDocToDelete(target)
                  }}
                  onCreateScene={handleCreateScene}
                  onToggleSelect={toggleSelection}
                  collapsed={collapsed}
                  toggleCollapse={toggleCollapse}
                  draggingId={draggingId}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </section>

      <Dialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null)
            setRenameInput('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重命名文档</DialogTitle>
            <DialogDescription>修改章节或笔记标题，便于维护大纲。</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameDocument} className="space-y-4">
            <Input
              value={renameInput}
              onChange={(event) => setRenameInput(event.target.value)}
              placeholder="输入新的标题"
              autoFocus
            />
            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="gap-1 border-red-200 text-xs text-red-500 hover:bg-red-50"
                onClick={() => {
                  if (renameTarget) {
                    setDocToDelete(renameTarget)
                    setRenameTarget(null)
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> 删除
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost" onClick={() => setRenameTarget(null)}>
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!renameInput.trim()}>
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>批量移动</DialogTitle>
            <DialogDescription>选择目标章节或顶层位置，快速整理选中的节点。</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMoveSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="move-target" className="text-xs font-semibold text-muted-foreground">
                目标位置
              </label>
              <select
                id="move-target"
                name="move-target"
                value={moveTarget}
                onChange={(event) => setMoveTarget(event.target.value as 'root' | string)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="root">顶层（章节列表）</option>
                {moveOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                当前选择 {selectedCount} 个节点。移动后将追加至目标位置的末尾。
              </p>
            </div>
            <DialogFooter className="space-y-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!canConfirmMove}>
                移动
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={projectToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setProjectToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除项目</DialogTitle>
            <DialogDescription>
              此操作将移除项目“{projectToDelete?.title ?? ''}”以及其所有章节、场景、笔记与历史记录，且无法恢复。
            </DialogDescription>
          </DialogHeader>
          <div className="text-xs text-muted-foreground">
            <p>请确认已经备份该项目内容，再进行删除。</p>
          </div>
          <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                取消
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50"
              onClick={() => {
                if (projectToDelete) {
                  deleteProject(projectToDelete.id)
                }
                setProjectToDelete(null)
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={docToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDocToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除文档</DialogTitle>
            <DialogDescription>
              将删除“{docToDelete?.title ?? ''}”及其全部子节点，操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                取消
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="outline"
              className="border-red-200 text-red-500 hover:bg-red-50"
              onClick={() => {
                if (docToDelete) {
                  deleteDocuments([docToDelete.id])
                }
                setDocToDelete(null)
              }}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type DocumentTreeItemProps = {
  node: DocumentTreeNode
  depth: number
  activeId: string | null
  selectedIds: Set<string>
  onOpen: (documentId: string) => void
  onRename: (node: DocumentTreeNode) => void
  onDelete: (node: DocumentTreeNode) => void
  onCreateScene: (parentId: string) => void
  onToggleSelect: (documentId: string) => void
  collapsed: Record<string, boolean>
  toggleCollapse: (id: string) => void
  draggingId: string | null
}

function DocumentTreeItem({
  node,
  depth,
  activeId,
  selectedIds,
  onOpen,
  onRename,
  onDelete,
  onCreateScene,
  onToggleSelect,
  collapsed,
  toggleCollapse,
  draggingId,
}: DocumentTreeItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id })
  const hasChildren = node.children.length > 0
  const isCollapsed = collapsed[node.id] ?? false
  const meta = typeMeta[node.type] ?? typeMeta.note
  const Icon = meta.icon
  const isActive = node.id === activeId
  const isSelected = selectedIds.has(node.id)
  const isDragTarget = draggingId === node.id

  const itemStyle: CSSProperties = { marginLeft: depth * 16 }
  const transformValue = CSS.Transform.toString(transform)
  if (transformValue) {
    itemStyle.transform = transformValue
  }
  if (transition) {
    itemStyle.transition = transition
  }
  if (isDragging) {
    itemStyle.opacity = 0.6
  }

  return (
    <div ref={setNodeRef} style={itemStyle} className="flex flex-col">
      <div
        className={cn(
          'group flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors',
          isSelected
            ? 'border-primary bg-primary/10 text-primary'
            : isActive
            ? 'border-primary/50 bg-primary/5 text-primary'
            : 'border-border bg-card/60 text-foreground hover:bg-card',
          isDragTarget ? 'ring-1 ring-primary/40' : null,
          isDragging ? 'shadow-lg' : null,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            aria-label="拖拽排序"
            {...attributes}
            {...listeners}
            className="flex h-5 w-5 items-center justify-center rounded border border-transparent text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleCollapse(node.id)}
              className="flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
              aria-label={isCollapsed ? '展开节点' : '折叠节点'}
            >
              {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-primary"
            checked={isSelected}
            onChange={(event) => {
              event.stopPropagation()
              onToggleSelect(node.id)
            }}
          />
          <Icon className="h-4 w-4 text-muted-foreground" />
          <button type="button" onClick={() => onOpen(node.id)} className="flex-1 truncate text-left">
            <span className="font-medium">{node.title}</span>
            <span className="ml-2 text-xs text-muted-foreground">{meta.label}</span>
          </button>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {node.type === 'chapter' && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onCreateScene(node.id)
              }}
              className="flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-muted"
            >
              <Plus className="h-3 w-3" /> 场景
            </button>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onRename(node)
            }}
            className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-muted"
          >
            重命名
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(node)
            }}
            className="rounded border border-border px-2 py-1 text-[11px] text-red-500 transition hover:bg-red-50"
          >
            删除
          </button>
        </div>
      </div>
      {!isCollapsed &&
        node.children.map((child) => (
          <DocumentTreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            activeId={activeId}
            selectedIds={selectedIds}
            onOpen={onOpen}
            onRename={onRename}
            onDelete={onDelete}
            onCreateScene={onCreateScene}
            onToggleSelect={onToggleSelect}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            draggingId={draggingId}
          />
        ))}
    </div>
  )
}

