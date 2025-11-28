import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettings } from '@/contexts/SettingsContext'
import { hasGeminiKey } from '@/services/gemini'
import { hasDeepSeekKey } from '@/services/deepseek'
import { hasZhipuKey } from '@/services/zhipu'

const AVAILABLE_MODELS = [
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (质量)', provider: 'gemini' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (速度)', provider: 'gemini' },
  { value: 'deepseek-chat', label: 'DeepSeek Chat (中文优化)', provider: 'deepseek' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (思考模式)', provider: 'deepseek' },
  { value: 'glm-4.6', label: 'GLM-4.6 (智谱旗舰)', provider: 'zhipu' },
  { value: 'glm-4.5', label: 'GLM-4.5 (智谱)', provider: 'zhipu' },
]

const LENGTH_OPTIONS = [
  { value: 90, label: '精简（≈90字）' },
  { value: 150, label: '标准（≈150字）' },
  { value: 220, label: '深入（≈220字）' },
]

const COUNT_OPTIONS: Array<{ value: 1 | 2 | 3; label: string }> = [
  { value: 1, label: '1 条' },
  { value: 2, label: '2 条' },
  { value: 3, label: '3 条' },
]

export function AiConfigPanel() {
  const { settings, updateAi, setApiKey } = useSettings()
  const [geminiInput, setGeminiInput] = useState(settings.keys.gemini ?? '')
  const [deepseekInput, setDeepseekInput] = useState(settings.keys.deepseek ?? '')
  const [zhipuInput, setZhipuInput] = useState(settings.keys.zhipu ?? '')

  useEffect(() => {
    setGeminiInput(settings.keys.gemini ?? '')
    setDeepseekInput(settings.keys.deepseek ?? '')
    setZhipuInput(settings.keys.zhipu ?? '')
  }, [settings.keys.gemini, settings.keys.deepseek, settings.keys.zhipu])

  const geminiHasKey = Boolean(settings.keys.gemini || hasGeminiKey())
  const deepseekHasKey = Boolean(settings.keys.deepseek || hasDeepSeekKey())
  const zhipuHasKey = Boolean(settings.keys.zhipu || hasZhipuKey())

  const geminiDetected = geminiHasKey || Boolean(settings.keys.gemini)
  const deepseekDetected = deepseekHasKey || Boolean(settings.keys.deepseek)
  const zhipuDetected = zhipuHasKey || Boolean(settings.keys.zhipu)

  const displayModels = useMemo(() => {
    return AVAILABLE_MODELS.filter((item) => {
      if (item.provider === 'gemini') {
        return geminiDetected || settings.provider === 'gemini'
      }
      if (item.provider === 'deepseek') {
        return deepseekDetected || settings.provider === 'deepseek'
      }
      if (item.provider === 'zhipu') {
        return zhipuDetected || settings.provider === 'zhipu'
      }
      return true
    })
  }, [deepseekDetected, geminiDetected, zhipuDetected, settings.provider])

  const toggleParallelProvider = (provider: 'gemini' | 'deepseek' | 'zhipu') => {
    const current = settings.parallelProviders ?? []
    const next = current.includes(provider)
      ? current.filter((p) => p !== provider)
      : [...current, provider]
    updateAi({ parallelProviders: next })
  }

  return (
    <div className="rounded-3xl border border-border bg-card/40 p-6 text-sm text-foreground shadow-sm">
      <header className="space-y-1">
        <h2 className="text-base font-semibold">AI 配置</h2>
        <p className="text-xs text-muted-foreground">
          选择默认模型与创意度，并可在此粘贴 API Key（仅保存在本地）。
        </p>
      </header>

      <div className="mt-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">模型</label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {displayModels.map((item) => (
              <button
                key={item.value}
                onClick={() =>
                  updateAi({ provider: item.provider as 'gemini' | 'deepseek' | 'zhipu', model: item.value })
                }
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  settings.model === item.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background/70 text-foreground hover:bg-muted'
                }`}
              >
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.value}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">温度（创意度）</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={settings.temperature}
              onChange={(event) => updateAi({ temperature: Number(event.target.value) })}
              className="flex-1"
            />
            <span className="w-12 text-right text-xs text-muted-foreground">
              {settings.temperature.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">每次生成条数</label>
            <div className="mt-2 flex gap-2">
              {COUNT_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => updateAi({ suggestionCount: item.value })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs transition ${
                    settings.suggestionCount === item.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background/70 text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">单条长度控制</label>
            <div className="mt-2 flex gap-2">
              {LENGTH_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => updateAi({ outputLength: item.value })}
                  className={`flex-1 rounded-lg border px-3 py-2 text-center text-xs transition ${
                    settings.outputLength === item.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background/70 text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">并行调用（同时使用多个API）</label>
            <p className="text-xs text-muted-foreground mb-2">
              选择多个API后，当"每次生成条数"设为1时，点击工具栏按钮将同时调用所有选中的API，便于对比输出效果。
              <span className="block mt-1 text-[10px] text-orange-600">⚠️ 注意：并行调用仅在"每次生成条数"为1时生效</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {(['gemini', 'deepseek', 'zhipu'] as const).map((provider) => {
                const hasKey = provider === 'gemini' ? geminiDetected : provider === 'deepseek' ? deepseekDetected : zhipuDetected
                const isSelected = (settings.parallelProviders ?? []).includes(provider)
                const label = provider === 'gemini' ? 'Gemini' : provider === 'deepseek' ? 'DeepSeek' : '智谱AI'
                return (
                  <button
                    key={provider}
                    type="button"
                    disabled={!hasKey}
                    onClick={() => toggleParallelProvider(provider)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : hasKey
                        ? 'border-border bg-background/70 text-foreground hover:bg-muted'
                        : 'border-border bg-background/30 text-muted-foreground opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {label}
                    {!hasKey && ' (需Key)'}
                  </button>
                )
              })}
            </div>
            {(settings.parallelProviders ?? []).length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                已选择 {settings.parallelProviders!.length} 个API进行并行调用
              </p>
            )}
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <label htmlFor="gemini-api-key" className="text-xs font-semibold text-muted-foreground">
                Gemini API Key
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="gemini-api-key"
                  name="gemini-api-key"
                  autoComplete="off"
                  className="flex-1 text-xs"
                  placeholder="粘贴 Gemini Key"
                  value={geminiInput}
                  onChange={(event) => setGeminiInput(event.target.value)}
                  onBlur={() => setApiKey('gemini', geminiInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={() => setApiKey('gemini', geminiInput)}
                >
                  保存
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-3 text-xs"
                  onClick={() => {
                    setGeminiInput('')
                    setApiKey('gemini', undefined)
                  }}
                >
                  清空
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {settings.keys.gemini ? `已保存：${settings.keys.gemini.slice(0, 4)}…${settings.keys.gemini.slice(-4)}` : '未保存'}
              </p>
            </div>

            <div>
              <label htmlFor="deepseek-api-key" className="text-xs font-semibold text-muted-foreground">
                DeepSeek API Key
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="deepseek-api-key"
                  name="deepseek-api-key"
                  autoComplete="off"
                  className="flex-1 text-xs"
                  placeholder="粘贴 DeepSeek Key"
                  value={deepseekInput}
                  onChange={(event) => setDeepseekInput(event.target.value)}
                  onBlur={() => setApiKey('deepseek', deepseekInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={() => setApiKey('deepseek', deepseekInput)}
                >
                  保存
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-3 text-xs"
                  onClick={() => {
                    setDeepseekInput('')
                    setApiKey('deepseek', undefined)
                  }}
                >
                  清空
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {settings.keys.deepseek
                  ? `已保存：${settings.keys.deepseek.slice(0, 4)}…${settings.keys.deepseek.slice(-4)}`
                  : '未保存'}
              </p>
            </div>

            <div>
              <label htmlFor="zhipu-api-key" className="text-xs font-semibold text-muted-foreground">
                智谱AI API Key
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  id="zhipu-api-key"
                  name="zhipu-api-key"
                  autoComplete="off"
                  className="flex-1 text-xs"
                  placeholder="粘贴智谱AI Key"
                  value={zhipuInput}
                  onChange={(event) => setZhipuInput(event.target.value)}
                  onBlur={() => setApiKey('zhipu', zhipuInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  onClick={() => setApiKey('zhipu', zhipuInput)}
                >
                  保存
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-3 text-xs"
                  onClick={() => {
                    setZhipuInput('')
                    setApiKey('zhipu', undefined)
                  }}
                >
                  清空
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {settings.keys.zhipu ? `已保存：${settings.keys.zhipu.slice(0, 4)}…${settings.keys.zhipu.slice(-4)}` : '未保存'}
              </p>
            </div>

            {!geminiDetected && !deepseekDetected && !zhipuDetected && (
              <p className="text-xs text-muted-foreground">
                未检测到有效 Key，当前仍使用占位模式。粘贴 Key 后点击保存即可启用真实生成。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
