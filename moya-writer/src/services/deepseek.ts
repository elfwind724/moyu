const DEFAULT_ENDPOINT = 'https://api.deepseek.com/chat/completions'
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined

export type DeepSeekModel = 'deepseek-chat' | 'deepseek-reasoner'

export type DeepSeekParams = {
  model?: DeepSeekModel
  systemPrompt?: string
  userPrompt: string
  temperature?: number
  maxTokens?: number
  apiKey?: string
}

export async function generateDeepSeek(params: DeepSeekParams): Promise<string> {
  const {
    model = 'deepseek-chat',
    systemPrompt = 'You are a helpful writing assistant focusing on Chinese fiction.',
    userPrompt,
    temperature = 0.7,
    maxTokens,
    apiKey,
  } = params

  const key = (apiKey ?? API_KEY)?.trim()
  const normalizedModel: DeepSeekModel | 'deepseek-chat' =
    (model?.trim() as DeepSeekModel) || 'deepseek-chat'

  if (!key) {
    return `【DeepSeek 模拟输出】\n模型：${normalizedModel}\n提示：${userPrompt.slice(0, 160)}...\n请在右侧设置面板保存 DeepSeek Key 以启用真实调用。`
  }

  const response = await fetch(DEFAULT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: normalizedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`DeepSeek 请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  
  // 检查是否有错误
  if (data.error) {
    throw new Error(`DeepSeek 错误: ${data.error.message || JSON.stringify(data.error)}`)
  }
  
  const text = data?.choices?.[0]?.message?.content
  if (!text) {
    console.error('DeepSeek 响应结构:', JSON.stringify(data, null, 2))
    throw new Error(`DeepSeek 返回内容为空。响应结构: ${JSON.stringify(data).slice(0, 200)}`)
  }
  return text
}

export function hasDeepSeekKey() {
  return Boolean(API_KEY)
}
