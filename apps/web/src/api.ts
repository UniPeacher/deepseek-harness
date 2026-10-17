import type {
  ConnectionConfig,
  ConnectionStatus,
  MessageItem,
  SessionItem,
  ToolCallItem,
  ModelItem,
  ModelCatalogInfo,
} from './types.ts'

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

  // 5. 模型配置管理 (支持用户自定义 API BaseURL, Key, 协议与模型)
  public async addCustomProvider(params: {
    route: string;
    displayName: string;
    baseURL: string;
    apiKey?: string;
    protocol?: 'openai-completions' | 'anthropic-messages';
    models: Array<{ id: string; name: string; description?: string }>;
  }): Promise<{ ok: boolean; error?: string }> {
    try {
      const keyRef = `PROVIDER_KEY_${params.route.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      const hasKey = !!params.apiKey?.trim();

      const profile: any = {
        displayName: params.displayName || params.route,
        api: params.protocol || 'openai-completions',
        baseURL: params.baseURL.trim().replace(/\/+$/, ''),
        models: params.models.map(m => ({
          id: m.id,
          name: m.name || m.id,
          description: m.description || '',
          contextWindow: 131072,
        })),
      };

      if (hasKey) {
        profile.apiKeyEnv = keyRef;
      }

      // 1. 写入 llm-pi-ai 设置
      await this.rpc('settings/mutate', {
        ns: 'llm-pi-ai',
        ops: [{ op: 'set', path: ['providers', params.route], value: profile }],
      });

      // 2. 如果提供了 Key，写入安全凭据库
      if (hasKey) {
        await this.rpc('credentials/set', {
          ref: keyRef,
          value: params.apiKey!.trim(),
        });
      }

      return { ok: true };
    } catch (err: any) {
      console.error('Failed to add custom provider:', err);
      return { ok: false, error: err.message || '配置保存失败' };
    }
  }

  // 删除自定义提供商
  public async deleteCustomProvider(route: string): Promise<boolean> {
    try {
      const keyRef = `PROVIDER_KEY_${route.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      await this.rpc('settings/mutate', {
        ns: 'llm-pi-ai',
        ops: [{ op: 'unset', path: ['providers', route] }],
      });
      try {
        await this.rpc('credentials/unset', { ref: keyRef });
      } catch {}
      return true;
    } catch (err) {
      console.error('Failed to delete provider:', err);
      return false;
    }
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

  private getLocalSet(key: string): Set<string> {
    try {
      const raw = localStorage.getItem(key);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  }

  private saveLocalSet(key: string, set: Set<string>): void {
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {}
  }

  // 1. 获取会话列表 (支持过滤已删除/归档，置顶排序)
  public async listSessions(): Promise<SessionItem[]> {
    try {
      const res = await this.rpc('session/list', { _request: {} });
      this.setStatus('connected');
      const archived = this.getLocalSet('vibe_archived_sessions');
      const pinned = this.getLocalSet('vibe_pinned_sessions');

      const items: SessionItem[] = (res.items || [])
        .filter((it: any) => !archived.has(it.sessionId))
        .map((it: any) => ({
          sessionId: it.sessionId,
          title: it.projections?.values?.title || it.title || '新灵感会话',
          updatedAt: it.updatedAt || Date.now(),
          isPinned: pinned.has(it.sessionId),
          modelSelection: it.projections?.values?.modelSelection?.next || it.projections?.values?.modelSelection?.lastUsed,
        }));

      // 置顶会话排在前面，其余按最近更新时间降序排
      items.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });

      return items;
    } catch (err) {
      this.setStatus('error');
      throw err;
    }
  }

  // 获取已归档会话数量
  public getArchivedCount(): number {
    return this.getLocalSet('vibe_archived_sessions').size;
  }

  // 2. 创建新会话
  public async createSession(cwd?: string): Promise<string> {
    const config = this.getConfig();
    const targetCwd = cwd || config.workspaceDir || '/root/workspace';
    const res = await this.rpc('session/create', {
      request: { cwd: targetCwd },
    });
    return res.sessionId;
  }

  // 3. 删除/归档会话
  public async deleteSession(sessionId: string): Promise<boolean> {
    const archived = this.getLocalSet('vibe_archived_sessions');
    archived.add(sessionId);
    this.saveLocalSet('vibe_archived_sessions', archived);

    const pinned = this.getLocalSet('vibe_pinned_sessions');
    if (pinned.has(sessionId)) {
      pinned.delete(sessionId);
      this.saveLocalSet('vibe_pinned_sessions', pinned);
    }

    // 同时通知后端停止该 session 并归档
    try {
      await this.rpc('workspace/archiveSession', {
        request: { sessionId, stopActivity: true },
      });
    } catch (err) {
      console.warn('Backend archive error, local handled:', err);
    }
    return true;
  }

  // 4. 置顶/取消置顶会话
  public async togglePinSession(sessionId: string): Promise<boolean> {
    const pinned = this.getLocalSet('vibe_pinned_sessions');
    const isNowPinned = !pinned.has(sessionId);
    if (isNowPinned) {
      pinned.add(sessionId);
      try {
        await this.rpc('workspace/pinSession', { request: { sessionId } });
      } catch {}
    } else {
      pinned.delete(sessionId);
      try {
        await this.rpc('workspace/unpinSession', { request: { sessionId } });
      } catch {}
    }
    this.saveLocalSet('vibe_pinned_sessions', pinned);
    return isNowPinned;
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

  // 7. 获取可用模型目录
  public async getModelCatalog(): Promise<ModelCatalogInfo> {
    try {
      const res = await this.rpc('session/modelCatalog', {});
      const list: ModelItem[] = [];
      const groups = res.groups || [];
      for (const g of groups) {
        for (const m of g.models || []) {
          list.push({
            id: m.id,
            name: m.name || m.id,
            description: m.description,
            provider: g.id,
            providerName: g.name || g.id,
            reasoningEfforts: m.reasoning?.efforts?.map((e: any) => e.id),
            defaultEffort: m.reasoning?.defaultEffort,
          });
        }
      }
      return {
        currentModel: res.default,
        models: list,
      };
    } catch (err) {
      console.error('Failed to get model catalog:', err);
      return { models: [] };
    }
  }

  // 8. 为指定会话切换模型
  public async selectModel(
    sessionId: string,
    provider: string,
    model: string,
    reasoningEffort?: string
  ): Promise<boolean> {
    try {
      const request: any = { sessionId, provider, model };
      if (reasoningEffort) request.reasoningEffort = reasoningEffort;
      await this.rpc('session/selectModel', { request });
      return true;
    } catch (err) {
      console.error('Failed to select model:', err);
      return false;
    }
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
