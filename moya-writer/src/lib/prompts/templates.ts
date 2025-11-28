type TemplateContext = {
  content: string
  selection?: string
  storyBibleSynopsis?: string
}

export type DescribeVariant =
  | 'default'
  | 'sense-vision'
  | 'sense-audio'
  | 'sense-smell'
  | 'sense-touch'
  | 'sense-taste'
  | 'psychology'
  | 'action'
  | 'mood-horror'
  | 'mood-epic'

export type WriteVariant =
  | 'advance-action'
  | 'raise-conflict'
  | 'build-suspense'
  | 'emotional-beat'
  | 'twist'

export type RewriteVariant =
  | 'style-formal'
  | 'style-poetic'
  | 'style-colloquial'
  | 'voice-noir'
  | 'voice-comedic'
  | 'perspective-first'
  | 'perspective-third'
  | 'perspective-omniscient'
  | 'pacing-tight'
  | 'pacing-rich'

export type ExpandVariant =
  | 'branch-conflict'
  | 'branch-emotion'
  | 'branch-mystery'
  | 'worldbuilding'
  | 'hook-cliffhanger'
  | 'hook-question'
  | 'slow-burn'
  | 'fast-forward'

export type BrainstormVariant =
  | 'premise'
  | 'conflict-tree'
  | 'character-arc'
  | 'worldbuilding-idea'
  | 'mystery-hooks'

export type TwistVariant =
  | 'reversal'
  | 'betrayal'
  | 'reveal-secret'
  | 'timing-shift'
  | 'perspective-shift'

export type ShrinkVariant =
  | 'summary-150'
  | 'summary-50'
  | 'outline'
  | 'logline'
  | 'bullet-keywords'

const baseContext = (context: TemplateContext) =>
  context.selection && context.selection.trim().length > 0
    ? context.selection
    : context.content

export function buildWritePrompt(context: TemplateContext) {
  const { content, storyBibleSynopsis } = context
  const base = content || '（尚无上下文）'
  return `你是一位擅长中文科幻叙事的小说助手。请基于以下内容续写 120-180 字的新段落：

【已有内容（请勿重复）】
${base.slice(-600)}

${storyBibleSynopsis ? `【故事背景参考】${storyBibleSynopsis}\n` : ''}【重要要求】
- **必须续写新内容**：不要重复或改写上述已有内容，要从已有内容的结尾继续写下去
- **保持情节连贯**：新内容要自然承接已有内容的结尾
- **保持世界观一致**：延续情绪基调，加入新的感官细节和情节推进
- **如果故事背景与已有内容冲突，以已有内容为准**
- **输出格式**：直接输出续写的新段落，不要包含"续写如下"等前缀`
}

export function buildRewritePrompt(context: TemplateContext) {
  const source = baseContext(context)
  return `请用更加有张力的语言改写以下文本，保持原意不变：
${source.slice(-400)}

要求：
1. 增强动词与形容词的表现力
2. 保持段落长度相近
3. 输出中文`
}

