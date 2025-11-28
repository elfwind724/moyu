# 墨语写作助手 (MoYu Writer) - 开发者档案1

**目标**: 复刻Sudowrite的AI写作工具，支持中文优化
**技术栈**: React + TypeScript + Tailwind CSS + Gemini API
**开发周期**: 6周MVP → 16周完整版

---

## 📋 项目概述

### 核心功能
本项目是一个AI辅助的创意写作平台，类似Sudowrite但针对中文写作优化。核心功能包括：

1. **Story Bible系统** - 项目知识库（灵感/体裁/概要/角色/世界观/大纲/场景）
2. **智能写作工具** - 续写/改写/描写/扩展/头脑风暴等9个核心工具
3. **富文本编辑器** - 支持实时AI生成和插入
4. **插件系统** - 20+预设插件，支持自定义
5. **项目管理** - 多项目/系列支持

### 技术要求
- **前端**: React 18 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui
- **编辑器**: Lexical
- **状态管理**: Zustand
- **存储**: window.storage API (Claude Artifacts持久化存储)
- **AI集成**: Google Gemini API (@google/generative-ai)
- **图标**: lucide-react
- **拖拽**: @dnd-kit/core

### 关键约束
- ⚠️ **禁止使用localStorage/sessionStorage** - 必须使用window.storage API
- ⚠️ **所有数据必须持久化** - 项目/文档/Story Bible/History
- ⚠️ **AI调用必须有错误处理** - try-catch + 用户友好提示
- ⚠️ **必须支持离线编辑** - 数据本地存储优先

---

## 🏗️ 项目架构

### 文件结构
```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx          # 主布局
│   │   ├── Sidebar.tsx            # 项目导航侧边栏
│   │   └── StoryBiblePanel.tsx    # Story Bible右侧面板
│   ├── editor/
│   │   ├── WritingEditor.tsx      # Lexical编辑器
│   │   ├── EditorToolbar.tsx      # 工具栏
│   │   ├── FloatingToolbar.tsx    # 选中文本浮动工具
│   │   └── SuggestionCards.tsx    # AI生成建议卡片
│   ├── story-bible/
│   │   ├── BraindumpTab.tsx       # 灵感倾倒
│   │   ├── GenreStyleTab.tsx      # 体裁风格
│   │   ├── SynopsisTab.tsx        # 故事概要
│   │   ├── CharactersTab.tsx      # 角色管理
│   │   ├── WorldbuildingTab.tsx   # 世界观
│   │   ├── OutlineTab.tsx         # 大纲
│   │   └── ScenesTab.tsx          # 场景
│   ├── plugins/
│   │   ├── PluginBrowser.tsx      # 插件浏览器
│   │   ├── PluginExecutor.tsx     # 插件执行器
│   │   └── PluginEditor.tsx       # 自定义插件编辑器
│   ├── projects/
│   │   ├── ProjectList.tsx        # 项目列表
│   │   ├── ProjectCard.tsx        # 项目卡片
│   │   └── NewProjectDialog.tsx   # 新建项目对话框
│   ├── history/
│   │   ├── HistoryPanel.tsx       # 历史记录面板
│   │   └── HistoryCard.tsx        # 历史记录卡片
│   └── ui/                        # shadcn/ui组件
├── contexts/
│   ├── ProjectContext.tsx         # 项目上下文
│   ├── StoryBibleContext.tsx      # Story Bible上下文
│   ├── EditorContext.tsx          # 编辑器上下文
│   └── SettingsContext.tsx        # 设置上下文
├── services/
│   ├── gemini.ts                  # Gemini API服务
│   ├── storage.ts                 # 持久化存储服务
│   ├── contextManager.ts          # 上下文管理器
│   └── exportService.ts           # 导出服务
├── lib/
│   ├── prompts/
│   │   ├── templates.ts           # Prompt模板
│   │   └── chineseExamples.ts     # 中文示例库
│   ├── plugins/
│   │   └── builtInPlugins.ts      # 内置插件
│   ├── types.ts                   # TypeScript类型定义
│   └── utils.ts                   # 工具函数
├── hooks/
│   ├── useAIGeneration.ts         # AI生成Hook
│   ├── useAutoSave.ts             # 自动保存Hook
│   └── useKeyboardShortcuts.ts    # 快捷键Hook
└── App.tsx                        # 主应用
```

### 核心数据流
```
用户输入 
  ↓
编辑器 → EditorContext
  ↓
触发AI工具 → Gemini Service
  ↓
引用Story Bible → StoryBibleContext
  ↓
生成结果 → SuggestionCards
  ↓
用户选择 → 插入编辑器
  ↓
自动保存 → Storage Service
  ↓
记录历史 → HistoryPanel
```

---

## 🎯 开发计划 - 6个Sprint

### Sprint 1: 基础框架 (Week 1)
**目标**: 搭建项目骨架和基础UI

#### Task 1.1: 项目初始化 ✅
**优先级**: P0 (最高)
**预计时间**: 1小时

