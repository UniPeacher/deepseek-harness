import React, { useState, useEffect, useRef } from 'react'
import { Header } from './components/Header.tsx'
import { Sidebar } from './components/Sidebar.tsx'
import { InspirationDeck } from './components/InspirationDeck.tsx'
import { MessageItemCard } from './components/MessageItemCard.tsx'
import { InputBar } from './components/InputBar.tsx'
import { LivePreviewDrawer } from './components/LivePreviewDrawer.tsx'
import { SettingsModal } from './components/SettingsModal.tsx'
import { PromptBuilderModal } from './components/PromptBuilderModal.tsx'
import { dsh } from './api.ts'
import type { MessageItem, SessionItem, ConnectionStatus } from './types.ts'

export function App() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('')
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')

  // 模态窗与抽屉状态
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [promptBuilderOpen, setPromptBuilderOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const config = dsh.getConfig()

  // 1. 监听连接状态
  useEffect(() => {
    return dsh.onStatusChange((status) => {
      setConnectionStatus(status)
    })
  }, [])

  // 2. 初始化加载会话列表
  const refreshSessions = async () => {
    try {
      const list = await dsh.listSessions()
      setSessions(list)
      if (list.length > 0 && !currentSessionId) {
        setCurrentSessionId(list[0].sessionId)
      } else if (list.length === 0) {
        const newId = await dsh.createSession()
        setCurrentSessionId(newId)
        setSessions([{ sessionId: newId, title: '新灵感会话', updatedAt: Date.now() }])
      }
    } catch (err) {
      console.error('Failed to list sessions:', err)
    }
  }

  useEffect(() => {
    refreshSessions()
  }, [])

  // 3. 监听当前会话的实时流
  useEffect(() => {
    if (!currentSessionId) return

    setMessages([])
    setLoading(false)

    const unsubscribe = dsh.followSession(currentSessionId, {
      onMessage: (msg) => {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id)) return prev
          return [...prev, msg]
        })
      },
      onAppendText: (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.isStreaming) {
            return [
              ...prev.slice(0, -1),
              { ...last, text: last.text + chunk },
            ]
          } else {
            return [
              ...prev,
              {
                id: `stream-${Date.now()}`,
                role: 'assistant',
                text: chunk,
                isStreaming: true,
              },
            ]
          }
        })
      },
      onThinking: (chunk) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.isStreaming) {
            return [
              ...prev.slice(0, -1),
              { ...last, thinking: (last.thinking || '') + chunk },
            ]
          }
          return prev
        })
      },
      onToolCall: (call) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant') {
            const existingCalls = last.toolCalls || []
            return [
              ...prev.slice(0, -1),
              { ...last, toolCalls: [...existingCalls, call] },
            ]
          }
          return prev
        })
      },
      onToolOutput: (name, output) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.role === 'assistant' && last.toolCalls) {
            const updated = last.toolCalls.map(tc =>
              tc.name === name ? { ...tc, output, status: 'completed' as const } : tc,
            )
            return [...prev.slice(0, -1), { ...last, toolCalls: updated }]
          }
          return prev
        })
      },
      onTurnEnd: () => {
        setLoading(false)
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (last && last.isStreaming) {
            return [...prev.slice(0, -1), { ...last, isStreaming: false }]
          }
          return prev
        })
      },
      onError: (err) => {
        console.error('Session follow error:', err)
        setLoading(false)
      },
    })

    return () => unsubscribe()
  }, [currentSessionId])

  // 4. 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 5. 新建会话
  const handleNewSession = async () => {
    try {
      const newId = await dsh.createSession();
      const newSession: SessionItem = {
        sessionId: newId,
        title: '新灵感项目',
        updatedAt: Date.now(),
      };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newId);
    } catch (err) {
      console.error('Create session error:', err);
    }
  };

  // 5.1 重命名会话
  const handleRenameSession = async (sessionId: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.sessionId === sessionId ? { ...s, title: newTitle } : s))
    );
    await dsh.renameSession(sessionId, newTitle);
  };

  // 5.2 分叉会话 (Fork)
  const handleForkSession = async (sessionId: string) => {
    try {
      setLoading(true);
      const newId = await dsh.forkSession(sessionId);
      const source = sessions.find((s) => s.sessionId === sessionId);
      const newSession: SessionItem = {
        sessionId: newId,
        title: source ? `${source.title} (副本)` : '分叉灵感项目',
        updatedAt: Date.now(),
      };
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newId);
      setLoading(false);
    } catch (err: any) {
      console.error('Fork session error:', err);
      setLoading(false);
    }
  };

  // 5.3 删除/归档会话
  const handleDeleteSession = async (sessionId: string) => {
    await dsh.deleteSession(sessionId);
    const remaining = sessions.filter((s) => s.sessionId !== sessionId);
    setSessions(remaining);

    // 如果删除的是当前打开的会话，自动切换到下一个或新建
    if (sessionId === currentSessionId) {
      if (remaining.length > 0) {
        setCurrentSessionId(remaining[0].sessionId);
      } else {
        await handleNewSession();
      }
    }
  };

  // 5.4 置顶/取消置顶会话
  const handleTogglePinSession = async (sessionId: string) => {
    await dsh.togglePinSession(sessionId);
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.sessionId === sessionId ? { ...s, isPinned: !s.isPinned } : s
      );
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
    });
  };

  // 6. 发送消息
  const handleSend = async (customText?: string) => {
    const textToSend = (customText !== undefined ? customText : input).trim()
    if (!textToSend || loading || !currentSessionId) return

    setInput('')
    setLoading(true)

    // 乐观添加用户气泡
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: textToSend,
        timestamp: Date.now(),
      },
    ])

    try {
      await dsh.sendPrompt(currentSessionId, textToSend)
    } catch (err: any) {
      console.error('Send prompt error:', err)
      setLoading(false)
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ 发送失败: ${err.message || '请检查网络或后端地址配置'}`,
          timestamp: Date.now(),
        },
      ])
    }
  }

  // 7. 判断是否有可预览的代码
  const hasPreviewableCode = messages.some(
    m =>
      m.role === 'assistant' &&
      (m.text.includes('<html') ||
        m.text.includes('<!DOCTYPE') ||
        m.text.includes('```html') ||
        (m.toolCalls && m.toolCalls.some(tc => tc.name.includes('write')))),
  )

  const activeSession = sessions.find(s => s.sessionId === currentSessionId)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#FFF9FB] text-[#33202C]">
      {/* 顶部导航 */}
      <Header
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenPreview={() => setPreviewOpen(true)}
        connectionStatus={connectionStatus}
        hasPreviewableCode={hasPreviewableCode}
        activeSessionTitle={activeSession?.title || '新灵感会话'}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
      />

      {/* 侧滑会话手账抽屉 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewSession={handleNewSession}
        onRenameSession={handleRenameSession}
        onForkSession={handleForkSession}
        onDeleteSession={handleDeleteSession}
        onTogglePinSession={handleTogglePinSession}
        serverUrl={config.serverUrl}
      />

      {/* 消息滚动流展示区 */}
      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          {/* 无消息时展示新手灵感引导中枢 */}
          {messages.length === 0 ? (
            <InspirationDeck
              onSelectPrompt={text => handleSend(text)}
              onOpenPromptBuilder={() => setPromptBuilderOpen(true)}
            />
          ) : (
            <div className="space-y-1">
              {messages.map(msg => (
                <MessageItemCard
                  key={msg.id}
                  message={msg}
                  onSelectSuggestion={sug => handleSend(sug)}
                  onOpenPreview={() => setPreviewOpen(true)}
                />
              ))}
            </div>
          )}

          {/* 思考中加载指示器 */}
          {loading && (
            <div className="my-3 flex items-center gap-2 pl-10 text-xs text-rose-500 animate-pulse">
              <span className="text-base">🌸</span>
              <span>导师正在为你细致雕琢与编写中...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 底部输入中枢 */}
      <InputBar
        input={input}
        setInput={setInput}
        onSend={() => handleSend()}
        loading={loading}
        onOpenPromptBuilder={() => setPromptBuilderOpen(true)}
        onQuickPrompt={text => handleSend(text)}
      />

      {/* 实时预览全屏抽屉 */}
      <LivePreviewDrawer
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        messages={messages}
      />

      {/* 设置与套壳 APK 配置弹窗 */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfigSaved={() => refreshSessions()}
      />

      {/* 灵感提词公式生成弹窗 */}
      <PromptBuilderModal
        isOpen={promptBuilderOpen}
        onClose={() => setPromptBuilderOpen(false)}
        onSubmit={prompt => handleSend(prompt)}
      />
    </div>
  )
}

export default App