const REWRITE_VARIANT_PROMPTS: Record<RewriteVariant, (source: string) => string> = {
  'style-formal': (source) => `请用正式、严谨的文风改写以下段落，保持信息完整：
${source.slice(-400)}

要求：句式更规整、词汇更书面，总字数控制在原文 ±10%。`,
  'style-poetic': (source) => `请用富有诗意与意象化的文风改写以下段落：
${source.slice(-400)}

要求：加入比喻/拟人，但保持句子通顺，总字数 ≤ 原文的 1.2 倍。`,
  'style-colloquial': (source) => `请将以下段落改写得更口语化、更贴近人物真实对话：
${source.slice(-400)}

要求：语气自然，允许加入简单语气词，总字数控制在原文 ±10%。`,
  'voice-noir': (source) => `请把以下段落改写成暗黑、黑色电影风格，保留核心信息：
${source.slice(-400)}

要求：语气冷峻、带有隐含危机，总字数 ≤ 原文的 1.1 倍。`,
  'voice-comedic': (source) => `请将以下段落改写成轻松幽默的语气，但保留剧情要点：
${source.slice(-400)}

要求：可以加入俏皮比喻，总字数控制在原文 ±10%。`,
  'perspective-first': (source) => `请把以下段落改写成第一人称视角，呈现“我”的所见所感：
${source.slice(-400)}

要求：保持原剧情信息，总字数控制在原文 ±10%。`,
  'perspective-third': (source) => `请将以下段落改写成第三人称有限视角，关注主角的观察与情绪：
${source.slice(-400)}

要求：保留原剧情信息，总字数控制在原文 ±10%。`,
  'perspective-omniscient': (source) => `请将以下段落改写成全知视角，能适度揭示其他角色或未来的信息：
${source.slice(-400)}

要求：仍保持清晰连贯，总字数 ≤ 原文的 1.2 倍。`,
  'pacing-tight': (source) => `请对以下内容进行压缩改写，突出重点，字数约为原文的 70%：
${source.slice(-400)}

要求：删除冗余描述，保留核心动作/信息。`,
  'pacing-rich': (source) => `请在保持原意的基础上略作扩写，加入细节与意象（约原文 1.3 倍）：
${source.slice(-400)}

要求：不改变剧情走向，适度补充环境或心理描写。`,
}

export function buildRewriteVariantPrompt(variant: RewriteVariant, context: TemplateContext) {
  const source = baseContext(context)
  const builder = REWRITE_VARIANT_PROMPTS[variant] ?? REWRITE_VARIANT_PROMPTS['style-formal']
  return builder(source)
}

export function buildDescribePrompt(context: TemplateContext) {
  const source = baseContext(context)
  return `请强化下述场景的五感细节，重点描写光线、声响与触感：
${source.slice(-400)}

输出中文，保留原段落结构。`
}

const DESCRIBE_VARIANT_PROMPTS: Record<DescribeVariant, (source: string) => string> = {
  default: (source) => buildDescribePrompt({ content: source }),
  'sense-vision': (source) => `请浓墨描写视觉细节，突出光影、颜色与形体对比：
${source.slice(-400)}

输出不超过120字，保持中文科幻风格。`,
  'sense-audio': (source) => `请强化听觉细节，描写声响的来源、节奏与距离层次：
${source.slice(-400)}

输出不超过120字，保持中文科幻风格。`,
  'sense-smell': (source) => `请聚焦气味与空气细节，描写味道、湿度、温度带来的感受：
${source.slice(-400)}

输出不超过120字，保持中文科幻风格。`,
  'sense-touch': (source) => `请突出触觉与质感，描写肌肤、材质、温差的细腻体验：
${source.slice(-400)}

输出不超过120字，保持中文科幻风格。`,
  'sense-taste': (source) => `请从味觉切入，描写口腔中的味道、唾液反应与联想：
${source.slice(-400)}

输出不超过120字，保持中文科幻风格。`,
  psychology: (source) => `请从角色心理角度描写内心活动、情绪波动与潜台词：
${source.slice(-400)}

输出不超过130字，保持中文科幻风格。`,
  action: (source) => `请强化动作与身体语言，描写节奏、力度与微小动作：
${source.slice(-400)}

输出不超过130字，保持中文科幻风格。`,
  'mood-horror': (source) => `请把以下场景改写成暗黑、恐怖氛围，营造令人不安的细节：
${source.slice(-400)}

输出不超过120字，保持中文科幻语感。`,
  'mood-epic': (source) => `请把以下场景改写成宏大、史诗氛围，强调空间、力量与壮阔感：
${source.slice(-400)}

输出不超过120字，保持中文科幻语感。`,
}

export function buildDescribeVariantPrompt(variant: DescribeVariant, context: TemplateContext) {
  const source = baseContext(context)
  const builder = DESCRIBE_VARIANT_PROMPTS[variant] ?? DESCRIBE_VARIANT_PROMPTS.default
  return builder(source)
}

