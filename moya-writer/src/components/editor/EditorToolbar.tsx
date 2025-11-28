import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useEditor } from '@/contexts/EditorContext'
import { useHistory } from '@/contexts/HistoryContext'
import { useProject } from '@/contexts/ProjectContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useStoryState } from '@/contexts/StoryStateContext'
import { generateWithProvider, generateWithMultipleProviders } from '@/services/ai'
import {
  buildDescribePrompt,
  buildExpandPrompt,
  buildRewritePrompt,
  buildWritePrompt,
  buildDescribeVariantPrompt,
  buildWriteVariantPrompt,
  buildRewriteVariantPrompt,
  buildExpandVariantPrompt,
  buildBrainstormPrompt,
  buildBrainstormVariantPrompt,
  buildTwistPrompt,
  buildTwistVariantPrompt,
  buildShrinkPrompt,
  buildShrinkVariantPrompt,
} from '@/lib/prompts'
import type {
  DescribeVariant,
  WriteVariant,
  RewriteVariant,
  ExpandVariant,
  BrainstormVariant,
  TwistVariant,
  ShrinkVariant,
} from '@/lib/prompts'
import { ChevronDown } from 'lucide-react'

type EditorTool = 'write' | 'rewrite' | 'describe' | 'expand' | 'brainstorm' | 'twist' | 'shrink'

type RunToolOptions = {
  describeVariantId?: DescribeVariant
  describeLabel?: string
  writeVariantId?: WriteVariant
  writeLabel?: string
  rewriteVariantId?: RewriteVariant
  rewriteLabel?: string
  expandVariantId?: ExpandVariant
  expandLabel?: string
  brainstormVariantId?: BrainstormVariant
  brainstormLabel?: string
  twistVariantId?: TwistVariant
  twistLabel?: string
  shrinkVariantId?: ShrinkVariant
  shrinkLabel?: string
}

const writeVariants: Array<{ id: WriteVariant; label: string; description: string }> = [
  { id: 'advance-action', label: '动作推进', description: '加速动作场面、紧张节奏。' },
  { id: 'raise-conflict', label: '冲突升级', description: '引入更强的对抗或阻碍。' },
  { id: 'build-suspense', label: '悬念钩子', description: '制造未解谜题，结尾留钩子。' },
  { id: 'emotional-beat', label: '情感推进', description: '聚焦角色情绪与关系。' },
  { id: 'twist', label: '意外转折', description: '呈现合理但意想不到的反转。' },
]

const rewriteVariants: Array<{ id: RewriteVariant; label: string; description: string }> = [
  { id: 'style-formal', label: '正式书面', description: '语句规整，偏书面化表达。' },
  { id: 'style-poetic', label: '诗意意象', description: '加入意象和比喻，文笔更华丽。' },
  { id: 'style-colloquial', label: '口语自然', description: '贴近现实对话与轻松语气。' },
  { id: 'voice-noir', label: '暗黑气质', description: '营造黑色电影式冷冽风格。' },
  { id: 'voice-comedic', label: '幽默诙谐', description: '添加轻松俏皮的语气和节奏。' },
  { id: 'perspective-first', label: '第一人称', description: '改写成“我”的视角与感知。' },
  { id: 'perspective-third', label: '第三人称', description: '改写成第三人称有限视角。' },
  { id: 'perspective-omniscient', label: '全知视角', description: '可以透露其他角色或未来信息。' },
  { id: 'pacing-tight', label: '紧凑压缩', description: '压缩文字、突出重点。' },
  { id: 'pacing-rich', label: '细腻扩充', description: '略作扩展，补充细节与情绪。' },
]

const describeVariants: Array<{ id: DescribeVariant; label: string; description: string }> = [
  { id: 'sense-vision', label: '视觉强化', description: '突出光影、色彩与形体对比。' },
  { id: 'sense-audio', label: '听觉强化', description: '渲染声源、节奏与距离层次。' },
  { id: 'sense-smell', label: '嗅觉强化', description: '描写气味、湿度与空气变化。' },
  { id: 'sense-touch', label: '触觉强化', description: '强调质感、温差与肌肤反应。' },
  { id: 'sense-taste', label: '味觉强化', description: '突出味道、唾液、联想意象。' },
  { id: 'psychology', label: '心理剖析', description: '深入角色内心与情绪波动。' },
  { id: 'action', label: '动作细节', description: '丰富身体动作与行为节奏。' },
  { id: 'mood-horror', label: '恐怖氛围', description: '营造暗黑、令人不安的场景。' },
  { id: 'mood-epic', label: '宏大氛围', description: '营造壮阔、史诗级的气势。' },
]

