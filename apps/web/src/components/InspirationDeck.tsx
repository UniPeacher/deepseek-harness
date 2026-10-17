import React, { useState } from 'react';
import { Sparkles, Compass, BookOpen, Wand2, ArrowRight } from 'lucide-react';
import type { InspirationPrompt } from '../types.ts';

// 🌍 1. 地理微课交互课件（专为地理师范生打造）
const GEO_PROMPTS: InspirationPrompt[] = [
  {
    id: 'geo-1',
    category: 'geo',
    emoji: '🌀',
    title: '热力环流与海陆风动态模拟器',
    description: '可拖拽调节陆地与海洋冷热，动态演示等压面弯曲与气流闭合环流',
    prompt: `你是一位中学地理教学课件专家。请为我编写一个单文件【热力环流与海陆风交互演示课件】（HTML/CSS/JS 全集成）：
1. 核心交互：包含“白天（陆热海冷）/ 夜晚（陆冷海热）”切换按钮，或冷热温度滑动条；
2. 动态视觉：用柔和优美的粒子/箭头流线动态展现空气垂直上升下沉与水平流动（冷下沉高压、热上升低压）；
3. 知识图解：可切换显示“等压面弯曲形态（高凸低凹）”以及对应的近地面风向（海风/陆风）；
4. 教学配套：卡片下方带考点记忆口诀（如“热升冷沉、高高低低”）；
5. 适配手机全屏与触屏操作，粉白清爽现代手账画风，适合在试讲或微课比赛中直接全屏演示。`,
    tags: ['高中必修一', '动态流线', '等压面', '试讲教具'],
  },
  {
    id: 'geo-2',
    category: 'geo',
    emoji: '🏔️',
    title: '等高线地形图 3D 切片与剖面仪',
    description: '山顶、山脊、山谷、鞍部、陡崖的可视化切片与实时地形剖面线',
    prompt: `请为我设计并编写一个【等高线与地形剖面图交互教学课件】（单文件 HTML/CSS/JS）：
1. 界面绘制一个经典山地地形（包含山顶、山脊、山谷、鞍部、陡崖）；
2. 交互功能：拖动“海拔切片高度”滑块，动态展示水平切面与闭合等高线的生成过程；
3. 部位判读：点击任意部位（如山脊、山谷），高亮显示并弹出判读口诀（“凸低为脊，凸高为谷”）；
4. 地形剖面线：支持沿 AB 虚线生成实时的垂直剖面变化折线；
5. 采用温暖清新、富有师范教育美感的手账 UI，能直接在手机浏览器中全屏触控演示。`,
    tags: ['初高中衔接', '等高线判读', '剖面图', '空间建构'],
  },
  {
    id: 'geo-3',
    category: 'geo',
    emoji: '🌧️',
    title: '冷锋与暖锋过境天气演变模拟',
    description: '冷暖气团移动对抗、锋面倾斜、降水区位置及过境前后气温气压仪表',
    prompt: `请为我编写一个中学地理【锋面系统与天气动态交互微课】（单文件 HTML/CSS/JS）：
1. 支持一键切换“冷锋”与“暖锋”两种模式；
2. 动态动画：冷暖气团的主动移动与被迫抬升，清晰标出锋面倾斜方向与降水区（冷锋雨后/暖锋雨前）；
3. 城市天气站仪表盘：点击“推进时间（过境前 → 过境时 → 过境后）”，城市仪表盘的气温、气压、阴晴降水指标随之联动跳变；
4. 试讲提问卡：右侧折叠一个小卡片，列出课堂启发性提问清单；
5. 全面屏适配，交互顺畅丝滑，画风温柔柔和。`,
    tags: ['锋面天气', '过境前后对比', '动态降水', '微课神器'],
  },
  {
    id: 'geo-4',
    category: 'geo',
    emoji: '☀️',
    title: '太阳直射点与气压带风带季节移动',
    description: '拖动季节滑块（二分二至），气压带风带随太阳直射点纬度南北移动',
    prompt: `请为我制作一个【太阳直射点移动与三圈环流季节位移】教学演示单页（单文件 HTML/CSS/JS）：
1. 拖动时间滑块（春分 → 夏至 → 秋分 → 冬至），左侧地球仪的太阳直射纬线动态上下滑动；
2. 右侧全球气压带风带（赤道低压带、副热带高压带、信风带、西风带）随直射点同步发生 5°~10° 的南北季节移动；
3. 地中海气候成因联动：点击“地中海地区”，直观显示夏受副高控制干燥少雨、冬受西风控制温和湿润的切换；
4. 界面温润雅致，排版清晰，专为中学地理课堂交互演示设计。`,
    tags: ['气压带风带', '气候成因', '季节移动', '核心素养'],
  },
];