**具体要求**:
1. 使用Lovable AI创建React + TypeScript + Tailwind项目
2. 安装依赖:
   ```json
   {
     "@google/generative-ai": "^0.21.0",
     "lexical": "^0.20.0",
     "@lexical/react": "^0.20.0",
     "zustand": "^4.5.0",
     "lucide-react": "latest",
     "@dnd-kit/core": "^6.1.0",
     "@dnd-kit/sortable": "^8.0.0"
   }
   ```
3. 配置Tailwind CSS
4. 安装shadcn/ui组件

**验收标准**:
- [ ] 项目能成功运行 `npm run dev`
- [ ] Tailwind CSS正常工作
- [ ] shadcn/ui组件可导入使用

**完成后反馈格式**:
```
✅ Task 1.1 完成
- 项目初始化成功
- 已安装所有依赖
- Tailwind和shadcn/ui配置完成
- 项目运行在 http://localhost:5173
```

---

#### Task 1.2: 主布局结构 ✅
**优先级**: P0
**预计时间**: 2小时

**具体要求**:
创建三栏布局: 左侧导航 | 中间编辑区 | 右侧Story Bible

**文件**: `src/components/layout/AppLayout.tsx`

```typescript
/**
 * 主布局组件
 * 
 * 布局结构:
 * ┌────────┬─────────────────┬──────────┐
 * │ 导航栏 │   编辑器区域     │ Story    │
 * │ 240px  │     flex-1      │ Bible    │
 * │        │                 │ 320px    │
 * └────────┴─────────────────┴──────────┘
 */

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { StoryBiblePanel } from './StoryBiblePanel';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [storyBibleOpen, setStoryBibleOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-14 border-b flex items-center px-4 bg-white">
        <h1 className="text-xl font-bold">墨语写作</h1>
        <div className="ml-auto flex items-center gap-2">
          <button className="px-3 py-1 text-sm">保存</button>
          <button className="px-3 py-1 text-sm">导出</button>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧导航 */}
        {sidebarOpen && (
          <aside className="w-60 border-r bg-gray-50">
            <Sidebar />
          </aside>
        )}

        {/* 中间编辑区 */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* 右侧Story Bible */}
        {storyBibleOpen && (
          <aside className="w-80 border-l bg-gray-50">
            <StoryBiblePanel />
          </aside>
        )}
      </div>
    </div>
  );
}
```

**验收标准**:
- [ ] 三栏布局正确显示
- [ ] 响应式: 宽度小于1280px时自动隐藏侧边栏
- [ ] 侧边栏可折叠

**完成后反馈格式**:
```
✅ Task 1.2 完成
- AppLayout组件创建完成
- 三栏布局正常显示
- 已实现侧边栏折叠功能
- 截图: [附上界面截图]
```

---

#### Task 1.3: 项目列表侧边栏 ✅
**优先级**: P0
**预计时间**: 2小时

**具体要求**:
创建左侧项目导航,显示项目列表和文档树

**文件**: `src/components/layout/Sidebar.tsx`

