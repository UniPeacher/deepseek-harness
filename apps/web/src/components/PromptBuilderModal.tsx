import React, { useState } from 'react';
import { X, Wand2, Sparkles, Check } from 'lucide-react';

interface PromptBuilderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => void
}

const APP_TYPES = [
  { label: '🌍 热力环流与海陆风模拟器', val: '中学地理【热力环流与海陆风交互演示微课件】，支持冷热切换、动态流线粒子与等压面弯曲' },
  { label: '🏔️ 等高线切片与剖面仪', val: '地理【等高线地形图切片与剖面分析仪】，支持海拔高度滑动切片、地形部位判读与实时地形剖面线' },
  { label: '🌧️ 冷暖锋面天气演变模拟', val: '中学地理【冷锋与暖锋天气系统模拟器】，包含锋面倾斜移动、降水区域对比及气温气压仪表联动' },
  { label: '☀️ 太阳直射与气压带风带移动', val: '高中地理【太阳直射点与气压带风带季节移动课件】，随二分二至滑块直观展示全球风带季节摆动' },
  { label: '📋 新课标地理教学设计', val: '紧扣新课标四大核心素养的标准高中地理教案，含情境导入、探究任务单与板书设计' },
  { label: '🎤 15分钟无生试讲逐字台本', val: '高中地理优质课 15 分钟试讲逐字稿，详细标明教态动作、板书时机、停顿与启发性师生问答' },
  { label: '💖 恋爱/纪念日倒数卡', val: '恋爱/重要纪念日倒数日小单页，带浪漫星光微粒动效' },
  { label: '🧸 每日心情盲盒翻牌', val: '今日好运盲盒翻牌器，点击有丝滑 3D 翻牌动画与治愈每日寄语' },
]

const STYLES = [
  { label: '🌸 奶油粉白 & 草莓牛奶', val: '草莓牛奶与香草奶油粉白色调，柔和漫反射大圆角阴影' },
  { label: '🍰 法式复古 & 温暖奶咖', val: '法式复古与温暖焦糖奶咖色调，手写衬线标题搭配拍立得留白' },
  { label: '🎀 柔和马卡龙三色渐变', val: '马卡龙粉、薄荷绿与奶黄柔和渐变，甜品店菜单般的清爽元气' },
  { label: '🦄 赛博甜心 & 梦幻紫调', val: '梦幻薰衣草浅紫搭配微光发光字，轻科技少女感' },
]

const FEATURES = [
  { label: '✨ 动态粒子与风向/洋流流线', val: '使用 Canvas 或 CSS 绘制生动柔和的流线粒子动效，直观展示大气与洋流空间流动' },
  { label: '🎛️ 触控交互滑块（直射点/海拔/冷热）', val: '加入支持手指拖动的精巧滑块，动态响应参数变化并联动图表' },
  { label: '💡 考点记忆口诀与速查标签', val: '在界面显眼处标注地理高频口诀（如“凸高为低、热升冷沉”），兼具复习记忆功能' },
  { label: '📱 手机全面屏全屏授课适配', val: '完全适配手机竖屏与套壳 APK 全面屏，避开顶部刘海与底部手势条，适合拿在手上展示' },
  { label: '💾 本地保存与自定义题库', val: '使用 localStorage 保存教学记录或测试数据，刷新页面不丢失' },
]

export const PromptBuilderModal: React.FC<PromptBuilderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedType, setSelectedType] = useState(APP_TYPES[0].val)
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].val)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([FEATURES[0].val, FEATURES[1].val])
  const [customNote, setCustomNote] = useState('')

  if (!isOpen) return null

  const toggleFeature = (val: string) => {
    setSelectedFeatures(prev =>
      prev.includes(val) ? prev.filter(f => f !== val) : [...prev, val],
    )
  }

  const handleGenerate = () => {
    const finalPrompt = `导师你好！我想做一个【${selectedType}】。
视觉风格希望是【${selectedStyle}】。
核心功能与亮点包括：
${selectedFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}
${customNote.trim() ? `另外我还希望：${customNote.trim()}` : ''}

请为我一次性编写出结构清晰、注释详尽的单文件 HTML/CSS/JavaScript 代码，能直接在手机浏览器或套壳 APK 里面全屏运行与触控交互！`

    onSubmit(finalPrompt)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 抽屉卡片 */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-rose-200/80 bg-[#FFFBFD] p-5 shadow-2xl overflow-hidden pb-safe">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-400 to-pink-500 text-white shadow-xs">
              <Wand2 size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#33202C]">灵感魔杖 · 提词公式生成器</h3>
              <p className="text-[10px] text-rose-500">点选你的想法，导师自动为你生成最精准的造物指令</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-100/60 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* 表单内容滚动区 */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
          {/* 步骤 1：你想做什么小工具？ */}
          <div>
            <div className="mb-2 text-xs font-bold text-[#33202C] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">1</span>
              <span>我想造一个什么小工具？</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {APP_TYPES.map((t, idx) => {
                const isSelected = selectedType === t.val
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedType(t.val)}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all ${
                      isSelected
                        ? 'border border-rose-400 bg-white font-semibold text-rose-600 shadow-xs'
                        : 'border border-rose-100/80 bg-white/60 text-[#543D4C] hover:bg-white'
                    }`}
                  >
                    <span>{t.label}</span>
                    {isSelected && <Check size={14} className="text-rose-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 步骤 2：心仪的视觉风格？ */}
          <div>
            <div className="mb-2 text-xs font-bold text-[#33202C] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">2</span>
              <span>想要什么梦幻视觉风格？</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {STYLES.map((s, idx) => {
                const isSelected = selectedStyle === s.val
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedStyle(s.val)}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all ${
                      isSelected
                        ? 'border border-rose-400 bg-white font-semibold text-rose-600 shadow-xs'
                        : 'border border-rose-100/80 bg-white/60 text-[#543D4C] hover:bg-white'
                    }`}
                  >
                    <span>{s.label}</span>
                    {isSelected && <Check size={14} className="text-rose-500 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 步骤 3：有哪些亮点功能？ */}
          <div>
            <div className="mb-2 text-xs font-bold text-[#33202C] flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">3</span>
              <span>想要包含哪些贴心亮点？（可多选）</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {FEATURES.map((f, idx) => {
                const isChecked = selectedFeatures.includes(f.val)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleFeature(f.val)}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-left text-xs transition-all ${
                      isChecked
                        ? 'border border-rose-400 bg-rose-50/70 font-semibold text-rose-600'
                        : 'border border-rose-100/80 bg-white/60 text-[#543D4C] hover:bg-white'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-md border text-[10px] ${
                        isChecked
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : 'border-stone-300 bg-white text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 补充想法 */}
          <div>
            <div className="mb-1 text-[11px] font-medium text-[#7A5F71]">
              还有其他小要求？（可选输入）
            </div>
            <input
              type="text"
              value={customNote}
              onChange={e => setCustomNote(e.target.value)}
              placeholder="例如：背景想要粉色樱花瓣飘落、按钮换成猫爪形状..."
              className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs text-[#33202C] placeholder:text-stone-300 focus:border-rose-400 focus:outline-hidden"
            />
          </div>
        </div>

        {/* 底部生成按钮 */}
        <div className="pt-3 border-t border-rose-100">
          <button
            onClick={handleGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-rose-300/40 transition-all hover:brightness-105 active:scale-[0.98]"
          >
            <Sparkles size={16} />
            <span>✨ 一键生成绝佳提示词并发送</span>
          </button>
        </div>
      </div>
    </div>
  )
}
