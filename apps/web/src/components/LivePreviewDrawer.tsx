import React, { useState } from 'react';
import { X, RotateCw, Smartphone, Monitor, ExternalLink, Copy, Check } from 'lucide-react';
import type { MessageItem } from '../types.ts'

interface LivePreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  messages: MessageItem[]
}

export const LivePreviewDrawer: React.FC<LivePreviewDrawerProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'responsive'>('mobile')
  const [copied, setCopied] = useState(false)
  const [key, setKey] = useState(0)

  // 从所有对话消息中提取最后一段有效的 HTML/网页代码
  const extractLatestCode = (): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg.role !== 'assistant') continue

      // 匹配 ```html ... ``` 或 ``` ... ``` 包含 <html> <body> 标签
      const codeRegex = /```(?:html|xml)?\n([\s\S]*?)```/g
      let match
      let lastMatch = null
      while ((match = codeRegex.exec(msg.text)) !== null) {
        lastMatch = match[1]
      }
      if (lastMatch && (lastMatch.includes('<html') || lastMatch.includes('<!DOCTYPE') || lastMatch.includes('<div') || lastMatch.includes('<script') || lastMatch.includes('<style'))) {
        return lastMatch
      }
    }
    return null
  }

  const code = extractLatestCode()

  const handleCopyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenNewTab = () => {
    if (!code) return
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/60 backdrop-blur-md transition-all">
      {/* 顶部控制栏 */}
      <div className="flex h-14 w-full items-center justify-between border-b border-rose-100/20 bg-stone-900/90 px-4 pt-safe text-white">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-400 to-rose-400 text-xs">
            🌸
          </span>
          <div>
            <div className="text-xs font-bold">实时造物预览沙盒</div>
            <div className="text-[10px] text-pink-300">所见即所得 · 手机触控交互</div>
          </div>
        </div>

        {/* 中间：设备视图切换 */}
        <div className="flex items-center rounded-xl bg-stone-800 p-0.5 text-xs">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
              deviceMode === 'mobile'
                ? 'bg-rose-500 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Smartphone size={12} />
            <span>手机机型</span>
          </button>
          <button
            onClick={() => setDeviceMode('responsive')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] transition-all ${
              deviceMode === 'responsive'
                ? 'bg-rose-500 text-white font-semibold shadow-xs'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Monitor size={12} />
            <span>全面屏</span>
          </button>
        </div>

        {/* 右侧动作按钮 */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setKey(k => k + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white active:scale-95"
            title="刷新"
          >
            <RotateCw size={15} />
          </button>
          {code && (
            <>
              <button
                onClick={handleCopyCode}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white active:scale-95"
                title="复制代码"
              >
                {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
              </button>
              <button
                onClick={handleOpenNewTab}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white active:scale-95"
                title="新窗口打开"
              >
                <ExternalLink size={15} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-800 text-stone-300 hover:bg-rose-500 hover:text-white active:scale-95 ml-1"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* 主沙盒预览视口 */}
      <div className="flex flex-1 items-center justify-center overflow-hidden p-2 sm:p-4 bg-stone-950/40 pb-safe">
        {code ? (
          <div
            className={`relative flex h-full w-full items-center justify-center transition-all duration-300 ${
              deviceMode === 'mobile'
                ? 'max-w-[390px] max-h-[820px] rounded-[42px] border-[10px] border-stone-800 bg-stone-900 p-0 shadow-2xl overflow-hidden'
                : 'max-w-5xl rounded-2xl border border-stone-800 bg-white shadow-xl overflow-hidden'
            }`}
          >
            {/* 手机模式的顶部灵动岛/听筒装饰 */}
            {deviceMode === 'mobile' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 h-4 w-24 rounded-full bg-stone-800 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-stone-900 ml-auto mr-3"></div>
              </div>
            )}

            <iframe
              key={key}
              srcDoc={code}
              title="Vibe App Live Preview"
              sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
              className="h-full w-full border-0 bg-white"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 text-stone-300 max-w-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/20 text-3xl text-rose-300 shadow-sm animate-float">
              🌸
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              还没有可预览的前端代码哦
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed mb-6">
              请在对话框中让导师为你编写一个恋爱倒数日、复古咖啡探店打卡或者情绪盲盒，导师生成代码后，这里就会实时活起来啦！
            </p>
            <button
              onClick={onClose}
              className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md active:scale-95"
            >
              去让导师写代码 ➔
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
