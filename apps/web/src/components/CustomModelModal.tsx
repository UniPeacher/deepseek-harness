import React, { useState } from 'react';
import { X, Plus, Trash2, Cpu, Globe, Key, ShieldCheck, Check, Sparkles, Layers } from 'lucide-react';
import { dsh } from '../api.ts';
import type { ModelItem } from '../types.ts';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableModels: ModelItem[];
  onRefreshModels: () => Promise<void>;
  onSelectModel: (model: ModelItem) => void;
  currentModelId: string;
}

const TEMPLATES = [
  {
    name: '硅基流动 (SiliconFlow)',
    route: 'siliconflow',
    baseURL: 'https://api.siliconflow.cn/v1',
    protocol: 'openai-completions' as const,
    models: [
      { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek V3 (SiliconFlow)', description: '极速开源旗舰' },
      { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1 (SiliconFlow)', description: '满血推理模型' },
    ],
  },
  {
    name: 'DeepSeek 官方 API',
    route: 'deepseek-direct',
    baseURL: 'https://api.deepseek.com/v1',
    protocol: 'openai-completions' as const,
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (官方)', description: '官方超低延迟' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (官方)', description: '官方深度思考' },
    ],
  },
  {
    name: 'OpenRouter 聚合平台',
    route: 'openrouter',
    baseURL: 'https://openrouter.ai/api/v1',
    protocol: 'openai-completions' as const,
    models: [
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat (OpenRouter)', description: '多线容灾' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: '代码与课件能力极强' },
    ],
  },
  {
    name: '本地 Ollama / vLLM',
    route: 'ollama-local',
    baseURL: 'http://127.0.0.1:11434/v1',
    protocol: 'openai-completions' as const,
    models: [
      { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B (本地)', description: '离线纯本地运行' },
    ],
  },
];

export const CustomModelModal: React.FC<CustomModelModalProps> = ({
  isOpen,
  onClose,
  availableModels,
  onRefreshModels,
  onSelectModel,
  currentModelId,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // 新增模型表单状态
  const [displayName, setDisplayName] = useState('');
  const [route, setRoute] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [protocol, setProtocol] = useState<'openai-completions' | 'anthropic-messages'>('openai-completions');
  const [modelId, setModelId] = useState('');
  const [modelName, setModelName] = useState('');
  const [modelDesc, setModelDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // 应用快速模板
  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setDisplayName(tpl.name);
    setRoute(tpl.route);
    setBaseURL(tpl.baseURL);
    setProtocol(tpl.protocol);
    if (tpl.models.length > 0) {
      setModelId(tpl.models[0].id);
      setModelName(tpl.models[0].name);
      setModelDesc(tpl.models[0].description);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!displayName.trim()) {
      setErrorMsg('请填写提供商名称（如：硅基流动/OpenAI）');
      return;
    }
    if (!baseURL.trim()) {
      setErrorMsg('请填写接口 BaseURL（如：https://api.siliconflow.cn/v1）');
      return;
    }
    if (!modelId.trim()) {
      setErrorMsg('请填写模型标识（如：deepseek-ai/DeepSeek-V3）');
      return;
    }

    const safeRoute = (route.trim() || displayName.trim())
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    setSaving(true);
    try {
      const res = await dsh.addCustomProvider({
        route: safeRoute,
        displayName: displayName.trim(),
        baseURL: baseURL.trim(),
        apiKey: apiKey.trim() || undefined,
        protocol,
        models: [
          {
            id: modelId.trim(),
            name: modelName.trim() || modelId.trim(),
            description: modelDesc.trim() || undefined,
          },
        ],
      });

      if (res.ok) {
        setSuccessMsg('🎉 模型接入成功并已保存！');
        await onRefreshModels();
        setTimeout(() => {
          setSuccessMsg('');
          setActiveTab('list');
        }, 1000);
      } else {
        setErrorMsg(res.error || '保存失败');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '网络或接口异常');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (confirm(`确定要移除提供商 [${providerId}] 吗？`)) {
      await dsh.deleteCustomProvider(providerId);
      await onRefreshModels();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 模态卡片 */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-rose-200/80 bg-[#FFFBFD] p-5 shadow-2xl overflow-hidden pb-safe">
        {/* 标题栏 */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-2xs">
              <Cpu size={16} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#33202C]">自定义 AI 智能模型与渠道</h3>
              <p className="text-[10px] text-rose-500">自由接入任何 OpenAI/Anthropic 兼容 API、自建中转与本地模型</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-100/60 active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab 导航 */}
        <div className="my-3 flex items-center rounded-2xl bg-rose-100/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 rounded-xl py-1.5 font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-white text-rose-600 font-bold shadow-2xs'
                : 'text-[#6E5364]'
            }`}
          >
            当前可用模型 ({availableModels.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('add')}
            className={`flex-1 rounded-xl py-1.5 font-medium transition-all ${
              activeTab === 'add'
                ? 'bg-white text-rose-600 font-bold shadow-2xs'
                : 'text-[#6E5364]'
            }`}
          >
            ➕ 接入新渠道 / 模型
          </button>
        </div>

        {/* 内容展示区 */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-xs">
          {activeTab === 'list' ? (
            <div className="space-y-2">
              <div className="text-[11px] text-stone-500">
                轻点模型即可将其立即设为当前会话的主力推理引擎：
              </div>

              {availableModels.map((m) => {
                const isCurrent = m.id === currentModelId;
                return (
                  <div
                    key={`${m.provider}-${m.id}`}
                    onClick={() => onSelectModel(m)}
                    className={`group relative flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition-all ${
                      isCurrent
                        ? 'border-rose-400 bg-rose-50/50 shadow-2xs'
                        : 'border-rose-100/80 bg-white hover:border-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 shadow-2xs border border-rose-100">
                        {m.id.includes('pro') ? '⚡' : '🚀'}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-bold text-[#33202C]">{m.name}</span>
                          <span className="shrink-0 rounded-md bg-stone-100 px-1.5 py-0.2 text-[9px] text-stone-500 font-mono">
                            {m.provider}
                          </span>
                        </div>
                        <div className="truncate text-[10px] text-stone-400 font-mono mt-0.5">
                          {m.id}
                        </div>
                        {m.description && (
                          <div className="text-[10px] text-stone-500 mt-0.5 line-clamp-1">
                            {m.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-semibold text-white shadow-2xs">
                          <Check size={12} />
                          <span>当前使用</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-stone-600 border border-stone-200 hover:border-rose-300 hover:text-rose-600 transition-all"
                        >
                          切换使用
                        </button>
                      )}

                      {/* 自定义非默认提供商支持删除 */}
                      {m.provider !== 'zle' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProvider(m.provider);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="删除该渠道"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => setActiveTab('add')}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-rose-300 p-3 text-xs font-semibold text-rose-600 hover:bg-rose-50/60 active:scale-[0.99] transition-all"
              >
                <Plus size={14} />
                <span>接入更多自定义模型 / 官方 API / 聚合平台</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              {/* 快速模版选择 */}
              <div>
                <label className="text-[11px] font-bold text-[#33202C] mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} className="text-rose-500" />
                  <span>常用渠道一键预填模版：</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="rounded-xl border border-rose-100 bg-white p-2 text-left hover:border-rose-300 hover:bg-rose-50/40 transition-all"
                    >
                      <div className="truncate text-xs font-semibold text-[#33202C]">{tpl.name}</div>
                      <div className="truncate text-[9px] text-stone-400 font-mono">{tpl.models[0].id}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 提供商名称 */}
              <div>
                <label className="mb-1 block font-bold text-[#33202C]">
                  渠道名称 / 备注 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="如：硅基流动、官方 DeepSeek、我的转发网关"
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs focus:border-rose-400 focus:outline-hidden"
                  required
                />
              </div>

              {/* 接口 BaseURL */}
              <div>
                <label className="mb-1 flex items-center justify-between font-bold text-[#33202C]">
                  <span className="flex items-center gap-1">
                    <Globe size={13} className="text-rose-500" />
                    <span>API BaseURL (接口基地址) <span className="text-rose-500">*</span></span>
                  </span>
                </label>
                <input
                  type="url"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder="如：https://api.siliconflow.cn/v1"
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-mono focus:border-rose-400 focus:outline-hidden"
                  required
                />
              </div>

              {/* API Key */}
              <div>
                <label className="mb-1 flex items-center justify-between font-bold text-[#33202C]">
                  <span className="flex items-center gap-1">
                    <Key size={13} className="text-rose-500" />
                    <span>API Key (密钥 / Token)</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">留空即不带认证头</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-mono focus:border-rose-400 focus:outline-hidden"
                />
                <div className="mt-1 text-[9px] text-stone-400 flex items-center gap-1">
                  <ShieldCheck size={11} className="text-green-600" />
                  <span>密钥由后端安全加密存储，不暴露在任何网页代码中</span>
                </div>
              </div>

              {/* 协议类型 */}
              <div>
                <label className="mb-1 block font-bold text-[#33202C]">协议规范</label>
                <div className="flex gap-2">
                  <label className="flex flex-1 items-center gap-2 rounded-xl border border-rose-200 bg-white p-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="protocol"
                      checked={protocol === 'openai-completions'}
                      onChange={() => setProtocol('openai-completions')}
                    />
                    <span>OpenAI 兼容 (Chat Completions)</span>
                  </label>
                  <label className="flex flex-1 items-center gap-2 rounded-xl border border-rose-200 bg-white p-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="protocol"
                      checked={protocol === 'anthropic-messages'}
                      onChange={() => setProtocol('anthropic-messages')}
                    />
                    <span>Anthropic (Messages)</span>
                  </label>
                </div>
              </div>

              {/* 接入的模型 */}
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-3 space-y-2">
                <div className="text-xs font-bold text-[#33202C] flex items-center gap-1">
                  <Layers size={13} className="text-rose-500" />
                  <span>模型详情</span>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-stone-600 font-medium">
                    模型唯一 ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="如：deepseek-ai/DeepSeek-V3 或 gpt-4o"
                    className="w-full rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-mono focus:border-rose-400 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-stone-600 font-medium">界面展示别名</label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="如：DeepSeek V3 (硅基满血)"
                    className="w-full rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-xs focus:border-rose-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* 错误或成功提示 */}
              {errorMsg && (
                <div className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl bg-green-50 p-2.5 text-xs text-green-700 border border-green-200">
                  {successMsg}
                </div>
              )}

              {/* 提交按钮 */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="flex-1 rounded-xl border border-stone-200 bg-white py-2 font-semibold text-stone-600 hover:bg-stone-50"
                >
                  返回列表
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 py-2 font-semibold text-white shadow-xs hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {saving ? '保存中...' : '确认接入并保存'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
