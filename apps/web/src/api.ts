import type { ConnectionConfig, ConnectionStatus, MessageItem, SessionItem, ToolCallItem } from './types.ts'

class DshClient {
  private rpcSeq = 0
  private statusListeners: Set<(status: ConnectionStatus) => void> = new Set()
  private currentStatus: ConnectionStatus = 'disconnected'

  constructor() {
    this.initFromUrlParams()
  }

  // 1. 初始化并持久化配置 (支持手机套壳与网页直连)
  private initFromUrlParams(): void {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const server = params.get('server')
    if (token) {
      localStorage.setItem('dsh_token', token)
    }
    if (server) {
      localStorage.setItem('dsh_server_url', server)
    }
  }

  public getConfig(): ConnectionConfig {
    if (typeof window === 'undefined') {
      return { serverUrl: '', token: '', workspaceDir: '/root/workspace' }
    }
    return {
      serverUrl: localStorage.getItem('dsh_server_url') || '',
      token: localStorage.getItem('dsh_token') || '',
      workspaceDir: localStorage.getItem('dsh_workspace') || '/root/workspace',
    }
  }

  public saveConfig(config: Partial<ConnectionConfig>): void {
    if (typeof window === 'undefined') return
    if (config.serverUrl !== undefined) {
      localStorage.setItem('dsh_server_url', config.serverUrl.trim().replace(/\/+$/, ''))
    }
    if (config.token !== undefined) {
      localStorage.setItem('dsh_token', config.token.trim())
    }
    if (config.workspaceDir !== undefined) {
      localStorage.setItem('dsh_workspace', config.workspaceDir.trim())
    }
  }

  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.add(listener)
    listener(this.currentStatus)
    return () => this.statusListeners.delete(listener)
  }

  private setStatus(status: ConnectionStatus): void {
    this.currentStatus = status
    for (const listener of this.statusListeners) {
      try {
        listener(status)
      } catch (err) {
        console.error('Status listener error:', err)
      }
    }
  }

  public getStatus(): ConnectionStatus {
    return this.currentStatus
  }

  // 构建 API URL
  private getApiBase(): string {
    const config = this.getConfig()
    if (config.serverUrl) {
      return config.serverUrl
    }
    // 默认同源
    return window.location.origin
  }

  // 构建 WebSocket URL
  private getWsUrl(): string {
    const config = this.getConfig()
    if (config.serverUrl) {
      const url = new URL(config.serverUrl)
      const wsProto = url.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${wsProto}//${url.host}/api/remote.mux`
    }
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${proto}//${window.location.host}/api/remote.mux`
  }

  // 统一 RPC 请求入口
  public async rpc(method: string, args: Record<string, any> = {}): Promise<any> {
    this.rpcSeq++
    const rpcId = `rpc-${Date.now()}-${this.rpcSeq}`
    const baseUrl = this.getApiBase()
    const config = this.getConfig()

    const headers: Record<string, string> = {
      'content-type': 'application/json',
    }
    if (config.token) {
      headers['authorization'] = `Bearer ${config.token}`
      headers['x-dsh-token'] = config.token
    }

    const res = await fetch(`${baseUrl}/api/${method}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        type: 'client-request',
        rpcId,
        method,
        payload: { args },
      }),
    })

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()
    if (!data.result || !data.result.ok) {
      const err = data.result?.error?.message || data.error?.message || 'RPC Failed'
      throw new Error(err)
    }
    return data.result.value
  }

  // 测试网络连接与延迟
  public async testConnection(): Promise<{ ok: boolean; latency: number; error?: string }> {
    const start = performance.now()
    try {
      this.setStatus('connecting')
      await this.rpc('session/list', { _request: {} })
      const latency = Math.round(performance.now() - start)
      this.setStatus('connected')
      return { ok: true, latency }
    } catch (err: any) {
      this.setStatus('error')
      return { ok: false, latency: 0, error: err.message || String(err) }
    }
  }

  // 1. 获取会话列表
  public async listSessions(): Promise<SessionItem[]> {
    try {
      const res = await this.rpc('session/list', { _request: {} })
      this.setStatus('connected')
      return (res.items || []).map((it: any) => ({
        sessionId: it.sessionId,
        title: it.projections?.values?.title || it.title || '新灵感会话',
        updatedAt: it.updatedAt || Date.now(),
      }))
    } catch (err) {
      this.setStatus('error')
      throw err
    }
  }

  // 2. 创建新会话
  public async createSession(cwd?: string): Promise<string> {
    const config = this.getConfig()
    const targetCwd = cwd || config.workspaceDir || '/root/workspace'
    const res = await this.rpc('session/create', {
      request: { cwd: targetCwd },
    })
    return res.sessionId
  }

  // 5. 重命名会话
  public async renameSession(sessionId: string, title: string): Promise<boolean> {
    try {
      await this.rpc('session/rename', {
        request: { sessionId, title },
      });
      return true;
    } catch (err) {
      console.error('Rename session error:', err);
      return false;
    }
  }

  // 6. 分叉会话 (Fork)
  public async forkSession(sessionId: string): Promise<string> {
    const res = await this.rpc('session/fork', {
      request: { sessionId },
    });
    return res.sessionId;
  }
  public async sendPrompt(sessionId: string, text: string): Promise<boolean> {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const res = await this.rpc('session/prompt', {
      request: {
        requestId,
        sessionId,
        mode: 'queue',
        content: [{ type: 'text', text }],
      },
    })
    return res.accepted === true
  }

  // 4. 打开实时会话流（WebSocket 双向多路复用）
  public followSession(
    sessionId: string,
    callbacks: {
      onMessage: (msg: MessageItem) => void
      onAppendText: (chunk: string) => void
      onThinking: (chunk: string) => void
      onToolCall: (call: ToolCallItem) => void
      onToolOutput: (name: string, output: string) => void
      onTurnEnd: () => void
      onError?: (err: any) => void
    },
  ): () => void {
    let ws: WebSocket | null = null
    let isDisposed = false
    let reconnectTimer: any = null
    let streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const connect = () => {
      if (isDisposed) return
      try {
        this.setStatus('connecting')
        const wsUrl = this.getWsUrl()
        const config = this.getConfig()
        const fullWsUrl = config.token
          ? `${wsUrl}?token=${encodeURIComponent(config.token)}`
          : wsUrl

        ws = new WebSocket(fullWsUrl)

        ws.onopen = () => {
          if (isDisposed) {
            ws?.close()
            return
          }
          this.setStatus('connected')
          streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          ws?.send(
            JSON.stringify({
              type: 'open',
              streamId,
              endpoint: 'session/follow',
              payload: {
                args: {
                  request: {
                    address: { kind: 'session', sessionId },
                  },
                },
              },
            }),
          )
        }

        ws.onmessage = (e) => {
          try {
            const frame = JSON.parse(e.data)
            if (frame.type !== 'item' || frame.streamId !== streamId) return

            const val = frame.value
            if (!val) return

            // A. 历史全量快照 (Snapshot)
            if (val.type === 'snapshot' && Array.isArray(val.records)) {
              for (const rec of val.records) {
                if (rec.type === 'event' && rec.event) {
                  const ev = rec.event
                  if (ev.type === 'user/message') {
                    const text = (ev.data?.content || []).map((c: any) => c.text || '').join('')
                    callbacks.onMessage({
                      id: `ev-${ev.seq}`,
                      role: 'user',
                      text,
                      timestamp: ev.timestamp || Date.now(),
                    })
                  } else if (ev.type === 'assistant/message') {
                    const text = (ev.data?.content || []).map((c: any) => c.text || '').join('')
                    callbacks.onMessage({
                      id: `ev-${ev.seq}`,
                      role: 'assistant',
                      text,
                      timestamp: ev.timestamp || Date.now(),
                    })
                  }
                }
              }
            }

            // B. 增量事件流 (Journal Frames)
            if (val.type === 'journal' && Array.isArray(val.changes)) {
              for (const ch of val.changes) {
                if (ch.kind === 'append' && Array.isArray(ch.entries)) {
                  for (const entry of ch.entries) {
                    const ev = entry.event
                    if (!ev) continue

                    if (ev.type === 'user/message') {
                      const text = (ev.data?.content || []).map((c: any) => c.text || '').join('')
                      callbacks.onMessage({
                        id: `ev-${ev.seq}`,
                        role: 'user',
                        text,
                        timestamp: Date.now(),
                      })
                    } else if (ev.type === 'assistant/message') {
                      const text = (ev.data?.content || []).map((c: any) => c.text || '').join('')
                      callbacks.onMessage({
                        id: `ev-${ev.seq}`,
                        role: 'assistant',
                        text,
                        timestamp: Date.now(),
                      })
                    } else if (ev.type === 'turn/end') {
                      callbacks.onTurnEnd()
                    }
                  }
                }
              }
            }

            // C. 实时打字机流 (Assistant Streaming)
            if (val.type === 'assistant-stream' && val.stream) {
              const s = val.stream
              if (s.type === 'content/delta' && s.delta?.text) {
                callbacks.onAppendText(s.delta.text)
              } else if (s.type === 'thinking/delta' && s.delta?.text) {
                callbacks.onThinking(s.delta.text)
              } else if (s.type === 'tool/call') {
                callbacks.onToolCall({
                  id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  name: s.name,
                  args: s.arguments,
                  status: 'running',
                })
              } else if (s.type === 'tool/output') {
                callbacks.onToolOutput(s.name, typeof s.output === 'string' ? s.output : JSON.stringify(s.output))
              }
            }
          } catch (err) {
            console.error('Frame parse error:', err)
          }
        }

        ws.onclose = () => {
          this.setStatus('disconnected')
          if (!isDisposed) {
            reconnectTimer = setTimeout(connect, 3000)
          }
        }

        ws.onerror = (err) => {
          this.setStatus('error')
          callbacks.onError?.(err)
        }
      } catch (err) {
        this.setStatus('error')
        if (!isDisposed) {
          reconnectTimer = setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      isDisposed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close()
      }
    }
  }
}

export const dsh = new DshClient()
