import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  X,
  Sparkles,
  Server,
  Smartphone,
  Edit2,
  Check,
  GitFork,
  Trash2,
  Pin,
  AlertTriangle,
  FolderTree,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Wand2,
  HardDrive,
  Copy,
  ChevronDown,
} from 'lucide-react';
import type { SessionItem, ModelItem } from '../types.ts';

interface CollapsibleSidebarProps {
  // 展开/收起状态
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Session 管理
  sessions: SessionItem[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onForkSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onTogglePinSession: (sessionId: string) => void;
  // 模型切换
  availableModels: ModelItem[];
  currentModelId: string;
  onSelectModel: (model: ModelItem) => void;
  // 附加功能
  onOpenPromptBuilder: () => void;
  onQuickPrompt: (text: string) => void;
  onOpenSettings: () => void;
  serverUrl?: string;
  workspaceDir?: string;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onForkSession,
  onDeleteSession,
  onTogglePinSession,
  availableModels,
  currentModelId,
  onSelectModel,
  onOpenPromptBuilder,
  onQuickPrompt,
  onOpenSettings,
  serverUrl,
  workspaceDir = '/root/workspace',
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'workspace' | 'prompts'>('sessions');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<SessionItem | null>(null);
  const [copiedPath, setCopiedPath] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m 前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h 前`;
    return new Date(ts).toLocaleDateString();
  };

  const handleStartRename = (session: SessionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.sessionId);
    setEditingTitle(session.title);
  };

  const handleSaveRename = (sessionId: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(sessionId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.sessionId);
      setSessionToDelete(null);
    }
  };

  const handleCopyWorkspace = () => {
    navigator.clipboard?.writeText(workspaceDir);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeModelObj = availableModels.find((m) => m.id === currentModelId) || availableModels[0];

  // 快捷造物灵感预设
  const quickIdeas = [
    { title: '🌀 热力环流与海陆风动态模拟', prompt: '帮我设计一个高级温柔的中学地理【热力环流与海陆风交互演示课件】网页，带白天黑夜切换、动态粒子流动与等压面弯曲！' },
    { title: '🏔️ 等高线与地形剖面切片仪', prompt: '制作一个直观易懂的【等高线地形图切片模拟器】，可拖动海拔高度查看闭合曲线生成与部位判读口诀！' },
    { title: '🌧️ 冷暖锋面过境天气演变', prompt: '制作一个【冷锋与暖锋过境交互微课】，可动态对比冷暖气团移动抬升、降水区域与城市天气仪表跳变！' },
    { title: '📋 新课标河流地貌教学设计', prompt: '请按照新课标四大核心素养，为我生成一份【人教版高中地理河流地貌】标准教学设计教案与板书设计！' },
  ];

  return (
    <>
      {/* 手机端展开时的半透明模糊遮罩 */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* 
        统一侧边栏容器：
        - 收缩时：固定宽度 52px (w-[52px])，展示纵向快捷控制栏
        - 展开时：在移动端以覆盖式抽屉 (w-[82vw] max-w-72)，在电脑/平板端以常驻面板 (w-72) 平滑展开
      */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex h-full flex-col border-r border-rose-200/80 bg-[#FFF7FA] pt-safe pb-safe backdrop-blur-xl transition-all duration-300 ease-in-out select-none shadow-xl md:shadow-none ${
          isCollapsed ? 'w-[52px]' : 'w-[82vw] max-w-72 md:w-72'
        }`}
      >
        {isCollapsed ? (
          /* ====================================================
             1. MINI 迷你常驻状态 (宽度 52px)
             ==================================================== */
          <div className="flex h-full w-[52px] flex-col items-center justify-between py-3 px-1">
            {/* 上部操作按钮群 */}
            <div className="flex flex-col items-center gap-2.5 w-full">
              {/* 展开总开关 */}
              <button
                onClick={onToggleCollapse}
                className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-500 text-white shadow-sm hover:brightness-110 active:scale-95 transition-all"
                title="点击展开侧边栏"
              >
                <span className="text-base">🌸</span>
              </button>

              {/* 开启新会话 */}
              <button
                onClick={onNewSession}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-rose-600 shadow-2xs hover:bg-rose-100/60 active:scale-95 transition-all border border-rose-100"
                title="开启新灵感项目"
              >
                <Plus size={16} />
              </button>

              <div className="my-0.5 h-px w-5 bg-rose-200/60" />

              {/* 快捷模型切换小图标 */}
              <button
                onClick={() => {
                  setActiveTab('workspace');
                  onToggleCollapse();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all border border-rose-100"
                title={`当前模型: ${activeModelObj?.name || 'DeepSeek'}`}
              >
                <Cpu size={15} />
              </button>

              {/* 会话列表图标 (带数量徽章) */}
              <button
                onClick={() => {
                  setActiveTab('sessions');
                  onToggleCollapse();
                }}
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-all ${
                  activeTab === 'sessions' ? 'bg-rose-100/70 text-rose-600 font-bold' : ''
                }`}
                title="展开会话列表"
              >
                <MessageSquare size={16} />
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-2xs">
                  {sessions.length}
                </span>
              </button>

              {/* 沙盒看板图标 */}
              <button
                onClick={() => {
                  setActiveTab('workspace');
                  onToggleCollapse();
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-all ${
                  activeTab === 'workspace' ? 'bg-rose-100/70 text-rose-600' : ''
                }`}
                title="展开沙盒工作区状态"
              >
                <HardDrive size={16} />
              </button>

              {/* 灵感魔杖图标 */}
              <button
                onClick={() => {
                  setActiveTab('prompts');
                  onToggleCollapse();
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-stone-600 hover:bg-rose-50 hover:text-rose-600 transition-all ${
                  activeTab === 'prompts' ? 'bg-rose-100/70 text-rose-600' : ''
                }`}
                title="展开灵感提词百宝箱"
              >
                <Wand2 size={16} />
              </button>
            </div>

            {/* 底部展开箭头 */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={onToggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-rose-600 shadow-2xs hover:bg-rose-50 active:scale-95 transition-all border border-rose-100"
                title="展开侧边栏"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* ====================================================
             2. FULL 完整展开状态 (宽度 288px)
             ==================================================== */
          <div className="flex h-full w-full flex-col">
            {/* 顶栏与收起按钮 */}
            <div className="flex items-center justify-between border-b border-rose-100/70 px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-500 text-sm text-white shadow-2xs">
                  🌸
                </span>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#33202C]">灵感控制中枢</div>
                  <div className="text-[10px] text-rose-500 font-medium">Session & 智能模型</div>
                </div>
              </div>

              {/* 收起侧边栏按钮 */}
              <button
                onClick={onToggleCollapse}
                className="flex h-7.5 w-7.5 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-100/60 hover:text-rose-600 active:scale-95 transition-all"
                title="收起侧边栏"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* 🔥 侧边栏核心：智能模型即时切换卡片 */}
            <div className="relative px-3 pt-2.5 pb-2 border-b border-rose-100/60 bg-gradient-to-b from-rose-50/30 to-transparent">
              <div className="text-[10px] font-bold text-[#8C6D80] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Cpu size={12} className="text-rose-500" />
                  <span>当前会话推理模型</span>
                </span>
                <span className="text-[9px] text-rose-500 font-semibold bg-rose-100/60 px-1.5 py-0.2 rounded-full">
                  已切换生效
                </span>
              </div>

              {/* 模型选择主卡片 */}
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex w-full items-center justify-between rounded-2xl border border-rose-200/90 bg-white p-2.5 text-left shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 text-xs font-bold shadow-2xs">
                    {activeModelObj?.id.includes('pro') ? '⚡' : '🚀'}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-[#33202C]">
                      {activeModelObj?.name || 'DeepSeek V4.1 Flash'}
                    </div>
                    <div className="truncate text-[10px] text-stone-400">
                      {activeModelObj?.description || '极速智能响应，适合日常教学设计与快速问答'}
                    </div>
                  </div>
                </div>
                <ChevronDown size={14} className={`text-stone-400 shrink-0 transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180 text-rose-500' : ''}`} />
              </button>

              {/* 模型切换下拉浮层 */}
              {modelDropdownOpen && (
                <div className="absolute top-full left-3 right-3 z-40 mt-1 rounded-2xl border border-rose-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[10px] font-semibold text-stone-400 px-2 py-1">
                    选择适用的智能引擎：
                  </div>
                  <div className="space-y-1">
                    {availableModels.map((m) => {
                      const isSelected = m.id === currentModelId;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectModel(m);
                            setModelDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-xl p-2 text-left transition-all ${
                            isSelected
                              ? 'bg-rose-50/90 font-bold text-rose-600 border border-rose-200/80'
                              : 'text-stone-700 hover:bg-stone-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm shrink-0">
                              {m.id.includes('pro') ? '⚡' : '🚀'}
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-xs">{m.name}</div>
                              <div className="truncate text-[9px] text-stone-400 font-normal">
                                {m.description || (m.id.includes('pro') ? '深度复杂推理' : '极速日常响应')}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check size={14} className="text-rose-500 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 分类 Tab 切换条 */}
            <div className="flex items-center border-b border-rose-100/60 bg-[#FFF5F8]/80 p-1.5 gap-1 text-[11px] font-medium">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 transition-all ${
                  activeTab === 'sessions'
                    ? 'bg-white font-semibold text-rose-600 shadow-2xs'
                    : 'text-stone-500 hover:text-rose-500'
                }`}
              >
                <MessageSquare size={12} />
                <span>会话 ({sessions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('workspace')}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 transition-all ${
                  activeTab === 'workspace'
                    ? 'bg-white font-semibold text-rose-600 shadow-2xs'
                    : 'text-stone-500 hover:text-rose-500'
                }`}
              >
                <FolderTree size={12} />
                <span>沙盒</span>
              </button>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`flex-1 flex items-center justify-center gap-1 rounded-xl py-1.5 transition-all ${
                  activeTab === 'prompts'
                    ? 'bg-white font-semibold text-rose-600 shadow-2xs'
                    : 'text-stone-500 hover:text-rose-500'
                }`}
              >
                <Sparkles size={12} />
                <span>灵感</span>
              </button>
            </div>

            {/* Tab 1: 会话管理 */}
            {activeTab === 'sessions' && (
              <div className="flex flex-1 flex-col min-h-0">
                {/* 开启新对话 */}
                <div className="p-3 pb-2">
                  <button
                    onClick={() => {
                      onNewSession();
                      // 在小屏幕上选择或新建后自动折叠
                      if (window.innerWidth < 768) onToggleCollapse();
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 py-2.5 text-xs font-semibold text-white shadow-xs shadow-rose-300/30 transition-all hover:brightness-105 active:scale-[0.98]"
                  >
                    <Plus size={15} />
                    <span>开启新灵感项目</span>
                  </button>
                </div>

                {/* 搜索框 */}
                {sessions.length > 2 && (
                  <div className="px-3 pb-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索历史项目..."
                      className="w-full rounded-xl border border-rose-100 bg-white/70 px-2.5 py-1.5 text-xs text-[#33202C] placeholder:text-stone-300 focus:border-rose-300 focus:bg-white focus:outline-hidden"
                    />
                  </div>
                )}

                {/* 会话列表 */}
                <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1">
                  {filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-xs text-stone-400">
                      <Sparkles size={20} className="mb-1.5 text-rose-300 opacity-60" />
                      <span>{searchQuery ? '没有找到相关项目' : '暂无历史会话'}</span>
                      <span className="mt-1 text-[10px]">点击上方按钮开始第一次尝试吧～</span>
                    </div>
                  ) : (
                    filteredSessions.map((session) => {
                      const isActive = session.sessionId === currentSessionId;
                      const isEditing = editingId === session.sessionId;

                      return (
                        <div
                          key={session.sessionId}
                          onClick={() => {
                            if (!isEditing) {
                              onSelectSession(session.sessionId);
                              if (window.innerWidth < 768) onToggleCollapse();
                            }
                          }}
                          className={`group relative flex w-full flex-col items-start gap-1 rounded-2xl px-3 py-2 text-left transition-all cursor-pointer ${
                            isActive
                              ? 'bg-white font-semibold text-rose-600 shadow-2xs border border-rose-200/90 ring-1 ring-rose-200/40'
                              : 'text-[#5C4554] hover:bg-white/60 active:bg-rose-50/70 border border-transparent'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {session.isPinned ? (
                                <Pin size={12} className="shrink-0 text-amber-500 fill-amber-500" />
                              ) : (
                                <MessageSquare
                                  size={13}
                                  className={`shrink-0 ${isActive ? 'text-rose-500' : 'opacity-40'}`}
                                />
                              )}

                              {isEditing ? (
                                <div
                                  className="flex items-center gap-1 flex-1 min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveRename(session.sessionId);
                                      if (e.key === 'Escape') setEditingId(null);
                                    }}
                                    autoFocus
                                    className="w-full rounded-md border border-rose-300 bg-white px-1.5 py-0.5 text-xs text-[#33202C] focus:outline-hidden"
                                  />
                                  <button
                                    onClick={(e) => handleSaveRename(session.sessionId, e)}
                                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-500 text-white"
                                  >
                                    <Check size={11} />
                                  </button>
                                </div>
                              ) : (
                                <span className="truncate text-xs tracking-wide">
                                  {session.title || '新灵感项目'}
                                </span>
                              )}
                            </div>

                            {/* 操作按钮 */}
                            {!isEditing && (
                              <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                                {/* 置顶 */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePinSession(session.sessionId);
                                  }}
                                  className={`flex h-5.5 w-5.5 items-center justify-center rounded-md ${
                                    session.isPinned
                                      ? 'text-amber-500 hover:bg-amber-50'
                                      : 'text-stone-400 hover:bg-rose-100/60 hover:text-stone-700'
                                  }`}
                                  title={session.isPinned ? '取消置顶' : '置顶'}
                                >
                                  <Pin size={10} className={session.isPinned ? 'fill-amber-500' : ''} />
                                </button>

                                {/* 重命名 */}
                                <button
                                  onClick={(e) => handleStartRename(session, e)}
                                  className="flex h-5.5 w-5.5 items-center justify-center rounded-md text-stone-400 hover:bg-rose-100/60 hover:text-rose-600"
                                  title="重命名"
                                >
                                  <Edit2 size={10} />
                                </button>

                                {/* 分叉复制 */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onForkSession(session.sessionId);
                                  }}
                                  className="flex h-5.5 w-5.5 items-center justify-center rounded-md text-stone-400 hover:bg-rose-100/60 hover:text-rose-600"
                                  title="分叉复制"
                                >
                                  <GitFork size={10} />
                                </button>

                                {/* 删除 */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSessionToDelete(session);
                                  }}
                                  className="flex h-5.5 w-5.5 items-center justify-center rounded-md text-stone-400 hover:bg-rose-100/80 hover:text-red-500"
                                  title="删除项目"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-400 font-normal pl-4 flex items-center justify-between w-full">
                            <span>{formatTime(session.updatedAt)}</span>
                            {isActive && (
                              <span className="text-[9px] font-medium text-rose-500 bg-rose-50 px-1 py-0.1 rounded-sm border border-rose-200/50">
                                进行中
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: 沙盒与工作区状态 */}
            {activeTab === 'workspace' && (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                <div className="rounded-2xl border border-rose-100 bg-white/80 p-3 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#33202C]">
                      <HardDrive size={13} className="text-rose-500" />
                      <span>工作区沙盒根目录</span>
                    </span>
                    <button
                      onClick={handleCopyWorkspace}
                      className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 hover:text-rose-600"
                    >
                      <Copy size={10} />
                      <span>{copiedPath ? '已复制' : '复制'}</span>
                    </button>
                  </div>
                  <div className="rounded-xl bg-stone-50 p-2 text-[11px] font-mono text-stone-600 break-all select-all">
                    {workspaceDir}
                  </div>
                  <p className="text-[10px] text-stone-400 leading-normal">
                    AI 导师编写的所有 HTML、组件与脚本文件均安全隔离存放在此沙盒目录下。
                  </p>
                </div>

                {/* AI 引擎与运行环境 */}
                <div className="rounded-2xl border border-rose-100 bg-white/80 p-3 shadow-2xs space-y-2.5">
                  <div className="text-xs font-bold text-[#33202C] flex items-center gap-1.5">
                    <Cpu size={13} className="text-rose-500" />
                    <span>智能引擎状态</span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">底层模型</span>
                      <span className="font-semibold text-stone-700 bg-rose-50 px-2 py-0.5 rounded-md text-[10px]">
                        DeepSeek V3 / R1
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">执行权限</span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px]">
                        Workspace Write
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">沙盒隔离</span>
                      <span className="font-semibold text-emerald-600">已启用 ✓</span>
                    </div>
                  </div>
                </div>

                {/* 套壳 APK 连接指引卡 */}
                <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50/60 p-3 space-y-2 text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <Smartphone size={13} />
                    <span>手机套壳 APK 状态</span>
                  </div>
                  <p className="text-[10px] text-[#6B5061] leading-relaxed">
                    当前运行在专属安全端口 8443，已跳过 ICP 备案防火墙限制，移动端离线及长连接完全畅通。
                  </p>
                  <button
                    onClick={() => {
                      onOpenSettings();
                      if (window.innerWidth < 768) onToggleCollapse();
                    }}
                    className="w-full rounded-xl bg-white/90 py-1.5 text-center font-semibold text-rose-600 hover:bg-white border border-rose-200/60 active:scale-98 transition-all"
                  >
                    查看连接与网络设置
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: 灵感公式 */}
            {activeTab === 'prompts' && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                <button
                  onClick={() => {
                    onOpenPromptBuilder();
                    if (window.innerWidth < 768) onToggleCollapse();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 p-3 text-white shadow-xs hover:brightness-105 active:scale-98 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🪄</span>
                    <div className="text-left">
                      <div className="text-xs font-bold">灵感提词魔杖</div>
                      <div className="text-[10px] text-pink-100">3 步点选生成地道 Vibe 代码提示词</div>
                    </div>
                  </div>
                  <ChevronRight size={14} />
                </button>

                <div className="text-[11px] font-bold text-stone-400 px-1 pt-1">
                  ✨ 萌系小项目起手式
                </div>

                <div className="space-y-1.5">
                  {quickIdeas.map((idea, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onQuickPrompt(idea.prompt);
                        if (window.innerWidth < 768) onToggleCollapse();
                      }}
                      className="flex w-full flex-col items-start gap-1 rounded-2xl border border-rose-100 bg-white/80 p-2.5 text-left transition-all hover:bg-white hover:border-rose-200 active:scale-98"
                    >
                      <span className="text-xs font-bold text-[#33202C]">{idea.title}</span>
                      <span className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                        {idea.prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 底部信息栏 */}
            <div className="border-t border-rose-100/60 bg-white/50 p-3 text-[11px] text-stone-400 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Smartphone size={13} className="text-rose-400" />
                  <span>多项目随时切换</span>
                </span>
                <span className="rounded-full bg-rose-100/80 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
                  v2.2 移动版
                </span>
              </div>
              {serverUrl && (
                <div className="flex items-center gap-1 truncate text-[10px] text-stone-400">
                  <Server size={11} className="shrink-0" />
                  <span className="truncate">{serverUrl}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* 删除确认弹窗 */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-600 mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle size={18} />
              </span>
              <h3 className="font-bold text-sm text-[#33202C]">确认删除此灵感项目？</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 pl-11.5 leading-relaxed">
              将要删除会话「<span className="font-medium text-stone-800">{sessionToDelete.title}</span>」。删除后此会话将从列表移除并归档。
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-500 hover:bg-stone-100 active:scale-95"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:brightness-105 active:scale-95"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