// 📝 2. 地理教学设计与说课试讲工作台
const LESSON_PROMPTS: InspirationPrompt[] = [
  {
    id: 'lesson-1',
    category: 'lesson',
    emoji: '📋',
    title: '新课标地理教学设计（教案）生成',
    description: '一键生成紧扣新课标四大核心素养的标准教学设计，含情境与活动设计',
    prompt: `你是一位特级地理教师兼师范生教学导师。请针对高中地理【人教版必修一：常见地貌类型（河流地貌）】为我撰写一份完整的【新课标地理教学设计】：
包含：
一、 课题与课标要求
二、 核心素养目标（人地协调观、综合思维、区域认知、地理实践力的具体可衡量表述）
三、 教学重难点与突破策略
四、 教学过程（1. 真实生活情境导入；2. 探究任务一：溯源侵蚀与V型谷；3. 探究任务二：侧蚀曲流与牛轭湖；4. 探究任务三：堆积地貌与冲积扇、三角洲）
五、 板书设计草图（结构化思维导图排版）
六、 课堂巩固检测与课后实践任务单。
格式要极其规范专业，可直接作为教学技能大赛或试讲评比的标准教案！`,
    tags: ['新课标教案', '四大素养', '板书设计', '比赛标准'],
  },
  {
    id: 'lesson-2',
    category: 'lesson',
    emoji: '🎤',
    title: '10~15 分钟无生试讲逐字台词稿',
    description: '包含互动停顿、启发提问、板书时机和学生回答预设的标准试讲台词',
    prompt: `请为我编写一份 10~15 分钟【无生试讲逐字台词脚本】。
课题：【高中地理必修一：大气的受热过程（太阳暖大地、大地暖大气、大气还大地）】。
要求：
1. 语言亲切生动、抑扬顿挫，符合优秀师范生教态；
2. 详细标注【动作/眼神/板书时机/停顿点】（如：【转身板书】、【微笑环视、稍作停顿】）；
3. 包含生活化情境导入（如：为什么山顶比山脚冷？为什么月球昼夜温差几百摄氏度而地球很宜居？）；
4. 包含 3 次精彩的生生/师生互动问答预设及教师启发性点评；
5. 最后 1 分钟精炼总结与升华（温室效应与低碳人地协调观）。`,
    tags: ['教资面试', '试讲逐字稿', '课堂互动', '高分台风'],
  },
  {
    id: 'lesson-3',
    category: 'lesson',
    emoji: '🧭',
    title: '中学地理研学旅行方案策划',
    description: '设计基于真实地域的研学旅行手册、考察路线与探究实践任务单',
    prompt: `请帮我策划一份中学地理【研学旅行活动方案与学生探究手册】。
地点：以【喀斯特地貌与地质考察（如贵州织金洞或桂林阳朔）】为主题。
内容包括：
1. 研学目标与学科素养关联（突出地理实践力）；
2. 3 天实地考察路线规划与安全预案；
3. 沿途学生探究任务单（溶洞钟乳石测量、地下暗河观察、峰林峰丛对比记录表）；
4. 研学成果展示方式（手账汇报、微视频、考察报告评价量规）。`,
    tags: ['地理实践力', '研学手册', '野外考察', '探究任务'],
  },
];

