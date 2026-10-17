import React, { useState } from 'react';
import { Sparkles, Palette, Wrench, Wand2, ArrowRight } from 'lucide-react';
import type { InspirationPrompt } from '../types.ts'

const STARTER_PROMPTS: InspirationPrompt[] = [
  {
    id: 'starter-1',
    category: 'starter',
    emoji: '💖',
    title: '恋爱 / 纪念日倒数卡',
    description: '粉白奶油风倒数日单页，支持自定义天数与浪漫星光动效',
    prompt: '我想做一个超好看的粉白奶油风恋爱/纪念日倒数日小单页。请直接为我编写单文件 HTML/CSS/JS 代码，包含：1. 倒数天数大数字显示；2. 背景有浪漫柔和的星光微粒呼吸动效；3. 可以让我修改纪念日名字；4. 适配手机竖屏浏览。',
    tags: ['奶油粉白', '浪漫动效', '极易上手'],
  },
  {
    id: 'starter-2',
    category: 'starter',
    emoji: '☕',
    title: '复古咖啡馆探店打卡',
    description: '小红书拍立得画廊风格，可记录每次咖啡探店心得与评星',
    prompt: '帮我设计并编写一个复古咖啡馆探店打卡小单页。视觉风格采用法式复古与温暖奶咖色，包含小红书风格的拍立得照片卡片、星级评分、探店标签和推荐手冲清单，请用单文件 HTML/CSS/JS 交付，能直接在手机浏览器或APK全屏查看。',
    tags: ['法式复古', '小红书风', '探店日记'],
  },
  {
    id: 'starter-3',
    category: 'starter',
    emoji: '🧸',
    title: '今日心情盲盒翻牌器',
    description: '每天点击随机翻开一张治愈系心情卡片与专属好运寄语',
    prompt: '我想做一个超治愈的“今日心情盲盒翻牌”趣味小工具。包含 6 张背面带粉嫩花纹的盲盒卡片，点击其中一张会有丝滑的 3D 翻牌动画，翻开后展示今天的治愈金句和幸运色！全部样式和交互逻辑整合在一个清晰的前端代码文件中。',
    tags: ['治愈盲盒', '翻牌动效', '好运签'],
  },
  {
    id: 'starter-4',
    category: 'starter',
    emoji: '💅',
    title: '美甲与穿搭色卡生成器',
    description: '点击一键随机生成一组马卡龙少女系配色方案并支持复制色号',
    prompt: '帮我做一个马卡龙色系的美甲与日常穿搭色卡生成器。每点一次按钮，随机生成 5 个互相搭配的温柔少女系色块，显示 HEX 颜色值并支持一键复制到剪贴板，界面要非常软萌可爱，像甜品店菜单一样精致！',
    tags: ['马卡龙配色', '色卡工具', '一键复制'],
  },
]

const VIBE_PROMPTS: InspirationPrompt[] = [
  {
    id: 'vibe-1',
    category: 'vibe',
    emoji: '🍰',
    title: '注入马卡龙与奶油质感',
    description: '把当前页面的配色换成草莓牛奶、香草奶油与柔和圆角阴影',
    prompt: '请帮我把当前正在做的小工具视觉风格全面升级：采用温柔的草莓牛奶粉（#FF7597）、香草奶油底色（#FFF9FB）和薰衣草柔紫，将所有按钮和卡片换成 24px 大圆角与柔和漫反射阴影，让整个界面充满精致少女感。',
    tags: ['草莓牛奶', '奶油微质感', '大圆角'],
  },
  {
    id: 'vibe-2',
    category: 'vibe',
    emoji: '✨',
    title: '添加软萌 Q 弹点击动效',
    description: '给按钮、卡片添加轻盈的弹性动画与按下缩放微反馈',
    prompt: '帮我给当前项目里的所有交互元素（按钮、开关、卡片）加上软萌 Q 弹的 CSS 点击动画！按下去时有微小的弹性下沉（scale 0.95），悬停时有轻微上浮呼吸动效，让操作起来像捏猫爪肉垫一样有手感。',
    tags: ['Q弹动效', '微交互', '触控反馈'],
  },
  {
    id: 'vibe-3',
    category: 'vibe',
    emoji: '🩰',
    title: '升级高级极简法式排版',
    description: '调整字体字偶间距、留白呼吸感，告别拥挤死板的程序员风',
    prompt: '现在的页面排版稍微有些拥挤。请帮我用现代法式极简审美重新梳理布局：增大区域间的留白（padding/margin），选用优雅圆润的无衬线字体层级，并把重要信息做成呼吸感十足的半透明毛玻璃卡片（backdrop-blur）。',
    tags: ['法式留白', '毛玻璃', '优雅排版'],
  },
]

