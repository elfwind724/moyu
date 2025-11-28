const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent'
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined

export type GenerateParams = {
  prompt: string
  model?: string
  maxOutputTokens?: number
}

export type HistoryOptions = {
  projectId: string
  documentId?: string | null
  tool?: 'write' | 'rewrite' | 'describe' | 'expand' | 'brainstorm' | 'twist' | 'shrink' | 'chapter-plan' | 'custom'
  variant?: string
  apiKey?: string
  log?: (entry: {
    projectId: string
    documentId: string | null
    tool: HistoryOptions['tool']
    variant?: string
    input: string
    output: string
    model: string
  }) => void
}

async function callGemini(prompt: string, model = 'gemini-1.5-pro', apiKey?: string, maxOutputTokens?: number): Promise<string> {
  const key = apiKey ?? API_KEY
  if (!key) {
    return `【模拟输出】\n模型：${model}\n提示：${prompt.slice(0, 160)}...\n请配置 VITE_GEMINI_API_KEY 或在设置中粘贴 Key 以启用真实调用。`
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: maxOutputTokens ? { maxOutputTokens } : undefined,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini 请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join('\n')
  if (!text) {
    throw new Error('Gemini 返回内容为空')
  }
  return text
}

export async function generateContent(
  params: GenerateParams,
  options: HistoryOptions,
): Promise<string> {
  const { prompt, model = 'gemini-1.5-pro', maxOutputTokens } = params
  const { log, projectId, documentId = null, tool = 'custom', variant, apiKey } = options
  const output = await callGemini(prompt, model, apiKey, maxOutputTokens)

  if (log) {
    const normalizedTool: Exclude<HistoryOptions['tool'], undefined> = tool ?? 'custom'
    log({ projectId, documentId, tool: normalizedTool, variant, input: prompt, output, model })
  }

  return output
}

export function hasGeminiKey() {
  return Boolean(API_KEY)
}
