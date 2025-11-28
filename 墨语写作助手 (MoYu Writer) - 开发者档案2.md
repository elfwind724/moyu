# 墨语写作助手 (MoYu Writer) - 开发者档案2
Sprint 4: 编辑器和写作工具 (Week 4)
Sprint 4 目标
实现Lexical富文本编辑器和核心写作工具(Write/Rewrite/Describe)

Task 4.1: Lexical编辑器集成 ✅
优先级: P0
预计时间: 4小时
文件: src/components/editor/WritingEditor.tsx
typescript/**
 * Lexical富文本编辑器
 * 
 * 功能:
 * - 基础文本编辑
 * - AI生成文本高亮(紫色)
 * - 自动保存
 * - 字数统计
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useEditor } from '@/contexts/EditorContext';

const theme = {
  paragraph: 'mb-2 leading-7',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  // AI生成文本样式
  aiGenerated: 'text-purple-600 bg-purple-50'
};

export function WritingEditor({ documentId }: { documentId: string }) {
  const { saveDocument } = useProject();
  const { currentDocument, setCurrentDocument } = useEditor();
  const [wordCount, setWordCount] = useState(0);

  const initialConfig = {
    namespace: 'WritingEditor',
    theme,
    onError: (error: Error) => {
      console.error('编辑器错误:', error);
    },
  };

  // 内容变化处理
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      
      // 更新字数
      setWordCount(textContent.length);
      
      // 自动保存
      if (documentId) {
        saveDocument(documentId, textContent);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="flex-1 flex flex-col">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="flex-1 outline-none p-8 prose prose-lg max-w-4xl mx-auto w-full"
                style={{ minHeight: '100%' }}
              />
            }
            placeholder={
              <div className="absolute top-8 left-8 text-gray-400 pointer-events-none">
                开始写作，或使用下方的AI工具...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          {/* 插件 */}
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <AutoSavePlugin documentId={documentId} />
          
          {/* 底部状态栏 */}
          <div className="border-t px-4 py-2 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>文档: {currentDocument?.title || '未命名'}</span>
            <span>{wordCount} 字</span>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}

/**
 * 自动保存插件
 */
function AutoSavePlugin({ documentId }: { documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const { saveDocument } = useProject();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          const root = $getRoot();
          const content = root.getTextContent();
          saveDocument(documentId, content);
        });
      }, 2000); // 2秒后自动保存
    });

    return () => {
      unregister();
      clearTimeout(timeoutId);
    };
  }, [editor, documentId, saveDocument]);

  return null;
}
验收标准:

 编辑器正常显示和输入
 自动保存功能正常(2秒延迟)
 字数统计实时更新
 撤销/重做功能正常

完成后反馈:
✅ Task 4.1 完成
- Lexical编辑器集成成功
- 基础文本编辑功能正常
- 自动保存功能已实现(2秒延迟)
- 字数统计实时显示
- 撤销/重做测试通过
- 截图: [附上编辑器界面]