const FIX_PROMPTS: InspirationPrompt[] = [
  {
    id: 'fix-1',
    category: 'fix',
    emoji: '❓',
    title: '页面白屏排错（温柔版）',
    description: '打开什么都没显示？让导师说人话帮你一步步排查并修复',
    prompt: '导师救命！我刚改完代码之后页面打开变成一片空白了，请帮我分析控制台可能报错的原因，用完全不用技术黑话的简单中文告诉我发生了什么，并直接帮我把修正好的完整代码发给我～',
    tags: ['小白急救', '不用黑话', '一键修复'],
  },
  {
    id: 'fix-2',
    category: 'fix',
    emoji: '📱',
    title: '手机竖屏自适应优化',
    description: '适配全面屏手机与套壳 APK，解决边缘遮挡与输入框弹窗变形',
    prompt: '这个页面在手机竖屏或者套壳 APK 里面打开时，底部的文字和按钮容易被手机小黑条或者全面屏刘海遮住。请帮我加上标准移动端 viewport 和安全区适配（safe-area-inset），让在任何手机上全屏运行都非常完美！',
    tags: ['全面屏适配', '安全区', '手机优化'],
  },
  {
    id: 'fix-3',
    category: 'fix',
    emoji: '🖱️',
    title: '按钮点击没反应检查',
    description: '检查 JavaScript 监听事件与函数绑定，快速恢复点击效果',
    prompt: '我点击界面上的按钮之后没有任何反应，不知道是事件没绑上还是 JS 逻辑有误。请帮我检查代码里的交互逻辑，把失效的点击事件修复，并顺便加上一个可爱的点击提示反馈 Toast。',
    tags: ['交互修复', 'Toast反馈', '事件监听'],
  },
]

interface InspirationDeckProps {
  onSelectPrompt: (promptText: string) => void
  onOpenPromptBuilder: () => void
}

export const InspirationDeck: React.FC<InspirationDeckProps> = ({
  onSelectPrompt,
  onOpenPromptBuilder,
}) => {
  const [activeTab, setActiveTab] = useState<'starter' | 'vibe' | 'fix'>('starter')

  const getList = () => {
    switch (activeTab) {
      case 'starter':
        return STARTER_PROMPTS
      case 'vibe':
        return VIBE_PROMPTS
      case 'fix':
        return FIX_PROMPTS
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-2 py-4">
      {/* 头部欢迎问候 */}
      <div className="mb-6 text-center animate-spring-pop">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-pink-200 via-rose-200 to-pink-300 text-3xl shadow-md shadow-pink-200/50 animate-float">
          🌸
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#33202C]">
          你好呀，我是你的 Vibe Coding 导师
        </h1>
        <p className="mt-1.5 text-xs text-[#7A5C6F] leading-relaxed max-w-sm mx-auto">
          不用背代码，把你的奇思妙想告诉我，我手把手带你在手机上造出专属于你的梦幻小工具 ✨
        </p>

        {/* 灵感提词器入口卡片 */}
        <div className="mt-4 px-2">
          <button
            onClick={onOpenPromptBuilder}
            className="flex w-full items-center justify-between rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-100/60 via-pink-50/70 to-rose-100/60 p-3.5 text-left shadow-xs transition-all hover:border-rose-300 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
                <Wand2 size={18} />
              </span>
              <div>
                <div className="text-xs font-bold text-[#33202C]">灵感魔杖 · 提词公式生成器</div>
                <div className="text-[10px] text-[#8A667C]">选择风格+功能+受众，一秒拼出完美需求</div>
              </div>
            </div>
            <ArrowRight size={16} className="text-rose-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* 分类切换药丸 Tab */}
      <div className="mb-3 flex items-center justify-center gap-1 rounded-2xl bg-rose-100/40 p-1">
        <button
          onClick={() => setActiveTab('starter')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all ${
            activeTab === 'starter'
              ? 'bg-white text-rose-600 shadow-xs font-bold'
              : 'text-[#6E5364] hover:text-rose-500'
          }`}
        >
          <Sparkles size={13} />
          <span>初学者造物</span>
        </button>
        <button
          onClick={() => setActiveTab('vibe')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all ${
            activeTab === 'vibe'
              ? 'bg-white text-rose-600 shadow-xs font-bold'
              : 'text-[#6E5364] hover:text-rose-500'
          }`}
        >
          <Palette size={13} />
          <span>审美调优</span>
        </button>
        <button
          onClick={() => setActiveTab('fix')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all ${
            activeTab === 'fix'
              ? 'bg-white text-rose-600 shadow-xs font-bold'
              : 'text-[#6E5364] hover:text-rose-500'
          }`}
        >
          <Wrench size={13} />
          <span>温柔排错</span>
        </button>
      </div>

      {/* 灵感卡片列表 */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {getList().map(item => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex flex-col justify-between rounded-2xl border border-rose-100/90 bg-white/80 p-3.5 text-left transition-all hover:border-rose-300 hover:bg-white hover:shadow-md hover:shadow-rose-100/40 active:scale-[0.98]"
          >
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-[10px] font-medium text-rose-400 opacity-80 group-hover:opacity-100">
                  一键发送 ➔
                </span>
              </div>
              <div className="text-xs font-bold text-[#33202C] group-hover:text-rose-600">
                {item.title}
              </div>
              <p className="mt-1 text-[11px] text-[#785E6E] line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-medium text-rose-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
