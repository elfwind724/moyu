import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useRef } from 'react'
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection } from 'lexical'
import type { EditorState } from 'lexical'

import { useEditor } from '@/contexts/EditorContext'
import { useProject } from '@/contexts/ProjectContext'
import { useAutoSave } from '@/hooks/useAutoSave'

const theme = {
  paragraph: 'mb-3 text-base leading-relaxed text-foreground',
}

function Placeholder() {
  return (
    <div className="pointer-events-none select-none text-sm text-muted-foreground">
      在此输入正文内容，Lexical 编辑器已接入。
    </div>
  )
}

function ExternalContentPlugin({ documentId }: { documentId: string | null }) {
  const [editor] = useLexicalComposerContext()
  const { content } = useEditor()
  const previousDocIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!documentId) return
    if (previousDocIdRef.current === documentId) return
    previousDocIdRef.current = documentId
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      paragraph.append($createTextNode(content))
      root.append(paragraph)
    })
  }, [content, documentId, editor])

  return null
}

function InsertionPlugin() {
  const [editor] = useLexicalComposerContext()
  const { pendingInsertion, clearPendingInsertion } = useEditor()

  useEffect(() => {
    if (!pendingInsertion) return

    editor.update(() => {
      const selection = $getSelection()
      const textToInsert = `\n${pendingInsertion}\n`

      if (selection && $isRangeSelection(selection)) {
        selection.insertText(textToInsert)
      } else {
        const root = $getRoot()
        const paragraph = $createParagraphNode()
        paragraph.append($createTextNode(textToInsert))
        root.append(paragraph)
      }
    })

    clearPendingInsertion()
  }, [clearPendingInsertion, editor, pendingInsertion])

  return null
}

export function WritingEditor() {
  const { currentDocument } = useProject()
  const { content, setContent, isDirty, save, currentDocumentId, setSelectionText } = useEditor()
  useAutoSave()

  const initialConfig = {
    namespace: 'MoYuWriterEditor',
    editable: Boolean(currentDocumentId),
    theme,
    onError(error: Error) {
      console.error('Lexical error', error)
    },
  }

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot()
      const text = root.getTextContent()
      const selection = $getSelection()
      const selectedText = selection?.getTextContent() ?? ''
      setSelectionText(selectedText)
      setContent(text)
    })
  }

  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card/40 shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            当前文档
          </p>
          <h2 className="text-lg font-semibold text-foreground">
            {currentDocument?.title ?? '尚未选择文档'}
          </h2>
        </div>
        <div className="text-xs text-muted-foreground">
          {isDirty ? '未保存修改' : '已保存'}
        </div>
      </div>

      <LexicalComposer initialConfig={initialConfig} key={currentDocumentId ?? 'empty'}>
        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <RichTextPlugin
              contentEditable={
                <div className="h-full">
                  <ContentEditable className="h-full whitespace-pre-wrap px-6 py-6 text-base leading-relaxed text-foreground outline-none" />
                </div>
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <ExternalContentPlugin documentId={currentDocumentId} />
          <InsertionPlugin />
        </div>
      </LexicalComposer>

      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-6 py-3 text-xs text-muted-foreground">
        <span>
          字数：{content.length} &nbsp;|&nbsp; 文档 ID：{currentDocumentId ?? '无'}
        </span>
        <button
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          onClick={save}
          disabled={!isDirty}
        >
          {isDirty ? '保存更改' : '已同步'}
        </button>
      </div>
    </div>
  )
}