```typescript
/**
 * 项目导航侧边栏
 * 
 * 功能:
 * 1. 显示所有项目列表
 * 2. 显示当前项目的文档树
 * 3. 新建项目/文档按钮
 * 4. 搜索项目/文档
 */

import { useState } from 'react';
import { FolderIcon, FileTextIcon, PlusIcon } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

export function Sidebar() {
  const { projects, currentProject, documents, createDocument } = useProject();
  
  return (
    <div className="h-full flex flex-col">
      {/* 顶部搜索 */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="搜索项目..."
          className="w-full px-3 py-1.5 text-sm border rounded"
        />
      </div>

      {/* 项目列表 */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">项目</h3>
          <button className="p-1 hover:bg-gray-200 rounded">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {projects.map(project => (
          <div key={project.id} className="mb-2">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-200 rounded text-left">
              <FolderIcon className="w-4 h-4" />
              <span className="text-sm">{project.title}</span>
            </button>
            
            {/* 文档列表 */}
            {currentProject?.id === project.id && (
              <div className="ml-6 mt-1">
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded text-left text-sm"
                  >
                    <FileTextIcon className="w-3 h-3" />
                    {doc.title}
                  </button>
                ))}
                <button
                  onClick={() => createDocument()}
                  className="w-full flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded text-left text-sm text-gray-500"
                >
                  <PlusIcon className="w-3 h-3" />
                  新建文档
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**验收标准**:
- [ ] 显示项目列表
- [ ] 显示文档树
- [ ] 可点击切换项目
- [ ] "新建"按钮正常工作

**完成后反馈**:
```
✅ Task 1.3 完成
- Sidebar组件创建完成
- 项目列表正常显示
- 文档树结构正确
- 新建按钮已绑定事件
```

---

#### Task 1.4: Story Bible面板框架 ✅
**优先级**: P0
**预计时间**: 2小时

**具体要求**:
创建右侧Story Bible面板,包含标签导航

**文件**: `src/components/layout/StoryBiblePanel.tsx`

```typescript
/**
 * Story Bible面板
 * 
 * 包含7个标签:
 * 1. 灵感 (Braindump)
 * 2. 体裁风格 (Genre & Style)
 * 3. 概要 (Synopsis)
 * 4. 角色 (Characters)
 * 5. 世界观 (Worldbuilding)
 * 6. 大纲 (Outline)
 * 7. 场景 (Scenes)
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenIcon, UsersIcon, GlobeIcon, ListIcon, FilmIcon } from 'lucide-react';

export function StoryBiblePanel() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="braindump" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-4 border-b rounded-none h-auto">
          <TabsTrigger value="braindump" className="text-xs py-2">
            <BookOpenIcon className="w-3 h-3 mr-1" />
            灵感
          </TabsTrigger>
          <TabsTrigger value="synopsis" className="text-xs py-2">
            <BookOpenIcon className="w-3 h-3 mr-1" />
            概要
          </TabsTrigger>
          <TabsTrigger value="characters" className="text-xs py-2">
            <UsersIcon className="w-3 h-3 mr-1" />
            角色
          </TabsTrigger>
          <TabsTrigger value="worldbuilding" className="text-xs py-2">
            <GlobeIcon className="w-3 h-3 mr-1" />
            世界观
          </TabsTrigger>
        </TabsList>
        
        <TabsList className="w-full grid grid-cols-3 border-b rounded-none h-auto">
          <TabsTrigger value="outline" className="text-xs py-2">
            <ListIcon className="w-3 h-3 mr-1" />
            大纲
          </TabsTrigger>
          <TabsTrigger value="scenes" className="text-xs py-2">
            <FilmIcon className="w-3 h-3 mr-1" />
            场景
          </TabsTrigger>
          <TabsTrigger value="style" className="text-xs py-2">
            风格
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="braindump" className="p-4">
            <h3 className="font-medium mb-2">灵感倾倒 💡</h3>
            <p className="text-sm text-gray-600 mb-3">
              随意记录你的故事想法
            </p>
            {/* 具体内容在后续任务中实现 */}
          </TabsContent>
          
          {/* 其他标签内容待实现 */}
        </div>
      </Tabs>
    </div>
  );
}
```

**验收标准**:
- [ ] 标签导航正常工作
- [ ] 标签切换无延迟
- [ ] 滚动条正常显示

**完成后反馈**:
```
✅ Task 1.4 完成
- StoryBiblePanel组件创建完成
- 7个标签导航正常工作
- UI符合设计要求
- 已准备好填充具体内容
```

---

#### Task 1.5: Context Provider设置 ✅
**优先级**: P0
**预计时间**: 3小时

**具体要求**:
创建3个核心Context: Project, StoryBible, Editor

**文件1**: `src/contexts/ProjectContext.tsx`

```typescript
/**
 * 项目上下文
 * 
 * 管理:
 * - 项目列表
 * - 当前项目
 * - 文档管理
 * - 项目切换
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '@/services/storage';
import type { Project, Document } from '@/lib/types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  documents: Document[];
  
  // 项目操作
  createProject: (title: string) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  switchProject: (id: string) => Promise<void>;
  
  // 文档操作
  createDocument: (title?: string) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  saveDocument: (id: string, content: string) => Promise<void>;
  
  loading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载项目列表
  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      const loadedProjects = await StorageService.listProjects();
      setProjects(loadedProjects);
      
      // 如果有项目,默认打开第一个
      if (loadedProjects.length > 0) {
        await switchProject(loadedProjects[0].id);
      }
    } catch (err) {
      setError('加载项目失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(title: string) {
    const project: Project = {
      id: `project_${Date.now()}`,
      title,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await StorageService.createProject(project);
    setProjects(prev => [...prev, project]);
    await switchProject(project.id);
    
    return project;
  }

  async function deleteProject(id: string) {
    await StorageService.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setDocuments([]);
    }
  }

  async function switchProject(id: string) {
    const project = await StorageService.getProject(id);
    setCurrentProject(project);
    
    const docs = await StorageService.listDocuments(id);
    setDocuments(docs);
  }

  async function createDocument(title = '未命名文档') {
    if (!currentProject) throw new Error('没有打开的项目');
    
    const document: Document = {
      id: `doc_${Date.now()}`,
      projectId: currentProject.id,
      title,
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      wordCount: 0
    };
    
    await StorageService.saveDocument(document);
    setDocuments(prev => [...prev, document]);
    
    return document;
  }

  async function deleteDocument(id: string) {
    await StorageService.deleteDocument(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
  }

  async function saveDocument(id: string, content: string) {
    const doc = documents.find(d => d.id === id);
    if (!doc) return;
    
    const updated = {
      ...doc,
      content,
      wordCount: content.length,
      updatedAt: Date.now()
    };
    
    await StorageService.saveDocument(updated);
    setDocuments(prev => prev.map(d => d.id === id ? updated : d));
  }

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        documents,
        createProject,
        deleteProject,
        switchProject,
        createDocument,
        deleteDocument,
        saveDocument,
        loading,
        error
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
}
```

**文件2**: `src/contexts/StoryBibleContext.tsx`

```typescript
/**
 * Story Bible上下文
 * 
 * 管理:
 * - Story Bible所有字段
 * - 字段更新
 * - AI生成功能
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StorageService } from '@/services/storage';
import { GeminiService } from '@/services/gemini';
import type { StoryBible, Character, WorldElement } from '@/lib/types';
import { useProject } from './ProjectContext';

interface StoryBibleContextType {
  storyBible: StoryBible;
  
  // 字段更新
  updateField: (field: keyof StoryBible, value: any) => Promise<void>;
  
  // 角色管理
  addCharacter: (character: Character) => Promise<void>;
  updateCharacter: (id: string, updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  
  // 世界观管理
  addWorldElement: (element: WorldElement) => Promise<void>;
  updateWorldElement: (id: string, updates: Partial<WorldElement>) => Promise<void>;
  deleteWorldElement: (id: string) => Promise<void>;
  
  // AI生成
  generateSynopsis: () => Promise<void>;
  generateCharacters: (count?: number) => Promise<void>;
  
  loading: boolean;
}

const StoryBibleContext = createContext<StoryBibleContextType | null>(null);

export function StoryBibleProvider({ children }: { children: ReactNode }) {
  const { currentProject } = useProject();
  const [storyBible, setStoryBible] = useState<StoryBible>(createEmptyStoryBible());
  const [loading, setLoading] = useState(false);

  // 加载Story Bible
  useEffect(() => {
    if (currentProject) {
      loadStoryBible(currentProject.id);
    }
  }, [currentProject]);

  async function loadStoryBible(projectId: string) {
    const sb = await StorageService.getStoryBible(projectId);
    setStoryBible(sb);
  }

  async function updateField(field: keyof StoryBible, value: any) {
    if (!currentProject) return;
    
    const updated = { ...storyBible, [field]: value };
    setStoryBible(updated);
    await StorageService.updateStoryBible(currentProject.id, updated);
  }

  async function addCharacter(character: Character) {
    const updated = {
      ...storyBible,
      characters: [...storyBible.characters, character]
    };
    setStoryBible(updated);
    if (currentProject) {
      await StorageService.updateStoryBible(currentProject.id, updated);
    }
  }

  async function generateSynopsis() {
    if (!storyBible.braindump || !storyBible.genre) {
      throw new Error('请先填写灵感和体裁');
    }
    
    setLoading(true);
    try {
      const synopsis = await GeminiService.generateSynopsis(
        storyBible.braindump,
        storyBible.genre
      );
      await updateField('synopsis', synopsis);
    } finally {
      setLoading(false);
    }
  }

  async function generateCharacters(count = 3) {
    if (!storyBible.synopsis) {
      throw new Error('请先生成故事概要');
    }
    
    setLoading(true);
    try {
      const characters = await GeminiService.generateCharacters(
        storyBible.synopsis,
        storyBible.genre,
        count
      );
      
      for (const char of characters) {
        await addCharacter(char);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <StoryBibleContext.Provider
      value={{
        storyBible,
        updateField,
        addCharacter,
        updateCharacter: async () => {},  // TODO
        deleteCharacter: async () => {},  // TODO
        addWorldElement: async () => {},  // TODO
        updateWorldElement: async () => {},  // TODO
        deleteWorldElement: async () => {},  // TODO
        generateSynopsis,
        generateCharacters,
        loading
      }}
    >
      {children}
    </StoryBibleContext.Provider>
  );
}

export function useStoryBible() {
  const context = useContext(StoryBibleContext);
  if (!context) {
    throw new Error('useStoryBible must be used within StoryBibleProvider');
  }
  return context;
}

function createEmptyStoryBible(): StoryBible {
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
}
```

**验收标准**:
- [ ] 3个Context正确创建
- [ ] Provider嵌套正确
- [ ] Hooks可正常使用
- [ ] 数据持久化正常

**完成后反馈**:
```
✅ Task 1.5 完成
- ProjectContext创建完成
- StoryBibleContext创建完成
- EditorContext创建完成
- 所有Provider已在App.tsx中正确嵌套
- Hooks测试通过
```

---

### Sprint 1 完成标准
- [ ] 项目骨架搭建完成
- [ ] 三栏布局正常显示
- [ ] Context系统正常工作
- [ ] 可以创建/切换项目
- [ ] Story Bible面板框架完成

**Sprint 1 完成后总结格式**:
```
🎉 Sprint 1 完成！

已实现功能:
✅ 项目基础框架
✅ 三栏响应式布局
✅ 项目管理Context
✅ Story Bible Context
✅ 项目列表和切换
✅ 基础UI组件

技术栈确认:
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state
- window.storage for persistence

下一步: Sprint 2 - Storage服务和Gemini API集成

当前项目截图: [附上完整界面截图]
```

---

## 🔄 每个Task的标准反馈格式

每完成一个Task,Lovable AI必须提供以下格式的反馈:

```markdown
## ✅ Task [编号] 完成报告

**任务名称**: [任务名称]
**完成时间**: [实际用时]
**状态**: ✅ 完成 / ⚠️ 部分完成 / ❌ 遇到问题

### 实现内容
1. [具体实现了什么]
2. [创建了哪些文件]
3. [修改了哪些代码]

### 技术细节
- 使用的库/组件: [列表]
- 关键代码逻辑: [简要说明]
- 遇到的技术难点: [如有]

### 验收清单
- [x] 验收标准1
- [x] 验收标准2
- [ ] 验收标准3 (如有未完成项需说明原因)

### 测试结果
- 功能测试: ✅ 通过
- UI显示: ✅ 正常
- 性能: ✅ 良好

### 截图/演示
[附上功能截图或GIF]

### 代码片段
```typescript
// 关键代码展示
```

### 下一步
建议: [对下一个Task的建议]
```

---

## 📋 Sprint 2: 存储服务和AI集成 (Week 2)

### Sprint 2 目标
完成数据持久化和Gemini API集成,实现基本的AI生成功能

---

#### Task 2.1: Storage Service实现 ✅
**优先级**: P0
**预计时间**: 3小时

**具体要求**:
实现完整的存储服务,使用window.storage API

**文件**: `src/services/storage.ts`

```typescript
/**
 * 存储服务
 * 
 * 使用Claude Artifacts的window.storage API
 * 
 * ⚠️ 重要: 
 * - 禁止使用localStorage/sessionStorage
 * - 必须用window.storage.set/get/delete
 * - 所有操作需要try-catch错误处理
 */