// ✨ 3. 经典萌系小工具起手式
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
    title: '马卡龙穿搭与配色生成器',
    description: '点击一键随机生成一组马卡龙少女系配色方案并支持复制色号',
    prompt: '帮我做一个马卡龙色系的美甲与日常穿搭色卡生成器。每点一次按钮，随机生成 5 个互相搭配的温柔少女系色块，显示 HEX 颜色值并支持一键复制到剪贴板，界面要非常软萌可爱，像甜品店菜单一样精致！',
    tags: ['马卡龙配色', '色卡工具', '一键复制'],
  },
];

interface InspirationDeckProps {
  onSelectPrompt: (promptText: string) => void;
  onOpenPromptBuilder: () => void;
}

export const InspirationDeck: React.FC<InspirationDeckProps> = ({
  onSelectPrompt,
  onOpenPromptBuilder,
}) => {
  const [activeTab, setActiveTab] = useState<'geo' | 'lesson' | 'starter'>('geo');

  const getList = () => {
    switch (activeTab) {
      case 'geo':
        return GEO_PROMPTS;
      case 'lesson':
        return LESSON_PROMPTS;
      case 'starter':
      default:
        return STARTER_PROMPTS;
    }
  };

  return (
    <div className="flex flex-col space-y-3 py-1">
      {/* 头部专属欢迎卡片 */}
      <div className="relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-br from-[#FFF5F8] via-white to-pink-50/70 p-3.5 sm:p-5 shadow-2xs">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/80 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-rose-600">
              <span>🌸</span>
              <span>地理师范专属 · 灵感造物工坊</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#33202C] tracking-wide">
              今天想为地理课堂点亮什么新灵感？
            </h2>
            <p className="text-[11px] sm:text-xs text-[#6B5061] leading-relaxed max-w-md">
              一键生成能用手指交互的动态地理微课件，或秒出紧扣四大核心素养的标准试讲台本与教案。
            </p>
          </div>

          <button
            onClick={onOpenPromptBuilder}
            className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:brightness-105 active:scale-95 transition-all"
          >
            <Wand2 size={13} />
            <span>智能提词魔杖</span>
          </button>
        </div>
      </div>

      {/* 分类药丸切换器 */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveTab('geo')}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'geo'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-2xs'
              : 'bg-white/80 text-[#6B5061] border border-rose-100 hover:bg-white'
          }`}
        >
          <Compass size={12} />
          <span>🌍 交互课件 ({GEO_PROMPTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('lesson')}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'lesson'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-2xs'
              : 'bg-white/80 text-[#6B5061] border border-rose-100 hover:bg-white'
          }`}
        >
          <BookOpen size={12} />
          <span>📝 试讲教案 ({LESSON_PROMPTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('starter')}
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'starter'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-2xs'
              : 'bg-white/80 text-[#6B5061] border border-rose-100 hover:bg-white'
          }`}
        >
          <Sparkles size={12} />
          <span>✨ 趣味手账 ({STARTER_PROMPTS.length})</span>
        </button>
      </div>

      {/* 预设卡片列表 */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {getList().map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group relative flex flex-col justify-between rounded-2xl border border-rose-100/90 bg-white/90 p-3.5 shadow-2xs transition-all hover:border-rose-300 hover:shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-base">
                  {item.emoji}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500">
                  <ArrowRight size={14} />
                </span>
              </div>

              <h3 className="mt-2 text-xs sm:text-sm font-bold text-[#33202C] tracking-wide">
                {item.title}
              </h3>
              <p className="mt-1 text-[11px] text-[#8C6D80] leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-rose-50/80 px-2 py-0.5 text-[10px] font-medium text-rose-600 border border-rose-100/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
