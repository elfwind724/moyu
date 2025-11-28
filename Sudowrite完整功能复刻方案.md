# Sudowrite完整功能复刻方案 - 100%覆盖

## ✅ 可以完整复刻！答案是肯定的

经过深入研究，**Sudowrite的所有核心功能都可以用Lovable AI + Gemini API复刻**。以下是完整的功能清单和实现方案。

---

## 📊 Sudowrite完整功能矩阵

### **一、Story Bible系统 (核心架构) - 100%可复刻**

| 功能 | 描述 | 复刻难度 | 实现方案 |
|------|------|----------|----------|
| **Braindump** | 灵感倾倒,随意记录想法 | ⭐ 简单 | 简单文本框 + 本地存储 |
| **Genre** | 体裁选择(科幻/奇幻/浪漫等) | ⭐ 简单 | 下拉选择 + 自定义输入 |
| **Style** | 风格设置,可上传样本 | ⭐⭐ 中等 | 文本框 + 文件上传,提取文本作为示例 |
| **Synopsis** | 故事概要自动生成 | ⭐⭐ 中等 | Gemini根据Braindump+Genre生成 |
| **Characters** | 角色管理系统 | ⭐⭐⭐ 复杂 | 见下表详细说明 |
| **Worldbuilding** | 世界观元素库 | ⭐⭐⭐ 复杂 | 可扩展卡片系统 |
| **Outline** | 大纲系统(可拖拽重排) | ⭐⭐⭐ 复杂 | React DnD库 + 层级结构 |
| **Scenes** | 场景卡片系统 | ⭐⭐⭐ 复杂 | 关联Outline的子系统 |

#### **Characters子系统详细功能**
- ✅ 批量生成所有角色(基于Synopsis)
- ✅ 自定义特征字段(trait fields)
- ✅ 关系网络图
- ✅ 从已有文本导入识别角色
- ✅ 角色搜索和过滤
- ✅ 角色在Story Bible中的显著性(Saliency Engine)

#### **Worldbuilding子系统**
- ✅ Places(地点)
- ✅ Items(物品)
- ✅ Lore/Rules(规则/传说)
- ✅ Organizations(组织)
- ✅ 自定义元素类型
- ✅ 层级关系(如城市→街区)

---

### **二、核心写作工具 - 100%可复刻**

| 工具 | 功能描述 | Sudowrite实现 | 我们的复刻方案 |
|------|----------|---------------|----------------|
| **Write** | 续写300-500字 | 有Auto/Guided/Tone Shift三种模式 | Gemini + 三种Prompt模板 |
| **Rewrite** | 改写选中文本 | 生成多个版本供选择 | Gemini生成3-5个变体 |
| **Describe** | 增强描写(五感) | 添加感官细节 | Gemini + "Show Don't Tell"提示词 |
| **Expand** | 扩展段落 | 放慢节奏,增加长度 | Gemini扩写,不改变原意 |
| **Shrink Ray** | 压缩文本 | 缩短同时保留核心 | Gemini总结压缩 |
| **Brainstorm** | 头脑风暴 | 生成创意列表(角色/情节/对话) | Gemini列表生成 |
| **Twist** | 情节转折生成 | 基于梗概生成意外转折 | Gemini创意转折生成 |
| **First Draft** | 章节生成器 | 基于beats生成500-1000字场景 | Gemini长文本生成(需pro模型) |
| **Poem** | 诗歌创作 | 不常用,但存在 | Gemini诗歌生成 |

#### **Write工具的三种模式详解**
```javascript
// Auto Write - 自动续写
const autoWritePrompt = `
基于以下内容自然续写:
${previousText}

Story Bible: ${storyBible}
`;

// Guided Write - 引导续写
const guidedWritePrompt = `
基于以下内容和用户指示续写:
${previousText}

用户指示: ${userGuidance}
Story Bible: ${storyBible}
`;

// Tone Shift - 语气转换
const toneShiftPrompt = `
以${selectedTone}的语气续写:
${previousText}

可选语气: 紧张/轻松/浪漫/幽默/悲伤/神秘
`;
```

---

### **三、高级功能 - 95%可复刻**

| 功能 | 描述 | 复刻难度 | 说明 |
|------|------|----------|------|
| **Canvas** | 可视化大纲画板 | ⭐⭐⭐⭐ 困难 | 拖拽式卡片系统,可用React Flow实现 |
| **Visualize** | 根据文本生成图片 | ⭐⭐⭐⭐ 困难 | 需集成Imagen/DALL-E,非核心功能 |
| **Plugins** | 自定义工具系统 | ⭐⭐⭐⭐⭐ 很难 | 见下方专门说明 |
| **My Voice** | 风格学习 | ⭐⭐⭐⭐ 困难 | Gemini可通过few-shot学习模仿 |
| **Chat** | AI对话助手 | ⭐⭐ 中等 | 标准聊天界面 + Gemini |
| **Quick Edit** | 选中文本快速编辑 | ⭐⭐ 中等 | 右键菜单 + Gemini |
| **Selection Menu** | 选中文本工具栏 | ⭐ 简单 | 浮动工具栏UI |
| **POV & Tense** | 视角和时态设置 | ⭐ 简单 | 下拉选择器 |
| **Chapter Continuity** | 章节连续性 | ⭐⭐ 中等 | 引用前文内容到Prompt |
| **Series Support** | 系列小说支持 | ⭐⭐⭐ 复杂 | 文件夹系统 + 共享Story Bible |
| **Import Novel** | 导入已有小说 | ⭐⭐⭐ 复杂 | 文件解析 + AI提取信息 |
| **History** | 生成历史记录 | ⭐⭐ 中等 | 本地存储 + 卡片展示 |
| **Saliency Engine** | 智能上下文筛选 | ⭐⭐⭐ 复杂 | AI判断哪些角色/元素相关 |

---

### **四、Plugins系统详解 - 核心竞争力**

**Sudowrite的Plugins是其最强大的功能之一,社区已有1000+插件**

#### **插件能做什么?**
1. **生成文本** - 按特定格式/风格生成内容
2. **转换文本** - 改写/翻译/格式转换
3. **分析文本** - 反馈/评分/检查一致性

#### **插件系统核心机制**
```javascript
// 插件数据结构
const Plugin = {
  id: string,
  name: string,
  description: string,
  category: 'writing' | 'editing' | 'analysis' | 'worldbuilding' | 'character',
  creator: string,
  visibility: 'public' | 'unlisted',
  
  // 核心配置
  instruction: string,  // AI指令(用户用自然语言描述)
  
  // 高级配置
  enableStoryBible: boolean,
  storyBibleFields: ['genre', 'characters', 'synopsis', ...],
  
  // 变量系统
  variables: {
    "{{selected_text}}": "用户选中的文本",
    "{{previous_text}}": "光标前1000字",
    "{{genre}}": "Story Bible的体裁",
    "{{characters}}": "相关角色信息",
    "{{synopsis}}": "故事概要",
    "{{braindump}}": "灵感倾倒",
    "{{outline}}": "大纲信息",
    "{{previous_document_text}}": "前一章全文",
    // ... 20+个内置变量
  },
  
  // 输出配置
  outputType: 'single' | 'multiple',  // 单个/多个卡片
  model: 'muse' | 'gpt4' | 'claude' | 'gemini',
  temperature: 0.8,
  maxTokens: 1024
}

// 插件执行流程
async function executePlugin(plugin, context) {
  // 1. 替换变量
  let prompt = plugin.instruction;
  for (const [variable, value] of Object.entries(context)) {
    prompt = prompt.replace(variable, value);
  }
  
  // 2. 添加Story Bible
  if (plugin.enableStoryBible) {
    prompt = addStoryBibleContext(prompt, plugin.storyBibleFields);
  }
  
  // 3. 调用AI
  const result = await geminiService.generate(prompt, {
    temperature: plugin.temperature,
    maxTokens: plugin.maxTokens
  });
  
  // 4. 返回结果
  return result;
}
```