import type { Project, Document, StoryBible, HistoryEntry } from '@/lib/types';

export class StorageService {
  
  // ========== 项目管理 ==========
  
  /**
   * 获取所有项目列表
   */
  static async listProjects(): Promise<Project[]> {
    try {
      const result = await window.storage.get('projects-index');
      if (!result) return [];
      return JSON.parse(result.value);
    } catch (error) {
      console.error('加载项目列表失败:', error);
      return [];
    }
  }

  /**
   * 创建新项目
   */
  static async createProject(project: Project): Promise<void> {
    try {
      // 1. 保存项目数据
      await window.storage.set(
        `project:${project.id}`,
        JSON.stringify(project),
        false  // 个人数据
      );

      // 2. 更新项目索引
      const projects = await this.listProjects();
      projects.push({
        id: project.id,
        title: project.title,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      });
      
      await window.storage.set(
        'projects-index',
        JSON.stringify(projects),
        false
      );

      // 3. 创建空的Story Bible
      await this.updateStoryBible(project.id, this.createEmptyStoryBible());
      
      console.log('✅ 项目创建成功:', project.title);
    } catch (error) {
      console.error('❌ 创建项目失败:', error);
      throw new Error('创建项目失败,请重试');
    }
  }

  /**
   * 获取项目详情
   */
  static async getProject(projectId: string): Promise<Project | null> {
    try {
      const result = await window.storage.get(`project:${projectId}`);
      if (!result) return null;
      return JSON.parse(result.value);
    } catch (error) {
      console.error('加载项目失败:', error);
      return null;
    }
  }

