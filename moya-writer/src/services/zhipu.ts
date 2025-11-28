const DEFAULT_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
const API_KEY = import.meta.env.VITE_ZHIPU_API_KEY as string | undefined

export type ZhipuModel = 'glm-4.6' | 'glm-4.5' | 'glm-4.5-air' | 'glm-4.5-x' | 'glm-4.5-airx' | 'glm-4.5-flash'

export type ZhipuParams = {
  model?: ZhipuModel
  userPrompt: string
  temperature?: number
  maxTokens?: number
  apiKey?: string
}

export async function generateZhipu(params: ZhipuParams): Promise<string> {
  const {
    model = 'glm-4.6',
    userPrompt,
    temperature = 1.0,
    maxTokens,
    apiKey,
  } = params

  const key = (apiKey ?? API_KEY)?.trim()
  const normalizedModel: ZhipuModel = (model?.trim() as ZhipuModel) || 'glm-4.6'

  if (!key) {
    return `【智谱AI 模拟输出】\n模型：${normalizedModel}\n提示：${userPrompt.slice(0, 160)}...\n请在右侧设置面板保存智谱AI Key 以启用真实调用。`
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
        { role: 'user', content: userPrompt },
      ],
      stream: false,
      temperature,
      // 禁用思维链模式，直接返回最终内容
      thinking: { type: 'disabled' },
      // 确保有足够的token空间，但不要增加太多（避免思维链）
      max_tokens: maxTokens ? Math.max(maxTokens, 512) : 2048,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`智谱AI 请求失败: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  
  // 检查是否有错误
  if (data.error) {
    throw new Error(`智谱AI 错误: ${data.error.message || JSON.stringify(data.error)}`)
  }
  
  // GLM-4.6可能返回思维链，但我们只需要最终内容
  const choice = data?.choices?.[0]
  const message = choice?.message
  const finishReason = choice?.finish_reason
  const content = message?.content?.trim()
  
  // 只使用content，不使用reasoning_content（思维链）
  // 如果content为空，尝试其他字段
  let text: string | null = content || null
  
  if (!text || text.length === 0) {
    text = 
      data?.choices?.[0]?.delta?.content?.trim() ??
      data?.content?.trim() ??
      data?.message?.content?.trim() ??
      null
  }
    
  // 如果content为空，说明可能只返回了思维链，这是一个错误
  if (!text || text.length === 0) {
    const reasoningContent = message?.reasoning_content
    console.error('智谱AI 响应结构:', JSON.stringify(data, null, 2))
    if (reasoningContent && reasoningContent.length > 50) {
      // 如果只有思维链没有最终内容，说明API配置有问题
      throw new Error(`智谱AI 只返回了思维链，没有最终内容。这可能是因为max_tokens太小或被截断。finish_reason: ${finishReason}`)
    }
    throw new Error(`智谱AI 返回内容为空。finish_reason: ${finishReason}, 响应结构: ${JSON.stringify(data).slice(0, 500)}`)
  }
  
  return text
}

export function hasZhipuKey() {
  return Boolean(API_KEY)
}

