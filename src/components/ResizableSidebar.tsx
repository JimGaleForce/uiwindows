/**
 * Resizable sidebar component with collapse/expand functionality
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Theme } from '../types'

export interface ResizableSidebarProps {
  /** Sidebar content */
  children: ReactNode
  /** Theme configuration */
  theme: Theme
  /** Minimum width in pixels */
  minWidth?: number
  /** Maximum width in pixels */
  maxWidth?: number
  /** Default width in pixels */
  defaultWidth?: number
  /** Storage key for persisting width */
  storageKey?: string
  /** Collapsed label (shown vertically when collapsed) */
  collapsedLabel?: string
}

/**
 * Resizable sidebar with drag handle and collapse functionality
 */
export const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  theme,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 256,
  storageKey = 'sidebar-width',
  collapsedLabel = 'Sidebar',
}) => {
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') return defaultWidth
    const saved = localStorage.getItem(storageKey)
    return saved ? parseInt(saved) : defaultWidth
  })

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem(`${storageKey}-collapsed`)
    return saved === 'true'
  })

  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        if (!sidebarRef.current) return
        const newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX))
        setWidth(newWidth)
        localStorage.setItem(storageKey, newWidth.toString())
      }

      const handleMouseUp = () => {
        setIsResizing(false)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
  }, [isResizing, minWidth, maxWidth, storageKey])

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    localStorage.setItem(`${storageKey}-collapsed`, newCollapsed.toString())
  }

  return (
    <div
      ref={sidebarRef}
      className="relative flex"
      style={{
        width: isCollapsed ? '48px' : `${width}px`,
        transition: isResizing ? 'none' : 'width 0.2s ease-in-out',
        flexShrink: 0,
      }}
    >
      {/* Sidebar Content */}
      <div className="flex-1 overflow-hidden">
        {isCollapsed ? (
          // Collapsed state
          <div
            className="h-full border-r flex flex-col items-center py-4 gap-4"
            style={{
              backgroundColor: theme.colors.panel,
              borderColor: theme.colors.border.default,
            }}
          >
            <button
              onClick={handleToggleCollapse}
              className="text-slate-400 hover:text-[#D4FF48] transition-colors p-2 rounded hover:bg-white/5"
              title="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
            <div className="flex-1 flex items-center">
              <span
                className="text-xs font-semibold text-slate-400 uppercase tracking-wide"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                {collapsedLabel}
              </span>
            </div>
          </div>
        ) : (
          // Expanded state
          children
        )}
      </div>

      {/* Resize Handle - only shown when not collapsed */}
      {!isCollapsed && (
        <div
          className="w-1 cursor-col-resize hover:bg-[#D4FF48] transition-colors group relative"
          style={{
            backgroundColor: isResizing ? '#D4FF48' : 'transparent',
          }}
          onMouseDown={() => setIsResizing(true)}
        >
          {/* Visual indicator on hover */}
          <div className="absolute inset-y-0 -left-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Collapse/Expand Button - positioned over the border */}
      {!isCollapsed && (
        <button
          onClick={handleToggleCollapse}
          className="absolute -right-3 top-4 z-10 bg-[#161616] border border-white/10 rounded-full p-1 text-slate-400 hover:text-[#D4FF48] hover:border-[#D4FF48] transition-all shadow-lg"
          title="Collapse sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      )}
    </div>
  )
}