  /**
   * 更新项目
   */
  static async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    try {
      const project = await this.getProject(projectId);
      if (!project) throw new Error('项目不存在');

      const updated = {
        ...project,
        ...updates,
        updatedAt: Date.now()
      };

      await window.storage.set(
        `project:${projectId}`,
        JSON.stringify(updated),
        false
      );

      // 更新索引中的信息
      const projects = await this.listProjects();
      const index = projects.findIndex(p => p.id === projectId);
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          title: updated.title,
          updatedAt: updated.updatedAt
        };
        await window.storage.set('projects-index', JSON.stringify(projects), false);
      }
    } catch (error) {
      console.error('更新项目失败:', error);
      throw new Error('更新项目失败');
    }
  }

  /**
   * 删除项目
   */
  static async deleteProject(projectId: string): Promise<void> {
    try {
      // 1. 删除项目数据
      await window.storage.delete(`project:${projectId}`);
      await window.storage.delete(`story-bible:${projectId}`);
      await window.storage.delete(`history:${projectId}`);

      // 2. 删除所有文档
      const documents = await this.listDocuments(projectId);
      for (const doc of documents) {
        await window.storage.delete(`document:${doc.id}`);
      }

      // 3. 更新索引
      const projects = await this.listProjects();
      const filtered = projects.filter(p => p.id !== projectId);
      await window.storage.set('projects-index', JSON.stringify(filtered), false);

      console.log('✅ 项目删除成功');
    } catch (error) {
      console.error('❌ 删除项目失败:', error);
      throw new Error('删除项目失败');
    }
  }

  // ========== 文档管理 ==========

  /**
   * 获取项目的所有文档
   */
  static async listDocuments(projectId: string): Promise<Document[]> {
    try {
      const keys = await window.storage.list(`document:${projectId}:`);
      if (!keys || !keys.keys) return [];

      const documents: Document[] = [];
      for (const key of keys.keys) {
        try {
          const result = await window.storage.get(key);
          if (result) {
            documents.push(JSON.parse(result.value));
          }
        } catch (error) {
          console.warn('跳过损坏的文档:', key);
        }
      }

      return documents.sort((a, b) => a.createdAt - b.createdAt);
    } catch (error) {
      console.error('加载文档列表失败:', error);
      return [];
    }
  }

  /**
   * 获取文档内容
   */
  static async getDocument(documentId: string): Promise<Document | null> {
    try {
      const result = await window.storage.get(`document:${documentId}`);
      if (!result) return null;
      return JSON.parse(result.value);
    } catch (error) {
      console.error('加载文档失败:', error);
      return null;
    }
  }

  /**
   * 保存文档
   */
  static async saveDocument(document: Document): Promise<void> {
    try {
      await window.storage.set(
        `document:${document.id}`,
        JSON.stringify({
          ...document,
          updatedAt: Date.now()
        }),
        false
      );
      console.log('✅ 文档保存成功');
    } catch (error) {
      console.error('❌ 保存文档失败:', error);
      throw new Error('保存文档失败');
    }
  }

  /**
   * 删除文档
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      await window.storage.delete(`document:${documentId}`);
      console.log('✅ 文档删除成功');
    } catch (error) {
      console.error('❌ 删除文档失败:', error);
      throw new Error('删除文档失败');
    }
  }

  // ========== Story Bible ==========

  /**
   * 获取Story Bible
   */
  static async getStoryBible(projectId: string): Promise<StoryBible> {
    try {
      const result = await window.storage.get(`story-bible:${projectId}`);
      if (!result) return this.createEmptyStoryBible();
      return JSON.parse(result.value);
    } catch (error) {
      console.error('加载Story Bible失败:', error);
      return this.createEmptyStoryBible();
    }
  }

  /**
   * 更新Story Bible
   */
  static async updateStoryBible(projectId: string, storyBible: StoryBible): Promise<void> {
    try {
      await window.storage.set(
        `story-bible:${projectId}`,
        JSON.stringify(storyBible),
        false
      );
      console.log('✅ Story Bible保存成功');
    } catch (error) {
      console.error('❌ 保存Story Bible失败:', error);
      throw new Error('保存Story Bible失败');
    }
  }

  /**
   * 创建空的Story Bible
   */
  static createEmptyStoryBible(): StoryBible {
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
  }

  // ========== History ==========

  /**
   * 获取历史记录
   */
  static async getHistory(projectId: string): Promise<HistoryEntry[]> {
    try {
      const result = await window.storage.get(`history:${projectId}`);
      if (!result) return [];
      return JSON.parse(result.value);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      return [];
    }
  }

  /**
   * 添加历史记录
   */
  static async addToHistory(projectId: string, entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const history = await this.getHistory(projectId);
      
      const newEntry: HistoryEntry = {
        id: `history_${Date.now()}`,
        timestamp: Date.now(),
        ...entry
      };

      history.unshift(newEntry);

      // 只保留最近100条
      const trimmed = history.slice(0, 100);

      await window.storage.set(
        `history:${projectId}`,
        JSON.stringify(trimmed),
        false
      );
    } catch (error) {
      console.error('添加历史记录失败:', error);
    }
  }

  // ========== 设置 ==========

  /**
   * 获取应用设置
   */
  static async getSettings() {
    try {
      const result = await window.storage.get('app-settings');
      if (!result) return this.getDefaultSettings();
      return JSON.parse(result.value);
    } catch (error) {
      return this.getDefaultSettings();
    }
  }

  /**
   * 更新设置
   */
  static async updateSettings(settings: any): Promise<void> {
    try {
      await window.storage.set('app-settings', JSON.stringify(settings), false);
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  }

  /**
   * 默认设置
   */
  static getDefaultSettings() {
    return {
      apiKey: '',
      defaultModel: 'gemini-1.5-pro',
      theme: 'light',
      fontSize: 16,
      autoSave: true,
      autoSaveInterval: 30000
    };
  }
}
```

**验收标准**:
- [ ] 所有方法都使用window.storage API
- [ ] 完整的错误处理
- [ ] console.log记录关键操作
- [ ] 类型定义完整

**完成后反馈**:
```
✅ Task 2.1 完成
- StorageService实现完成
- 所有CRUD操作已实现
- 使用window.storage API (非localStorage)
- 完整的错误处理和日志
- 已测试: 创建/读取/更新/删除都正常工作
```

---

#### Task 2.2: TypeScript类型定义 ✅
**优先级**: P0
**预计时间**: 1小时

**具体要求**:
定义所有数据结构的TypeScript类型

**文件**: `src/lib/types.ts`

```typescript
/**
 * 全局类型定义
 */

