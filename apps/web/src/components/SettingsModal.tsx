import React, { useState, useEffect } from 'react'
import { X, Server, Key, FolderGit, Check, Wifi, AlertCircle, Smartphone, HelpCircle } from 'lucide-react'
import { dsh } from '../api.ts'
import type { ConnectionConfig } from '../types.ts'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfigSaved: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<ConnectionConfig>({
    serverUrl: '',
    token: '',
    workspaceDir: '/root/workspace',
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; latency: number; error?: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'config' | 'guide'>('config')

  useEffect(() => {
    if (isOpen) {
      const current = dsh.getConfig()
      setConfig(current)
      setTestResult(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    dsh.saveConfig(config)
    onConfigSaved()
    onClose()
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    dsh.saveConfig(config)
    const result = await dsh.testConnection()
    setTestResult(result)
    setTesting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* 设置主卡片 */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-rose-200/80 bg-[#FFFBFD] p-5 shadow-2xl overflow-hidden pb-safe">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs">
              ⚙️
            </span>
            <div>
              <h3 className="text-sm font-bold text-[#33202C]">连接设置 & 套壳 APK 适配</h3>
              <p className="text-[10px] text-rose-500">配置上海服务器地址与手机离线访问凭据</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-100/60 active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab 切换 */}
        <div className="my-3 flex items-center rounded-xl bg-rose-100/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex-1 rounded-lg py-1.5 font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-white text-rose-600 font-bold shadow-xs'
                : 'text-[#6E5364]'
            }`}
          >
            服务器与网络配置
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 rounded-lg py-1.5 font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-rose-600 font-bold shadow-xs'
                : 'text-[#6E5364]'
            }`}
          >
            📱 手机 APK 使用指南
          </button>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {activeTab === 'config' ? (
            <>
              {/* 服务器地址 */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 font-bold text-[#33202C]">
                  <Server size={14} className="text-rose-500" />
                  <span>DeepSeek Harness 后端地址</span>
                </label>
                <input
                  type="text"
                  value={config.serverUrl}
                  onChange={e => setConfig({ ...config, serverUrl: e.target.value })}
                  placeholder="留空即默认同源，或填：http://124.71.197.189:3080"
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 font-mono text-xs text-[#33202C] placeholder:text-stone-300 focus:border-rose-400 focus:outline-hidden"
                />
                <p className="mt-1 text-[10px] text-stone-400 leading-relaxed">
                  在手机套壳 APK 中使用时，填入你在上海机器上部署的公网 IP 和端口（例如 http://124.71.197.189:3080）。
                </p>
              </div>

              {/* 访问令牌 Token */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 font-bold text-[#33202C]">
                  <Key size={14} className="text-rose-500" />
                  <span>访问鉴权 Token (可选)</span>
                </label>
                <input
                  type="password"
                  value={config.token}
                  onChange={e => setConfig({ ...config, token: e.target.value })}
                  placeholder="DeepSeek Harness 启动打印的 ?token=..."
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 font-mono text-xs text-[#33202C] placeholder:text-stone-300 focus:border-rose-400 focus:outline-hidden"
                />
                <p className="mt-1 text-[10px] text-stone-400 leading-relaxed">
                  如果服务端开启了认证，填入 launchToken。保存在手机本地后，打开 APK 自动登录。
                </p>
              </div>

              {/* 工作区目录 */}
              <div>
                <label className="mb-1 flex items-center gap-1.5 font-bold text-[#33202C]">
                  <FolderGit size={14} className="text-rose-500" />
                  <span>代码工作区根目录 (Workspace CWD)</span>
                </label>
                <input
                  type="text"
                  value={config.workspaceDir}
                  onChange={e => setConfig({ ...config, workspaceDir: e.target.value })}
                  placeholder="/root/workspace"
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 font-mono text-xs text-[#33202C] placeholder:text-stone-300 focus:border-rose-400 focus:outline-hidden"
                />
              </div>

              {/* 连通性测试按钮与反馈 */}
              <div className="rounded-2xl border border-rose-100 bg-[#FFF7F9] p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#33202C] flex items-center gap-1">
                    <Wifi size={13} className="text-rose-400" />
                    <span>连通性诊断</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="rounded-xl bg-white px-3 py-1 text-xs font-semibold text-rose-600 border border-rose-200 hover:bg-rose-50 active:scale-95 disabled:opacity-50"
                  >
                    {testing ? '正在测试...' : '测试网络连接'}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`rounded-xl p-2.5 text-[11px] leading-relaxed flex items-start gap-1.5 ${
                      testResult.ok
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {testResult.ok ? (
                      <>
                        <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">连接成功！</span>
                          <span> 服务端响应正常，延迟约 {testResult.latency} ms。</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">连接失败：</span>
                          <span>{testResult.error || '无法连通指定服务器，请检查IP与端口'}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-3 leading-relaxed text-[#543D4C]">
              <div className="rounded-2xl border border-rose-100 bg-white p-3 space-y-2">
                <div className="font-bold text-[#33202C] flex items-center gap-1.5">
                  <Smartphone size={15} className="text-rose-500" />
                  <span>方案一：免安装 PWA 全屏沉浸使用（推荐）</span>
                </div>
                <p className="text-[11px]">
                  用手机浏览器（如 Safari、Chrome、Edge）打开本网站后，点击浏览器底部的【分享】或右上角【三点菜单】，选择【添加到主屏幕】。添加后手机桌面会出现专属粉嫩图标，打开直接全屏运行，手势与体验完全等同原生 App！
                </p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-white p-3 space-y-2">
                <div className="font-bold text-[#33202C] flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-rose-500" />
                  <span>方案二：Android 套壳 APK 打包</span>
                </div>
                <p className="text-[11px]">
                  1. 使用任何在线 Web-to-APK 工具、Capacitor 或 Android Studio 创建一个简单的 WebView 壳。
                  <br />
                  2. 将 WebView 加载地址设置为：<code>http://124.71.197.189:3080</code>。
                  <br />
                  3. 本前端已全面适配 <code>viewport-fit=cover</code> 和全面屏安全区，无黑边无白条，流畅丝滑。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 底部保存按钮 */}
        <div className="pt-3 border-t border-rose-100 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-rose-200 bg-white py-3 text-xs font-semibold text-stone-600 active:scale-95"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-xs font-semibold text-white shadow-md shadow-rose-300/40 active:scale-95"
          >
            保存并应用配置
          </button>
        </div>
      </div>
    </div>
  )
}