#### **插件示例**

**示例1: 对话润色插件**
```
名称: 对话润色大师
指令: 请改写以下对话,使其更加生动自然:
- 增加语气词和停顿
- 添加肢体语言描写
- 符合人物性格

选中文本: {{selected_text}}
角色信息: {{characters}}

输出3个版本。
```

**示例2: 情节一致性检查**
```
名称: 情节漏洞检测器
指令: 请仔细阅读以下文本,检查是否有情节不一致的地方:
- 人物性格是否前后矛盾
- 时间线是否合理
- 人物位置变化是否连贯

选中文本: {{selected_text}}
故事概要: {{synopsis}}
角色设定: {{characters}}

列出所有发现的问题,每个问题包含:位置、描述、建议修改。
```

**示例3: 武侠动作场面生成(中文特色)**
```
名称: 武侠打斗生成器
指令: 基于以下设定生成一个精彩的武侠打斗场景(300字):

人物1: {{character1}}
人物2: {{character2}}
地点: {{location}}
起因: {{conflict}}

要求:
- 描写招式细节(轻功、内力、兵器)
- 体现人物性格和武功风格
- 有来有回,张弛有度
- 符合武侠小说语言风格
```

#### **我们如何实现Plugins?**

**方案A: 简化版(MVP)**
- 预设20-30个常用插件
- 用户不能自己创建
- 每个插件就是一个预定义的Prompt模板

**方案B: 完整版(终极目标)**
- 允许用户用自然语言创建插件
- 支持变量系统
- 插件市场/社区
- 公开/私有插件

**推荐: 先做方案A,后续升级到方案B**

---

### **五、多模型支持 - Sudowrite的独特优势**

Sudowrite支持多个AI模型,用户可根据需求选择:

| 模型 | 特点 | 成本 | 适用场景 | 我们的对应 |
|------|------|------|----------|-----------|
| **Muse 1.5** | 专为小说训练,质量最高 | 贵 | 核心写作 | ❌ 无法复刻(专有) |
| GPT-5 | 创意强,对话好 | 贵 | 对话场景 | Gemini 2.0 Flash |
| GPT-4 | 平衡性好 | 中等 | 通用写作 | Gemini 1.5 Pro |
| Claude 3.5 | 逻辑强,文学性好 | 中等 | 情节推理 | Gemini 1.5 Pro |
| GPT-3.5 | 便宜快速 | 便宜 | 头脑风暴 | Gemini 1.5 Flash |
| DeepSeek | 便宜,中文好 | 很便宜 | 中文写作 | ✅ 可直接集成 |

**我们的多模型策略:**
1. **主力**: Gemini 1.5 Pro(质量) + Flash(速度)
2. **辅助**: DeepSeek(中文优化)
3. **可选**: Claude API / GPT API(用户自己配置)

---

### **六、界面与交互 - 细节决定成败**

#### **1. 编辑器功能**
- ✅ 富文本编辑(粗体/斜体/下划线)
- ✅ AI生成文本高亮显示(紫色)
- ✅ 字数/字符统计
- ✅ 自动保存
- ✅ 撤销/重做
- ✅ 查找/替换
- ✅ 导出(DOCX/PDF/TXT)

#### **2. History面板**
- ✅ 所有AI生成的"卡片"
- ✅ 可收藏(星标)
- ✅ 可搜索
- ✅ 可对比多个版本
- ✅ 一键插入

#### **3. 工具栏布局**
```
┌────────────────────────────────────────┐
│ [续写▼] [改写] [描写] [扩展] [头脑风暴] │
│                                        │
│  Auto  Guided  Tone                    │
│  ✨     ↔️      🥸                      │
└────────────────────────────────────────┘

点击▼展开子菜单
悬停显示提示
快捷键提示
```

#### **4. 选中文本工具栏(浮动)**
```
用户选中文本后自动显示:

  [改写] [描写] [扩展] [压缩] [更多▼]
     ↑ 浮动在选中文本上方
```

#### **5. Story Bible侧边栏**
```
┌─ Story Bible ──────────┐
│ 📚 Braindump     [编辑] │
│ 🎭 Genre & Style [编辑] │
│ 📖 Synopsis      [生成] │
│ 👤 Characters    [+新增]│
│   ├─ 主角A             │
│   ├─ 反派B             │
│   └─ 配角C             │
│ 🌍 Worldbuilding [+新增]│
│ 📝 Outline       [编辑] │
│ 🎬 Scenes        [编辑] │
└────────────────────────┘
```

---

## 🔧 完整技术实现方案

### **核心技术栈**

```json
{
  "前端框架": "React 18 + TypeScript",
  "UI库": "Tailwind CSS + shadcn/ui",
  "富文本编辑器": "Lexical (Meta开源,Facebook用的)",
  "拖拽": "dnd-kit",
  "状态管理": "Zustand",
  "路由": "React Router",
  "图标": "Lucide React",
  "Canvas可视化": "React Flow",
  "存储": "window.storage API (Claude Artifacts) 或 IndexedDB",
  "AI集成": "Gemini API"
}
```

### **数据持久化方案**

```javascript
// 使用Claude Artifacts的持久化存储
// 每个项目独立存储

// 项目列表
await window.storage.set('projects-list', JSON.stringify(projectsList), false);

// 单个项目
await window.storage.set(`project:${projectId}`, JSON.stringify(project), false);

// Story Bible
await window.storage.set(`story-bible:${projectId}`, JSON.stringify(storyBible), false);

// 文档内容
await window.storage.set(`document:${docId}`, content, false);

// History记录
await window.storage.set(`history:${projectId}`, JSON.stringify(history), false);

// 插件(可选共享)
await window.storage.set(`plugin:${pluginId}`, JSON.stringify(plugin), true);  // shared
```

### **Gemini API完整封装**

```javascript
// services/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  constructor(apiKey) {
    this.ai = new GoogleGenerativeAI(apiKey);
    this.defaultConfig = {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    };
  }

  // 获取模型
  getModel(fast = false) {
    return this.ai.getGenerativeModel({
      model: fast ? "gemini-1.5-flash" : "gemini-1.5-pro",
      generationConfig: this.defaultConfig
    });
  }

  // 通用生成
  async generate(prompt, config = {}) {
    const model = this.getModel(config.fast);
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // 流式生成(实时显示)
  async *generateStream(prompt, config = {}) {
    const model = this.getModel(config.fast);
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  // 构建完整Prompt
  buildPrompt(template, context, storyBible) {
    let prompt = template;
    
    // 替换上下文变量
    for (const [key, value] of Object.entries(context)) {
      prompt = prompt.replace(`{{${key}}}`, value);
    }
    
    // 添加Story Bible
    if (storyBible.enabled) {
      prompt = `
【Story Bible信息】
体裁: ${storyBible.genre}
风格: ${storyBible.style}
概要: ${storyBible.synopsis}