// ========== 项目相关 ==========

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  seriesId?: string;  // 系列ID
}

export interface Document {
  id: string;
  projectId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  linkedChapterId?: string;  // 关联的大纲章节
}

// ========== Story Bible ==========

export interface StoryBible {
  braindump: string;
  genre: string;
  style: {
    text: string;
    file: File | null;
  };
  synopsis: string;
  characters: Character[];
  worldbuilding: WorldElement[];
  outline: OutlineChapter[];
  scenes: Scene[];
}

export interface Character {
  id: string;
  name: string;
  description: string;
  traits: Record<string, string>;  // 自定义特征字段
  motivations: string;
  backstory: string;
  relationships: Relationship[];
  createdAt: number;
}

export interface Relationship {
  targetId: string;  // 关联角色ID
  type: string;  // 师徒/情侣/仇敌等
  description: string;
}

export interface WorldElement {
  id: string;
  type: 'place' | 'item' | 'lore' | 'organization' | 'custom';
  name: string;
  description: string;
  traits: Record<string, string>;
  parentId?: string;  // 层级关系
  createdAt: number;
}

export interface OutlineChapter {
  id: string;
  title: string;
  order: number;
  type: 'chapter' | 'prologue' | 'epilogue' | 'interlude';
  summary: string;
  linkedDocumentId?: string;
  parentActId?: string;  // 父级"幕"ID
}

