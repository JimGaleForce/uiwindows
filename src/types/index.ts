/**
 * Core types for Window Manager package
 * @packageDocumentation
 */

import { ReactNode } from 'react'

/**
 * Window state - determines how the window is displayed
 */
export type WindowState = 'normal' | 'minimized' | 'maximized'

/**
 * Base window configuration
 */
export interface Window<TData = any> {
  /** Unique identifier for the window */
  id: string
  /** Window title displayed in header */
  title: string
  /** Content to render inside the window */
  content: ReactNode
  /** Current display state */
  state?: WindowState
  /** Display order in workspace (for grid layout) */
  order: number
  /** Optional border color (hex or rgb) */
  borderColor?: string
  /** Optional icon to display in header */
  icon?: ReactNode
  /** Associated data for this window */
  data?: TData
  /** Callback when window is requested to close */
  onClose?: () => void
}

/**
 * Audio attachment data for chat messages
 */
export interface AttachedAudio {
  id: string
  data: string // base64 encoded audio
  format: 'wav' | 'pcm16' | 'mp3'
  voice?: string
  duration?: number
}

/**
 * Embedding vector data
 */
export interface EmbeddingData {
  id: string
  model: string
  dimension: number
  vector: number[]
  inputText: string
  timestamp: string
}

/**
 * Chat-specific message types
 */
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system' | 'error' | 'tool'
  content: string
  timestamp: string
  images?: AttachedImage[]
  audio?: AttachedAudio
  embedding?: EmbeddingData
}

/**
 * Attached image data for chat messages
 */
export interface AttachedImage {
  id: string
  name: string
  data: string // base64 encoded
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  size: number
  preview?: string
}

/**
 * Chat session configuration
 */
export interface ChatSession {
  id: string
  messages: ChatMessage[]
  isRunning: boolean
  sessionId?: string // Backend session ID
  contextUsage?: {
    totalInputTokens: number
    contextWindow: number
    percentUsed: number
  }
}

/**
 * Sidebar item configuration
 */
export interface SidebarItem {
  id: string
  label: string
  icon?: ReactNode
  children?: SidebarItem[]
  collapsed?: boolean
  badge?: string | number
  active?: boolean
  onClick?: () => void
}

/**
 * Sidebar configuration
 */
export interface SidebarConfig {
  items: SidebarItem[]
  collapsible?: boolean
  resizable?: boolean
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  collapsed?: boolean
}

/**
 * Workspace - saved window layout configuration
 */
export interface Workspace {
  /** Unique session ID (per browser tab) */
  sessionId: string
  /** Optional name for saved workspaces */
  name?: string
  /** Window configurations */
  windows: Window[]
  /** IDs of manually closed items (prevent auto-reopen) */
  closedItemIds?: string[]
  /** IDs of collapsed sidebar items */
  collapsedItemIds?: string[]
  createdAt: string
  updatedAt: string
  /** true = named/saved workspace, false = current session state */
  isSaved: boolean
}

/**
 * Saved workspace reference (without full window data)
 */
export interface SavedWorkspace {
  name: string
  windows: Window[]
  createdAt: string
  updatedAt: string
}

/**
 * Theme color configuration
 */
export interface ThemeColors {
  background: string
  panel: string
  accent: string
  text: {
    primary: string
    secondary: string
    muted: string
  }
  border: {
    default: string
    hover: string
  }
}

/**
 * Complete theme configuration
 */
export interface Theme {
  name: string
  colors: ThemeColors
}

/**
 * Window manager configuration
 */
export interface WindowManagerConfig {
  /** Current windows to display */
  windows: Window[]
  /** Grid layout mode */
  gridLayout?: 'auto' | 'manual'
  /** Theme configuration */
  theme?: Theme
  /** Callback when window state changes */
  onWindowStateChange?: (windowId: string, state: WindowState) => void
  /** Callback when window is closed */
  onWindowClose?: (windowId: string) => void
  /** Callback when window is minimized */
  onWindowMinimize?: (windowId: string) => void
  /** Callback when window is maximized */
  onWindowMaximize?: (windowId: string) => void
  /** Callback when window is restored to normal */
  onWindowRestore?: (windowId: string) => void
}

/**
 * Window manager hook return type
 */
export interface UseWindowsReturn {
  windows: Window[]
  openWindow: (window: Omit<Window, 'order'>) => void
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  restoreWindow: (windowId: string) => void
  updateWindow: (windowId: string, updates: Partial<Window>) => void
}

/**
 * Workspace manager hook return type
 */
export interface UseWorkspacesReturn {
  savedWorkspaces: SavedWorkspace[]
  currentWorkspaceName: string | null
  isDirty: boolean
  saveWorkspace: (name: string, windows: Window[]) => Promise<void>
  loadWorkspace: (name: string) => Promise<Window[] | null>
  deleteWorkspace: (name: string) => Promise<void>
  renameWorkspace: (oldName: string, newName: string) => Promise<void>
  loadSessionWorkspace: () => Promise<Workspace>
  saveSessionWorkspace: (windows: Window[], closedIds?: string[], collapsedIds?: string[]) => void
}
