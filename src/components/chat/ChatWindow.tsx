/**
 * Complete chat window component
 * Combines message list, input, and header with controls
 */

import React from 'react'
import {
  Settings,
  Trash2,
  Archive,
  Minimize2,
  Maximize2,
  Square,
  X,
  Pause,
  Download,
  Upload,
  Code,
} from 'lucide-react'
import { ChatSession, AttachedImage, Theme } from '../../types'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { eventBus } from '../../utils/event-bus'

export interface ChatWindowProps {
  /** Chat session data */
  session: ChatSession
  /** Window title */
  title: string
  /** Subtitle (e.g., working directory) */
  subtitle?: string
  /** Theme configuration */
  theme: Theme
  /** Send message callback */
  onSendMessage: (message: string, images?: AttachedImage[]) => void
  /** Audio recorded callback - returns transcribed text or null */
  onAudioRecorded?: (audioBlob: Blob, mimeType: string) => Promise<string | null>
  /** Stop session callback */
  onStop?: () => void
  /** Settings button callback */
  onSettings?: () => void
  /** Clear chat callback */
  onClear?: () => void
  /** Archive chat callback */
  onArchive?: () => void
  /** Close window callback */
  onClose?: () => void
  /** Minimize window callback */
  onMinimize?: () => void
  /** Maximize window callback */
  onMaximize?: () => void
  /** Restore window callback */
  onRestore?: () => void
  /** Is window maximized */
  isMaximized?: boolean
  /** Enable image attachments */
  enableImages?: boolean
  /** Enable audio file upload (for STT models like Whisper) */
  enableAudioUpload?: boolean
  /** Enable microphone recording */
  enableMicrophone?: boolean
  /** Disable text input (for STT-only models) */
  disableTextInput?: boolean
  /** Optional header extension (e.g., audio controls, model-specific settings) */
  headerExtension?: React.ReactNode
  /** Export chat callback */
  onExport?: () => void
  /** Import chat callback */
  onImport?: () => void
  /** Show code examples callback */
  onShowCodeExamples?: () => void
  /** Window ID for multi-window sync */
  windowId: string
  /** Input click handler with modifier keys (for multi-window selection) */
  onInputClick?: (event: React.MouseEvent) => void
  /** Is this window part of a multi-selection */
  isSelected?: boolean
  /** Set of all selected window IDs (for sync coordination) */
  selectedWindowIds?: Set<string>
}

/**
 * Chat window - full-featured chat interface with header controls
 */