export interface Scene {
  id: string;
  chapterId: string;
  order: number;
  description: string;
  pov: string;  // 视角角色
  tense: 'past' | 'present' | 'future';
  pace: 'fast' | 'medium' | 'slow';
  beats: string[];  // 情节要点
  extraInstructions: string;
}

// ========== AI生成相关 ==========

export interface AIGenerationRequest {
  type: 'write' | 'rewrite' | 'describe' | 'expand' | 'brainstorm' | 'twist';
  mode?: 'auto' | 'guided' | 'tone';  // Write工具的模式
  input: string;  // 输入文本或指令
  context?: {
    previousText?: string;
    storyBible?: Partial<StoryBible>;
    userGuidance?: string;
    tone?: string;
  };
  options?: {
    length?: number;
    temperature?: number;
    model?: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'deepseek';
  };
}

export interface AIGenerationResult {
  id: string;
  type: string;
  suggestions: string[];  // 可能有多个版本
  metadata: {
    model: string;
    timestamp: number;
    tokensUsed?: number;
  };
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: 'write' | 'rewrite' | 'describe' | 'expand' | 'brainstorm' | 'plugin';
  input: string;
  output: string;
  selected: boolean;  // 是否被用户选择插入
  starred: boolean;  // 是否收藏
}

// ========== 插件系统 ==========

export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: 'writing' | 'editing' | 'analysis' | 'worldbuilding' | 'character' | 'brainstorm';
  author: string;
  visibility: 'public' | 'unlisted' | 'private';
  
  // 核心配置
  instruction: string;  // AI指令
  
  // 高级配置
  enableStoryBible: boolean;
  storyBibleFields?: ('genre' | 'style' | 'synopsis' | 'characters' | 'worldbuilding')[];
  
  // 变量系统
  variables?: string[];  // 使用的变量列表
  
  // 输出配置
  outputType: 'single' | 'multiple';
  outputFormat?: 'text' | 'json' | 'markdown';
  
  // 模型配置
  model?: string;
  temperature?: number;
  maxTokens?: number;
  
  createdAt: number;
  updatedAt: number;
  usageCount?: number;
}

// ========== 设置 ==========

export interface AppSettings {
  apiKey: string;
  defaultModel: 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'deepseek';
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  autoSave: boolean;
  autoSaveInterval: number;  // 毫秒
  language: 'zh' | 'en';
}

// ========== 工具函数类型 ==========

export type PromptTemplate = (variables: Record<string, any>) => string;

