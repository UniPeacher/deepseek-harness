import React from 'react';
import { Plus, MessageSquare, X, Sparkles, Server, Smartphone } from 'lucide-react';
import type { SessionItem } from '../types.ts'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  sessions: SessionItem[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  serverUrl?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  serverUrl,
}) => {
  const formatTime = (ts: number) => {
    const diff = Date.now() - ts
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return new Date(ts).toLocaleDateString()
  }

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-72 flex-col border-r border-rose-100 bg-[#FFF7FA]/95 pt-safe pb-safe backdrop-blur-xl transition-transform duration-300 ease-out shadow-2xl ${
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
              <div className="text-[10px] text-rose-500 font-medium">Vibe Coding 专属搭子</div>
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
        <div className="p-3.5">
          <button
            onClick={() => {
              onNewSession()
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-500 py-3 text-sm font-semibold text-white shadow-md shadow-rose-300/30 transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>开启新灵感项目</span>
          </button>
        </div>

        {/* 历史对话列表 */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium text-stone-400">
            全部对话 ({sessions.length})
          </div>

          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-stone-400">
              <Sparkles size={24} className="mb-2 text-rose-300 opacity-60" />
              <span>暂无历史对话</span>
              <span className="mt-1 text-[11px]">点击上方按钮开始第一次尝试吧～</span>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.sessionId === currentSessionId
              return (
                <button
                  key={session.sessionId}
                  onClick={() => {
                    onSelectSession(session.sessionId)
                    onClose()
                  }}
                  className={`group relative flex w-full flex-col items-start gap-1 rounded-2xl px-3.5 py-2.5 text-left transition-all ${
                    isActive
                      ? 'bg-white font-semibold text-rose-600 shadow-sm border border-rose-200/70'
                      : 'text-[#5C4554] hover:bg-white/60 active:bg-rose-50/70'
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare
                        size={15}
                        className={`shrink-0 ${isActive ? 'text-rose-500' : 'opacity-40'}`}
                      />
                      <span className="truncate text-xs tracking-wide">
                        {session.title || '新灵感会话'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-400 font-normal pl-5">
                    {formatTime(session.updatedAt)}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="border-t border-rose-100/60 bg-white/40 p-3 text-[11px] text-stone-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Smartphone size={13} className="text-rose-400" />
              <span>已适配手机套壳 APK</span>
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
    </>
  )
}