const WRITE_VARIANT_PROMPTS: Record<WriteVariant, (context: TemplateContext) => string> = {
  'advance-action': ({ content, storyBibleSynopsis }) => `请把以下内容续写 120-160 字的新段落，强调紧张的动作与场面：

【已有内容（请勿重复）】
${(content || '').slice(-600)}

${storyBibleSynopsis ? `【故事背景参考】${storyBibleSynopsis}\n` : ''}要求：
- **必须续写新内容**：不要重复已有内容，从结尾继续写
- 保持科幻背景、突出动作节奏，并留出下一段可承接的新线索`,
  'raise-conflict': ({ content, storyBibleSynopsis }) => `请续写 120-160 字的新段落，聚焦冲突升级或新的阻碍：

【已有内容（请勿重复）】
${(content || '').slice(-600)}

${storyBibleSynopsis ? `【故事背景参考】${storyBibleSynopsis}\n` : ''}要求：
- **必须续写新内容**：不要重复已有内容，从结尾继续写
- 引入新的对抗、矛盾或选择，让角色陷入更大的困境`,
  'build-suspense': ({ content, storyBibleSynopsis }) => `请续写 120-160 字的新段落，以悬念、未解谜题或隐藏危机为重点：

【已有内容（请勿重复）】
${(content || '').slice(-600)}

${storyBibleSynopsis ? `【故事背景参考】${storyBibleSynopsis}\n` : ''}要求：
- **必须续写新内容**：不要重复已有内容，从结尾继续写
- 营造紧张感，结尾留下一个钩子或疑问`,
  'emotional-beat': ({ content, storyBibleSynopsis }) => `请续写 120-160 字的新段落，突出角色情绪与内心变化：

【已有内容（请勿重复）】
${(content || '').slice(-600)}

${storyBibleSynopsis ? `【故事背景参考】${storyBibleSynopsis}\n` : ''}要求：
- **必须续写新内容**：不要重复已有内容，从结尾继续写
- 描写角色心理与人际关系，保持中文科幻语感`,
  twist: ({ content, storyBibleSynopsis }) => `请续写 120-160 字的新段落，引出一个意想不到但合理的剧情转折：

【已有内容（请勿重复）】
${(content || '').slice(-600)}

${storyBibleSynopsis ? `【故事背景参考】${storyBibleSynopsis}\n` : ''}要求：
- **必须续写新内容**：不要重复已有内容，从结尾继续写
- 转折要与既有设定相符，并留下后续发展的伏笔`,
}

export function buildWriteVariantPrompt(variant: WriteVariant, context: TemplateContext) {
  const builder = WRITE_VARIANT_PROMPTS[variant] ?? WRITE_VARIANT_PROMPTS['advance-action']
  return builder(context)
}

const EXPAND_VARIANT_PROMPTS: Record<ExpandVariant, (source: string) => string> = {
  'branch-conflict': (source) => `请对以下片段进行扩展 140-180 字，重点描写冲突走向的另一个可能分支：
${source.slice(-400)}

要求：保持人物设定一致，提出一个新的阻碍或对手行动，为后续剧情提供发展空间。`,
  'branch-emotion': (source) => `请扩展 140-180 字，以角色情绪和关系变化为核心，呈现另一种情感走向：
${source.slice(-400)}

要求：保持设定不变，强化心理描写，让结尾保留悬念或未说完的话。`,
  'branch-mystery': (source) => `请扩展 140-180 字，营造悬疑/谜团分支：
${source.slice(-400)}

要求：引入新的线索或未解之谜，保持合理性，结尾留出钩子。`,
  worldbuilding: (source) => `请扩展 150-200 字，补充世界观或背景设定细节：
${source.slice(-400)}

要求：描述科技、社会结构或历史事件，与主线呼应，并为后续剧情提供素材。`,
  'hook-cliffhanger': (source) => `请扩展 120-160 字，打造一个紧张的悬崖式结尾钩子：
${source.slice(-400)}

要求：节奏鲜明，让读者想继续阅读，结尾留下危机或未完成动作。`,
  'hook-question': (source) => `请扩展 120-160 字，结尾抛出引人好奇的问题或悖论：
${source.slice(-400)}

要求：保持剧情逻辑，最后提出关键疑问，引导下一章探索。`,
  'slow-burn': (source) => `请扩展 160-200 字，放慢节奏，细腻描写环境/氛围/人物内心：
${source.slice(-400)}

要求：增强感官细节与心理层次，结尾带出小幅铺垫。`,
  'fast-forward': (source) => `请扩展 120-150 字，加速推进剧情，概述时间流逝或关键事件进展：
${source.slice(-400)}

要求：保持逻辑紧凑，点明转折节点，为下一幕腾出空间。`,
}

