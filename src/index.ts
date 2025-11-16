/**
 * UIWindows - React Window Management System
 * 
 * A complete window management system with built-in chat support, audio recording,
 * embedding analysis, and responsive grid layouts for building IDE-like applications
 * or multi-panel dashboards.
 * 
 * @packageDocumentation
 */

// Core types
export type {
  Window,
  WindowState,
  WindowManagerConfig,
  ChatMessage,
  ChatSession,
  AttachedImage,
  AttachedAudio,
  EmbeddingData,
  SidebarItem,
  SidebarConfig,
  Workspace,
  SavedWorkspace,
  Theme,
  ThemeColors,
  UseWindowsReturn,
  UseWorkspacesReturn,
} from './types'

// Components
export { WindowManager } from './components/WindowManager'
export { MinimizedBar } from './components/MinimizedBar'
export { ResizableSidebar } from './components/ResizableSidebar'

// Chat components
export { ChatWindow } from './components/chat/ChatWindow'
export { MessageList } from './components/chat/MessageList'
export { MessageInput } from './components/chat/MessageInput'
export { MessageBubble } from './components/chat/MessageBubble'
export { EmbeddingComparison } from './components/chat/EmbeddingComparison'
export { MicrophoneButton } from './components/chat/MicrophoneButton'

// Utilities
export * from './utils/similarity'
export { eventBus } from './utils/event-bus'

// Hooks
export { useWindows } from './hooks/useWindows'
export { useWorkspaces } from './hooks/useWorkspaces'

// Theme
export { ThemeProvider, useTheme } from './contexts/ThemeContext'
export { defaultTheme, darkTheme, lightTheme, themes } from './theme/defaultTheme'