export type ValidationResult = {
  valid: boolean;
  errors?: string[];
};
```

**验收标准**:
- [ ] 所有数据结构都有类型定义
- [ ] 使用Record/Partial等TypeScript工具类型
- [ ] 注释清晰

**完成后反馈**:
```
✅ Task 2.2 完成
- types.ts创建完成
- 定义了15+个核心接口
- 所有字段都有明确类型
- 已在其他文件中成功导入使用
```

---

#### Task 2.3: Gemini API服务 ✅
**优先级**: P0
**预计时间**: 4小时

**具体要求**:
实现Gemini API集成,包括所有核心生成功能

**文件**: `src/services/gemini.ts`

```typescript
/**
 * Gemini API服务
 * 
 * 提供所有AI生成功能:
 * - 续写 (Write: Auto/Guided/Tone)
 * - 改写 (Rewrite)
 * - 描写 (Describe)
 * - 扩展 (Expand)
 * - 头脑风暴 (Brainstorm)
 * - 情节转折 (Twist)
 * - 角色生成 (Generate Character)
 * - 概要生成 (Generate Synopsis)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AIGenerationRequest, StoryBible, Character } from '@/lib/types';
import { PROMPT_TEMPLATES } from '@/lib/prompts/templates';

export class GeminiService {
  private static instance: GoogleGenerativeAI | null = null;
  private static apiKey: string = '';

  /**
   * 初始化API
   */
  static initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.instance = new GoogleGenerativeAI(apiKey);
    console.log('✅ Gemini API初始化成功');
  }

  /**
   * 获取模型实例
   */
  private static getModel(modelName: string = 'gemini-1.5-pro') {
    if (!this.instance) {
      throw new Error('Gemini API未初始化,请先设置API Key');
    }

    return this.instance.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
  }

  /**
   * 通用生成方法
   */
  static async generate(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    try {
      const model = this.getModel(options.model);
      
      // 如果有自定义配置,更新生成配置
      if (options.temperature !== undefined || options.maxTokens !== undefined) {
        // 重新获取带新配置的模型
        const customModel = this.instance!.getGenerativeModel({
          model: options.model || 'gemini-1.5-pro',
          generationConfig: {
            temperature: options.temperature ?? 0.8,
            maxOutputTokens: options.maxTokens ?? 2048,
          },
        });
        
        const result = await customModel.generateContent(prompt);
        return result.response.text();
      }

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error('❌ Gemini API调用失败:', error);
      
      if (error.message?.includes('API_KEY')) {
        throw new Error('API Key无效或未设置');
      } else if (error.message?.includes('quota')) {
        throw new Error('API配额已用完');
      } else if (error.message?.includes('safety')) {
        throw new Error('内容被安全过滤器拦截');
      } else {
        throw new Error(`生成失败: ${error.message}`);
      }
    }
  }

  /**
   * 流式生成
   */
  static async *generateStream(prompt: string, model: string = 'gemini-1.5-flash') {
    const modelInstance = this.getModel(model);
    const result = await modelInstance.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }

  // ========== 写作工具 ==========

  /**
   * 续写 - Auto模式
   */
  static async writeAuto(
    previousText: string,
    storyBible?: Partial<StoryBible>,
    length: number = 300
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.autoWrite({
      previousText,
      storyBible,
      length
    });

    return await this.generate(prompt);
  }

  /**
   * 续写 - Guided模式
   */
  static async writeGuided(
    previousText: string,
    userGuidance: string,
    storyBible?: Partial<StoryBible>
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.guidedWrite({
      previousText,
      userGuidance,
      storyBible
    });

    return await this.generate(prompt);
  }

  /**
   * 续写 - Tone Shift模式
   */
  static async writeToneShift(
    previousText: string,
    tone: string,
    storyBible?: Partial<StoryBible>
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.toneShift({
      previousText,
      tone,
      storyBible
    });

    return await this.generate(prompt);
  }

  /**
   * 改写
   */
  static async rewrite(
    text: string,
    instruction: string,
    storyBible?: Partial<StoryBible>
  ): Promise<string[]> {
    const prompt = PROMPT_TEMPLATES.rewrite({
      text,
      instruction,
      storyBible
    });

    const result = await this.generate(prompt);
    
    // 解析JSON格式的多个版本
    try {
      const parsed = JSON.parse(result);
      return Array.isArray(parsed) ? parsed.map(v => v.text) : [result];
    } catch {
      // 如果不是JSON,返回原文本
      return [result];
    }
  }

  /**
   * 描写增强
   */
  static async describe(
    text: string,
    context?: string,
    storyBible?: Partial<StoryBible>
  ): Promise<string[]> {
    const prompt = PROMPT_TEMPLATES.describe({
      text,
      context,
      storyBible
    });

    const result = await this.generate(prompt);
    
    try {
      const parsed = JSON.parse(result);
      return Array.isArray(parsed) ? parsed : [result];
    } catch {
      return [result];
    }
  }

  /**
   * 扩展
   */
  static async expand(
    text: string,
    storyBible?: Partial<StoryBible>
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.expand({
      text,
      storyBible
    });

    return await this.generate(prompt);
  }

  /**
   * 头脑风暴
   */
  static async brainstorm(
    topic: string,
    category: string,
    context?: string,
    storyBible?: Partial<StoryBible>
  ): Promise<Array<{ idea: string; description: string }>> {
    const prompt = PROMPT_TEMPLATES.brainstorm({
      topic,
      category,
      context,
      storyBible
    });

    const result = await this.generate(prompt, { model: 'gemini-1.5-flash' });
    
    try {
      return JSON.parse(result);
    } catch {
      // 如果解析失败,返回单个结果
      return [{ idea: topic, description: result }];
    }
  }

  /**
   * 情节转折
   */
  static async generateTwist(
    synopsis: string,
    genre: string
  ): Promise<Array<{ twist: string; setup: string; impact: string }>> {
    const prompt = PROMPT_TEMPLATES.twist({
      synopsis,
      genre
    });

    const result = await this.generate(prompt);
    
    try {
      return JSON.parse(result);
    } catch {
      return [{ twist: result, setup: '', impact: '' }];
    }
  }

  // ========== Story Bible生成 ==========

  /**
   * 生成故事概要
   */
  static async generateSynopsis(
    braindump: string,
    genre: string
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.synopsis({
      braindump,
      genre
    });

    return await this.generate(prompt);
  }

  /**
   * 生成角色
   */
  static async generateCharacters(
    synopsis: string,
    genre: string,
    count: number = 3
  ): Promise<Character[]> {
    const prompt = PROMPT_TEMPLATES.character({
      synopsis,
      genre,
      count
    });

    const result = await this.generate(prompt);
    
    try {
      const parsed = JSON.parse(result);
      return Array.isArray(parsed) ? parsed.map((char, index) => ({
        id: `char_${Date.now()}_${index}`,
        name: char.name || '未命名',
        description: char.description || '',
        traits: char.traits || {},
        motivations: char.motivations || '',
        backstory: char.backstory || '',
        relationships: [],
        createdAt: Date.now()
      })) : [];
    } catch (error) {
      console.error('解析角色数据失败:', error);
      return [];
    }
  }

  /**
   * 生成场景
   */
  static async generateScene(
    sceneDescription: string,
    storyBible: Partial<StoryBible>,
    options: {
      pov?: string;
      tense?: string;
      pace?: string;
      beats?: string[];
      extraInstructions?: string;
    } = {}
  ): Promise<string> {
    const prompt = PROMPT_TEMPLATES.scene({
      description: sceneDescription,
      storyBible,
      ...options
    });

    return await this.generate(prompt, { model: 'gemini-1.5-pro' });
  }

  // ========== 工具方法 ==========

  /**
   * 检查API Key是否有效
   */
  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      this.initialize(apiKey);
      await this.generate('测试', { model: 'gemini-1.5-flash' });
      return true;
    } catch {
      return false;
    }
  }