const expandVariants: Array<{ id: ExpandVariant; label: string; description: string }> = [
  { id: 'branch-conflict', label: '冲突分支', description: '构思新的矛盾发展。' },
  { id: 'branch-emotion', label: '情感分支', description: '描写人物情绪另一种走向。' },
  { id: 'branch-mystery', label: '悬疑分支', description: '给出谋略/谜团的分支剧情。' },
  { id: 'worldbuilding', label: '世界观拓展', description: '补充背景设定与科技细节。' },
  { id: 'hook-cliffhanger', label: '悬崖钩子', description: '制造紧张的 Cliffhanger 结尾。' },
  { id: 'hook-question', label: '关键疑问', description: '抛出引人好奇的关键问题。' },
  { id: 'slow-burn', label: '慢速铺陈', description: '放慢节奏，细腻描写氛围。' },
  { id: 'fast-forward', label: '快速推进', description: '加快剧情节奏，推进到下一幕。' },
]

const brainstormVariants: Array<{ id: BrainstormVariant; label: string; description: string }> = [
  { id: 'premise', label: '剧情前提', description: '提出新的任务目标或故事开局。' },
  { id: 'conflict-tree', label: '冲突升级', description: '构建冲突树，规划压力点。' },
  { id: 'character-arc', label: '角色成长', description: '雕琢角色的情感或心智转折。' },
  { id: 'worldbuilding-idea', label: '世界观', description: '扩展科技与社会设定。' },
  { id: 'mystery-hooks', label: '悬疑钩子', description: '设计谜题与未解线索。' },
]

const twistVariants: Array<{ id: TwistVariant; label: string; description: string }> = [
  { id: 'reversal', label: '局势逆转', description: '瞬间扭转优势或劣势。' },
  { id: 'betrayal', label: '背叛反转', description: '让角色阵营或信任崩塌。' },
  { id: 'reveal-secret', label: '真相揭露', description: '曝光隐藏的秘密或身份。' },
  { id: 'timing-shift', label: '时机突变', description: '调整事件发生时刻改变走向。' },
  { id: 'perspective-shift', label: '视角转换', description: '从新视角重构事实。' },
]

const shrinkVariants: Array<{ id: ShrinkVariant; label: string; description: string }> = [
  { id: 'summary-150', label: '150字摘要', description: '快速整理剧情重点。' },
  { id: 'summary-50', label: '50字浓缩', description: '极短摘要，提炼核心。' },
  { id: 'outline', label: '大纲条目', description: '用条列概括起承转合。' },
  { id: 'logline', label: '一句话梗概', description: '突出主角、目标与阻碍。' },
  { id: 'bullet-keywords', label: '关键词提取', description: '提炼要素，方便复盘。' },
]

const toolDisplayName: Record<EditorTool, string> = {
  write: '续写',
  rewrite: '改写',
  describe: '描写',
  expand: '扩展',
  brainstorm: '头脑风暴',
  twist: '剧情反转',
  shrink: '缩写',
}

