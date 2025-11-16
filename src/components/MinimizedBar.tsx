/**
 * Minimized window bar component
 * Displays a compact bar for minimized windows with restore/maximize/close actions
 */

import React from 'react'
import { Maximize2, Square, X } from 'lucide-react'
import { Theme } from '../types'

export interface MinimizedBarProps {
  /** Unique panel ID */
  panelId: string
  /** Primary title text */
  title: string
  /** Secondary subtitle text */
  subtitle?: string
  /** Border color (hex or rgb) */
  borderColor: string
  /** Theme configuration */
  theme: Theme
  /** Callback when restore button clicked */
  onRestore: () => void
  /** Callback when maximize button clicked */
  onMaximize: () => void
  /** Callback when close button clicked */
  onClose: () => void
  /** Disable close button when running */
  isRunning?: boolean
}

/**
 * Minimized window bar - shows title and action buttons for minimized windows
 */
export const MinimizedBar: React.FC<MinimizedBarProps> = ({
  title,
  subtitle,
  borderColor,
  theme,
  onRestore,
  onMaximize,
  onClose,
  isRunning = false,
}) => {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-2 rounded border-2 flex-1 min-w-0"
      style={{
        backgroundColor: theme.colors.panel,
        borderColor,
      }}
    >
      {/* Left: Title and Subtitle */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onRestore}>
        <div className="text-sm font-semibold text-white truncate">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-500 font-mono truncate">
            {subtitle}
          </div>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRestore}
          className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
          aria-label="Restore window"
          title="Restore to normal size"
        >
          <Square size={14} />
        </button>

        <button
          onClick={onMaximize}
          className="text-slate-400 hover:text-[#D4FF48] transition-colors p-1.5 rounded hover:bg-white/5"
          aria-label="Maximize window"
          title="Maximize window"
        >
          <Maximize2 size={14} />
        </button>

        <button
          onClick={onClose}
          disabled={isRunning}
          className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Close window"
          title="Close window"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