export function buildExpandPrompt(context: TemplateContext) {
  const source = baseContext(context)
  return `请在保持原意的前提下扩展以下段落，增加细节与情绪渲染，篇幅约 150 字：
${source.slice(-400)}

要求：
1. 保持叙事视角一致
2. 增加人物心理或环境描写
3. 输出中文`
}

export function buildExpandVariantPrompt(variant: ExpandVariant, context: TemplateContext) {
  const source = baseContext(context)
  const builder = EXPAND_VARIANT_PROMPTS[variant] ?? EXPAND_VARIANT_PROMPTS['branch-conflict']
  return builder(source)
}

export function buildBrainstormPrompt(context: TemplateContext) {
  const base = baseContext(context)
  return `请基于以下文本与设定，提出 3 个有创意的剧情灵感点子：
${base.slice(-600)}

要求：
- **必须完整输出所有3个灵感点子，不要截断或省略**
- 每个灵感用两句话详细描述
- 保持当前世界观与人物设定
- 结尾附上潜在的情绪或题材标签
- 确保内容完整，不要因为篇幅限制而省略任何重要信息`
}

const BRAINSTORM_VARIANT_PROMPTS: Record<BrainstormVariant, (context: TemplateContext) => string> = {
  premise: ({ content, storyBibleSynopsis }) => `请围绕以下内容提出 3 个新的剧情前提或任务目标：
${(content || '').slice(-600)}

故事概要：${storyBibleSynopsis ?? '暂无'}
要求：
- **必须完整输出所有3个前提，不要截断或省略**
- 每个前提都要详细包含动机、风险与潜在奖励
- 确保内容完整，不要省略任何重要信息`,
  'conflict-tree': ({ content, storyBibleSynopsis }) => `请构思 3 条冲突升级线，每条包含"触发事件 - 升级 - 失控"三个节点：
${(content || '').slice(-600)}

故事概要：${storyBibleSynopsis ?? '暂无'}
要求：
- **必须完整输出所有3条冲突线，不要截断或省略**
- 每条冲突线都要详细描述三个节点，确保内容完整
输出格式示例：
- 冲突线标题：
  1) 触发事件：
  2) 升级：
  3) 失控：`,
  'character-arc': ({ content }) => `请提出 3 个角色成长弧线方案，每个方案说明"内在需求"、"转折契机"、"成长结果"：
${(content || '').slice(-600)}

要求：
- **必须完整输出所有3个方案，不要截断或省略**
- 每个方案都要详细描述内在需求、转折契机和成长结果
- 贴合科幻背景，可聚焦主角或关键配角
- 确保内容完整，不要省略任何重要细节`,
  'worldbuilding-idea': ({ content }) => `请提出 3 个世界观或科技设定的扩展灵感：
${(content || '').slice(-600)}

要求：
- **必须完整输出所有3个创意点子，不要截断或省略**
- 每个创意点子都要详细描述设定细节、社会影响，以及它如何推动剧情发展
- 每个点子应包含：设定名称、具体描述、对世界观的影响、对剧情的作用
- 确保内容完整，不要因为篇幅限制而省略任何重要信息`,
  'mystery-hooks': ({ content }) => `请围绕以下剧情提出 3 个悬疑钩子，每个钩子包含"谜题描述 + 线索指向 + 潜在真相"：
${(content || '').slice(-600)}

要求：
- **必须完整输出所有3个悬疑钩子，不要截断或省略**
- 每个钩子都要详细描述谜题、线索和潜在真相
- 保持合理性，并留下后续可解答的空间
- 确保内容完整，不要省略任何重要信息`,
}

