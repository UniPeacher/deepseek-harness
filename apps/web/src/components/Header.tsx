import React from 'react';
import { Menu, Settings, Eye } from 'lucide-react';
import type { ConnectionStatus } from '../types.ts'

interface HeaderProps {
  onOpenSidebar: () => void
  onOpenSettings: () => void
  onOpenPreview: () => void
  connectionStatus: ConnectionStatus
  hasPreviewableCode: boolean
  activeSessionTitle: string
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  onOpenSettings,
  onOpenPreview,
  connectionStatus,
  hasPreviewableCode,
  activeSessionTitle,
}) => {
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 border border-emerald-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>已就绪</span>
          </span>
        )
      case 'connecting':
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 border border-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>连接中</span>
          </span>
        )
      case 'error':
      case 'disconnected':
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-500 border border-rose-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
            <span>离线</span>
          </span>
        )
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-rose-100/70 bg-white/80 px-3.5 pt-safe backdrop-blur-md">
      {/* 左侧：抽屉菜单开关与标题 */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-rose-50/80 text-rose-600 transition-all hover:bg-rose-100 active:scale-95"
          aria-label="打开会话列表"
        >
          <Menu size={19} />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">🌸</span>
            <span className="truncate text-sm font-semibold tracking-wide text-[#33202C]">
              {activeSessionTitle || 'Vibe Muse 助理'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#8C6D80] leading-none mt-0.5">
            {getStatusBadge()}
            <span className="hidden sm:inline">DeepSeek Harness 智能引擎</span>
          </div>
        </div>
      </div>

      {/* 右侧：实时预览入口与设置 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 实时预览按钮 (生成代码后高亮跳动) */}
        <button
          onClick={onOpenPreview}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
            hasPreviewableCode
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs shadow-rose-300 animate-pulse-gentle'
              : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
          }`}
          title="实时预览当前网页/应用"
        >
          <Eye size={14} className={hasPreviewableCode ? 'animate-bounce' : ''} />
          <span>预览</span>
        </button>

        {/* 套壳APK与网络设置 */}
        <button
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-50 text-stone-600 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          aria-label="设置与APK配置"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}
