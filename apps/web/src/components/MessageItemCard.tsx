import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Terminal, FileCode, Eye } from 'lucide-react';
import type { MessageItem } from '../types.ts';

interface MessageItemCardProps {
  message: MessageItem
  onSelectSuggestion?: (suggestion: string) => void
  onOpenPreview?: () => void
}

export const MessageItemCard: React.FC<MessageItemCardProps> = ({
  message,
  onSelectSuggestion,
  onOpenPreview,
}) => {
  const [thinkingExpanded, setThinkingExpanded] = useState(false)
  const [toolsExpanded, setToolsExpanded] = useState(false)
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null)

  const isUser = message.role === 'user'

  // 复制文本/代码到剪贴板
  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedCodeIdx(idx)
    setTimeout(() => setCopiedCodeIdx(null), 2000)
  }

  // 检测文本中是否包含代码块并分离解析
  const renderFormattedContent = (content: string) => {
    // 简易 Markdown 解析 (标题、粗体、代码块)
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match
    let blockIndex = 0

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
          key: `text-${lastIndex}`,
        })
      }
      parts.push({
        type: 'code',
        lang: match[1] || 'html',
        code: match[2],
        key: `code-${match.index}`,
        index: blockIndex++,
      })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
        key: `text-${lastIndex}`,
      })
    }

    if (parts.length === 0) {
      return <div className="whitespace-pre-wrap selectable-text">{content}</div>
    }

    return (
      <div className="space-y-3 selectable-text">
        {parts.map((p) => {
          if (p.type === 'code') {
            const isCopied = copiedCodeIdx === p.index
            return (
              <div
                key={p.key}
                className="overflow-hidden rounded-2xl border border-rose-200/80 bg-stone-900 text-stone-100 shadow-sm"
              >
                {/* 代码顶部标题栏 */}
                <div className="flex items-center justify-between border-b border-stone-800 bg-stone-950 px-3.5 py-1.5 text-[11px] text-stone-400">
                  <span className="font-mono text-rose-400 font-semibold">{p.lang || 'code'}</span>
                  <div className="flex items-center gap-2">
                    {onOpenPreview && (p.lang === 'html' || p.lang === 'js' || p.lang === 'css' || p.code.includes('<html') || p.code.includes('<!DOCTYPE')) && (
                      <button
                        onClick={onOpenPreview}
                        className="flex items-center gap-1 rounded-md bg-rose-500/20 px-2 py-0.5 text-[10px] text-rose-300 hover:bg-rose-500/30 transition-all"
                      >
                        <Eye size={11} />
                        <span>立即预览</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(p.code, p.index!)}
                      className="flex items-center gap-1 rounded-md bg-stone-800 px-2 py-0.5 text-[10px] text-stone-300 hover:bg-stone-700 transition-all"
                    >
                      {isCopied ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>复制代码</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 代码本体 */}
                <pre className="max-h-72 overflow-x-auto p-3.5 font-mono text-xs leading-relaxed text-pink-100/90 select-text">
                  <code>{p.code}</code>
                </pre>
              </div>
            )
          }

          // 文本部分
          return (
            <div key={p.key} className="whitespace-pre-wrap leading-relaxed select-text">
              {p.content}
            </div>
          )
        })}
      </div>
    )
  }

  // 用户气泡
  if (isUser) {
    return (
      <div className="flex justify-end pl-8 my-2 animate-spring-pop">
        <div className="rounded-3xl rounded-tr-xs bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-xs sm:text-sm leading-relaxed text-white shadow-md shadow-rose-300/30 selectable-text max-w-[88%]">
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>
      </div>
    )
  }

  // 工具消息 (纯工具结果汇报卡片)
  if (message.role === 'tool') {
    return (
      <div className="my-1.5 flex justify-start pl-9 pr-4 text-xs">
        <div className="rounded-xl border border-rose-100 bg-[#FFF5F8] px-3 py-1.5 text-[11px] text-[#7A5B6E] flex items-center gap-1.5">
          <Terminal size={12} className="text-rose-400" />
          <span className="font-semibold text-rose-600">已执行动作:</span>
          <span className="font-mono text-stone-700">{message.toolName}</span>
        </div>
      </div>
    )
  }

  // 默认生成的建议引导 Chips (给新手女生轻松点击)
  const defaultSuggestions = [
    '👀 立即在右侧预览效果',
    '🎀 换一个更少女的马卡龙配色',
    '✨ 增加软萌 Q 弹的点击微动效',
    '📱 检查在手机端显示好不好看',
  ]

  const suggestions = message.suggestions || defaultSuggestions

  // 导师气泡
  return (
    <div className="flex items-start gap-2.5 pr-4 my-3 animate-spring-pop">
      {/* 导师可爱头像 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-300 via-rose-300 to-pink-400 text-sm text-white shadow-xs mt-1">
        🌸
      </div>

      <div className="flex flex-col min-w-0 flex-1 max-w-[92%]">
        {/* 导师主卡片 */}
        <div className="rounded-3xl rounded-tl-xs border border-rose-100/80 bg-white p-4 text-xs sm:text-sm text-[#33202C] shadow-sm space-y-3">
          {/* A. 💭 导师思考手账 (DeepSeek R1/V3 思维链) */}
          {message.thinking && (
            <div className="rounded-2xl border border-rose-100 bg-[#FFF8FA] p-2.5 transition-all">
              <button
                type="button"
                onClick={() => setThinkingExpanded(!thinkingExpanded)}
                className="flex w-full items-center justify-between text-left text-[11px] font-medium text-rose-500"
              >
                <div className="flex items-center gap-1.5">
                  <span className="animate-pulse">💭</span>
                  <span>导师思路手账 {message.isStreaming && !message.text && '(正在构思中...)'}</span>
                </div>
                {thinkingExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {thinkingExpanded && (
                <div className="mt-2 text-[11px] leading-relaxed text-[#735767] border-t border-rose-100/60 pt-2 whitespace-pre-wrap selectable-text">
                  {message.thinking}
                </div>
              )}
            </div>
          )}

          {/* B. ⚡ 造物动作提示卡 */}
          {(message.toolCalls && message.toolCalls.length > 0) && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-2.5 text-xs text-amber-900">
              <button
                type="button"
                onClick={() => setToolsExpanded(!toolsExpanded)}
                className="flex w-full items-center justify-between text-left text-[11px] font-semibold text-amber-800"
              >
                <div className="flex items-center gap-1.5">
                  <FileCode size={13} className="text-amber-600" />
                  <span>已为你创建 / 修改代码工程 ({message.toolCalls.length} 个动作)</span>
                </div>
                {toolsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {toolsExpanded && (
                <div className="mt-2 space-y-1.5 border-t border-amber-200/60 pt-2 font-mono text-[10px]">
                  {message.toolCalls.map((tc, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-white/70 px-2 py-1">
                      <span className="text-amber-700">{tc.name}</span>
                      <span className="text-stone-400 truncate max-w-[200px]">
                        {typeof tc.args === 'string' ? tc.args : JSON.stringify(tc.args)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* C. 导师回答正文 */}
          <div className="leading-relaxed">
            {renderFormattedContent(message.text)}
          </div>

          {/* 实时生成中的跳动微动画 */}
          {message.isStreaming && (
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce delay-100"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-bounce delay-200"></span>
              <span className="ml-1 text-[10px] text-[#8C6D80]">导师正在为你编写与雕琢中...</span>
            </div>
          )}
        </div>

        {/* D. ✨ 猜你想做... (Smart Next Step Chips) */}
        {!message.isStreaming && onSelectSuggestion && (
          <div className="mt-2 flex flex-wrap gap-1.5 pl-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (s.includes('预览') && onOpenPreview) {
                    onOpenPreview()
                  } else {
                    onSelectSuggestion(s)
                  }
                }}
                className="group flex items-center gap-1 rounded-full border border-rose-200/70 bg-white/90 px-3 py-1 text-[11px] font-medium text-rose-600 shadow-2xs transition-all hover:border-rose-300 hover:bg-rose-50 active:scale-95"
              >
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