export const ChatWindow: React.FC<ChatWindowProps> = ({
  session,
  title,
  subtitle,
  theme,
  onSendMessage,
  onAudioRecorded,
  onStop,
  onSettings,
  onClear,
  onArchive,
  onClose,
  onMinimize,
  onMaximize,
  onRestore,
  isMaximized = false,
  enableImages = true,
  enableAudioUpload = false,
  enableMicrophone = true,
  disableTextInput = false,
  headerExtension,
  onExport,
  onImport,
  onShowCodeExamples,
  windowId,
  onInputClick,
  isSelected = false,
  selectedWindowIds = new Set(),
}) => {
  const [input, setInput] = React.useState('')

  // Use refs to avoid stale closures in callbacks
  const isSelectedRef = React.useRef(isSelected)
  const selectedWindowIdsRef = React.useRef(selectedWindowIds)

  // Update refs on every render (synchronously, before effects run)
  isSelectedRef.current = isSelected
  selectedWindowIdsRef.current = selectedWindowIds

  // Subscribe to sync events (similar to CrossCodeX pattern)
  React.useEffect(() => {
    const handleSync = (data: { windowId: string; text: string }) => {
      // Only update if this is a different window and we're in the selection
      if (data.windowId !== windowId && isSelectedRef.current && selectedWindowIdsRef.current.has(windowId)) {
        setInput(data.text)
      }
    }

    eventBus.on('sync-input', handleSync)
    return () => eventBus.off('sync-input', handleSync)
  }, [windowId])

  // Handle input change - emit sync event if selected (stable callback using refs)
  const handleInputChange = React.useCallback((value: string) => {
    setInput(value)

    // Emit sync event if this window is selected (use refs for latest values)
    if (isSelectedRef.current && selectedWindowIdsRef.current.has(windowId)) {
      eventBus.emit('sync-input', { windowId, text: value })
    }
  }, [windowId])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="border-b px-4 py-2 flex items-center justify-between"
        style={{
          backgroundColor: theme.colors.panel,
          borderColor: theme.colors.border.default,
        }}
      >
        {/* Left: Title */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-500 font-mono truncate">{subtitle}</div>
          )}
        </div>

        {/* Center: Header Extension (e.g., audio controls) */}
        {headerExtension && (
          <div className="flex items-center gap-2 mx-4">
            {headerExtension}
          </div>
        )}

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          {session.contextUsage && (
            <div className="text-xs text-slate-500 mr-2">
              {session.contextUsage.totalInputTokens.toLocaleString()} /{' '}
              {session.contextUsage.contextWindow.toLocaleString()} (
              {session.contextUsage.percentUsed.toFixed(1)}%)
            </div>
          )}

          {onExport && (
            <button
              onClick={onExport}
              disabled={session.isRunning || session.messages.length === 0}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5 disabled:opacity-50"
              aria-label="Export"
              title="Export chat (text, json, md, html)"
            >
              <Download size={16} />
            </button>
          )}

          {onImport && (
            <button
              onClick={onImport}
              disabled={session.isRunning}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5 disabled:opacity-50"
              aria-label="Import"
              title="Import chat from JSON"
            >
              <Upload size={16} />
            </button>
          )}

          {onShowCodeExamples && (
            <button
              onClick={onShowCodeExamples}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
              aria-label="Code Examples"
              title="Show API connection code examples"
            >
              <Code size={16} />
            </button>
          )}

          {onSettings && (
            <button
              onClick={onSettings}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
              aria-label="Settings"
              title="Chat settings"
            >
              <Settings size={16} />
            </button>
          )}

          {onArchive && (
            <button
              onClick={onArchive}
              disabled={session.isRunning}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5 disabled:opacity-50"
              aria-label="Archive"
              title="Archive conversation"
            >
              <Archive size={16} />
            </button>
          )}

          {onClear && (
            <button
              onClick={onClear}
              disabled={session.isRunning}
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10 disabled:opacity-50"
              aria-label="Clear"
              title="Clear all messages"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="w-px h-4 bg-white/10 mx-1" />

          {onMinimize && (
            <button
              onClick={onMinimize}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
              aria-label="Minimize"
              title="Minimize window"
            >
              <Minimize2 size={16} />
            </button>
          )}

          {isMaximized ? (
            onRestore && (
              <button
                onClick={onRestore}
                className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
                aria-label="Restore"
                title="Restore window"
              >
                <Square size={16} />
              </button>
            )
          ) : (
            onMaximize && (
              <button
                onClick={onMaximize}
                className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
                aria-label="Maximize"
                title="Maximize window"
              >
                <Maximize2 size={16} />
              </button>
            )
          )}

          {onClose && (
            <button
              onClick={onClose}
              disabled={session.isRunning}
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10 disabled:opacity-50"
              aria-label="Close"
              title="Close window"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={session.messages} theme={theme} isRunning={session.isRunning} />

      {/* Input */}
      <MessageInput
        value={input}
        onChange={handleInputChange}
        onSubmit={(msg, imgs) => {
          onSendMessage(msg, imgs)
          handleInputChange('')
        }}
        onAudioRecorded={async (audioBlob, mimeType) => {
          if (!onAudioRecorded) return
          const transcribedText = await onAudioRecorded(audioBlob, mimeType)
          if (transcribedText) {
            if (disableTextInput) {
              // STT-only: auto-submit
              onSendMessage(transcribedText)
            } else {
              // Regular: fill text box
              handleInputChange(transcribedText)
            }
          }
        }}
        isRunning={session.isRunning}
        theme={theme}
        enableImages={enableImages}
        enableAudioUpload={enableAudioUpload}
        enableMicrophone={enableMicrophone}
        disableTextInput={disableTextInput}
        onClick={onInputClick}
        isSelected={isSelected}
      />

      {/* Stop button overlay (when running) */}
      {session.isRunning && onStop && (
        <div className="absolute bottom-20 right-6">
          <button
            onClick={onStop}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
            aria-label="Stop"
          >
            <Pause size={16} />
            <span>Stop</span>
          </button>
        </div>
      )}
    </div>
  )
}
