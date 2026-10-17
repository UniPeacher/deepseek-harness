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
} from 'lucide-react';
import type { SessionItem } from '../types.ts';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: SessionItem[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onForkSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onTogglePinSession: (sessionId: string) => void;
  serverUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onForkSession,
  onDeleteSession,
  onTogglePinSession,
  serverUrl,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<SessionItem | null>(null);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
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

  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* 遮罩背景 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* 侧滑抽屉 */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-80 flex-col border-r border-rose-100 bg-[#FFF7FA]/95 pt-safe pb-safe backdrop-blur-xl transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-rose-100/60">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-base text-white shadow-xs">
              🌸
            </span>
            <div>
              <div className="text-sm font-bold text-[#33202C]">灵感手账库</div>
              <div className="text-[10px] text-rose-500 font-medium">多项目会话管理</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-100/60 hover:text-stone-700 active:scale-95"
            aria-label="关闭侧边栏"
          >
            <X size={18} />
          </button>
        </div>

        {/* 开启新对话按钮 */}
        <div className="p-3.5 pb-2">
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-300/30 transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>开启新灵感项目</span>
          </button>
        </div>

        {/* 搜索会话框 */}
        {sessions.length > 2 && (
          <div className="px-3.5 pb-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索历史项目..."
              className="w-full rounded-xl border border-rose-100 bg-white/70 px-3 py-1.5 text-xs text-[#33202C] placeholder:text-stone-300 focus:border-rose-300 focus:bg-white focus:outline-hidden"
            />
          </div>
        )}

        {/* 历史对话列表 */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-stone-400 flex items-center justify-between">
            <span>全部会话 ({filteredSessions.length})</span>
            {sessions.length > 0 && (
              <span className="text-[10px] text-rose-400">支持置顶与重命名</span>
            )}
          </div>

          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-stone-400">
              <Sparkles size={24} className="mb-2 text-rose-300 opacity-60" />
              <span>{searchQuery ? '没有找到相关会话' : '暂无历史对话'}</span>
              <span className="mt-1 text-[11px]">点击上方按钮开始第一次尝试吧～</span>
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
                      onClose();
                    }
                  }}
                  className={`group relative flex w-full flex-col items-start gap-1 rounded-2xl px-3 py-2.5 text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white font-semibold text-rose-600 shadow-xs border border-rose-200/90 ring-1 ring-rose-200/50'
                      : 'text-[#5C4554] hover:bg-white/60 active:bg-rose-50/70 border border-transparent'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {session.isPinned ? (
                        <Pin size={13} className="shrink-0 text-amber-500 fill-amber-500" />
                      ) : (
                        <MessageSquare
                          size={14}
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
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-rose-500 text-white hover:bg-rose-600"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="truncate text-xs tracking-wide">
                          {session.title || '新灵感会话'}
                        </span>
                      )}
                    </div>

                    {/* 管理操作快捷按钮 (置顶、重命名、分叉、删除) */}
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                        {/* 置顶 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePinSession(session.sessionId);
                          }}
                          className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                            session.isPinned
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-stone-400 hover:bg-rose-100/60 hover:text-stone-700'
                          }`}
                          title={session.isPinned ? '取消置顶' : '置顶此项目'}
                        >
                          <Pin size={11} className={session.isPinned ? 'fill-amber-500' : ''} />
                        </button>

                        {/* 重命名 */}
                        <button
                          onClick={(e) => handleStartRename(session, e)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-100/60 hover:text-rose-600"
                          title="重命名项目"
                        >
                          <Edit2 size={11} />
                        </button>

                        {/* 分叉复制 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onForkSession(session.sessionId);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-100/60 hover:text-rose-600"
                          title="分叉/复制此项目"
                        >
                          <GitFork size={11} />
                        </button>

                        {/* 删除 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-100/80 hover:text-red-500"
                          title="删除项目"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-stone-400 font-normal pl-4.5 flex items-center justify-between w-full">
                    <span>{formatTime(session.updatedAt)}</span>
                    <div className="flex items-center gap-1">
                      {session.isPinned && (
                        <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200/60">
                          置顶
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[9px] font-medium text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded-full border border-rose-200/60">
                          当前会话
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="border-t border-rose-100/60 bg-white/40 p-3 text-[11px] text-stone-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone size={13} className="text-rose-400" />
              <span>多项目随时切换</span>
            </span>
            <span className="rounded-full bg-rose-100/80 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
              v2.0 移动版
            </span>
          </div>
          {serverUrl && (
            <div className="flex items-center gap-1 truncate text-[10px] text-stone-400">
              <Server size={11} className="shrink-0" />
              <span className="truncate">{serverUrl}</span>
            </div>
          )}
        </div>
      </aside>

      {/* 删除会话二次确认弹窗 */}
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