export function buildBrainstormVariantPrompt(variant: BrainstormVariant, context: TemplateContext) {
  const builder = BRAINSTORM_VARIANT_PROMPTS[variant] ?? BRAINSTORM_VARIANT_PROMPTS.premise
  return builder(context)
}

export function buildTwistPrompt(context: TemplateContext) {
  const base = baseContext(context)
  return `请针对以下剧情构思 3 个合乎逻辑的剧情反转点：
${base.slice(-600)}

要求：
- 每个反转用两句话描述
- 说明反转对角色或世界造成的影响
- 保持中文输出`
}

const TWIST_VARIANT_PROMPTS: Record<TwistVariant, (context: TemplateContext) => string> = {
  reversal: ({ content }) => `请构思 3 个“局势反转”方案，让角色从劣势瞬间逆转局面：
${(content || '').slice(-600)}

要求：说明反转触发条件与代价。`,
  betrayal: ({ content }) => `请构思 3 个“背叛”式反转点：
${(content || '').slice(-600)}

每个方案需说明背叛者、动机，以及对主线造成的冲击。`,
  'reveal-secret': ({ content }) => `请构思 3 个“隐藏真相揭露”反转点：
${(content || '').slice(-600)}

要求：指出真相内容、揭露方式与情绪冲击。`,
  'timing-shift': ({ content }) => `请构思 3 个“时间点突变”反转：
${(content || '').slice(-600)}

说明为何发生在此刻、反转后角色面临的新局面。`,
  'perspective-shift': ({ content }) => `请构思 3 个“视角转换”反转：
${(content || '').slice(-600)}

要求：描述转换后的信息差与读者的震撼点。`,
}

export function buildTwistVariantPrompt(variant: TwistVariant, context: TemplateContext) {
  const builder = TWIST_VARIANT_PROMPTS[variant] ?? TWIST_VARIANT_PROMPTS.reversal
  return builder(context)
}

export function buildShrinkPrompt(context: TemplateContext) {
  const source = baseContext(context)
  return `请将以下内容压缩成约 120 字的简洁摘要，同时保持核心信息：
${source.slice(-600)}

输出中文，语句流畅，避免堆砌。`
}

const SHRINK_VARIANT_PROMPTS: Record<ShrinkVariant, (context: TemplateContext) => string> = {
  'summary-150': ({ content }) => `请将以下内容整理成 150 字左右的段落摘要：
${(content || '').slice(-600)}

要求：突出角色目标、冲突与情绪。`,
  'summary-50': ({ content }) => `请压缩成 50 字以内的超短摘要，突出故事核心矛盾：
${(content || '').slice(-400)}

输出一段中文。`,
  outline: ({ content }) => `请把以下内容整理成 4-6 条剧情大纲，每条不超过 25 字：
${(content || '').slice(-600)}

使用序号列出，涵盖起承转合。`,
  logline: ({ content }) => `请为以下内容写一个一句话剧情梗概（Logline），突出主角、目标、阻碍与风险：
${(content || '').slice(-600)}

输出不超过 35 字，语句紧凑。`,
  'bullet-keywords': ({ content }) => `请提取 6-8 个关键词或短语，概括以下内容的核心元素：
${(content || '').slice(-600)}

每个关键词不超过 6 个字，使用顿号分隔。`,
}

export function buildShrinkVariantPrompt(variant: ShrinkVariant, context: TemplateContext) {
  const builder = SHRINK_VARIANT_PROMPTS[variant] ?? SHRINK_VARIANT_PROMPTS['summary-150']
  return builder(context)
}

