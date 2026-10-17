export interface SessionItem {
  sessionId: string;
  title: string;
  updatedAt: number;
  messageCount?: number;
  isPinned?: boolean;
  modelSelection?: {
    provider: string;
    model: string;
    reasoningEffort?: string;
  };
}

export interface ToolCallItem {
  id: string
  name: string
  args?: any
  output?: string
  status: 'running' | 'completed' | 'failed'
}

export interface MessageItem {
  id: string
  role: 'user' | 'assistant' | 'tool'
  text: string
  thinking?: string
  toolCalls?: ToolCallItem[]
  toolName?: string
  toolArgs?: any
  toolOutput?: string
  isStreaming?: boolean
  timestamp?: number
  suggestions?: string[]
}

export interface InspirationPrompt {
  id: string
  category: 'geo' | 'lesson' | 'starter' | 'vibe' | 'fix'
  emoji: string
  title: string
  description: string
  prompt: string
  tags: string[]
}

export interface ConnectionConfig {
  serverUrl: string
  token: string
  workspaceDir: string
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ModelItem {
  id: string;
  name: string;
  description?: string;
  provider: string;
  providerName: string;
  reasoningEfforts?: string[];
  defaultEffort?: string;
}

export interface ModelCatalogInfo {
  currentModel?: {
    provider: string;
    model: string;
    reasoningEffort?: string;
  };
  models: ModelItem[];
}