export function EditorToolbar() {
  const { content, currentDocumentId, selectionText } = useEditor()
  const { currentProjectId } = useProject()
  const history = useHistory()
  const { settings, isLoading: settingsLoading } = useSettings()
  const { state: storyState } = useStoryState()
  const [loadingTool, setLoadingTool] = useState<string | null>(null)

  const suggestionCount = settings.suggestionCount ?? 1
  const outputLengthTarget = settings.outputLength ?? 150

  const runTool = async (tool: EditorTool, options?: RunToolOptions) => {
    if (!currentProjectId || settingsLoading) return

    const prompt =
      tool === 'write'
        ? options?.writeVariantId
          ? buildWriteVariantPrompt(options.writeVariantId, {
              content,
              storyBibleSynopsis: storyState.synopsis,
            })
          : buildWritePrompt({ content, storyBibleSynopsis: storyState.synopsis })
        : tool === 'rewrite'
        ? options?.rewriteVariantId
          ? buildRewriteVariantPrompt(options.rewriteVariantId, { content, selection: selectionText })
          : buildRewritePrompt({ content, selection: selectionText })
        : tool === 'describe'
        ? options?.describeVariantId
          ? buildDescribeVariantPrompt(options.describeVariantId, { content, selection: selectionText })
          : buildDescribePrompt({ content, selection: selectionText })
        : tool === 'expand'
        ? options?.expandVariantId
          ? buildExpandVariantPrompt(options.expandVariantId, { content, selection: selectionText })
          : buildExpandPrompt({ content, selection: selectionText })
        : tool === 'brainstorm'
        ? options?.brainstormVariantId
          ? buildBrainstormVariantPrompt(options.brainstormVariantId, {
              content,
              storyBibleSynopsis: storyState.synopsis,
            })
          : buildBrainstormPrompt({ content, storyBibleSynopsis: storyState.synopsis })
        : tool === 'twist'
        ? options?.twistVariantId
          ? buildTwistVariantPrompt(options.twistVariantId, { content, selection: selectionText })
          : buildTwistPrompt({ content, selection: selectionText })
        : options?.shrinkVariantId
        ? buildShrinkVariantPrompt(options.shrinkVariantId, { content, selection: selectionText })
        : buildShrinkPrompt({ content, selection: selectionText })

    // 调整提示词结构：优先强调编辑器内容，剧情状态作为背景参考
    const contextInfo = storyState.synopsis || storyState.activeConflicts.length > 0 || storyState.hooks.length > 0
      ? `\n\n【背景参考】\n当前剧情摘要：${storyState.synopsis || '暂无'}\n已知冲突：${storyState.activeConflicts.slice(0, 2).map((item) => `- ${item}`).join('\n') || '暂无记录'}\n现有钩子：${storyState.hooks.slice(0, 2).map((item) => `- ${item}`).join('\n') || '暂无记录'}\n最近剧情片段：${storyState.lastSummary || '暂无'}`
      : ''
    
    const promptWithState = `${prompt}${contextInfo}`

    const count = suggestionCount
    // 头脑风暴和反转需要更长的输出空间，设置更高的token限制
    const baseTokens = Math.min(2048, Math.max(120, Math.round(outputLengthTarget * 2)))
    const targetTokens = 
      tool === 'shrink' 
        ? Math.min(640, baseTokens)
        : tool === 'brainstorm' || tool === 'twist'
        ? 4000  // 头脑风暴和反转需要更多空间，确保完整输出
        : baseTokens
    const lengthDirectives =
      tool === 'write'
        ? `\n\n【输出要求】\n- 请控制在约 ${outputLengthTarget} 个中文字符以内\n- **重要：必须续写新内容，不要重复或改写输入内容**\n- 直接从已有内容的结尾继续写下去，保持情节连贯\n- 必须使用中文回答${
            count > 1 ? '\n- 如果存在其它候选方案，请确保该方案在情节、情绪或文风上具有明显差异' : ''
          }`
        : tool === 'brainstorm'
        ? `\n\n【输出要求】\n- **重要：必须完整输出所有内容，不要截断或省略**\n- 使用编号或条列格式，输出中文\n- 每个创意点子都要详细描述，确保内容完整${
            count > 1 ? '\n- 若有多组方案，请保持主题差异' : ''
          }`
        : tool === 'twist'
        ? `\n\n【输出要求】\n- **重要：必须完整输出所有内容，不要截断或省略**\n- 输出中文，可编号分条\n- 每个反转都要详细描述其影响和后果，确保内容完整${
            count > 1 ? '\n- 每个反转的方向必须明显不同' : ''
          }`
        : tool === 'shrink'
        ? `\n\n【输出要求】\n- 输出中文，保持结构清晰${
            count > 1 ? '\n- 不同方案需在长度或角度上有所区分' : ''
          }`
        : `\n\n【输出要求】\n- 请控制在约 ${outputLengthTarget} 个中文字符以内\n- 必须使用中文回答${
            count > 1 ? '\n- 如果存在其它候选方案，请确保该方案在情节、情绪或文风上具有明显差异' : ''
          }`

    try {
      const variantLabel =
        options?.describeLabel ??
        options?.writeLabel ??
        options?.rewriteLabel ??
        options?.expandLabel ??
        options?.brainstormLabel ??
        options?.twistLabel ??
        options?.shrinkLabel
      const outputs: string[] = []
      setLoadingTool(
        `${tool}-${
          options?.describeVariantId ??
          options?.writeVariantId ??
          options?.rewriteVariantId ??
          options?.expandVariantId ??
          options?.brainstormVariantId ??
          options?.twistVariantId ??
          options?.shrinkVariantId ??
          'default'
        }`,
      )

      // 并行调用功能已禁用，始终使用单模型调用
      // 注意：并行调用功能已禁用，以下代码不会执行
      if (false) {
        // 并行调用多个API（已禁用，代码保留但不执行）
    const parallelProviders = settings.parallelProviders ?? []
    const activeProviders = parallelProviders.filter((p) => settings.keys[p])
        console.info(`[${tool}] 并行调用模式，激活的提供商:`, activeProviders)
        
        if (activeProviders.length === 0) {
          console.warn(`[${tool}] 并行调用配置了但无有效API Key，回退到单模型模式`)
        } else {
          const variantPrompt = `${promptWithState}${lengthDirectives}`
          const variantForLog = variantLabel ?? toolDisplayName[tool]

          const results = await generateWithMultipleProviders(activeProviders, variantPrompt, {
          gemini: activeProviders.includes('gemini')
            ? {
                model: settings.model.startsWith('gemini') ? settings.model : 'gemini-1.5-pro',
                apiKey: settings.keys.gemini,
                historyOptions: {
                  projectId: currentProjectId!,
                  documentId: currentDocumentId,
                  tool,
                  // 并行调用时，在variant中包含provider名称，确保每个结果都有独立标识
                  variant: `${variantForLog} · Gemini`,
                  log: ({ projectId, documentId, tool: logTool, variant, input, output, model }) =>
                    history.log({
                      projectId,
                      documentId,
                      tool: (logTool ?? tool) as typeof tool,
                      variant: variant ?? `${variantForLog} · Gemini`,
                      input,
                      output,
                      model,
                    }),
                },
              }
            : undefined,
          deepseek: activeProviders.includes('deepseek')
            ? {
                model: (settings.model as 'deepseek-chat' | 'deepseek-reasoner') ?? 'deepseek-chat',
                temperature: settings.temperature,
                apiKey: settings.keys.deepseek,
                projectId: currentProjectId!,
                documentId: currentDocumentId,
                tool,
                log: ({ projectId, documentId, tool: logTool, variant, input, output, model }) =>
                  history.log({
                    projectId,
                    documentId,
                    tool: (logTool ?? tool) as typeof tool,
                    variant: variant ?? `${variantForLog} · DeepSeek`,
                    input,
                    output,
                    model,
                  }),
              }
            : undefined,
          zhipu: activeProviders.includes('zhipu')
            ? {
                model: (settings.model as 'glm-4.6' | 'glm-4.5') ?? 'glm-4.6',
                temperature: settings.temperature,
                apiKey: settings.keys.zhipu,
                projectId: currentProjectId!,
                documentId: currentDocumentId,
                tool,
                log: ({ projectId, documentId, tool: logTool, variant, input, output, model }) =>
                  history.log({
                    projectId,
                    documentId,
                    tool: (logTool ?? tool) as typeof tool,
                    variant: variant ?? `${variantForLog} · 智谱AI`,
                    input,
                    output,
                    model,
                  }),
              }
            : undefined,
          maxOutputTokens: targetTokens,
          variant: variantForLog,
          })

          console.info(`[${tool}] 并行调用完成，获得 ${results.length} 个结果:`, results.map((r) => ({ provider: r.provider, model: r.model, outputLength: r.output.length })))
          
          if (results.length > 0) {
            results.forEach((result) => {
              outputs.push(result.output)
            })
            // 并行调用有结果，直接跳过单模型逻辑
            console.info(`[${tool}] 并行调用成功，获得 ${results.length} 个结果，跳过单模型调用`)
            
            // 如果并行调用只返回了部分结果（有些失败），记录警告
            if (results.length < activeProviders.length) {
              const failedProviders = activeProviders.filter(p => !results.some(r => r.provider === p))
              console.warn(`[${tool}] 并行调用部分失败，失败的提供商:`, failedProviders)
            }
          } else {
            console.warn(`[${tool}] 并行调用全部失败，继续执行单模型调用`)
          }
        }
      }
      
      // 始终使用单模型调用（并行功能已禁用）
      const shouldUseSingleModel = true
      
      if (shouldUseSingleModel) {
        // 单模型调用或多方案生成
        for (let index = 0; index < count; index += 1) {
          const variantForLog =
            count > 1
              ? `${variantLabel ?? toolDisplayName[tool]} · 方案 ${index + 1}`
              : variantLabel
          const variantPrompt = `${promptWithState}${lengthDirectives}`
          const promptWithIndex =
            count > 1
              ? `${variantPrompt}\n- 当前方案编号：${index + 1}`
              : variantPrompt

          const output = await generateWithProvider(
            settings.provider === 'deepseek'
              ? {
                  provider: 'deepseek',
                  prompt: promptWithIndex,
                  projectId: currentProjectId!,
                  documentId: currentDocumentId,
                  tool,
                  variant: variantForLog,
                  model: (settings.model as 'deepseek-chat' | 'deepseek-reasoner') ?? 'deepseek-chat',
                  temperature: settings.temperature,
                  apiKey: settings.keys.deepseek,
                  maxOutputTokens: targetTokens,
                  log: ({ projectId, documentId, tool: logTool, variant, input, output, model }) =>
                    history.log({
                      projectId,
                      documentId,
                      tool: (logTool ?? tool) as typeof tool,
                      variant: variant ?? variantForLog ?? undefined,
                      input,
                      output,
                      model,
                    }),
                }
              : settings.provider === 'zhipu'
              ? {
                  provider: 'zhipu',
                  prompt: promptWithIndex,
                  projectId: currentProjectId!,
                  documentId: currentDocumentId,
                  tool,
                  variant: variantForLog,
                  model: (settings.model as 'glm-4.6' | 'glm-4.5') ?? 'glm-4.6',
                  temperature: settings.temperature,
                  apiKey: settings.keys.zhipu,
                  maxOutputTokens: targetTokens,
                  log: ({ projectId, documentId, tool: logTool, variant, input, output, model }) =>
                    history.log({
                      projectId,
                      documentId,
                      tool: (logTool ?? tool) as typeof tool,
                      variant: variant ?? variantForLog ?? undefined,
                      input,
                      output,
                      model,
                    }),
                }
              : {
                  provider: 'gemini',
                  prompt: promptWithIndex,
                  model: settings.model,
                  apiKey: settings.keys.gemini,
                  variant: variantForLog,
                  maxOutputTokens: targetTokens,
                  historyOptions: {
                    projectId: currentProjectId!,
                    documentId: currentDocumentId,
                    tool,
                    variant: variantForLog,
                    log: ({ projectId, documentId, tool: logTool, variant, input, output, model }) =>
                      history.log({
                        projectId,
                        documentId,
                        tool: (logTool ?? tool) as typeof tool,
                        variant: variant ?? variantForLog ?? undefined,
                        input,
                        output,
                        model,
                      }),
                  },
                },
          )
          outputs.push(output)
        }
      }
      if (outputs.length > 0) {
        console.info(`[${tool}] 生成结果`, outputs)
      } else {
        console.warn(`[${tool}] 未生成任何结果`)
      }
    } catch (error) {
      console.error('AI 生成失败', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      // 即使失败也尝试记录一条错误日志，方便用户看到
      try {
        history.log({
          projectId: currentProjectId!,
          documentId: currentDocumentId,
          tool,
          variant: '错误',
          input: promptWithState.slice(0, 200),
          output: `生成失败: ${errorMessage}`,
          model: settings.model,
        })
      } catch (logError) {
        console.error('记录错误日志失败', logError)
      }
    } finally {
      setLoadingTool(null)
    }
  }

  // 并行调用功能已禁用，始终显示单个提供商
  const providerSummary = settings.provider === 'zhipu' ? '智谱AI' : settings.provider === 'deepseek' ? 'DeepSeek' : 'Gemini'

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-border bg-card/40 px-4 py-3 text-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">AI 工具栏</span>
      <ToolButtonGroup
        label="续写 (Write)"
        tool="write"
        loadingTool={loadingTool}
        runTool={runTool}
        variants={writeVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () => runTool('write', { writeVariantId: variant.id, writeLabel: variant.label }),
        }))}
      />
      <ToolButtonGroup
        label="改写 (Rewrite)"
        tool="rewrite"
        loadingTool={loadingTool}
        runTool={runTool}
        variants={rewriteVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () => runTool('rewrite', { rewriteVariantId: variant.id, rewriteLabel: variant.label }),
        }))}
      />
      <ToolButtonGroup
        label="描写 (Describe)"
        tool="describe"
        loadingTool={loadingTool}
        runTool={runTool}
        menuWidth="w-64"
        variants={describeVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () => runTool('describe', { describeVariantId: variant.id, describeLabel: variant.label }),
        }))}
      />
      <ToolButtonGroup
        label="扩展 (Expand)"
        tool="expand"
        loadingTool={loadingTool}
        runTool={runTool}
        variants={expandVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () => runTool('expand', { expandVariantId: variant.id, expandLabel: variant.label }),
        }))}
      />
      <ToolButtonGroup
        label="头脑风暴 (Brainstorm)"
        tool="brainstorm"
        loadingTool={loadingTool}
        runTool={runTool}
        variants={brainstormVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () =>
            runTool('brainstorm', {
              brainstormVariantId: variant.id,
              brainstormLabel: variant.label,
            }),
        }))}
      />
      <ToolButtonGroup
        label="反转 (Twist)"
        tool="twist"
        loadingTool={loadingTool}
        runTool={runTool}
        variants={twistVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () => runTool('twist', { twistVariantId: variant.id, twistLabel: variant.label }),
        }))}
      />
      <ToolButtonGroup
        label="缩写 (Shrink Ray)"
        tool="shrink"
        loadingTool={loadingTool}
        runTool={runTool}
        variants={shrinkVariants.map((variant) => ({
          id: variant.id,
          label: variant.label,
          description: variant.description,
          run: () => runTool('shrink', { shrinkVariantId: variant.id, shrinkLabel: variant.label }),
        }))}
      />
      <span className="ml-auto text-xs text-muted-foreground">
        {settings.keys.gemini || settings.keys.deepseek || settings.keys.zhipu
          ? (() => {
              return `每次生成 ${suggestionCount} 条 · 约 ${outputLengthTarget} 字 · ${providerSummary} · 模型 ${settings.model}`
            })()
          : '未配置 API Key 时将返回模拟结果'}
      </span>
    </div>
  )
}

type ToolButtonGroupProps = {
  label: string
  tool: EditorTool
  loadingTool: string | null
  runTool: (tool: EditorTool, options?: RunToolOptions) => Promise<void>
  variants: Array<{ id: string; label: string; description: string; run: () => void }>
  menuWidth?: string
}

function ToolButtonGroup({ label, tool, loadingTool, runTool, variants, menuWidth = 'w-72' }: ToolButtonGroupProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        className="h-8 px-3 text-xs"
        disabled={loadingTool !== null}
        onClick={() => runTool(tool)}
      >
        {loadingTool === `${tool}-default` ? '生成中...' : label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 px-2 text-xs" disabled={loadingTool !== null}>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className={menuWidth}>
          {variants.map((variant) => (
            <DropdownMenuItem
              key={variant.id}
              onSelect={(event) => {
                event.preventDefault()
                variant.run()
              }}
            >
              <div>
                <p className="text-sm font-medium text-foreground">{variant.label}</p>
                <p className="text-xs text-muted-foreground">{variant.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
