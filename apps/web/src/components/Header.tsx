import React, { useState } from 'react';
import { Menu, Settings, Eye, Plus, Edit2, Check, X, Pin } from 'lucide-react';
import type { ConnectionStatus, SessionItem } from '../types.ts';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
  onOpenPreview: () => void;
  onOpenModelManager?: () => void;
  connectionStatus: ConnectionStatus;
  hasPreviewableCode: boolean;
  activeSessionTitle: string;
  activeModelName?: string;
  sessions: SessionItem[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession?: (sessionId: string) => void;
  onRenameSession?: (sessionId: string, newTitle: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenSettings,
  onOpenPreview,
  onOpenModelManager,
  connectionStatus,
  hasPreviewableCode,
  activeSessionTitle,
  activeModelName,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  const handleStartRename = () => {
    setTempTitle(activeSessionTitle);
    setIsEditingTitle(true);
  };

  const handleSaveRename = () => {
    if (tempTitle.trim() && onRenameSession && currentSessionId) {
      onRenameSession(currentSessionId, tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 border border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>已就绪</span>
          </span>
        );
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 border border-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>连接中</span>
          </span>
        );
      case 'error':
      case 'disconnected':
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-500 border border-rose-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            <span>离线</span>
          </span>
        );
    }
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col border-b border-rose-100/70 bg-white/85 pt-safe backdrop-blur-md">
      {/* 主导航条 */}
      <header className="flex h-13 w-full items-center justify-between px-3.5">
        {/* 左侧：抽屉菜单开关与标题 */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={onOpenSidebar}
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-2xl bg-rose-50/80 text-rose-600 transition-all hover:bg-rose-100 active:scale-95"
            aria-label="打开会话手账"
          >
            <Menu size={18} />
          </button>

          <div className="flex flex-col min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base leading-none shrink-0">🌸</span>

              {isEditingTitle ? (
                <div className="flex items-center gap-1 min-w-0 max-w-[200px]">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="w-full rounded-md border border-rose-300 bg-white px-1.5 py-0.5 text-xs text-[#33202C] focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveRename}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-rose-500 text-white"
                  >
                    <Check size={11} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 min-w-0 group cursor-pointer" onClick={handleStartRename}>
                  <span className="truncate text-xs sm:text-sm font-bold tracking-wide text-[#33202C]">
                    {activeSessionTitle || 'Vibe Muse 助理'}
                  </span>
                  <Edit2 size={11} className="shrink-0 text-stone-300 group-hover:text-rose-500 transition-colors" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#8C6D80] leading-none mt-0.5">
              {getStatusBadge()}
              <button
                type="button"
                onClick={onOpenModelManager}
                className="font-medium text-rose-500 bg-rose-50 hover:bg-rose-100/80 px-1.5 py-0.5 rounded-md border border-rose-100/60 truncate max-w-[150px] cursor-pointer transition-colors"
                title="点击配置/切换自定义模型与渠道"
              >
                ⚙️ {activeModelName || 'DeepSeek V4.1 Flash'}
              </button>
            </div>
          </div>
        </div>

        {/* 右侧：新建会话、实时预览入口与设置 */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 快捷新建会话 */}
          <button
            onClick={onNewSession}
            className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-all active:scale-95"
            title="开启新灵感项目"
          >
            <Plus size={14} />
            <span className="hidden sm:inline text-[11px]">新项目</span>
          </button>

          {/* 实时预览按钮 (生成代码后高亮跳动) */}
          <button
            onClick={onOpenPreview}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-95 ${
              hasPreviewableCode
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs shadow-rose-300 animate-pulse-gentle'
                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
            }`}
            title="实时预览当前网页/应用"
          >
            <Eye size={13} className={hasPreviewableCode ? 'animate-bounce' : ''} />
            <span>预览</span>
          </button>

          {/* 设置 */}
          <button
            onClick={onOpenSettings}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-2xl bg-stone-50 text-stone-600 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95"
            aria-label="设置与APK配置"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* 顶部多会话横向滑动切换标签栏 (Tab Bar) */}
      {sessions.length > 1 && (
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-3.5 py-1.5 border-t border-rose-100/40 bg-[#FFFBFD]/80">
          {sessions.map((session) => {
            const isActive = session.sessionId === currentSessionId;
            return (
              <div
                key={session.sessionId}
                onClick={() => onSelectSession(session.sessionId)}
                className={`group flex shrink-0 items-center gap-1.5 rounded-full pl-2.5 pr-2 py-1 text-[11px] font-medium transition-all max-w-[160px] cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-2xs font-semibold'
                    : 'bg-white/80 text-[#6B5061] border border-rose-100 hover:bg-white hover:text-rose-600'
                }`}
              >
                {session.isPinned ? (
                  <Pin size={10} className="shrink-0 text-amber-300 fill-amber-300" />
                ) : (
                  <span className="text-[10px] leading-none shrink-0">✨</span>
                )}
                <span className="truncate">{session.title || '新灵感会话'}</span>

                {onDeleteSession && sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.sessionId);
                    }}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full opacity-60 hover:opacity-100 ${
                      isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-100 text-stone-400 hover:text-rose-600'
                    }`}
                    title="删除此会话"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