Task 4.2: 编辑器工具栏 ✅
优先级: P0
预计时间: 3小时
文件: src/components/editor/EditorToolbar.tsx
typescript/**
 * 编辑器工具栏
 * 
 * 包含所有核心AI工具按钮:
 * - Write (Auto/Guided/Tone)
 * - Rewrite
 * - Describe
 * - Expand
 * - Brainstorm
 * - More Tools
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PenLine,
  RotateCw,
  Eye,
  Maximize,
  Lightbulb,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Smile,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { toast } from 'sonner';

export function EditorToolbar() {
  const [activeToolMenu, setActiveToolMenu] = useState<string | null>(null);
  const { generateWrite, loading } = useAIGeneration();

  // Write工具的三种模式
  const handleWrite = async (mode: 'auto' | 'guided' | 'tone') => {
    try {
      await generateWrite(mode);
      toast.success('生成成功！');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-b p-2 bg-white flex items-center gap-2">
      {/* Write按钮组 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm"
            disabled={loading}
          >
            <PenLine className="w-4 h-4 mr-2" />
            续写
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleWrite('auto')}>
            <Sparkles className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Auto - 自动续写</div>
              <div className="text-xs text-gray-500">AI自动决定情节发展</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleWrite('guided')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Guided - 引导续写</div>
              <div className="text-xs text-gray-500">你指定方向,AI执行</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleWrite('tone')}>
            <Smile className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Tone Shift - 语气转换</div>
              <div className="text-xs text-gray-500">改变叙述语气</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rewrite */}
      <Button variant="outline" size="sm" disabled={loading}>
        <RotateCw className="w-4 h-4 mr-2" />
        改写
      </Button>

      {/* Describe */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Eye className="w-4 h-4 mr-2" />
        描写
      </Button>

      {/* Expand */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Maximize className="w-4 h-4 mr-2" />
        扩展
      </Button>

      {/* Brainstorm */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Lightbulb className="w-4 h-4 mr-2" />
        头脑风暴
      </Button>

      {/* More Tools */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-2" />
            更多工具
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>压缩 (Shrink Ray)</DropdownMenuItem>
          <DropdownMenuItem>情节转折 (Twist)</DropdownMenuItem>
          <DropdownMenuItem>插件...</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 右侧状态 */}
      {loading && (
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin">⏳</div>
          <span>生成中...</span>
        </div>
      )}
    </div>
  );
}
验收标准:

 所有按钮正确显示
 Write下拉菜单正常
 Loading状态正确显示
 按钮点击事件绑定

完成后反馈:
✅ Task 4.2 完成
- 工具栏UI创建完成
- 所有核心工具按钮已添加
- Write三种模式的下拉菜单正常
- Loading状态正确显示
- 图标和文字清晰易懂
- 截图: [附上工具栏截图]

Task 4.3: AI生成Hook ✅
优先级: P0
预计时间: 3小时
文件: src/hooks/useAIGeneration.ts
typescript/**
 * AI生成Hook
 * 
 * 统一管理所有AI生成功能:
 * - Write系列
 * - Rewrite
 * - Describe
 * - Expand
 * - Brainstorm
 */

import { useState } from 'react';
import { GeminiService } from '@/services/gemini';
import { useStoryBible } from '@/contexts/StoryBibleContext';
import { useEditor } from '@/contexts/EditorContext';
import { StorageService } from '@/services/storage';
import { useProject } from '@/contexts/ProjectContext';

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { storyBible } = useStoryBible();
  const { getSelectedText, getPreviousText, insertText } = useEditor();
  const { currentProject } = useProject();

  /**
   * Write - Auto模式
   */
  async function generateWrite(mode: 'auto' | 'guided' | 'tone') {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    setLoading(true);
    try {
      const previousText = getPreviousText(1000); // 获取前1000字
      let result: string;

      if (mode === 'auto') {
        result = await GeminiService.writeAuto(previousText, storyBible);
      } else if (mode === 'guided') {
        // TODO: 弹出对话框让用户输入指示
        const guidance = prompt('请输入续写方向:');
        if (!guidance) return;
        result = await GeminiService.writeGuided(previousText, guidance, storyBible);
      } else {
        // TODO: 弹出对话框让用户选择语气
        const tone = prompt('请输入语气(紧张/轻松/浪漫/神秘):');
        if (!tone) return;
        result = await GeminiService.writeToneShift(previousText, tone, storyBible);
      }

      setSuggestions([result]);
      
      // 保存到历史记录
      await StorageService.addToHistory(currentProject.id, {
        type: 'write',
        input: previousText,
        output: result,
        selected: false,
        starred: false
      });

      return result;
    } catch (error) {
      console.error('生成失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Rewrite - 改写
   */
  async function generateRewrite(instruction: string) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要改写的文本');
    }

    setLoading(true);
    try {
      const results = await GeminiService.rewrite(
        selectedText,
        instruction,
        storyBible
      );

      setSuggestions(results);

      await StorageService.addToHistory(currentProject.id, {
        type: 'rewrite',
        input: selectedText,
        output: results.join('\n---\n'),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Describe - 描写增强
   */
  async function generateDescribe(context?: string) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要增强的文本');
    }

    setLoading(true);
    try {
      const results = await GeminiService.describe(
        selectedText,
        context,
        storyBible
      );

      setSuggestions(results);

      await StorageService.addToHistory(currentProject.id, {
        type: 'describe',
        input: selectedText,
        output: results.join('\n---\n'),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Expand - 扩展
   */
  async function generateExpand() {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要扩展的文本');
    }

    setLoading(true);
    try {
      const result = await GeminiService.expand(selectedText, storyBible);

      setSuggestions([result]);

      await StorageService.addToHistory(currentProject.id, {
        type: 'expand',
        input: selectedText,
        output: result,
        selected: false,
        starred: false
      });

      return result;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Brainstorm - 头脑风暴
   */
  async function generateBrainstorm(
    topic: string,
    category: string,
    context?: string
  ) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    setLoading(true);
    try {
      const results = await GeminiService.brainstorm(
        topic,
        category,
        context,
        storyBible
      );

      await StorageService.addToHistory(currentProject.id, {
        type: 'brainstorm',
        input: `${category}: ${topic}`,
        output: JSON.stringify(results),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * 插入建议到编辑器
   */
  function insertSuggestion(text: string) {
    insertText(text);
    setSuggestions([]);
  }

  /**
   * 清除建议
   */
  function clearSuggestions() {
    setSuggestions([]);
  }

  return {
    loading,
    suggestions,
    generateWrite,
    generateRewrite,
    generateDescribe,
    generateExpand,
    generateBrainstorm,
    insertSuggestion,
    clearSuggestions
  };
}
验收标准:

 所有生成函数正常工作
 错误处理完整
 Loading状态管理正确
 History记录正常保存

完成后反馈:
✅ Task 4.3 完成
- useAIGeneration Hook创建完成
- 实现了5个核心生成函数
- 完整的错误处理和Loading管理
- History自动记录功能正常
- 已在工具栏中成功集成
- 测试: AI生成功能正常工作

Task 4.4: 建议卡片组件 ✅
优先级: P1
预计时间: 2小时
文件: src/components/editor/SuggestionCards.tsx
typescript/**
 * AI生成建议卡片
 * 
 * 显示在编辑器右侧的History面板中
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Star } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';

export function SuggestionCards() {
  const { suggestions, insertSuggestion, clearSuggestions } = useAIGeneration();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">AI建议</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSuggestions}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {suggestions.map((suggestion, index) => (
        <Card key={index} className="p-4 space-y-3">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {suggestion}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => insertSuggestion(suggestion)}
            >
              <Check className="w-4 h-4 mr-1" />
              插入
            </Button>
            <Button variant="outline" size="sm">
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
验收标准:

 建议卡片正确显示
 插入按钮功能正常
 收藏按钮UI正常
 清除按钮正常工作


Sprint 4 完成标准

 Lexical编辑器正常工作
 所有工具栏按钮功能完整
 Write/Rewrite/Describe功能可用
 AI生成的内容能正确插入
 History记录正常保存

Sprint 4 完成总结格式:
🎉 Sprint 4 完成！

已实现功能:
✅ Lexical富文本编辑器
✅ 完整的工具栏UI
✅ Write (Auto/Guided/Tone)
✅ Rewrite功能
✅ Describe功能
✅ Expand功能
✅ AI生成Hook
✅ 建议卡片显示
✅ History自动记录

技术亮点:
- Lexical插件系统运用
- 自动保存(2秒延迟)
- 统一的AI生成管理
- 完整的错误处理

下一步: Sprint 5 - 插件系统和高级功能

演示视频: [录屏展示Write功能]

📋 Sprint 5: 插件系统 (Week 5)
Sprint 5 目标
实现插件系统,包括20个预设插件和插件执行器

Task 5.1: 插件数据结构 ✅
优先级: P0
预计时间: 2小时
文件: src/lib/plugins/builtInPlugins.ts
typescript/**
 * 内置插件库
 * 
 * 包含20个预设插件:
 * - 写作类 (6个)
 * - 编辑类 (6个)
 * - 分析类 (4个)
 * - 创意类 (4个)
 */

import type { Plugin } from '@/lib/types';

export const BUILT_IN_PLUGINS: Plugin[] = [
  // ========== 写作类 ==========
  {
    id: 'dialogue-enhancer',
    name: '对话润色',
    description: '让对话更生动自然,增加语气词和肢体语言',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
请润色以下对话,使其更加生动:
- 添加语气词、停顿
- 增加肢体语言和表情描写
- 符合人物性格
- 避免"说"字重复

原对话:
{{selected_text}}

角色信息: {{characters}}

提供3个版本。
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'multiple',
    temperature: 0.8,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'wuxia-action',
    name: '武侠打斗',
    description: '生成精彩的武侠动作场面',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters', 'worldbuilding'],
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'inner-thoughts',
    name: '内心独白',
    description: '添加人物内心活动描写',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    temperature: 0.85,
    maxTokens: 800,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'cultivation-breakthrough',
    name: '修炼突破',
    description: '生成修仙突破场景',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters', 'worldbuilding'],
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'scene-setter',
    name: '场景铺垫',
    description: '为场景生成开场描写',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为以下场景生成开场描写(200字):
{{scene_description}}

要求:
- 渲染氛围
- 建立情绪基调
- 暗示即将发生的事件
- 使用环境描写

体裁: {{genre}}
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    temperature: 0.8,
    maxTokens: 1000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'chapter-hook',
    name: '章节钩子',
    description: '生成引人入胜的章节结尾',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为当前章节生成引人入胜的结尾(100字):

当前情节: {{selected_text}}
下一章预告: {{next_chapter}}

要求:
- 制造悬念
- 引发好奇
- 促使读者继续阅读
- 3个版本
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.85,
    maxTokens: 600,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 编辑类 ==========
  {
    id: 'sensory-details',
    name: '五感描写',
    description: '添加视听嗅触味五感细节',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为以下场景添加五感描写:

原文: {{selected_text}}

要求:
- 视觉、听觉、嗅觉、触觉、味觉
- 不改变情节
- 制造沉浸感
- 每种感官至少一处

提供2个版本。
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.8,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pace-up',
    name: '节奏加快',
    description: '将文本改写得更紧凑快速',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写得更紧凑快速:

原文: {{selected_text}}

方法:
- 缩短句子
- 删除冗余描写
- 增加动作
- 制造紧迫感

保留关键信息。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.7,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pace-down',
    name: '节奏放慢',
    description: '将文本改写得更舒缓细腻',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写得更舒缓细腻:

原文: {{selected_text}}

方法:
- 增加细节描写
- 拉长句子
- 添加心理描写
- 营造氛围

不改变核心情节。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.8,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'suspense-builder',
    name: '悬念营造',
    description: '增加文本的悬念感',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
改写以下段落，增加悬念感:

原文: {{selected_text}}

技巧:
- 延迟信息透露
- 增加不确定性
- 使用暗示
- 制造紧张感

保持原意，但更吸引人。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.85,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'style-unifier',
    name: '风格统一',
    description: '统一文本风格',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写为与目标风格一致:

原文: {{selected_text}}
目标风格: {{style}}

分析差异并调整:
- 句式结构
- 词汇选择
- 语气语调
- 修辞手法
`,
    enableStoryBible: true,
    storyBibleFields: ['style'],
    outputType: 'single',
    temperature: 0.75,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'emotion-amplifier',
    name: '情绪加强',
    description: '强化文本的情绪感染力',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 分析类 ==========
  {
    id: 'plot-hole-detector',
    name: '情节检查',
    description: '检测情节漏洞和不一致',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['synopsis', 'characters'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.3,
    maxTokens: 2048,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'relationship-mapper',
    name: '关系梳理',
    description: '分析并可视化人物关系',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.3,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'cliche-detector',
    name: '陈词滥调检测',
    description: '找出并替换陈词滥调',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
    instruction: `
检测以下文本中的陈词滥调并提供替换建议:

文本: {{selected_text}}

重点检测:
- "突然"、"原来"、"竟然"
- "不由得"、"心中一凛"
- 其他老套表达

输出JSON:
[
  {
    "cliche": "检测到的陈词滥调",
    "context": "上下文",
    "alternatives": ["替换建议1", "替换建议2"]
  }
]
`,
    enableStoryBible: false,
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.3,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pacing-analyzer',
    name: '节奏分析',
    description: '分析文本节奏并给出建议',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
    instruction: `
分析以下文本的叙事节奏:

文本: {{selected_text}}

分析维度:
- 句子长度变化
- 动作vs描写比例
- 对话密度
- 信息量分布
- 紧张度曲线

给出节奏评分和改进建议。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.3,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 创意类 ==========
  {
    id: 'name-generator',
    name: '角色命名',
    description: '生成符合设定的角色名字',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.9,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'conflict-escalator',
    name: '冲突升级',
    description: '设计冲突升级方案',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.85,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'foreshadowing',
    name: '伏笔设置',
    description: '在场景中埋下伏笔',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
    instruction: `
在当前场景中埋下伏笔:

场景: {{selected_text}}
要暗示的内容: {{future_event}}

要求:
- 不动声色
- 自然融入
- 事后恍然大悟
- 提供3种埋法
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.85,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'title-generator',
    name: '章节标题',
    description: '生成吸引眼球的章节标题',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.9,
    maxTokens: 1000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];

/**
 * 按分类获取插件
 */
export function getPluginsByCategory(category: Plugin['category']) {
  return BUILT_IN_PLUGINS.filter(p => p.category === category);
}

/**
 * 搜索插件
 */
export function searchPlugins(query: string) {
  const lowerQuery = query.toLowerCase();
  return BUILT_IN_PLUGINS.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}
```

**验收标准**:
- [ ] 20个插件定义完整
- [ ] 每个插件都有清晰的instruction
- [ ] 分类正确
- [ ] 工具函数正常工作

**完成后反馈**:
```
✅ Task 5.1 完成
- 20个内置插件定义完成
- 分为4大类: 写作/编辑/分析/创意
- 每个插件都有完整的配置
- 已实现分类和搜索函数
- 插件数据结构符合类型定义
```

---

#### Task 5.2: 插件执行器 ✅
**优先级**: P0
**预计时间**: 3小时

**文件**: `src/components/plugins/PluginExecutor.tsx`

```typescript
/**
 * 插件执行器
 * 
 * 功能:
 * 1. 解析插件变量
 * 2. 弹出输入对话框
 * 3. 调用Gemini API
 * 4. 显示结果
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { GeminiService } from '@/services/gemini';
import { useStoryBible } from '@/contexts/StoryBibleContext';
import { useEditor } from '@/contexts/EditorContext';
import type { Plugin } from '@/lib/types';
import { toast } from 'sonner';

interface PluginExecutorProps {
  plugin: Plugin;
  open: boolean;
  onClose: () => void;
  onSuccess: (result: string) => void;
}

export function PluginExecutor({ plugin, open, onClose, onSuccess }: PluginExecutorProps) {
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const { storyBible } = useStoryBible();
  const { getSelectedText } = useEditor();

  // 解析插件中的变量
  const extractedVariables = extractVariables(plugin.instruction);

  const handleExecute = async () => {
    setLoading(true);
    try {
      // 构建完整的Prompt
      let prompt = plugin.instruction;

      // 替换用户输入的变量
      for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(`{{${key}}}`, value);
      }

      // 替换内置变量
      const selectedText = getSelectedText();
      prompt = prompt.replace('{{selected_text}}', selectedText || '');

      // 添加Story Bible上下文
      if (plugin.enableStoryBible && plugin.storyBibleFields) {
        const context = buildStoryBibleContext(storyBible, plugin.storyBibleFields);
        prompt = context + '\n' + prompt;
      }

      // 调用AI
      const result = await GeminiService.generate(prompt, {
        temperature: plugin.temperature,
        maxTokens: plugin.maxTokens
      });

      onSuccess(result);
      toast.success('插件执行成功！');
      onClose();
    } catch (error: any) {
      toast.error(error.message || '插件执行失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plugin.name}</DialogTitle>
          <p className="text-sm text-gray-600">{plugin.description}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 动态渲染变量输入框 */}
          {extractedVariables.map(variable => (
            <div key={variable}>
              <Label htmlFor={variable}>{formatVariableName(variable)}</Label>
              <Input
                id={variable}
                value={variables[variable] || ''}
                onChange={(e) =>
                  setVariables(prev => ({ ...prev, [variable]: e.target.value }))
                }
                placeholder={`请输入${formatVariableName(variable)}`}
              />
            </div>
          ))}

          {/* 显示会使用的Story Bible字段 */}
          {plugin.enableStoryBible && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              📚 此插件会使用Story Bible中的:{' '}
              {plugin.storyBibleFields?.join('、')}
            </div>
          )}

          {/* 显示选中的文本 */}
          {plugin.instruction.includes('{{selected_text}}') && (
            <div className="p-3 bg-gray-50 border rounded">
              <div className="text-sm font-medium mb-2">选中的文本:</div>
              <div className="text-sm text-gray-600 line-clamp-3">
                {getSelectedText() || '(未选中任何文本)'}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleExecute} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                执行中...
              </>
            ) : (
              '执行插件'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 从instruction中提取变量
 */
function extractVariables(instruction: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = instruction.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    const variable = match[1];
    // 排除内置变量
    if (!['selected_text', 'characters', 'genre', 'style', 'synopsis', 'worldbuilding'].includes(variable)) {
      variables.add(variable);
    }
  }

  return Array.from(variables);
}

/**
 * 格式化变量名称
 */
function formatVariableName(variable: string): string {
  const map: Record<string, string> = {
    character1: '人物A',
    character2: '人物B',
    location: '地点',
    conflict: '冲突起因',
    pov_character: '视角人物',
    emotion: '情绪',
    current_level: '当前境界',
    next_level: '目标境界',
    scene_description: '场景描述',
    next_chapter: '下一章预告',
    target_emotion: '目标情绪',
    character_description: '角色描述',
    gender: '性别',
    current_conflict: '当前冲突',
    future_event: '要暗示的事件',
    chapter_summary: '章节概括'
  };

  return map[variable] || variable;
}

/**
 * 构建Story Bible上下文
 */
function buildStoryBibleContext(
  storyBible: any,
  fields: string[]
): string {
  let context = '【Story Bible】\n';

  for (const field of fields) {
    if (field === 'genre' && storyBible.genre) {
      context += `体裁: ${storyBible.genre}\n`;
    } else if (field === 'style' && storyBible.style?.text) {
      context += `风格: ${storyBible.style.text}\n`;
    } else if (field === 'synopsis' && storyBible.synopsis) {
      context += `概要: ${storyBible.synopsis}\n`;
    } else if (field === 'characters' && storyBible.characters?.length) {
      context += `角色: ${storyBible.characters.map((c: any) => c.name).join('、')}\n`;
    } else if (field === 'worldbuilding' && storyBible.worldbuilding?.length) {
      context += `世界观: ${storyBible.worldbuilding.map((w: any) => w.name).join('、')}\n`;
    }
  }

  return context;
}
```

**验收标准**:
- [ ] 对话框正确显示
- [ ] 变量输入框动态生成
- [ ] Story Bible上下文正确添加
- [ ] 插件执行成功
- [ ] 错误处理完善

**完成后反馈**:
```
✅ Task 5.2 完成
- 插件执行器创建完成
- 动态变量解析正常
- 输入对话框UI友好
- Story Bible集成正确
- 插件测试: 执行成功,结果正确
- 截图: [附上插件执行界面]
```

---

#### Task 5.3: 插件浏览器 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/plugins/PluginBrowser.tsx`

```typescript
/**
 * 插件浏览器
 * 
 * 显示所有可用插件,支持搜索和分类筛选
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, TrendingUp } from 'lucide-react';
import { BUILT_IN_PLUGINS, searchPlugins, getPluginsByCategory } from '@/lib/plugins/builtInPlugins';
import { PluginExecutor } from './PluginExecutor';
import type { Plugin } from '@/lib/types';

interface PluginBrowserProps {
  open: boolean;
  onClose: () => void;
}

export function PluginBrowser({ open, onClose }: PluginBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [executorOpen, setExecutorOpen] = useState(false);

  const displayPlugins = searchQuery
    ? searchPlugins(searchQuery)
    : BUILT_IN_PLUGINS;

  const handlePluginSelect = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setExecutorOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>插件工具箱</DialogTitle>
          </DialogHeader>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索插件..."
              className="pl-10"
            />
          </div>

          {/* 分类标签 */}
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="writing">写作</TabsTrigger>
              <TabsTrigger value="editing">编辑</TabsTrigger>
              <TabsTrigger value="analysis">分析</TabsTrigger>
              <TabsTrigger value="brainstorm">创意</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 max-h-96 overflow-y-auto">
              {displayPlugins.map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="writing" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('writing').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="editing" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('editing').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('analysis').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="brainstorm" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('brainstorm').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 插件执行器 */}
      {selectedPlugin && (
        <PluginExecutor
          plugin={selectedPlugin}
          open={executorOpen}
          onClose={() => setExecutorOpen(false)}
          onSuccess={(result) => {
            // 处理结果
            console.log('插件执行结果:', result);
          }}
        />
      )}
    </>
  );
}

/**
 * 插件卡片
 */
function PluginCard({ plugin, onClick }: { plugin: Plugin; onClick: () => void }) {
  return (
    <div
      className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{plugin.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{plugin.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {plugin.enableStoryBible && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              📚 Story Bible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

**验收标准**:
- [ ] 插件列表正确显示
- [ ] 搜索功能正常
- [ ] 分类切换正常
- [ ] 点击插件打开执行器
- [ ] UI美观易用

---

### Sprint 5 完成标准
- [ ] 20个内置插件定义完成
- [ ] 插件执行器正常工作
- [ ] 插件浏览器UI完善
- [ ] 插件可以正确调用AI
- [ ] Story Bible集成正确

**Sprint 5 完成总结**:
```
🎉 Sprint 5 完成！

已实现功能:
✅ 20个内置插件
  - 写作类: 6个
  - 编辑类: 6个
  - 分析类: 4个
  - 创意类: 4个
✅ 插件执行器
✅ 插件浏览器
✅ 动态变量解析
✅ Story Bible集成

插件亮点:
- 武侠打斗生成器
- 修炼突破场景
- 情节漏洞检测
- 陈词滥调检测

下一步: Sprint 6 - 优化与完善

插件演示: [录屏展示3-5个插件]
```

---

## 📋 Sprint 6: 优化与完善 (Week 6)

### Sprint 6 目标
完善剩余功能,优化用户体验,准备发布

---

#### Task 6.1: History面板 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/history/HistoryPanel.tsx`

```typescript
/**
 * 历史记录面板
 * 
 * 显示所有AI生成的历史记录
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Check, Trash2 } from 'lucide-react';
import { StorageService } from '@/services/storage';
import { useProject } from '@/contexts/ProjectContext';
import type { HistoryEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function HistoryPanel() {
  const { currentProject } = useProject();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred'>('all');

  useEffect(() => {
    if (currentProject) {
      loadHistory();
    }
  }, [currentProject]);

  async function loadHistory() {
    if (!currentProject) return;
    const entries = await StorageService.getHistory(currentProject.id);
    setHistory(entries);
  }

  const displayHistory = filter === 'starred'
    ? history.filter(h => h.starred)
    : history;

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col">
      <div className="p-3 border-b bg-white">
        <h3 className="font-medium mb-2">历史记录</h3>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            全部
          </Button>
          <Button
            variant={filter === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('starred')}
          >
            <Star className="w-3 h-3 mr-1" />
            收藏
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {displayHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无历史记录
          </div>
        ) : (
          displayHistory.map(entry => (
            <HistoryCard key={entry.id} entry={entry} onUpdate={loadHistory} />
          ))
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry, onUpdate }: { entry: HistoryEntry; onUpdate: () => void }) {
  const typeLabels: Record<string, string> = {
    write: '续写',
    rewrite: '改写',
    describe: '描写',
    expand: '扩展',
    brainstorm: '头脑风暴',
    plugin: '插件'
  };

  return (
    <Card className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          {typeLabels[entry.type]}
        </span>
        <span className="# 墨语写作助手 - 开发者档案 Part 2

> 接续Part 1: Sprint 1-3已完成
> 本文档包含: Sprint 4-6 + 完整开发流程规范

---

## 📋 Sprint 4: 编辑器和写作工具 (Week 4)

### Sprint 4 目标
实现Lexical富文本编辑器和核心写作工具(Write/Rewrite/Describe)

---

#### Task 4.1: Lexical编辑器集成 ✅
**优先级**: P0
**预计时间**: 4小时

**文件**: `src/components/editor/WritingEditor.tsx`

```typescript
/**
 * Lexical富文本编辑器
 * 
 * 功能:
 * - 基础文本编辑
 * - AI生成文本高亮(紫色)
 * - 自动保存
 * - 字数统计
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useEditor } from '@/contexts/EditorContext';

const theme = {
  paragraph: 'mb-2 leading-7',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  // AI生成文本样式
  aiGenerated: 'text-purple-600 bg-purple-50'
};

export function WritingEditor({ documentId }: { documentId: string }) {
  const { saveDocument } = useProject();
  const { currentDocument, setCurrentDocument } = useEditor();
  const [wordCount, setWordCount] = useState(0);

  const initialConfig = {
    namespace: 'WritingEditor',
    theme,
    onError: (error: Error) => {
      console.error('编辑器错误:', error);
    },
  };

  // 内容变化处理
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      
      // 更新字数
      setWordCount(textContent.length);
      
      // 自动保存
      if (documentId) {
        saveDocument(documentId, textContent);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="flex-1 flex flex-col">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="flex-1 outline-none p-8 prose prose-lg max-w-4xl mx-auto w-full"
                style={{ minHeight: '100%' }}
              />
            }
            placeholder={
              <div className="absolute top-8 left-8 text-gray-400 pointer-events-none">
                开始写作，或使用下方的AI工具...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          {/* 插件 */}
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <AutoSavePlugin documentId={documentId} />
          
          {/* 底部状态栏 */}
          <div className="border-t px-4 py-2 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>文档: {currentDocument?.title || '未命名'}</span>
            <span>{wordCount} 字</span>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}

/**
 * 自动保存插件
 */
function AutoSavePlugin({ documentId }: { documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const { saveDocument } = useProject();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          const root = $getRoot();
          const content = root.getTextContent();
          saveDocument(documentId, content);
        });
      }, 2000); // 2秒后自动保存
    });

    return () => {
      unregister();
      clearTimeout(timeoutId);
    };
  }, [editor, documentId, saveDocument]);

  return null;
}
```

**验收标准**:
- [ ] 编辑器正常显示和输入
- [ ] 自动保存功能正常(2秒延迟)
- [ ] 字数统计实时更新
- [ ] 撤销/重做功能正常

**完成后反馈**:
```
✅ Task 4.1 完成
- Lexical编辑器集成成功
- 基础文本编辑功能正常
- 自动保存功能已实现(2秒延迟)
- 字数统计实时显示
- 撤销/重做测试通过
- 截图: [附上编辑器界面]
```

---

#### Task 4.2: 编辑器工具栏 ✅
**优先级**: P0
**预计时间**: 3小时

**文件**: `src/components/editor/EditorToolbar.tsx`

```typescript
/**
 * 编辑器工具栏
 * 
 * 包含所有核心AI工具按钮:
 * - Write (Auto/Guided/Tone)
 * - Rewrite
 * - Describe
 * - Expand
 * - Brainstorm
 * - More Tools
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PenLine,
  RotateCw,
  Eye,
  Maximize,
  Lightbulb,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Smile,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { toast } from 'sonner';

export function EditorToolbar() {
  const [activeToolMenu, setActiveToolMenu] = useState<string | null>(null);
  const { generateWrite, loading } = useAIGeneration();

  // Write工具的三种模式
  const handleWrite = async (mode: 'auto' | 'guided' | 'tone') => {
    try {
      await generateWrite(mode);
      toast.success('生成成功！');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-b p-2 bg-white flex items-center gap-2">
      {/* Write按钮组 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm"
            disabled={loading}
          >
            <PenLine className="w-4 h-4 mr-2" />
            续写
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleWrite('auto')}>
            <Sparkles className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Auto - 自动续写</div>
              <div className="text-xs text-gray-500">AI自动决定情节发展</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleWrite('guided')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Guided - 引导续写</div>
              <div className="text-xs text-gray-500">你指定方向,AI执行</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleWrite('tone')}>
            <Smile className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Tone Shift - 语气转换</div>
              <div className="text-xs text-gray-500">改变叙述语气</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rewrite */}
      <Button variant="outline" size="sm" disabled={loading}>
        <RotateCw className="w-4 h-4 mr-2" />
        改写
      </Button>

      {/* Describe */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Eye className="w-4 h-4 mr-2" />
        描写
      </Button>

      {/* Expand */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Maximize className="w-4 h-4 mr-2" />
        扩展
      </Button>

      {/* Brainstorm */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Lightbulb className="w-4 h-4 mr-2" />
        头脑风暴
      </Button>

      {/* More Tools */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-2" />
            更多工具
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>压缩 (Shrink Ray)</DropdownMenuItem>
          <DropdownMenuItem>情节转折 (Twist)</DropdownMenuItem>
          <DropdownMenuItem>插件...</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 右侧状态 */}
      {loading && (
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin">⏳</div>
          <span>生成中...</span>
        </div>
      )}
    </div>
  );
}
```

**验收标准**:
- [ ] 所有按钮正确显示
- [ ] Write下拉菜单正常
- [ ] Loading状态正确显示
- [ ] 按钮点击事件绑定

**完成后反馈**:
```
✅ Task 4.2 完成
- 工具栏UI创建完成
- 所有核心工具按钮已添加
- Write三种模式的下拉菜单正常
- Loading状态正确显示
- 图标和文字清晰易懂
- 截图: [附上工具栏截图]
```

---

#### Task 4.3: AI生成Hook ✅
**优先级**: P0
**预计时间**: 3小时

**文件**: `src/hooks/useAIGeneration.ts`

```typescript
/**
 * AI生成Hook
 * 
 * 统一管理所有AI生成功能:
 * - Write系列
 * - Rewrite
 * - Describe
 * - Expand
 * - Brainstorm
 */

import { useState } from 'react';
import { GeminiService } from '@/services/gemini';
import { useStoryBible } from '@/contexts/StoryBibleContext';
import { useEditor } from '@/contexts/EditorContext';
import { StorageService } from '@/services/storage';
import { useProject } from '@/contexts/ProjectContext';

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { storyBible } = useStoryBible();
  const { getSelectedText, getPreviousText, insertText } = useEditor();
  const { currentProject } = useProject();

  /**
   * Write - Auto模式
   */
  async function generateWrite(mode: 'auto' | 'guided' | 'tone') {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    setLoading(true);
    try {
      const previousText = getPreviousText(1000); // 获取前1000字
      let result: string;

      if (mode === 'auto') {
        result = await GeminiService.writeAuto(previousText, storyBible);
      } else if (mode === 'guided') {
        // TODO: 弹出对话框让用户输入指示
        const guidance = prompt('请输入续写方向:');
        if (!guidance) return;
        result = await GeminiService.writeGuided(previousText, guidance, storyBible);
      } else {
        // TODO: 弹出对话框让用户选择语气
        const tone = prompt('请输入语气(紧张/轻松/浪漫/神秘):');
        if (!tone) return;
        result = await GeminiService.writeToneShift(previousText, tone, storyBible);
      }

      setSuggestions([result]);
      
      // 保存到历史记录
      await StorageService.addToHistory(currentProject.id, {
        type: 'write',
        input: previousText,
        output: result,
        selected: false,
        starred: false
      });

      return result;
    } catch (error) {
      console.error('生成失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Rewrite - 改写
   */
  async function generateRewrite(instruction: string) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要改写的文本');
    }

    setLoading(true);
    try {
      const results = await GeminiService.rewrite(
        selectedText,
        instruction,
        storyBible
      );

      setSuggestions(results);

      await StorageService.addToHistory(currentProject.id, {
        type: 'rewrite',
        input: selectedText,
        output: results.join('\n---\n'),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Describe - 描写增强
   */
  async function generateDescribe(context?: string) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要增强的文本');
    }

    setLoading(true);
    try {
      const results = await GeminiService.describe(
        selectedText,
        context,
        storyBible
      );

      setSuggestions(results);

      await StorageService.addToHistory(currentProject.id, {
        type: 'describe',
        input: selectedText,
        output: results.join('\n---\n'),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Expand - 扩展
   */
  async function generateExpand() {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要扩展的文本');
    }

    setLoading(true);
    try {
      const result = await GeminiService.expand(selectedText, storyBible);

      setSuggestions([result]);

      await StorageService.addToHistory(currentProject.id, {
        type: 'expand',
        input: selectedText,
        output: result,
        selected: false,
        starred: false
      });

      return result;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Brainstorm - 头脑风暴
   */
  async function generateBrainstorm(
    topic: string,
    category: string,
    context?: string
  ) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    setLoading(true);
    try {
      const results = await GeminiService.brainstorm(
        topic,
        category,
        context,
        storyBible
      );

      await StorageService.addToHistory(currentProject.id, {
        type: 'brainstorm',
        input: `${category}: ${topic}`,
        output: JSON.stringify(results),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * 插入建议到编辑器
   */
  function insertSuggestion(text: string) {
    insertText(text);
    setSuggestions([]);
  }

  /**
   * 清除建议
   */
  function clearSuggestions() {
    setSuggestions([]);
  }

  return {
    loading,
    suggestions,
    generateWrite,
    generateRewrite,
    generateDescribe,
    generateExpand,
    generateBrainstorm,
    insertSuggestion,
    clearSuggestions
  };
}
```

**验收标准**:
- [ ] 所有生成函数正常工作
- [ ] 错误处理完整
- [ ] Loading状态管理正确
- [ ] History记录正常保存

**完成后反馈**:
```
✅ Task 4.3 完成
- useAIGeneration Hook创建完成
- 实现了5个核心生成函数
- 完整的错误处理和Loading管理
- History自动记录功能正常
- 已在工具栏中成功集成
- 测试: AI生成功能正常工作
```

---

#### Task 4.4: 建议卡片组件 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/editor/SuggestionCards.tsx`

```typescript
/**
 * AI生成建议卡片
 * 
 * 显示在编辑器右侧的History面板中
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Star } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';

export function SuggestionCards() {
  const { suggestions, insertSuggestion, clearSuggestions } = useAIGeneration();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">AI建议</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSuggestions}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {suggestions.map((suggestion, index) => (
        <Card key={index} className="p-4 space-y-3">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {suggestion}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => insertSuggestion(suggestion)}
            >
              <Check className="w-4 h-4 mr-1" />
              插入
            </Button>
            <Button variant="outline" size="sm">
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**验收标准**:
- [ ] 建议卡片正确显示
- [ ] 插入按钮功能正常
- [ ] 收藏按钮UI正常
- [ ] 清除按钮正常工作

---

### Sprint 4 完成标准
- [ ] Lexical编辑器正常工作
- [ ] 所有工具栏按钮功能完整
- [ ] Write/Rewrite/Describe功能可用
- [ ] AI生成的内容能正确插入
- [ ] History记录正常保存

**Sprint 4 完成总结格式**:
```
🎉 Sprint 4 完成！

已实现功能:
✅ Lexical富文本编辑器
✅ 完整的工具栏UI
✅ Write (Auto/Guided/Tone)
✅ Rewrite功能
✅ Describe功能
✅ Expand功能
✅ AI生成Hook
✅ 建议卡片显示
✅ History自动记录

技术亮点:
- Lexical插件系统运用
- 自动保存(2秒延迟)
- 统一的AI生成管理
- 完整的错误处理

下一步: Sprint 5 - 插件系统和高级功能

演示视频: [录屏展示Write功能]
```

---

## 📋 Sprint 5: 插件系统 (Week 5)

### Sprint 5 目标
实现插件系统,包括20个预设插件和插件执行器

---

#### Task 5.1: 插件数据结构 ✅
**优先级**: P0
**预计时间**: 2小时

**文件**: `src/lib/plugins/builtInPlugins.ts`

```typescript
/**
 * 内置插件库
 * 
 * 包含20个预设插件:
 * - 写作类 (6个)
 * - 编辑类 (6个)
 * - 分析类 (4个)
 * - 创意类 (4个)
 */

import type { Plugin } from '@/lib/types';

export const BUILT_IN_PLUGINS: Plugin[] = [
  // ========== 写作类 ==========
  {
    id: 'dialogue-enhancer',
    name: '对话润色',
    description: '让对话更生动自然,增加语气词和肢体语言',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
请润色以下对话,使其更加生动:
- 添加语气词、停顿
- 增加肢体语言和表情描写
- 符合人物性格
- 避免"说"字重复

原对话:
{{selected_text}}

角色信息: {{characters}}

提供3个版本。
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'multiple',
    temperature: 0.8,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'wuxia-action',
    name: '武侠打斗',
    description: '生成精彩的武侠动作场面',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters', 'worldbuilding'],
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'inner-thoughts',
    name: '内心独白',
    description: '添加人物内心活动描写',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    temperature: 0.85,
    maxTokens: 800,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'cultivation-breakthrough',
    name: '修炼突破',
    description: '生成修仙突破场景',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters', 'worldbuilding'],
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'scene-setter',
    name: '场景铺垫',
    description: '为场景生成开场描写',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为以下场景生成开场描写(200字):
{{scene_description}}

要求:
- 渲染氛围
- 建立情绪基调
- 暗示即将发生的事件
- 使用环境描写

体裁: {{genre}}
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    temperature: 0.8,
    maxTokens: 1000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'chapter-hook',
    name: '章节钩子',
    description: '生成引人入胜的章节结尾',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为当前章节生成引人入胜的结尾(100字):

当前情节: {{selected_text}}
下一章预告: {{next_chapter}}

要求:
- 制造悬念
- 引发好奇
- 促使读者继续阅读
- 3个版本
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.85,
    maxTokens: 600,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 编辑类 ==========
  {
    id: 'sensory-details',
    name: '五感描写',
    description: '添加视听嗅触味五感细节',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为以下场景添加五感描写:

原文: {{selected_text}}

要求:
- 视觉、听觉、嗅觉、触觉、味觉
- 不改变情节
- 制造沉浸感
- 每种感官至少一处

提供2个版本。
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.8,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pace-up',
    name: '节奏加快',
    description: '将文本改写得更紧凑快速',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写得更紧凑快速:

原文: {{selected_text}}

方法:
- 缩短句子
- 删除冗余描写
- 增加动作
- 制造紧迫感

保留关键信息。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.7,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pace-down',
    name: '节奏放慢',
    description: '将文本改写得更舒缓细腻',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写得更舒缓细腻:

原文: {{selected_text}}

方法:
- 增加细节描写
- 拉长句子
- 添加心理描写
- 营造氛围

不改变核心情节。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.8,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'suspense-builder',
    name: '悬念营造',
    description: '增加文本的悬念感',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
改写以下段落，增加悬念感:

原文: {{selected_text}}

技巧:
- 延迟信息透露
- 增加不确定性
- 使用暗示
- 制造紧张感

保持原意，但更吸引人。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.85,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'style-unifier',
    name: '风格统一',
    description: '统一文本风格',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写为与目标风格一致:

原文: {{selected_text}}
目标风格: {{style}}

分析差异并调整:
- 句式结构
- 词汇选择
- 语气语调
- 修辞手法
`,
    enableStoryBible: true,
    storyBibleFields: ['style'],
    outputType: 'single',
    temperature: 0.75,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'emotion-amplifier',
    name: '情绪加强',
    description: '强化文本的情绪感染力',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 分析类 ==========
  {
    id: 'plot-hole-detector',
    name: '情节检查',
    description: '检测情节漏洞和不一致',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['synopsis', 'characters'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.3,
    maxTokens: 2048,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'relationship-mapper',
    name: '关系梳理',
    description: '分析并可视化人物关系',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.3,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'cliche-detector',
    name: '陈词滥调检测',
    description: '找出并替换陈词滥调',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
    instruction: `
检测以下文本中的陈词滥调并提供替换建议:

文本: {{selected_text}}

重点检测:
- "突然"、"原来"、"竟然"
- "不由得"、"心中一凛"
- 其他老套表达

输出JSON:
[
  {
    "cliche": "检测到的陈词滥调",
    "context": "上下文",
    "alternatives": ["替换建议1", "替换建议2"]
  }
]
`,
    enableStoryBible: false,
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.3,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pacing-analyzer',
    name: '节奏分析',
    description: '分析文本节奏并给出建议',
    category: 'analysis',
    author: '系统内置',
    visibility: 'public',
    instruction: `
分析以下文本的叙事节奏:

文本: {{selected_text}}

分析维度:
- 句子长度变化
- 动作vs描写比例
- 对话密度
- 信息量分布
- 紧张度曲线

给出节奏评分和改进建议。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.3,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 创意类 ==========
  {
    id: 'name-generator',
    name: '角色命名',
    description: '生成符合设定的角色名字',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.9,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'conflict-escalator',
    name: '冲突升级',
    description: '设计冲突升级方案',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.85,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'foreshadowing',
    name: '伏笔设置',
    description: '在场景中埋下伏笔',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
    instruction: `
在当前场景中埋下伏笔:

场景: {{selected_text}}
要暗示的内容: {{future_event}}

要求:
- 不动声色
- 自然融入
- 事后恍然大悟
- 提供3种埋法
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.85,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'title-generator',
    name: '章节标题',
    description: '生成吸引眼球的章节标题',
    category: 'brainstorm',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    outputFormat: 'json',
    temperature: 0.9,
    maxTokens: 1000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
];

/**
 * 按分类获取插件
 */
export function getPluginsByCategory(category: Plugin['category']) {
  return BUILT_IN_PLUGINS.filter(p => p.category === category);
}

/**
 * 搜索插件
 */
export function searchPlugins(query: string) {
  const lowerQuery = query.toLowerCase();
  return BUILT_IN_PLUGINS.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
  );
}
```

**验收标准**:
- [ ] 20个插件定义完整
- [ ] 每个插件都有清晰的instruction
- [ ] 分类正确
- [ ] 工具函数正常工作

**完成后反馈**:
```
✅ Task 5.1 完成
- 20个内置插件定义完成
- 分为4大类: 写作/编辑/分析/创意
- 每个插件都有完整的配置
- 已实现分类和搜索函数
- 插件数据结构符合类型定义
```

---

#### Task 5.2: 插件执行器 ✅
**优先级**: P0
**预计时间**: 3小时

**文件**: `src/components/plugins/PluginExecutor.tsx`

```typescript
/**
 * 插件执行器
 * 
 * 功能:
 * 1. 解析插件变量
 * 2. 弹出输入对话框
 * 3. 调用Gemini API
 * 4. 显示结果
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { GeminiService } from '@/services/gemini';
import { useStoryBible } from '@/contexts/StoryBibleContext';
import { useEditor } from '@/contexts/EditorContext';
import type { Plugin } from '@/lib/types';
import { toast } from 'sonner';

interface PluginExecutorProps {
  plugin: Plugin;
  open: boolean;
  onClose: () => void;
  onSuccess: (result: string) => void;
}

export function PluginExecutor({ plugin, open, onClose, onSuccess }: PluginExecutorProps) {
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const { storyBible } = useStoryBible();
  const { getSelectedText } = useEditor();

  // 解析插件中的变量
  const extractedVariables = extractVariables(plugin.instruction);

  const handleExecute = async () => {
    setLoading(true);
    try {
      // 构建完整的Prompt
      let prompt = plugin.instruction;

      // 替换用户输入的变量
      for (const [key, value] of Object.entries(variables)) {
        prompt = prompt.replace(`{{${key}}}`, value);
      }

      // 替换内置变量
      const selectedText = getSelectedText();
      prompt = prompt.replace('{{selected_text}}', selectedText || '');

      // 添加Story Bible上下文
      if (plugin.enableStoryBible && plugin.storyBibleFields) {
        const context = buildStoryBibleContext(storyBible, plugin.storyBibleFields);
        prompt = context + '\n' + prompt;
      }

      // 调用AI
      const result = await GeminiService.generate(prompt, {
        temperature: plugin.temperature,
        maxTokens: plugin.maxTokens
      });

      onSuccess(result);
      toast.success('插件执行成功！');
      onClose();
    } catch (error: any) {
      toast.error(error.message || '插件执行失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plugin.name}</DialogTitle>
          <p className="text-sm text-gray-600">{plugin.description}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 动态渲染变量输入框 */}
          {extractedVariables.map(variable => (
            <div key={variable}>
              <Label htmlFor={variable}>{formatVariableName(variable)}</Label>
              <Input
                id={variable}
                value={variables[variable] || ''}
                onChange={(e) =>
                  setVariables(prev => ({ ...prev, [variable]: e.target.value }))
                }
                placeholder={`请输入${formatVariableName(variable)}`}
              />
            </div>
          ))}

          {/* 显示会使用的Story Bible字段 */}
          {plugin.enableStoryBible && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              📚 此插件会使用Story Bible中的:{' '}
              {plugin.storyBibleFields?.join('、')}
            </div>
          )}

          {/* 显示选中的文本 */}
          {plugin.instruction.includes('{{selected_text}}') && (
            <div className="p-3 bg-gray-50 border rounded">
              <div className="text-sm font-medium mb-2">选中的文本:</div>
              <div className="text-sm text-gray-600 line-clamp-3">
                {getSelectedText() || '(未选中任何文本)'}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleExecute} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                执行中...
              </>
            ) : (
              '执行插件'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 从instruction中提取变量
 */
function extractVariables(instruction: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const matches = instruction.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    const variable = match[1];
    // 排除内置变量
    if (!['selected_text', 'characters', 'genre', 'style', 'synopsis', 'worldbuilding'].includes(variable)) {
      variables.add(variable);
    }
  }

  return Array.from(variables);
}

/**
 * 格式化变量名称
 */
function formatVariableName(variable: string): string {
  const map: Record<string, string> = {
    character1: '人物A',
    character2: '人物B',
    location: '地点',
    conflict: '冲突起因',
    pov_character: '视角人物',
    emotion: '情绪',
    current_level: '当前境界',
    next_level: '目标境界',
    scene_description: '场景描述',
    next_chapter: '下一章预告',
    target_emotion: '目标情绪',
    character_description: '角色描述',
    gender: '性别',
    current_conflict: '当前冲突',
    future_event: '要暗示的事件',
    chapter_summary: '章节概括'
  };

  return map[variable] || variable;
}

/**
 * 构建Story Bible上下文
 */
function buildStoryBibleContext(
  storyBible: any,
  fields: string[]
): string {
  let context = '【Story Bible】\n';

  for (const field of fields) {
    if (field === 'genre' && storyBible.genre) {
      context += `体裁: ${storyBible.genre}\n`;
    } else if (field === 'style' && storyBible.style?.text) {
      context += `风格: ${storyBible.style.text}\n`;
    } else if (field === 'synopsis' && storyBible.synopsis) {
      context += `概要: ${storyBible.synopsis}\n`;
    } else if (field === 'characters' && storyBible.characters?.length) {
      context += `角色: ${storyBible.characters.map((c: any) => c.name).join('、')}\n`;
    } else if (field === 'worldbuilding' && storyBible.worldbuilding?.length) {
      context += `世界观: ${storyBible.worldbuilding.map((w: any) => w.name).join('、')}\n`;
    }
  }

  return context;
}
```

**验收标准**:
- [ ] 对话框正确显示
- [ ] 变量输入框动态生成
- [ ] Story Bible上下文正确添加
- [ ] 插件执行成功
- [ ] 错误处理完善

**完成后反馈**:
```
✅ Task 5.2 完成
- 插件执行器创建完成
- 动态变量解析正常
- 输入对话框UI友好
- Story Bible集成正确
- 插件测试: 执行成功,结果正确
- 截图: [附上插件执行界面]
```

---

#### Task 5.3: 插件浏览器 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/plugins/PluginBrowser.tsx`

```typescript
/**
 * 插件浏览器
 * 
 * 显示所有可用插件,支持搜索和分类筛选
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Star, TrendingUp } from 'lucide-react';
import { BUILT_IN_PLUGINS, searchPlugins, getPluginsByCategory } from '@/lib/plugins/builtInPlugins';
import { PluginExecutor } from './PluginExecutor';
import type { Plugin } from '@/lib/types';

interface PluginBrowserProps {
  open: boolean;
  onClose: () => void;
}

export function PluginBrowser({ open, onClose }: PluginBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [executorOpen, setExecutorOpen] = useState(false);

  const displayPlugins = searchQuery
    ? searchPlugins(searchQuery)
    : BUILT_IN_PLUGINS;

  const handlePluginSelect = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setExecutorOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>插件工具箱</DialogTitle>
          </DialogHeader>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索插件..."
              className="pl-10"
            />
          </div>

          {/* 分类标签 */}
          <Tabs defaultValue="all">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="writing">写作</TabsTrigger>
              <TabsTrigger value="editing">编辑</TabsTrigger>
              <TabsTrigger value="analysis">分析</TabsTrigger>
              <TabsTrigger value="brainstorm">创意</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-2 max-h-96 overflow-y-auto">
              {displayPlugins.map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="writing" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('writing').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="editing" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('editing').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('analysis').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>

            <TabsContent value="brainstorm" className="space-y-2 max-h-96 overflow-y-auto">
              {getPluginsByCategory('brainstorm').map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onClick={() => handlePluginSelect(plugin)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* 插件执行器 */}
      {selectedPlugin && (
        <PluginExecutor
          plugin={selectedPlugin}
          open={executorOpen}
          onClose={() => setExecutorOpen(false)}
          onSuccess={(result) => {
            // 处理结果
            console.log('插件执行结果:', result);
          }}
        />
      )}
    </>
  );
}

/**
 * 插件卡片
 */
function PluginCard({ plugin, onClick }: { plugin: Plugin; onClick: () => void }) {
  return (
    <div
      className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{plugin.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{plugin.description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {plugin.enableStoryBible && (
            <span className="text-xs text-gray-400">
          {formatDistanceToNow(entry.timestamp, { locale: zhCN, addSuffix: true })}
        </span>
      </div>

      <div className="text-sm text-gray-600 line-clamp-3">
        {entry.output}
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline">
          <Check className="w-3 h-3 mr-1" />
          插入
        </Button>
        <Button size="sm" variant="ghost">
          {entry.starred ? (
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="w-3 h-3" />
          )}
        </Button>
        <Button size="sm" variant="ghost">
          <Trash2 className="w-3 h-3 text-red-500" />
        </Button>
      </div>
    </Card>
  );
}
```

---

#### Task 6.2: 设置页面 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/settings/SettingsDialog.tsx`

```typescript
/**
 * 设置对话框
 * 
 * 包含:
 * - API Key设置
 * - 主题切换
 * - 字体大小
 * - 自动保存间隔
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { StorageService } from '@/services/storage';
import { GeminiService } from '@/services/gemini';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const [settings, setSettings] = useState({
    apiKey: '',
    defaultModel: 'gemini-1.5-pro' as const,
    theme: 'light' as const,
    fontSize: 16,
    autoSave: true,
    autoSaveInterval: 30000
  });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const saved = await StorageService.getSettings();
    setSettings(saved);
    
    // 初始化Gemini API
    if (saved.apiKey) {
      GeminiService.initialize(saved.apiKey);
    }
  }

  async function handleSave() {
    await StorageService.updateSettings(settings);
    
    // 初始化API
    if (settings.apiKey) {
      GeminiService.initialize(settings.apiKey);
    }
    
    toast.success('设置已保存');
    onClose();
  }

  async function handleTestApiKey() {
    if (!settings.apiKey) {
      toast.error('请先输入API Key');
      return;
    }

    setTesting(true);
    try {
      const valid = await GeminiService.validateApiKey(settings.apiKey);
      if (valid) {
        toast.success('API Key验证成功！');
      } else {
        toast.error('API Key无效');
      }
    } catch (error) {
      toast.error('验证失败,请检查API Key');
    } finally {
      setTesting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label>Gemini API Key</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, apiKey: e.target.value }))
                }
                placeholder="输入你的Gemini API Key"
              />
              <Button onClick={handleTestApiKey} disabled={testing}>
                {testing ? '测试中...' : '测试'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              获取API Key: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-500">Google AI Studio</a>
            </p>
          </div>

          {/* 默认模型 */}
          <div className="space-y-2">
            <Label>默认AI模型</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(value: any) =>
                setSettings(prev => ({ ...prev, defaultModel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (高质量)</SelectItem>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (快速)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 主题 */}
          <div className="space-y-2">
            <Label>主题</Label>
            <Select
              value={settings.theme}
              onValueChange={(value: any) =>
                setSettings(prev => ({ ...prev, theme: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">浅色</SelectItem>
                <SelectItem value="dark">深色</SelectItem>
                <SelectItem value="auto">跟随系统</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 字体大小 */}
          <div className="space-y-2">
            <Label>字体大小: {settings.fontSize}px</Label>
            <input
              type="range"
              min="14"
              max="20"
              value={settings.fontSize}
              onChange={(e) =>
                setSettings(prev => ({ ...prev, fontSize: Number(e.target.value) }))
              }
              className="w-full"
            />
          </div>

          {/* 自动保存 */}
          <div className="flex items-center justify-between">
            <Label>自动保存</Label>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) =>
                setSettings(prev => ({ ...prev, autoSave: checked }))
              }
            />
          </div>

          {settings.autoSave && (
            <div className="space-y-2">
              <Label>自动保存间隔: {settings.autoSaveInterval / 1000}秒</Label>
              <input
                type="range"
                min="10000"
                max="60000"
                step="5000"
                value={settings.autoSaveInterval}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, autoSaveInterval: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### Task 6.3: 导入导出功能 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/services/exportService.ts`

```typescript
/**
 * 导出服务
 * 
 * 支持导出为:
 * - Markdown
 * - TXT
 * - JSON (完整项目数据)
 */

import { StorageService } from './storage';
import type { Project } from '@/lib/types';

export class ExportService {
  
  /**
   * 导出为Markdown
   */
  static async exportAsMarkdown(projectId: string): Promise<string> {
    const project = await StorageService.getProject(projectId);
    const documents = await StorageService.listDocuments(projectId);
    const storyBible = await StorageService.getStoryBible(projectId);

    let markdown = `# ${project?.title}\n\n`;

    // Story Bible
    markdown += `## 📖 Story Bible\n\n`;
    
    if (storyBible.synopsis) {
      markdown += `### 故事概要\n\n${storyBible.synopsis}\n\n`;
    }

    if (storyBible.characters.length > 0) {
      markdown += `### 角色\n\n`;
      storyBible.characters.forEach(char => {
        markdown += `#### ${char.name}\n\n`;
        markdown += `${char.description}\n\n`;
      });
    }

    // 文档内容
    markdown += `## 📝 正文\n\n`;
    
    for (const doc of documents) {
      markdown += `### ${doc.title}\n\n`;
      markdown += `${doc.content}\n\n`;
      markdown += `---\n\n`;
    }

    return markdown;
  }

  /**
   * 导出为TXT
   */
  static async exportAsTxt(projectId: string): Promise<string> {
    const project = await StorageService.getProject(projectId);
    const documents = await StorageService.listDocuments(projectId);

    let txt = `${project?.title}\n${'='.repeat(50)}\n\n`;

    for (const doc of documents) {
      txt += `${doc.title}\n${'-'.repeat(30)}\n\n`;
      txt += `${doc.content}\n\n`;
    }

    return txt;
  }

  /**
   * 导出完整项目数据
   */
  static async exportProject(projectId: string) {
    return await StorageService.exportProject(projectId);
  }

  /**
   * 下载文件
   */
  static downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 导入项目
   */
  static async importProject(file: File) {
    const text = await file.text();
    const data = JSON.parse(text);
    return await StorageService.importProject(data);
  }
}
```

---

#### Task 6.4: 快捷键系统 ✅
**优先级**: P2
**预计时间**: 2小时

**文件**: `src/hooks/useKeyboardShortcuts.ts`

```typescript
/**
 * 快捷键Hook
 * 
 * 常用快捷键:
 * - Ctrl/Cmd + S: 保存
 * - Ctrl/Cmd + Enter: 续写
 * - Ctrl/Cmd + R: 改写
 * - Ctrl/Cmd + D: 描写
 * - Ctrl/Cmd + K: 打开插件
 */

import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onWrite?: () => void;
  onRewrite?: () => void;
  onDescribe?: () => void;
  onPlugins?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + S: 保存
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }

      // Ctrl/Cmd + Enter: 续写
      if (ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handlers.onWrite?.();
      }

      // Ctrl/Cmd + R: 改写
      if (ctrlKey && e.key === 'r') {
        e.preventDefault();
        handlers.onRewrite?.();
      }

      // Ctrl/Cmd + D: 描写
      if (ctrlKey && e.key === 'd') {
        e.preventDefault();
        handlers.onDescribe?.();
      }

      // Ctrl/Cmd + K: 插件
      if (ctrlKey && e.key === 'k') {
        e.preventDefault();
        handlers.onPlugins?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
```

---

#### Task 6.5: 最终优化与测试 ✅
**优先级**: P0
**预计时间**: 4小时

**清单**:
- [ ] 所有功能端到端测试
- [ ] UI/UX优化
- [ ] 性能优化
- [ ] 错误处理检查
- [ ] 响应式布局测试
- [ ] 文档补充

---

### Sprint 6 完成标准
- [ ] History面板完整
- [ ] 设置页面功能完善
- [ ] 导入导出正常工作
- [ ] 快捷键系统可用
- [ ] 所有已知Bug修复
- [ ] 用户体验流畅

**Sprint 6 完成总结**:
```
🎉 Sprint 6 完成！项目进入可发布状态！

已实现功能:
✅ History历史记录面板
✅ 完整的设置系统
✅ 导入导出功能 (Markdown/TXT/JSON)
✅ 快捷键系统
✅ 全面的测试和优化

性能指标:
- 启动时间: <2秒
- AI响应: 3-8秒
- 自动保存: 2秒延迟
- 内存占用: 正常

准备发布! 🚀
```

---

## 🎯 完整开发流程规范

### 开发前准备

**Lovable AI开始开发前必须确认:**

1. ✅ 已完整阅读Part 1和Part 2文档
2. ✅ 理解项目整体架构
3. ✅ 熟悉所有技术栈和约束
4. ✅ 准备好开发环境

**开始开发时第一条消息格式:**
```
📋 开发启动确认

我已完整阅读开发者档案(Part 1 + Part 2)

理解的关键点:
✅ 项目目标: 复刻Sudowrite,支持中文
✅ 技术栈: React + TypeScript + Tailwind + Gemini API
✅ 存储: 必须使用window.storage API
✅ 开发流程: 6个Sprint,严格按Task顺序
✅ 反馈要求: 每个Task完成后提供标准报告

准备开始 Sprint 1, Task 1.1: 项目初始化

请确认开始开发。
```

---

### 每日工作流程

**每天开始时:**
```
🌅 今日开发计划

当前进度: Sprint X, Task X.X
今日目标: 完成Task X.X - X.X
预计完成: X个Task

开始执行...
```

**每天结束时:**
```
🌙 今日开发总结

已完成:
✅ Task X.X
✅ Task X.X

遇到的问题:
- [问题描述]
- [解决方案]

明日计划:
- Task X.X
- Task X.X

当前代码截图: [附图]
```

---

### Task完成标准模板

**每个Task完成后必须提供:**

```markdown
## ✅ Task X.X 完成报告

**任务名称**: [Task名称]
**实际用时**: [X小时]
**状态**: ✅ 完成

### 实现内容
1. 创建了文件: [列出所有新建文件]
2. 实现了功能: [详细描述]
3. 集成了组件: [列出相关组件]

### 关键代码
```typescript
// 展示核心实现代码
```

### 验收清单
- [x] 验收标准1
- [x] 验收标准2
- [x] 验收标准3

### 测试结果
- 功能测试: ✅ 通过
- UI显示: ✅ 正常
- 错误处理: ✅ 完善
- 性能: ✅ 良好

### 截图
[附上功能截图]

### 下一步
准备开始 Task X.X
```

---

### Sprint完成标准模板

**每个Sprint完成后必须提供:**

```markdown
## 🎉 Sprint X 完成总结

### 完成时间
开始: [日期]
结束: [日期]
实际用时: [X天]

### 完成的Task列表
✅ Task X.1: [名称]
✅ Task X.2: [名称]
✅ Task X.3: [名称]
...

### 实现的功能
1. [功能1]: [描述]
2. [功能2]: [描述]
3. [功能3]: [描述]

### 技术亮点
- [亮点1]
- [亮点2]
- [亮点3]

### 遇到的挑战及解决
1. **挑战**: [描述]
   **解决**: [方案]

2. **挑战**: [描述]
   **解决**: [方案]

### 测试结果
- 单元测试: ✅ 通过
- 集成测试: ✅ 通过
- 用户测试: ✅ 流畅

### 代码统计
- 新增文件: X个
- 代码行数: X行
- 组件数: X个

### 演示
[录屏或截图展示主要功能]

### 下一步
准备开始 Sprint X+1
预计完成时间: [日期]
```

---

## 🚨 关键注意事项

### 必须严格遵守

1. **禁止跳Task**
   - 必须按顺序完成
   - 每个Task验收通过才能进行下一个
   - 发现遗漏立即补充

2. **禁止使用localStorage/sessionStorage**
   - 只能用window.storage API
   - 所有存储操作需try-catch
   - 失败必须有用户提示

3. **完整的错误处理**
   - 所有异步操作用try-catch
   - 用户友好的错误提示
   - 记录错误日志

4. **代码质量**
   - TypeScript严格模式
   - 组件必须有注释
   - 关键函数写注释
   - 遵循React最佳实践

5. **每Task必须反馈**
   - 使用标准模板
   - 包含截图/代码
   - 说明测试结果
   - 不能省略

---

## 📞 沟通规范

### 遇到问题时

**必须立即报告，格式:**
```
❗ 问题报告

Task: [当前Task]
问题: [详细描述]
尝试的方案: [已尝试的解决方法]
需要的帮助: [具体需求]

等待指示...
```

### 需要澄清时

**格式:**
```
❓ 需要澄清

Task: [当前Task]
疑问: [具体问题]
我的理解: [当前理解]
可能的方案: [列出选项]

请确认正确方案。
```

---

## 🎯 最终交付标准

### 项目完成后必须提供:

1. **完整的代码库**
   - 所有源代码
   - README文档
   - 部署说明

2. **用户文档**
   - 使用教程
   - 功能说明
   - 常见问题

3. **演示视频**
   - 5-10分钟
   - 展示所有核心功能
   - 用户操作流程

4. **测试报告**
   - 功能测试结果
   - 性能测试数据
   - 已知问题列表

5. **部署包**
   - 可直接部署的代码
   - 环境配置说明
   - API Key配置指南

---

## 📚 附录: 快速参考

### 常用命令
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check

# 代码格式化
npm run format
```

### 重要文件位置
```
核心服务:
- src/services/gemini.ts         # Gemini API
- src/services/storage.ts        # 存储服务

核心组件:
- src/components/editor/         # 编辑器
- src/components/story-bible/    # Story Bible
- src/components/plugins/        # 插件系统

Context:
- src/contexts/ProjectContext.tsx
- src/contexts/StoryBibleContext.tsx

配置:
- src/lib/types.ts              # 类型定义
- src/lib/prompts/templates.ts  # Prompt模板
```

### 关键API

**window.storage**:
```typescript
await window.storage.set(key, value, shared)
await window.storage.get(key)
await window.storage.delete(key)
await window.storage.list(prefix)
```

**Gemini Service**:
```typescript
GeminiService.initialize(apiKey)
await GeminiService.generate(prompt, options)
await GeminiService.writeAuto(text, storyBible)
await GeminiService.generateCharacters(synopsis, genre)
```

---

## ✅ 开发启动检查清单

在开始开发前，Lovable AI必须确认:

- [ ] 已完整阅读Part 1文档
- [ ] 已完整阅读Part 2文档  
- [ ] 理解6个Sprint的目标
- [ ] 理解所有Task的验收标准
- [ ] 理解反馈格式要求
- [ ] 理解禁止事项
- [ ] 准备好按顺序执行
- [ ] 准备好每Task反馈
- [ ] 理解错误处理要求
- [ ] 理解代码质量标准

**全部确认后，开始Sprint 1, Task 1.1！** 🚀

---

*文档结束 - 准备开始开发*px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              📚 Story Bible
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

**验收标准**:
- [ ] 插件列表正确显示
- [ ] 搜索功能正常
- [ ] 分类切换正常
- [ ] 点击插件打开执行器
- [ ] UI美观易用

---

### Sprint 5 完成标准
- [ ] 20个内置插件定义完成
- [ ] 插件执行器正常工作
- [ ] 插件浏览器UI完善
- [ ] 插件可以正确调用AI
- [ ] Story Bible集成正确

**Sprint 5 完成总结**:
```
🎉 Sprint 5 完成！

已实现功能:
✅ 20个内置插件
  - 写作类: 6个
  - 编辑类: 6个
  - 分析类: 4个
  - 创意类: 4个
✅ 插件执行器
✅ 插件浏览器
✅ 动态变量解析
✅ Story Bible集成

插件亮点:
- 武侠打斗生成器
- 修炼突破场景
- 情节漏洞检测
- 陈词滥调检测

下一步: Sprint 6 - 优化与完善

插件演示: [录屏展示3-5个插件]
```

---

## 📋 Sprint 6: 优化与完善 (Week 6)

### Sprint 6 目标
完善剩余功能,优化用户体验,准备发布

---

#### Task 6.1: History面板 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/history/HistoryPanel.tsx`

```typescript
/**
 * 历史记录面板
 * 
 * 显示所有AI生成的历史记录
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Check, Trash2 } from 'lucide-react';
import { StorageService } from '@/services/storage';
import { useProject } from '@/contexts/ProjectContext';
import type { HistoryEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function HistoryPanel() {
  const { currentProject } = useProject();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred'>('all');

  useEffect(() => {
    if (currentProject) {
      loadHistory();
    }
  }, [currentProject]);

  async function loadHistory() {
    if (!currentProject) return;
    const entries = await StorageService.getHistory(currentProject.id);
    setHistory(entries);
  }

  const displayHistory = filter === 'starred'
    ? history.filter(h => h.starred)
    : history;

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col">
      <div className="p-3 border-b bg-white">
        <h3 className="font-medium mb-2">历史记录</h3>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            全部
          </Button>
          <Button
            variant={filter === 'starred' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('starred')}
          >
            <Star className="w-3 h-3 mr-1" />
            收藏
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {displayHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无历史记录
          </div>
        ) : (
          displayHistory.map(entry => (
            <HistoryCard key={entry.id} entry={entry} onUpdate={loadHistory} />
          ))
        )}
      </div>
    </div>
  );
}

function HistoryCard({ entry, onUpdate }: { entry: HistoryEntry; onUpdate: () => void }) {
  const typeLabels: Record<string, string> = {
    write: '续写',
    rewrite: '改写',
    describe: '描写',
    expand: '扩展',
    brainstorm: '头脑风暴',
    plugin: '插件'
  };

  return (
    <Card className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          {typeLabels[entry.type]}
        </span>
        <span className="# 墨语写作助手 - 开发者档案 Part 2

> 接续Part 1: Sprint 1-3已完成
> 本文档包含: Sprint 4-6 + 完整开发流程规范

---

## 📋 Sprint 4: 编辑器和写作工具 (Week 4)

### Sprint 4 目标
实现Lexical富文本编辑器和核心写作工具(Write/Rewrite/Describe)

---

#### Task 4.1: Lexical编辑器集成 ✅
**优先级**: P0
**预计时间**: 4小时

**文件**: `src/components/editor/WritingEditor.tsx`

```typescript
/**
 * Lexical富文本编辑器
 * 
 * 功能:
 * - 基础文本编辑
 * - AI生成文本高亮(紫色)
 * - 自动保存
 * - 字数统计
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { $getRoot, $getSelection, EditorState } from 'lexical';
import { useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useEditor } from '@/contexts/EditorContext';

const theme = {
  paragraph: 'mb-2 leading-7',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
  },
  // AI生成文本样式
  aiGenerated: 'text-purple-600 bg-purple-50'
};

export function WritingEditor({ documentId }: { documentId: string }) {
  const { saveDocument } = useProject();
  const { currentDocument, setCurrentDocument } = useEditor();
  const [wordCount, setWordCount] = useState(0);

  const initialConfig = {
    namespace: 'WritingEditor',
    theme,
    onError: (error: Error) => {
      console.error('编辑器错误:', error);
    },
  };

  // 内容变化处理
  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const textContent = root.getTextContent();
      
      // 更新字数
      setWordCount(textContent.length);
      
      // 自动保存
      if (documentId) {
        saveDocument(documentId, textContent);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <div className="flex-1 flex flex-col">
          <RichTextPlugin
            contentEditable={
              <ContentEditable 
                className="flex-1 outline-none p-8 prose prose-lg max-w-4xl mx-auto w-full"
                style={{ minHeight: '100%' }}
              />
            }
            placeholder={
              <div className="absolute top-8 left-8 text-gray-400 pointer-events-none">
                开始写作，或使用下方的AI工具...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          
          {/* 插件 */}
          <HistoryPlugin />
          <OnChangePlugin onChange={handleChange} />
          <AutoSavePlugin documentId={documentId} />
          
          {/* 底部状态栏 */}
          <div className="border-t px-4 py-2 bg-gray-50 flex items-center justify-between text-sm text-gray-600">
            <span>文档: {currentDocument?.title || '未命名'}</span>
            <span>{wordCount} 字</span>
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}

/**
 * 自动保存插件
 */
function AutoSavePlugin({ documentId }: { documentId: string }) {
  const [editor] = useLexicalComposerContext();
  const { saveDocument } = useProject();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        editorState.read(() => {
          const root = $getRoot();
          const content = root.getTextContent();
          saveDocument(documentId, content);
        });
      }, 2000); // 2秒后自动保存
    });

    return () => {
      unregister();
      clearTimeout(timeoutId);
    };
  }, [editor, documentId, saveDocument]);

  return null;
}
```

**验收标准**:
- [ ] 编辑器正常显示和输入
- [ ] 自动保存功能正常(2秒延迟)
- [ ] 字数统计实时更新
- [ ] 撤销/重做功能正常

**完成后反馈**:
```
✅ Task 4.1 完成
- Lexical编辑器集成成功
- 基础文本编辑功能正常
- 自动保存功能已实现(2秒延迟)
- 字数统计实时显示
- 撤销/重做测试通过
- 截图: [附上编辑器界面]
```

---

#### Task 4.2: 编辑器工具栏 ✅
**优先级**: P0
**预计时间**: 3小时

**文件**: `src/components/editor/EditorToolbar.tsx`

```typescript
/**
 * 编辑器工具栏
 * 
 * 包含所有核心AI工具按钮:
 * - Write (Auto/Guided/Tone)
 * - Rewrite
 * - Describe
 * - Expand
 * - Brainstorm
 * - More Tools
 */

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PenLine,
  RotateCw,
  Eye,
  Maximize,
  Lightbulb,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Smile,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { toast } from 'sonner';

export function EditorToolbar() {
  const [activeToolMenu, setActiveToolMenu] = useState<string | null>(null);
  const { generateWrite, loading } = useAIGeneration();

  // Write工具的三种模式
  const handleWrite = async (mode: 'auto' | 'guided' | 'tone') => {
    try {
      await generateWrite(mode);
      toast.success('生成成功！');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="border-b p-2 bg-white flex items-center gap-2">
      {/* Write按钮组 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm"
            disabled={loading}
          >
            <PenLine className="w-4 h-4 mr-2" />
            续写
            <ChevronDown className="w-3 h-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => handleWrite('auto')}>
            <Sparkles className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Auto - 自动续写</div>
              <div className="text-xs text-gray-500">AI自动决定情节发展</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleWrite('guided')}>
            <ArrowRight className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Guided - 引导续写</div>
              <div className="text-xs text-gray-500">你指定方向,AI执行</div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleWrite('tone')}>
            <Smile className="w-4 h-4 mr-2" />
            <div>
              <div className="font-medium">Tone Shift - 语气转换</div>
              <div className="text-xs text-gray-500">改变叙述语气</div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rewrite */}
      <Button variant="outline" size="sm" disabled={loading}>
        <RotateCw className="w-4 h-4 mr-2" />
        改写
      </Button>

      {/* Describe */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Eye className="w-4 h-4 mr-2" />
        描写
      </Button>

      {/* Expand */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Maximize className="w-4 h-4 mr-2" />
        扩展
      </Button>

      {/* Brainstorm */}
      <Button variant="outline" size="sm" disabled={loading}>
        <Lightbulb className="w-4 h-4 mr-2" />
        头脑风暴
      </Button>

      {/* More Tools */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-2" />
            更多工具
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>压缩 (Shrink Ray)</DropdownMenuItem>
          <DropdownMenuItem>情节转折 (Twist)</DropdownMenuItem>
          <DropdownMenuItem>插件...</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 右侧状态 */}
      {loading && (
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <div className="animate-spin">⏳</div>
          <span>生成中...</span>
        </div>
      )}
    </div>
  );
}
```

**验收标准**:
- [ ] 所有按钮正确显示
- [ ] Write下拉菜单正常
- [ ] Loading状态正确显示
- [ ] 按钮点击事件绑定

**完成后反馈**:
```
✅ Task 4.2 完成
- 工具栏UI创建完成
- 所有核心工具按钮已添加
- Write三种模式的下拉菜单正常
- Loading状态正确显示
- 图标和文字清晰易懂
- 截图: [附上工具栏截图]
```

---

#### Task 4.3: AI生成Hook ✅
**优先级**: P0
**预计时间**: 3小时

**文件**: `src/hooks/useAIGeneration.ts`

```typescript
/**
 * AI生成Hook
 * 
 * 统一管理所有AI生成功能:
 * - Write系列
 * - Rewrite
 * - Describe
 * - Expand
 * - Brainstorm
 */

import { useState } from 'react';
import { GeminiService } from '@/services/gemini';
import { useStoryBible } from '@/contexts/StoryBibleContext';
import { useEditor } from '@/contexts/EditorContext';
import { StorageService } from '@/services/storage';
import { useProject } from '@/contexts/ProjectContext';

export function useAIGeneration() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { storyBible } = useStoryBible();
  const { getSelectedText, getPreviousText, insertText } = useEditor();
  const { currentProject } = useProject();

  /**
   * Write - Auto模式
   */
  async function generateWrite(mode: 'auto' | 'guided' | 'tone') {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    setLoading(true);
    try {
      const previousText = getPreviousText(1000); // 获取前1000字
      let result: string;

      if (mode === 'auto') {
        result = await GeminiService.writeAuto(previousText, storyBible);
      } else if (mode === 'guided') {
        // TODO: 弹出对话框让用户输入指示
        const guidance = prompt('请输入续写方向:');
        if (!guidance) return;
        result = await GeminiService.writeGuided(previousText, guidance, storyBible);
      } else {
        // TODO: 弹出对话框让用户选择语气
        const tone = prompt('请输入语气(紧张/轻松/浪漫/神秘):');
        if (!tone) return;
        result = await GeminiService.writeToneShift(previousText, tone, storyBible);
      }

      setSuggestions([result]);
      
      // 保存到历史记录
      await StorageService.addToHistory(currentProject.id, {
        type: 'write',
        input: previousText,
        output: result,
        selected: false,
        starred: false
      });

      return result;
    } catch (error) {
      console.error('生成失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Rewrite - 改写
   */
  async function generateRewrite(instruction: string) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要改写的文本');
    }

    setLoading(true);
    try {
      const results = await GeminiService.rewrite(
        selectedText,
        instruction,
        storyBible
      );

      setSuggestions(results);

      await StorageService.addToHistory(currentProject.id, {
        type: 'rewrite',
        input: selectedText,
        output: results.join('\n---\n'),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Describe - 描写增强
   */
  async function generateDescribe(context?: string) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要增强的文本');
    }

    setLoading(true);
    try {
      const results = await GeminiService.describe(
        selectedText,
        context,
        storyBible
      );

      setSuggestions(results);

      await StorageService.addToHistory(currentProject.id, {
        type: 'describe',
        input: selectedText,
        output: results.join('\n---\n'),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Expand - 扩展
   */
  async function generateExpand() {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    const selectedText = getSelectedText();
    if (!selectedText) {
      throw new Error('请先选中要扩展的文本');
    }

    setLoading(true);
    try {
      const result = await GeminiService.expand(selectedText, storyBible);

      setSuggestions([result]);

      await StorageService.addToHistory(currentProject.id, {
        type: 'expand',
        input: selectedText,
        output: result,
        selected: false,
        starred: false
      });

      return result;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Brainstorm - 头脑风暴
   */
  async function generateBrainstorm(
    topic: string,
    category: string,
    context?: string
  ) {
    if (!currentProject) {
      throw new Error('请先打开一个项目');
    }

    setLoading(true);
    try {
      const results = await GeminiService.brainstorm(
        topic,
        category,
        context,
        storyBible
      );

      await StorageService.addToHistory(currentProject.id, {
        type: 'brainstorm',
        input: `${category}: ${topic}`,
        output: JSON.stringify(results),
        selected: false,
        starred: false
      });

      return results;
    } finally {
      setLoading(false);
    }
  }

  /**
   * 插入建议到编辑器
   */
  function insertSuggestion(text: string) {
    insertText(text);
    setSuggestions([]);
  }

  /**
   * 清除建议
   */
  function clearSuggestions() {
    setSuggestions([]);
  }

  return {
    loading,
    suggestions,
    generateWrite,
    generateRewrite,
    generateDescribe,
    generateExpand,
    generateBrainstorm,
    insertSuggestion,
    clearSuggestions
  };
}
```

**验收标准**:
- [ ] 所有生成函数正常工作
- [ ] 错误处理完整
- [ ] Loading状态管理正确
- [ ] History记录正常保存

**完成后反馈**:
```
✅ Task 4.3 完成
- useAIGeneration Hook创建完成
- 实现了5个核心生成函数
- 完整的错误处理和Loading管理
- History自动记录功能正常
- 已在工具栏中成功集成
- 测试: AI生成功能正常工作
```

---

#### Task 4.4: 建议卡片组件 ✅
**优先级**: P1
**预计时间**: 2小时

**文件**: `src/components/editor/SuggestionCards.tsx`

```typescript
/**
 * AI生成建议卡片
 * 
 * 显示在编辑器右侧的History面板中
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X, Star } from 'lucide-react';
import { useAIGeneration } from '@/hooks/useAIGeneration';

export function SuggestionCards() {
  const { suggestions, insertSuggestion, clearSuggestions } = useAIGeneration();

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">AI建议</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearSuggestions}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {suggestions.map((suggestion, index) => (
        <Card key={index} className="p-4 space-y-3">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {suggestion}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => insertSuggestion(suggestion)}
            >
              <Check className="w-4 h-4 mr-1" />
              插入
            </Button>
            <Button variant="outline" size="sm">
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**验收标准**:
- [ ] 建议卡片正确显示
- [ ] 插入按钮功能正常
- [ ] 收藏按钮UI正常
- [ ] 清除按钮正常工作

---

### Sprint 4 完成标准
- [ ] Lexical编辑器正常工作
- [ ] 所有工具栏按钮功能完整
- [ ] Write/Rewrite/Describe功能可用
- [ ] AI生成的内容能正确插入
- [ ] History记录正常保存

**Sprint 4 完成总结格式**:
```
🎉 Sprint 4 完成！

已实现功能:
✅ Lexical富文本编辑器
✅ 完整的工具栏UI
✅ Write (Auto/Guided/Tone)
✅ Rewrite功能
✅ Describe功能
✅ Expand功能
✅ AI生成Hook
✅ 建议卡片显示
✅ History自动记录

技术亮点:
- Lexical插件系统运用
- 自动保存(2秒延迟)
- 统一的AI生成管理
- 完整的错误处理

下一步: Sprint 5 - 插件系统和高级功能

演示视频: [录屏展示Write功能]
```

---

## 📋 Sprint 5: 插件系统 (Week 5)

### Sprint 5 目标
实现插件系统,包括20个预设插件和插件执行器

---

#### Task 5.1: 插件数据结构 ✅
**优先级**: P0
**预计时间**: 2小时

**文件**: `src/lib/plugins/builtInPlugins.ts`

```typescript
/**
 * 内置插件库
 * 
 * 包含20个预设插件:
 * - 写作类 (6个)
 * - 编辑类 (6个)
 * - 分析类 (4个)
 * - 创意类 (4个)
 */

import type { Plugin } from '@/lib/types';

export const BUILT_IN_PLUGINS: Plugin[] = [
  // ========== 写作类 ==========
  {
    id: 'dialogue-enhancer',
    name: '对话润色',
    description: '让对话更生动自然,增加语气词和肢体语言',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
请润色以下对话,使其更加生动:
- 添加语气词、停顿
- 增加肢体语言和表情描写
- 符合人物性格
- 避免"说"字重复

原对话:
{{selected_text}}

角色信息: {{characters}}

提供3个版本。
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'multiple',
    temperature: 0.8,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'wuxia-action',
    name: '武侠打斗',
    description: '生成精彩的武侠动作场面',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters', 'worldbuilding'],
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'inner-thoughts',
    name: '内心独白',
    description: '添加人物内心活动描写',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters'],
    outputType: 'single',
    temperature: 0.85,
    maxTokens: 800,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'cultivation-breakthrough',
    name: '修炼突破',
    description: '生成修仙突破场景',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
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
`,
    enableStoryBible: true,
    storyBibleFields: ['characters', 'worldbuilding'],
    outputType: 'single',
    temperature: 0.9,
    maxTokens: 2000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'scene-setter',
    name: '场景铺垫',
    description: '为场景生成开场描写',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为以下场景生成开场描写(200字):
{{scene_description}}

要求:
- 渲染氛围
- 建立情绪基调
- 暗示即将发生的事件
- 使用环境描写

体裁: {{genre}}
`,
    enableStoryBible: true,
    storyBibleFields: ['genre'],
    outputType: 'single',
    temperature: 0.8,
    maxTokens: 1000,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'chapter-hook',
    name: '章节钩子',
    description: '生成引人入胜的章节结尾',
    category: 'writing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为当前章节生成引人入胜的结尾(100字):

当前情节: {{selected_text}}
下一章预告: {{next_chapter}}

要求:
- 制造悬念
- 引发好奇
- 促使读者继续阅读
- 3个版本
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.85,
    maxTokens: 600,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  // ========== 编辑类 ==========
  {
    id: 'sensory-details',
    name: '五感描写',
    description: '添加视听嗅触味五感细节',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
为以下场景添加五感描写:

原文: {{selected_text}}

要求:
- 视觉、听觉、嗅觉、触觉、味觉
- 不改变情节
- 制造沉浸感
- 每种感官至少一处

提供2个版本。
`,
    enableStoryBible: false,
    outputType: 'multiple',
    temperature: 0.8,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pace-up',
    name: '节奏加快',
    description: '将文本改写得更紧凑快速',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写得更紧凑快速:

原文: {{selected_text}}

方法:
- 缩短句子
- 删除冗余描写
- 增加动作
- 制造紧迫感

保留关键信息。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.7,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'pace-down',
    name: '节奏放慢',
    description: '将文本改写得更舒缓细腻',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
将以下文本改写得更舒缓细腻:

原文: {{selected_text}}

方法:
- 增加细节描写
- 拉长句子
- 添加心理描写
- 营造氛围

不改变核心情节。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.8,
    maxTokens: 1500,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },

  {
    id: 'suspense-builder',
    name: '悬念营造',
    description: '增加文本的悬念感',
    category: 'editing',
    author: '系统内置',
    visibility: 'public',
    instruction: `
改写以下段落，增加悬念感:

原文: {{selected_text}}

技巧:
- 延迟信息透露
- 增加不确定性
- 使用暗示
- 制造紧张感

保持原意，但更吸引人。
`,
    enableStoryBible: false,
    outputType: 'single',
    temperature: 0.85,
    maxTokens: 1024,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },