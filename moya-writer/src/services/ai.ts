import { generateContent as generateGemini } from '@/services/gemini'
import type { HistoryOptions as GeminiHistoryOptions } from '@/services/gemini'
import { generateDeepSeek } from '@/services/deepseek'
import type { DeepSeekModel } from '@/services/deepseek'
import { generateZhipu } from '@/services/zhipu'
import type { ZhipuModel } from '@/services/zhipu'

type BaseParams = {
  prompt: string
  provider: 'gemini' | 'deepseek' | 'zhipu'
  maxOutputTokens?: number
}

type GeminiParams = BaseParams & {
  provider: 'gemini'
  model?: string
  variant?: string
  apiKey?: string
  historyOptions: GeminiHistoryOptions
}

type DeepSeekParams = BaseParams & {
  provider: 'deepseek'
  model?: DeepSeekModel
  variant?: string
  temperature?: number
  apiKey?: string
  log?: GeminiHistoryOptions['log']
  projectId: string
  documentId?: string | null
  tool?: GeminiHistoryOptions['tool']
}

type ZhipuParams = BaseParams & {
  provider: 'zhipu'
  model?: ZhipuModel
  variant?: string
  temperature?: number
  apiKey?: string
  log?: GeminiHistoryOptions['log']
  projectId: string
  documentId?: string | null
  tool?: GeminiHistoryOptions['tool']
}

export type ProviderResult = {
  provider: 'gemini' | 'deepseek' | 'zhipu'
  model: string
  output: string
}

export async function generateWithProvider(params: GeminiParams | DeepSeekParams | ZhipuParams): Promise<string> {
  if (params.provider === 'gemini') {
    return generateGemini(
      { prompt: params.prompt, model: params.model, maxOutputTokens: params.maxOutputTokens },
      { ...params.historyOptions, apiKey: params.apiKey, variant: params.variant },
    )
  }

  if (params.provider === 'zhipu') {
    const {
      prompt,
      model = 'glm-4.6',
      temperature = 1.0,
      log,
      projectId,
      documentId = null,
      tool = 'custom',
      apiKey,
      variant,
      maxOutputTokens,
    } = params
    const output = await generateZhipu({
      userPrompt: prompt,
      model,
      temperature,
      apiKey,
      maxTokens: maxOutputTokens,
    })
    if (log) {
      log({ projectId, documentId, tool, variant, input: prompt, output, model: model ?? 'glm-4.6' })
    }
    return output
  }

  const {
    prompt,
    model,
    temperature = 0.7,
    log,
    projectId,
    documentId = null,
    tool = 'custom',
    apiKey,
    variant,
    maxOutputTokens,
  } = params
  const output = await generateDeepSeek({
    userPrompt: prompt,
    model,
    temperature,
    apiKey,
    maxTokens: maxOutputTokens,
  })
  if (log) {
    log({ projectId, documentId, tool, variant, input: prompt, output, model: model ?? 'deepseek-chat' })
  }
  return output
}

export async function generateWithMultipleProviders(
  providers: Array<'gemini' | 'deepseek' | 'zhipu'>,
  basePrompt: string,
  options: {
    gemini?: {
      model?: string
      apiKey?: string
      historyOptions: GeminiHistoryOptions
    }
    deepseek?: {
      model?: DeepSeekModel
      temperature?: number
      apiKey?: string
      log?: GeminiHistoryOptions['log']
      projectId: string
      documentId?: string | null
      tool?: GeminiHistoryOptions['tool']
    }
    zhipu?: {
      model?: ZhipuModel
      temperature?: number
      apiKey?: string
      log?: GeminiHistoryOptions['log']
      projectId: string
      documentId?: string | null
      tool?: GeminiHistoryOptions['tool']
    }
    maxOutputTokens?: number
    variant?: string
  },
): Promise<ProviderResult[]> {
  const promises: Promise<ProviderResult>[] = []

  if (providers.includes('gemini') && options.gemini) {
    promises.push(
      generateGemini(
        { prompt: basePrompt, model: options.gemini.model, maxOutputTokens: options.maxOutputTokens },
        { 
          ...options.gemini.historyOptions, 
          apiKey: options.gemini.apiKey, 
          // 并行调用时，variant中包含provider名称
          variant: options.gemini.historyOptions.variant ? `${options.gemini.historyOptions.variant} · Gemini` : 'Gemini',
        },
      ).then((output) => ({
        provider: 'gemini' as const,
        model: options.gemini!.model ?? 'gemini-1.5-pro',
        output,
      })),
    )
  }

  if (providers.includes('deepseek') && options.deepseek) {
    promises.push(
      generateDeepSeek({
        userPrompt: basePrompt,
        model: options.deepseek.model,
        temperature: options.deepseek.temperature,
        apiKey: options.deepseek.apiKey,
        maxTokens: options.maxOutputTokens,
      }).then((output) => {
        // 并行调用时，每个provider的结果单独记录，variant中包含provider名称
        if (options.deepseek!.log) {
          const variantWithProvider = options.variant ? `${options.variant} · DeepSeek` : 'DeepSeek'
          options.deepseek!.log({
            projectId: options.deepseek!.projectId,
            documentId: options.deepseek!.documentId ?? null,
            tool: options.deepseek!.tool ?? 'custom',
            variant: variantWithProvider,
            input: basePrompt,
            output,
            model: options.deepseek!.model ?? 'deepseek-chat',
          })
        }
        return {
          provider: 'deepseek' as const,
          model: options.deepseek!.model ?? 'deepseek-chat',
          output,
        }
      }),
    )
  }

  if (providers.includes('zhipu') && options.zhipu) {
    promises.push(
      generateZhipu({
        userPrompt: basePrompt,
        model: options.zhipu.model,
        temperature: options.zhipu.temperature,
        apiKey: options.zhipu.apiKey,
        // 智谱AI思维链模式需要更多token，确保有足够空间
        maxTokens: options.maxOutputTokens ? Math.max(options.maxOutputTokens, 512) : 2048,
      }).then((output) => {
        // 并行调用时，每个provider的结果单独记录，variant中包含provider名称
        if (options.zhipu!.log) {
          const variantWithProvider = options.variant ? `${options.variant} · 智谱AI` : '智谱AI'
          options.zhipu!.log({
            projectId: options.zhipu!.projectId,
            documentId: options.zhipu!.documentId ?? null,
            tool: options.zhipu!.tool ?? 'custom',
            variant: variantWithProvider,
            input: basePrompt,
            output,
            model: options.zhipu!.model ?? 'glm-4.6',
          })
        }
        return {
          provider: 'zhipu' as const,
          model: options.zhipu!.model ?? 'glm-4.6',
          output,
        }
      }),
    )
  }

  console.info(`[并行调用] 开始并行请求 ${promises.length} 个提供商:`, providers)
  const results = await Promise.allSettled(promises)
  
  const processedResults = results
    .map((result, index) => {
      if (result.status === 'fulfilled') {
        console.info(`[并行调用] ${providers[index]} 成功，输出长度:`, result.value.output.length)
        return result.value
      }
      const errorMsg = result.reason instanceof Error ? result.reason.message : String(result.reason)
      console.error(`[并行调用] ${providers[index]} 失败:`, errorMsg)
      return null
    })
    .filter((result): result is ProviderResult => result !== null)
  
  console.info(`[并行调用] 完成，成功 ${processedResults.length}/${promises.length} 个提供商`)
  return processedResults
}