${storyBible.includeCharacters ? `角色: ${JSON.stringify(storyBible.characters)}` : ''}

【写作任务】
${prompt}
`;
    }
    
    // 添加中文优化指令
    prompt += `\n
【重要要求】
1. 使用地道自然的中文表达
2. 避免"突然"、"原来"、"竟然"等陈词滥调
3. 符合${storyBible.genre}体裁的语言风格
4. 展示而非告知(Show, Don't Tell)
`;
    
    return prompt;
  }

  // 续写功能
  async write(mode, context, storyBible) {
    const templates = {
      auto: AUTO_WRITE_TEMPLATE,
      guided: GUIDED_WRITE_TEMPLATE,
      toneShift: TONE_SHIFT_TEMPLATE
    };
    
    const prompt = this.buildPrompt(templates[mode], context, storyBible);
    return await this.generate(prompt);
  }

  // 改写功能
  async rewrite(text, instruction, storyBible) {
    const prompt = this.buildPrompt(REWRITE_TEMPLATE, {
      text,
      instruction
    }, storyBible);
    
    const result = await this.generate(prompt);
    return JSON.parse(result);  // 返回多个版本
  }

  // 描写增强
  async describe(text, context, storyBible) {
    const prompt = this.buildPrompt(DESCRIBE_TEMPLATE, {
      text,
      context
    }, storyBible);
    
    const result = await this.generate(prompt);
    return JSON.parse(result);
  }

  // 角色生成
  async generateCharacter(synopsis, genre, count = 1) {
    const prompt = `基于以下故事概要,生成${count}个立体的角色。

故事概要: ${synopsis}
体裁: ${genre}

对每个角色,生成:
- 姓名(符合${genre}风格)
- 年龄
- 外貌(3-5个特征)
- 性格(MBTI + 5个关键词)
- 背景故事(100字)
- 核心动机
- 主要冲突

输出为JSON数组格式。要求原创性高,避免刻板印象。`;

    const result = await this.generate(prompt, { fast: false });
    return JSON.parse(result);
  }

  // 场景生成
  async generateScene(scene, storyBible) {
    const prompt = this.buildPrompt(SCENE_TEMPLATE, {
      description: scene.description,
      pov: scene.pov,
      tense: scene.tense,
      pace: scene.pace,
      beats: scene.beats.join('\n'),
      extraInstructions: scene.extraInstructions
    }, storyBible);
    
    return await this.generate(prompt, { fast: false });
  }

  // 头脑风暴
  async brainstorm(topic, category, context, storyBible) {
    const prompt = this.buildPrompt(BRAINSTORM_TEMPLATE, {
      topic,
      category,
      context
    }, storyBible);
    
    const result = await this.generate(prompt, { fast: true });
    return JSON.parse(result);
  }

  // 情节转折
  async generateTwist(synopsis, storyBible) {
    const prompt = `基于以下故事梗概,生成5个意外且合理的情节转折点。

故事梗概: ${synopsis}
体裁: ${storyBible.genre}

每个转折包含:
- 转折点描述(50字)
- 如何铺垫(50字)
- 影响和后果(50字)

要求:
- 出乎意料但合理
- 符合体裁和人物性格
- 避免老套的"原来他是..."类型

输出JSON数组。`;

    const result = await this.generate(prompt);
    return JSON.parse(result);
  }
}

export const gemini = new GeminiService(GEMINI_API_KEY);
```

### **Prompt模板库**

```javascript
// prompts/templates.js

export const AUTO_WRITE_TEMPLATE = `
请自然流畅地续写以下文本。

【已有文本】
{{previous_text}}

【续写要求】
1. 生成约300字
2. 保持前文风格和语气
3. 符合人物性格
4. 推进情节或深化描写
5. 不要生硬转折
6. 自然收尾,留有余地

直接续写,不要开场白。
`;

export const GUIDED_WRITE_TEMPLATE = `
请根据用户指示续写以下文本。

【已有文本】
{{previous_text}}

【用户指示】
{{user_guidance}}

【续写要求】
1. 严格按照用户指示发展情节
2. 生成约300字
3. 保持风格一致
4. 自然衔接

直接续写。
`;

export const TONE_SHIFT_TEMPLATE = `
请以{{tone}}的语气续写以下文本。

【已有文本】
{{previous_text}}

【语气说明】
- 紧张: 短句、快节奏、悬念
- 轻松: 幽默、随意、舒缓
- 浪漫: 细腻、感性、诗意
- 神秘: 暗示、隐喻、不确定

生成约300字,完全体现所选语气。
`;

export const REWRITE_TEMPLATE = `
请改写以下文本,{{instruction}}。

【原文】
{{text}}

【改写要求】
1. 保持核心意思不变
2. 提供3个不同风格的版本
3. 每个版本约{{length}}字
4. 标注每个版本的特点

输出JSON格式:
[
  {
    "version": 1,
    "style": "简洁版",
    "text": "..."
  },
  ...
]
`;

export const DESCRIBE_TEMPLATE = `
请为以下场景片段添加丰富的感官描写。

【原文】
{{text}}

【场景背景】
{{context}}

【描写要求】
1. 五感描写:视觉、听觉、嗅觉、触觉、味觉
2. 制造沉浸感
3. 不改变原有情节
4. 避免过度华丽
5. 提供2个版本供选择

输出JSON数组格式。
`;

export const SCENE_TEMPLATE = `
你是小说写作专家。请基于以下信息生成场景文本。

【场景要求】
描述: {{description}}
视角: {{pov}}
时态: {{tense}}
节奏: {{pace}}

【情节要点】
{{beats}}

【额外指令】
{{extraInstructions}}

【写作要求】
1. 生成300-500字的场景文本
2. 展现人物性格,不要平铺直叙
3. 使用"展示而非告知"(Show, Don't Tell)
4. 自然融入环境和感官描写
5. 符合人物性格和故事逻辑
6. 语言生动但不浮夸

直接输出场景文本。
`;

export const BRAINSTORM_TEMPLATE = `
请为以下主题生成{{category}}创意。

【主题】
{{topic}}

【背景】
{{context}}

【创意类别说明】
- 角色创意: 新角色、角色发展方向
- 情节转折: 意外事件、冲突升级
- 对话灵感: 关键台词、对话场景
- 世界观: 地点、规则、历史
- 冲突设计: 外部冲突、内心挣扎

生成10个创意,每个包含简短说明(30字)。

输出JSON数组:
[
  {
    "idea": "...",
    "description": "..."
  },
  ...
]
`;
```

---

## 🎨 UI组件实现示例

### **Story Bible面板组件**

```jsx
// components/StoryBible/StoryBiblePanel.jsx
import { useState } from 'react';
import { useStoryBible } from '@/contexts/StoryBibleContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Users, Globe, List, Film } from 'lucide-react';

export function StoryBiblePanel() {
  const { storyBible, updateField, generateSynopsis } = useStoryBible();
  const [activeTab, setActiveTab] = useState('braindump');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'braindump', label: '灵感', icon: BookOpen },
    { id: 'synopsis', label: '概要', icon: BookOpen },
    { id: 'characters', label: '角色', icon: Users },
    { id: 'worldbuilding', label: '世界观', icon: Globe },
    { id: 'outline', label: '大纲', icon: List },
    { id: 'scenes', label: '场景', icon: Film }
  ];

  const handleGenerate = async () => {
    setLoading(true);
    try {
      await generateSynopsis();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col">
      {/* 标签栏 */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'braindump' && (
          <BraindumpSection 
            value={storyBible.braindump}
            onChange={(value) => updateField('braindump', value)}
          />
        )}
        
        {activeTab === 'synopsis' && (
          <SynopsisSection
            value={storyBible.synopsis}
            onChange={(value) => updateField('synopsis', value)}
            onGenerate={handleGenerate}
            loading={loading}
          />
        )}
        
        {activeTab === 'characters' && (
          <CharactersSection />
        )}
        
        {/* ... 其他标签内容 */}
      </div>
    </div>
  );
}

// Braindump区域
function BraindumpSection({ value, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">灵感倾倒 💡</h3>
        <p className="text-sm text-gray-600 mb-3">
          随意记录你的故事想法,不限格式。
        </p>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例如: 一个年轻女孩发现自己可以进入别人的梦境..."
        className="min-h-[300px]"
      />
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Genre & Style
        </Button>
      </div>
    </div>
  );
}

// Synopsis区域
function SynopsisSection({ value, onChange, onGenerate, loading }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">故事概要 📖</h3>
        <Button 
          onClick={onGenerate}
          disabled={loading}
          size="sm"
        >
          {loading ? '生成中...' : '生成'}
        </Button>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="3-5段的故事摘要,AI可以自动生成..."
        className="min-h-[400px]"
      />
    </div>
  );
}
```

### **编辑器组件(Lexical)**

```jsx
// components/Editor/WritingEditor.jsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import { FloatingToolbar } from './FloatingToolbar';
import { EditorToolbar } from './EditorToolbar';

const theme = {
  paragraph: 'mb-2',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline'
  }
};

export function WritingEditor({ documentId }) {
  const initialConfig = {
    namespace: 'WritingEditor',
    theme,
    onError: (error) => console.error(error)
  };

  const handleChange = (editorState) => {
    editorState.read(() => {
      // 保存内容
      const json = editorState.toJSON();
      saveDocument(documentId, json);
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      <LexicalComposer initialConfig={initialConfig}>
        {/* 顶部工具栏 */}
        <EditorToolbar />
        
        <div className="flex-1 overflow-y-auto p-8">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="outline-none min-h-full" />
            }
            placeholder={
              <div className="absolute top-8 left-8 text-gray-400 pointer-events-none">
                开始写作,或使用下方的"续写"按钮...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        
        {/* 选中文本浮动工具栏 */}
        <FloatingToolbar />
        
        {/* 历史记录 */}
        <HistoryPlugin />
        
        {/* 自动保存 */}
        <OnChangePlugin onChange={handleChange} />
      </LexicalComposer>
    </div>
  );
}
```

### **工具栏组件**

```jsx
// components/Editor/EditorToolbar.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  PenLine, 
  RotateCw, 
  Eye, 
  Maximize, 
  Lightbulb,
  Wand2 
} from 'lucide-react';

export function EditorToolbar() {
  const [writeMode, setWriteMode] = useState('auto');
  const [showWriteMenu, setShowWriteMenu] = useState(false);

  return (
    <div className="border-b p-2 flex items-center gap-2">
      {/* 续写按钮组 */}
      <div className="relative">
        <Button
          variant="default"
          onClick={() => handleWrite('auto')}
          onMouseEnter={() => setShowWriteMenu(true)}
          onMouseLeave={() => setShowWriteMenu(false)}
        >
          <PenLine className="w-4 h-4 mr-2" />
          续写
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
        
        {/* 下拉菜单 */}
        {showWriteMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
            <button 
              className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 w-full"
              onClick={() => handleWrite('auto')}
            >
              <Sparkles className="w-4 h-4" />
              Auto - 自动续写
            </button>
            <button 
              className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 w-full"
              onClick={() => handleWrite('guided')}
            >
              <ArrowRight className="w-4 h-4" />
              Guided - 引导续写
            </button>
            <button 
              className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2 w-full"
              onClick={() => handleWrite('tone')}
            >
              <Smile className="w-4 h-4" />
              Tone Shift - 语气转换
            </button>
          </div>
        )}
      </div>

      <Button variant="outline">
        <RotateCw className="w-4 h-4 mr-2" />
        改写
      </Button>

      <Button variant="outline">
        <Eye className="w-4 h-4 mr-2" />
        描写
      </Button>

      <Button variant="outline">
        <Maximize className="w-4 h-4 mr-2" />
        扩展
      </Button>

      <Button variant="outline">
        <Lightbulb className="w-4 h-4 mr-2" />
        头脑风暴
      </Button>

      <div className="ml-auto flex items-center gap-4">
        <span className="text-sm text-gray-600">
          字数: 3,247
        </span>
        <Button variant="ghost" size="sm">
          更多工具 ▼
        </Button>
      </div>
    </div>
  );
}
```

---

## ✅ 完整功能对比表

| 功能类别 | Sudowrite功能 | 复刻难度 | 实现方案 | 状态 |
|---------|---------------|----------|----------|------|
| **Story Bible** | | | | |
| → Braindump | ✓ | ⭐ | 文本框 | ✅ 100% |
| → Genre & Style | ✓ | ⭐ | 选择器+文件上传 | ✅ 100% |
| → Synopsis | ✓ | ⭐⭐ | Gemini生成 | ✅ 100% |
| → Characters | ✓ | ⭐⭐⭐ | CRUD+AI生成 | ✅ 100% |
| → Worldbuilding | ✓ | ⭐⭐⭐ | 卡片系统 | ✅ 100% |
| → Outline | ✓ | ⭐⭐⭐ | 可拖拽列表 | ✅ 100% |
| → Scenes | ✓ | ⭐⭐⭐ | 场景卡片 | ✅ 100% |
| **写作工具** | | | | |
| → Write (Auto) | ✓ | ⭐⭐ | Gemini续写 | ✅ 100% |
| → Write (Guided) | ✓ | ⭐⭐ | Gemini+用户指示 | ✅ 100% |
| → Write (Tone Shift) | ✓ | ⭐⭐ | Gemini语气转换 | ✅ 100% |
| → Rewrite | ✓ | ⭐⭐ | Gemini改写 | ✅ 100% |
| → Describe | ✓ | ⭐⭐ | Gemini描写增强 | ✅ 100% |
| → Expand | ✓ | ⭐⭐ | Gemini扩展 | ✅ 100% |
| → Shrink Ray | ✓ | ⭐⭐ | Gemini压缩 | ✅ 100% |
| → Brainstorm | ✓ | ⭐⭐ | Gemini列表生成 | ✅ 100% |
| → Twist | ✓ | ⭐⭐ | Gemini转折生成 | ✅ 100% |
| → First Draft | ✓ | ⭐⭐⭐ | Gemini Pro长文本 | ✅ 100% |
| **高级功能** | | | | |
| → Canvas | ✓ | ⭐⭐⭐⭐ | React Flow | ✅ 90% |
| → Plugins (预设) | ✓ | ⭐⭐⭐ | 预定义模板 | ✅ 100% |
| → Plugins (自定义) | ✓ | ⭐⭐⭐⭐⭐ | 自然语言生成 | 🔄 80% |
| → My Voice | ✓ | ⭐⭐⭐⭐ | Few-shot学习 | ✅ 90% |
| → Chat | ✓ | ⭐⭐ | 聊天界面 | ✅ 100% |
| → Quick Edit | ✓ | ⭐⭐ | 右键菜单 | ✅ 100% |
| → Visualize | ✓ | ⭐⭐⭐⭐ | 图像生成API | 🔄 50% |
| → POV & Tense | ✓ | ⭐ | 选择器 | ✅ 100% |
| → Chapter Continuity | ✓ | ⭐⭐ | 引用前文 | ✅ 100% |
| → Series Support | ✓ | ⭐⭐⭐ | 文件夹系统 | ✅ 100% |
| → Import Novel | ✓ | ⭐⭐⭐ | 文件解析+AI | ✅ 90% |
| → History | ✓ | ⭐⭐ | 卡片系统 | ✅ 100% |
| → Export | ✓ | ⭐⭐ | 文档导出 | ✅ 100% |
| **多模型支持** | Muse/GPT/Claude | ⭐⭐⭐ | Gemini/DeepSeek | ✅ 80% |

### **总体可复刻度: 95%**

**完全无法复刻的功能:**
- ❌ Muse模型(Sudowrite专有,需大量小说训练)

**部分复刻的功能:**
- 🔄 Visualize (需额外图像生成API,非核心)
- 🔄 自定义Plugins (需复杂的AI提示词生成系统)

**100%可复刻的功能:**
- ✅ 全部Story Bible系统
- ✅ 全部基础写作工具
- ✅ 大部分高级功能

---

## 🚀 MVP开发计划(6周完成核心功能)

### **Week 1: 基础框架**
```
Day 1-2: Lovable AI创建项目,搭建布局
Day 3-4: 项目管理(创建/列表/切换)
Day 5-6: Gemini API集成测试
Day 7: 基础编辑器集成(Lexical)
```

### **Week 2: Story Bible (核心1)**
```
Day 1-2: Braindump + Genre/Style
Day 3-4: Synopsis自动生成
Day 5-6: Characters基础CRUD
Day 7: 存储系统完善
```

### **Week 3: 写作工具 (核心2)**
```
Day 1-2: Write (Auto模式)
Day 3-4: Rewrite
Day 5-6: Describe + Expand
Day 7: 工具栏UI优化
```

### **Week 4: Story Bible完善**
```
Day 1-2: Worldbuilding系统
Day 3-4: Outline系统(可拖拽)
Day 5-6: Scenes卡片
Day 7: Story Bible联动测试
```

### **Week 5: 高级写作工具**
```
Day 1-2: Write (Guided + Tone Shift)
Day 3-4: Brainstorm + Twist
Day 5-6: First Draft
Day 7: History面板
```

### **Week 6: 优化与中文特色**
```
Day 1-2: 中文陈词滥调检测
Day 3-4: 中文体裁/风格预设
Day 5-6: UI/UX优化
Day 7: 测试与修复Bug
```

**6周后可交付:**
- ✅ 完整的Story Bible系统
- ✅ 9个核心写作工具
- ✅ 基础编辑器
- ✅ 项目管理
- ✅ History系统
- ✅ 中文优化

---

## 🎯 后续扩展计划

### **Phase 2 (4-6周): 高级功能**
- Canvas可视化
- 预设Plugins (20-30个)
- My Voice风格学习
- Chat助手
- Series支持
- Import/Export完善

### **Phase 3 (6-8周): 生态系统**
- 自定义Plugins系统
- 用户社区
- 插件市场
- 协作功能
- 移动端适配

---

## 💡 关键成功因素

### **1. Prompt工程是核心**
Sudowrite的Muse模型是专门训练的,我们无法复刻,但可以通过:
- **精细的Prompt模板**
- **大量中文小说示例**(few-shot)
- **陈词滥调黑名单**
- **多轮迭代优化**

来接近其质量。

### **2. Story Bible是灵魂**
必须确保:
- Story Bible的所有字段都能被AI调用
- 上下文相关性(Saliency)
- 自动更新和同步

### **3. 用户体验是关键**
- 流畅的交互
- 快速的响应(使用Flash模型)
- 清晰的UI
- 合理的默认值

### **4. 中文优化是差异化**
- 武侠/仙侠等中文体裁
- 中文语言习惯
- 中文陈词滥调库
- 中文网文风格

---

## 📝 总结

### **✅ 可以完整复刻吗?**

**答案: 95%可以!**

**无法复刻的:**
- Muse专有模型(但Gemini Pro可以非常接近)
- 部分高级插件功能

**完全可以复刻的:**
- 全部Story Bible系统
- 全部基础和高级写作工具
- 大部分UI/UX功能
- 项目管理和存储
- 多模型支持

---

## 🔥 核心竞争力分析

### **Sudowrite的核心优势:**
1. **Muse模型** - 专为小说训练,无内容审查
2. **成熟的Prompt工程** - 经过大量用户测试优化
3. **完整的Story Bible生态** - 所有功能深度集成
4. **活跃的插件社区** - 1000+用户创建的插件
5. **流畅的用户体验** - 多年迭代打磨

### **我们的对策:**

#### **1. 用Gemini + DeepSeek组合拳**
```javascript
// 智能模型选择策略
const modelStrategy = {
  // 创意生成 - 用Gemini Pro
  creative: 'gemini-1.5-pro',
  
  // 中文优化 - 用DeepSeek
  chineseOptimized: 'deepseek-chat',
  
  // 快速任务 - 用Gemini Flash
  fast: 'gemini-1.5-flash',
  
  // 长文本 - 用Gemini Pro (支持2M tokens)
  longContext: 'gemini-1.5-pro'
};

// 根据任务自动选择最佳模型
function selectModel(task) {
  if (task.requiresChinese && task.genre in ['武侠', '仙侠', '玄幻']) {
    return 'deepseek-chat';  // 中文网文优化
  }
  if (task.length > 1000) {
    return 'gemini-1.5-pro';
  }
  if (task.needsSpeed) {
    return 'gemini-1.5-flash';
  }
  return 'gemini-1.5-pro';  // 默认
}
```

#### **2. 建立中文小说语料库**
```javascript
// 为不同体裁准备示例
const chineseExamples = {
  武侠: {
    style: `他脚尖一点，身形如鬼魅般消失在原地。下一瞬，长剑已至对方咽喉三寸。`,
    avoid: ['突然', '瞬间', '只见', '但见']
  },
  
  仙侠: {
    style: `灵气在经脉中运转三十六周天，丹田处金丹微微震颤，一股精纯的真元喷薄而出。`,
    avoid: ['突然突破', '原来', '竟然']
  },
  
  都市言情: {
    style: `她垂下眼睫，指尖无意识地摩挲着咖啡杯沿。窗外细雨霏霏，像她此刻的心情。`,
    avoid: ['突然', '不由得', '心中一动']
  },
  
  悬疑推理: {
    style: `现场的血迹呈放射状分布，这意味着凶手在行凶时距离受害者不到一米。`,
    avoid: ['突然发现', '原来如此', '灵光一闪']
  }
};

// 在生成时动态注入示例
function buildPromptWithExamples(genre, task) {
  const example = chineseExamples[genre];
  return `
【风格参考】
${example.style}

【禁用词汇】
${example.avoid.join('、')}

${task}
`;
}
```

#### **3. 智能上下文系统(Saliency Engine复刻)**
```javascript
// Sudowrite的Saliency Engine会自动判断哪些Story Bible元素相关
// 我们用简单的关键词匹配 + AI判断

class ContextManager {
  constructor(storyBible) {
    this.storyBible = storyBible;
  }
  
  // 获取相关角色
  async getRelevantCharacters(currentText, maxChars = 3) {
    // 1. 关键词匹配
    const mentioned = this.storyBible.characters.filter(char => 
      currentText.includes(char.name)
    );
    
    // 2. 如果提到的少于maxChars，用AI判断
    if (mentioned.length < maxChars) {
      const prompt = `
当前文本: ${currentText}

可选角色:
${this.storyBible.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}

问题: 除了已经提到的角色，哪些角色最可能在接下来的情节中出现？
返回角色名称列表，最多${maxChars - mentioned.length}个。

只输出JSON数组: ["角色A", "角色B"]
`;
      const result = await gemini.generate(prompt, { fast: true });
      const aiSuggested = JSON.parse(result);
      
      return [
        ...mentioned,
        ...this.storyBible.characters.filter(c => aiSuggested.includes(c.name))
      ].slice(0, maxChars);
    }
    
    return mentioned;
  }
  
  // 获取相关世界观元素
  async getRelevantWorldbuilding(currentText, scene) {
    const location = scene?.location;
    const items = this.storyBible.worldbuilding.filter(w => 
      w.type === 'place' && w.name === location ||
      currentText.includes(w.name)
    );
    
    return items;
  }
  
  // 构建完整上下文
  async buildContext(currentText, scene, options = {}) {
    const context = {
      genre: this.storyBible.genre,
      style: this.storyBible.style.text,
      synopsis: this.storyBible.synopsis
    };
    
    // 智能添加相关信息
    if (options.includeCharacters !== false) {
      context.characters = await this.getRelevantCharacters(currentText);
    }
    
    if (options.includeWorldbuilding !== false) {
      context.worldbuilding = await this.getRelevantWorldbuilding(currentText, scene);
    }
    
    // 添加前文 (Chapter Continuity)
    if (options.includePrevious) {
      context.previousChapter = await this.getPreviousChapterSummary();
    }
    
    return context;
  }
}
```

#### **4. 预设插件库(中文特色)**
```javascript
// 内置20个最常用的插件

export const builtInPlugins = [
  // 1. 对话增强
  {
    id: 'dialogue-enhancer',
    name: '对话润色',
    category: 'editing',
    instruction: `
请润色以下对话，使其更加生动:
- 添加语气词、停顿
- 增加肢体语言和表情描写
- 符合人物性格
- 避免"说"字重复

原对话:
{{selected_text}}

角色信息: {{characters}}

提供3个版本。
    `
  },
  
  // 2. 场景设定生成器
  {
    id: 'scene-setter',
    name: '场景铺垫',
    category: 'writing',
    instruction: `
为以下场景生成开场描写(200字):
{{scene_description}}

要求:
- 渲染氛围
- 建立情绪基调
- 暗示即将发生的事件
- 使用环境描写

体裁: {{genre}}
    `
  },
  
  // 3. 武侠动作场面
  {
    id: 'wuxia-action',
    name: '武侠打斗',
    category: 'writing',
    instruction: `
生成一段武侠打斗场面(300字):

人物A: {{character1}}
人物B: {{character2}}
地点: {{location}}
起因: {{conflict}}

要求:
- 描写招式和轻功
- 体现武功风格
- 有来有回
- 符合武侠小说语言
    `
  },
  
  // 4. 心理描写
  {
    id: 'inner-thoughts',
    name: '内心独白',
    category: 'writing',
    instruction: `
为以下情节添加人物内心独白(150字):

情节: {{selected_text}}
人物: {{pov_character}}
情绪: {{emotion}}

要求:
- 展现内心挣扎
- 符合人物性格
- 不要直白说教
- 使用意识流手法
    `
  },
  
  // 5. 修仙突破场景
  {
    id: 'cultivation-breakthrough',
    name: '修炼突破',
    category: 'writing',
    instruction: `
生成修仙突破场景(400字):

角色: {{character}}
当前境界: {{current_level}}
目标境界: {{next_level}}
环境: {{location}}

要求:
- 描写灵气运转
- 境界感悟
- 天地异象
- 符合仙侠小说风格
    `
  },
  
  // 6. 情节漏洞检测
  {
    id: 'plot-hole-detector',
    name: '情节检查',
    category: 'analysis',
    instruction: `
检查以下文本是否存在情节漏洞:

文本: {{selected_text}}
Story Bible: {{synopsis}} {{characters}}

检查项目:
- 人物行为是否前后一致
- 时间线是否合理
- 人物位置变化是否合理
- 是否有逻辑矛盾

输出JSON格式:
{
  "issues": [
    {
      "type": "时间线问题",
      "description": "...",
      "suggestion": "..."
    }
  ]
}
    `
  },
  
  // 7. 宫斗阴谋策划
  {
    id: 'palace-intrigue',
    name: '宫斗策略',
    category: 'brainstorm',
    instruction: `
为以下宫斗情节设计阴谋:

主角: {{protagonist}}
对手: {{antagonist}}
目标: {{goal}}
现有资源: {{resources}}

生成5个阴谋方案，每个包含:
- 计策概述
- 执行步骤
- 风险评估
- 预期效果
    `
  },
  
  // 8. 感官描写增强
  {
    id: 'sensory-details',
    name: '五感描写',
    category: 'editing',
    instruction: `
为以下场景添加五感描写:

原文: {{selected_text}}

要求:
- 视觉、听觉、嗅觉、触觉、味觉
- 不改变情节
- 制造沉浸感
- 每种感官至少一处

提供2个版本。
    `
  },
  
  // 9. 悬念制造
  {
    id: 'suspense-builder',
    name: '悬念营造',
    category: 'editing',
    instruction: `
改写以下段落，增加悬念感:

原文: {{selected_text}}

技巧:
- 延迟信息透露
- 增加不确定性
- 使用暗示
- 制造紧张感

保持原意，但更吸引人。
    `
  },
  
  // 10. 角色关系图谱
  {
    id: 'relationship-mapper',
    name: '关系梳理',
    category: 'analysis',
    instruction: `
分析以下文本中的人物关系:

文本: {{selected_text}}
角色: {{characters}}

输出JSON格式:
{
  "relationships": [
    {
      "from": "角色A",
      "to": "角色B",
      "type": "师徒/情侣/仇敌/...",
      "description": "关系描述",
      "status": "当前状态"
    }
  ]
}
    `
  },
  
  // 11. 章节结尾钩子
  {
    id: 'chapter-hook',
    name: '章节钩子',
    category: 'writing',
    instruction: `
为当前章节生成引人入胜的结尾(100字):

当前情节: {{selected_text}}
下一章预告: {{next_chapter}}

要求:
- 制造悬念
- 引发好奇
- 促使读者继续阅读
- 3个版本
    `
  },
  
  // 12. 快节奏改写
  {
    id: 'pace-up',
    name: '节奏加快',
    category: 'editing',
    instruction: `
将以下文本改写得更紧凑快速:

原文: {{selected_text}}

方法:
- 缩短句子
- 删除冗余描写
- 增加动作
- 制造紧迫感

保留关键信息。
    `
  },
  
  // 13. 慢节奏改写
  {
    id: 'pace-down',
    name: '节奏放慢',
    category: 'editing',
    instruction: `
将以下文本改写得更舒缓细腻:

原文: {{selected_text}}

方法:
- 增加细节描写
- 拉长句子
- 添加心理描写
- 营造氛围

不改变核心情节。
    `
  },
  
  // 14. 命名生成器
  {
    id: 'name-generator',
    name: '角色命名',
    category: 'brainstorm',
    instruction: `
为以下角色生成合适的名字:

角色设定: {{character_description}}
体裁: {{genre}}
性别: {{gender}}

要求:
- 符合体裁风格
- 有寓意或象征
- 朗朗上口
- 生成10个候选

每个名字附上含义解释。
    `
  },
  
  // 15. 冲突升级
  {
    id: 'conflict-escalator',
    name: '冲突激化',
    category: 'brainstorm',
    instruction: `
基于当前冲突，设计升级方案:

当前冲突: {{current_conflict}}
涉及人物: {{characters}}

生成5个冲突升级点:
- 外部压力加剧
- 内部矛盾激化
- 意外事件介入
- 第三方搅局
- 道德困境

每个包含具体情节。
    `
  },
  
  // 16. 文风统一
  {
    id: 'style-unifier',
    name: '风格统一',
    category: 'editing',
    instruction: `
将以下文本改写为与目标风格一致:

原文: {{selected_text}}
目标风格: {{style}}

分析差异并调整:
- 句式结构
- 词汇选择
- 语气语调
- 修辞手法
    `
  },
  
  // 17. 伏笔设置
  {
    id: 'foreshadowing',
    name: '埋伏笔',
    category: 'writing',
    instruction: `
在当前场景中埋下伏笔:

场景: {{selected_text}}
要暗示的内容: {{future_event}}

要求:
- 不动声色
- 自然融入
- 事后恍然大悟
- 提供3种埋法
    `
  },
  
  // 18. 对比改写
  {
    id: 'contrast-rewrite',
    name: '对比版本',
    category: 'editing',
    instruction: `
用三种完全不同的风格改写:

原文: {{selected_text}}

版本A: 简洁版 (海明威风格)
版本B: 华丽版 (古典文学风格)
版本C: 网文版 (通俗易懂)

保持情节一致。
    `
  },
  
  // 19. 标题生成器
  {
    id: 'title-generator',
    name: '章节标题',
    category: 'brainstorm',
    instruction: `
为以下章节内容生成标题:

内容概括: {{chapter_summary}}
体裁: {{genre}}

要求:
- 吸引眼球
- 暗示内容但不剧透
- 符合体裁风格
- 生成10个候选

风格可多样: 对联式、悬念式、诗意式等
    `
  },
  
  // 20. 情绪渲染
  {
    id: 'emotion-amplifier',
    name: '情绪加强',
    category: 'editing',
    instruction: `
强化以下文本的情绪感染力:

原文: {{selected_text}}
目标情绪: {{target_emotion}}

技巧:
- 感官细节
- 环境烘托
- 肢体语言
- 心理描写

让读者感同身受。
    `
  }
];

// 插件执行器
class PluginExecutor {
  constructor(geminiService) {
    this.gemini = geminiService;
  }
  
  async execute(plugin, variables, storyBible) {
    // 1. 替换变量
    let prompt = plugin.instruction;
    for (const [key, value] of Object.entries(variables)) {
      prompt = prompt.replace(`{{${key}}}`, value);
    }
    
    // 2. 添加Story Bible上下文
    if (plugin.enableStoryBible) {
      prompt = `
【Story Bible】
体裁: ${storyBible.genre}
风格: ${storyBible.style.text}
概要: ${storyBible.synopsis}

${prompt}
`;
    }
    
    // 3. 执行生成
    const result = await this.gemini.generate(prompt, {
      temperature: plugin.temperature || 0.8,
      maxTokens: plugin.maxTokens || 2048
    });
    
    return result;
  }
}
```

---

## 🎨 完整UI设计方案

### **主界面完整布局**

```
┌────────────────────────────────────────────────────────────────┐
│ [墨语] 项目: 《修仙传》        [保存] [导出] [设置] [👤用户]     │
├───────┬────────────────────────────────────────┬───────────────┤
│ 项目  │                编辑区域                │ Story Bible   │
│ 导航  │                                        │               │
│       │                                        │ [📚概要]      │
│ 📁项目│  第三章 突破                            │ 体裁: 仙侠    │
│  ├─文│                                        │ 风格: 古典    │
│  │档1│  灵气在经脉中运转三十六周天，丹田      │ ──────────   │
│  │   │  处金丹微微震颤。[光标]                │ [👤角色]      │
│  ├─文│                                        │ ├ 林天        │
│  │档2│                                        │ ├ 苏婉儿      │
│  │   │  ┌───────────────────────┐           │ └ 云长老      │
│  └─文│  │ 💡 AI建议                │           │               │
│   档3│  │ ○ 描写突破时的天地异象    │           │ [🌍世界观]    │
│ ──── │  │ ○ 加入回忆杀，交代前因   │           │ ├ 天云宗      │
│ 📁系列│  │ ○ 增加情绪描写           │           │ ├ 青云峰      │
│ 1    │  └───────────────────────┘           │ └ 灵石        │
│ ──── │                                        │               │
│ + 新建│                                        │ [📝大纲]      │
│      │                                        │ 第一章 ✓      │
│      │                                        │ 第二章 ✓      │
│      │                                        │ 第三章 ← 当前 │
│      │                                        │ 第四章        │
│      │                                        │               │
│      │                                        │ [🎬场景]      │
│      │                                        │ 场景1: 修炼   │
│      │                                        │ 场景2: 突破   │
├───────┴────────────────────────────────────────┴───────────────┤
│ [✨续写▼] [🔄改写] [👁️描写] [📏扩展] [💡头脑风暴] [🔌插件▼] │3,247字│
│  Auto  Guided Tone                                             │
└────────────────────────────────────────────────────────────────┘
```

### **插件界面设计**

```
┌─ 插件工具箱 ──────────────────────────┐
│                                        │
│ [搜索插件...]               [+ 自定义] │
│                                        │
│ 📝 写作类                              │
│  ├─ 武侠打斗                    ⭐⭐⭐  │
│  ├─ 修炼突破                    ⭐⭐⭐  │
│  ├─ 场景铺垫                    ⭐⭐   │
│  └─ 对话生成                    ⭐⭐   │
│                                        │
│ ✏️ 编辑类                              │
│  ├─ 对话润色                    ⭐⭐⭐  │
│  ├─ 五感描写                    ⭐⭐   │
│  ├─ 节奏调整                    ⭐⭐   │
│  └─ 风格统一                    ⭐     │
│                                        │
│ 🔍 分析类                              │
│  ├─ 情节检查                    ⭐⭐   │
│  ├─ 关系梳理                    ⭐     │
│  └─ 一致性检测                  ⭐     │
│                                        │
│ 💭 创意类                              │
│  ├─ 冲突升级                    ⭐⭐   │
│  ├─ 角色命名                    ⭐⭐⭐  │
│  ├─ 标题生成                    ⭐⭐   │
│  └─ 伏笔设计                    ⭐     │
│                                        │
└────────────────────────────────────────┘

点击插件后:
┌─ 武侠打斗生成器 ──────────────────────┐
│                                        │
│ 人物A: [林天]                          │
│ 人物B: [黑衣人]                        │
│ 地点: [青云峰悬崖]                     │
│ 起因: [争夺灵药]                       │
│                                        │
│ 高级选项 ▼                             │
│  □ 使用Story Bible                    │
│  □ 包含内心独白                        │
│  长度: [●─────────] 300字             │
│                                        │
│        [取消]      [生成 ✨]           │
└────────────────────────────────────────┘
```

---

## 📊 完整数据存储方案

### **存储架构**

```javascript
// 使用window.storage API (Claude Artifacts持久化)

const StorageService = {
  // === 项目管理 ===
  
  async listProjects() {
    try {
      const result = await window.storage.get('projects-index');
      return result ? JSON.parse(result.value) : [];
    } catch {
      return [];
    }
  },
  
  async createProject(project) {
    // 1. 保存项目数据
    await window.storage.set(
      `project:${project.id}`,
      JSON.stringify(project)
    );
    
    // 2. 更新索引
    const projects = await this.listProjects();
    projects.push({ id: project.id, title: project.title, createdAt: Date.now() });
    await window.storage.set('projects-index', JSON.stringify(projects));
    
    return project;
  },
  
  async getProject(projectId) {
    const result = await window.storage.get(`project:${projectId}`);
    return result ? JSON.parse(result.value) : null;
  },
  
  async updateProject(projectId, updates) {
    const project = await this.getProject(projectId);
    const updated = { ...project, ...updates, updatedAt: Date.now() };
    await window.storage.set(`project:${projectId}`, JSON.stringify(updated));
    return updated;
  },
  
  async deleteProject(projectId) {
    // 删除项目及所有相关数据
    await window.storage.delete(`project:${projectId}`);
    await window.storage.delete(`story-bible:${projectId}`);
    
    // 删除所有文档
    const documents = await this.listDocuments(projectId);
    for (const doc of documents) {
      await window.storage.delete(`document:${doc.id}`);
    }
    
    // 更新索引
    const projects = await this.listProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    await window.storage.set('projects-index', JSON.stringify(filtered));
  },
  
  // === Story Bible ===
  
  async getStoryBible(projectId) {
    try {
      const result = await window.storage.get(`story-bible:${projectId}`);
      return result ? JSON.parse(result.value) : this.createEmptyStoryBible();
    } catch {
      return this.createEmptyStoryBible();
    }
  },
  
  async updateStoryBible(projectId, storyBible) {
    await window.storage.set(
      `story-bible:${projectId}`,
      JSON.stringify(storyBible)
    );
  },
  
  createEmptyStoryBible() {
    return {
      braindump: '',
      genre: '',
      style: { text: '', file: null },
      synopsis: '',
      characters: [],
      worldbuilding: [],
      outline: [],
      scenes: []
    };
  },
  
  // === 文档 ===
  
  async listDocuments(projectId) {
    const keys = await window.storage.list(`document:${projectId}:`);
    const documents = [];
    
    if (keys) {
      for (const key of keys.keys) {
        const result = await window.storage.get(key);
        if (result) {
          documents.push(JSON.parse(result.value));
        }
      }
    }
    
    return documents;
  },
  
  async getDocument(documentId) {
    const result = await window.storage.get(`document:${documentId}`);
    return result ? JSON.parse(result.value) : null;
  },
  
  async saveDocument(document) {
    await window.storage.set(
      `document:${document.id}`,
      JSON.stringify({
        ...document,
        updatedAt: Date.now()
      })
    );
  },
  
  // === History (AI生成历史) ===
  
  async getHistory(projectId) {
    try {
      const result = await window.storage.get(`history:${projectId}`);
      return result ? JSON.parse(result.value) : [];
    } catch {
      return [];
    }
  },
  
  async addToHistory(projectId, entry) {
    const history = await this.getHistory(projectId);
    history.unshift({
      id: Date.now(),
      timestamp: Date.now(),
      ...entry
    });
    
    // 只保留最近100条
    const trimmed = history.slice(0, 100);
    
    await window.storage.set(
      `history:${projectId}`,
      JSON.stringify(trimmed)
    );
  },
  
  // === 设置 ===
  
  async getSettings() {
    try {
      const result = await window.storage.get('app-settings');
      return result ? JSON.parse(result.value) : this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  },
  
  async updateSettings(settings) {
    await window.storage.set('app-settings', JSON.stringify(settings));
  },
  
  getDefaultSettings() {
    return {
      apiKey: '',
      defaultModel: 'gemini-1.5-pro',
      theme: 'light',
      fontSize: 16,
      autoSave: true,
      autoSaveInterval: 30000  // 30秒
    };
  },
  
  // === 导出/导入 ===
  
  async exportProject(projectId) {
    const project = await this.getProject(projectId);
    const storyBible = await this.getStoryBible(projectId);
    const documents = await this.listDocuments(projectId);
    
    return {
      version: '1.0',
      exportedAt: Date.now(),
      project,
      storyBible,
      documents
    };
  },
  
  async importProject(data) {
    const projectId = `project_${Date.now()}`;
    
    await this.createProject({
      ...data.project,
      id: projectId
    });
    
    await this.updateStoryBible(projectId, data.storyBible);
    
    for (const doc of data.documents) {
      await this.saveDocument({
        ...doc,
        id: `${projectId}:${doc.id}`
      });
    }
    
    return projectId;
  }
};
```

---

## 🚀 立即开始实现

### **Step 1: 在Lovable AI创建项目**

```bash
# 项目结构
moyu-writer/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── WritingEditor.jsx
│   │   │   ├── EditorToolbar.jsx
│   │   │   └── FloatingToolbar.jsx
│   │   ├── StoryBible/
│   │   │   ├── StoryBiblePanel.jsx
│   │   │   ├── BraindumpSection.jsx
│   │   │   ├── SynopsisSection.jsx
│   │   │   ├── CharactersSection.jsx
│   │   │   └── OutlineSection.jsx
│   │   ├── Plugins/
│   │   │   ├── PluginBrowser.jsx
│   │   │   └── PluginExecutor.jsx
│   │   └── ui/  (shadcn组件)
│   ├── contexts/
│   │   ├── ProjectContext.jsx
│   │   ├── StoryBibleContext.jsx
│   │   └── EditorContext.jsx
│   ├── services/
│   │   ├── gemini.js
│   │   ├── storage.js
│   │   └── contextManager.js
│   ├── prompts/
│   │   └── templates.js
│   ├── data/
│   │   ├── plugins.js
│   │   └── chineseExamples.js
│   └── App.jsx
├── package.json
└── README.md
```

### **Step 2: 核心代码实现**

我可以为你生成:
1. ✅ 完整的React项目框架
2. ✅ 所有组件代码
3. ✅ Gemini API集成
4. ✅ Storage服务
5. ✅ 20个预设插件
6. ✅ 所有Prompt模板

### **Step 3: 部署**

- Lovable AI自动部署
- 或导出代码部署到Vercel/Netlify

---

## 🎯 最终答案

### **✅ 能否100%复刻Sudowrite?**

**答案: 能复刻95%的功能！**

**完全可以复刻(100%):**
- ✅ Story Bible完整系统
- ✅ 所有基础写作工具
- ✅ 大部分高级功能
- ✅ 项目管理
- ✅ History系统
- ✅ 导入/导出
- ✅ 多模型支持

**可以部分复刻(80-90%):**
- 🔄 Canvas (使用React Flow)
- 🔄 My Voice (Few-shot学习)
- 🔄 Plugins (预设+简化自定义)
- 🔄 Saliency Engine (简化版上下文管理)

**无法复刻(专有技术):**
- ❌ Muse模型 (但Gemini Pro质量接近)
- ❌ 完整的用户创建插件生态 (需大量用户)

**我们的优势:**
- ✅ **中文优化**