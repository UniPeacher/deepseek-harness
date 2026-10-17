import React, { useRef, useEffect } from 'react';
import { Wand2, Trash2, ArrowUp } from 'lucide-react';

interface InputBarProps {
  input: string
  setInput: (val: string) => void
  onSend: () => void
  loading: boolean
  onOpenPromptBuilder: () => void
  onQuickPrompt: (text: string) => void
}

const QUICK_CHIPS = [
  { label: '🪄 灵感魔杖', isWand: true },
  { label: '💖 恋爱倒数卡', prompt: '帮我做一个超好看的粉白奶油风恋爱/纪念日倒数日单页，包含天数大字显示与星光微粒呼吸动效！' },
  { label: '☕ 探店拍立得', prompt: '设计一个复古咖啡馆探店打卡单页，包含小红书拍立得照片卡片、星级评分与打卡清单。' },
  { label: '🧸 情绪盲盒', prompt: '做一个治愈系今日好运盲盒翻牌器，点击有丝滑的 3D 翻牌动画和温暖的治愈寄语！' },
  { label: '🎨 换奶油配色', prompt: '请帮我把当前小工具的配色全面升级为草莓牛奶与香草奶油粉白色调，换成 24px 大圆角与柔和阴影。' },
  { label: '📱 手机全面屏适配', prompt: '帮我适配手机全面屏与安全区，避开顶部刘海与底部手势条，排版自适应优化。' },
]

export const InputBar: React.FC<InputBarProps> = ({
  input,
  setInput,
  onSend,
  loading,
  onOpenPromptBuilder,
  onQuickPrompt,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动调整输入框高度 (根据内容行数)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="sticky bottom-0 z-20 w-full border-t border-rose-100/70 bg-white/90 pb-safe backdrop-blur-xl">
      {/* 快捷灵感推荐横向滚动胶囊 */}
      <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto px-3 py-2 text-xs">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              if (chip.isWand) {
                onOpenPromptBuilder()
              } else if (chip.prompt) {
                onQuickPrompt(chip.prompt)
              }
            }}
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all active:scale-95 ${
              chip.isWand
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-2xs font-semibold'
                : 'border border-rose-200/80 bg-rose-50/70 text-rose-600 hover:bg-rose-100/80'
            }`}
          >
            {chip.isWand && <Wand2 size={11} />}
            <span>{chip.label}</span>
          </button>
        ))}

        {input.trim() && (
          <button
            type="button"
            onClick={() => setInput('')}
            className="flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[10px] text-stone-400 hover:text-stone-600"
            title="清空输入框"
          >
            <Trash2 size={10} />
            <span>清空</span>
          </button>
        )}
      </div>

      {/* 核心输入坞 */}
      <div className="px-3 pb-2 pt-0.5">
        <div className="flex items-end gap-2 rounded-3xl border border-rose-200/90 bg-[#FFFBFD] px-3.5 py-2 shadow-xs transition-all focus-within:border-rose-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-rose-200/40">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="告诉导师你想做什么功能、换什么配色或修什么..."
            className="max-h-28 flex-1 resize-none bg-transparent py-1 text-xs sm:text-sm text-[#33202C] placeholder:text-[#A8909F] focus:outline-hidden leading-relaxed"
          />

          {/* 发送按钮 */}
          <button
            onClick={onSend}
            disabled={!input.trim() || loading}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl transition-all duration-200 ${
              input.trim() && !loading
                ? 'bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 text-white shadow-xs shadow-rose-300 active:scale-90 hover:brightness-105'
                : 'bg-rose-100/60 text-rose-300 cursor-not-allowed'
            }`}
            aria-label="发送消息"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
