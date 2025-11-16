/**
 * Main window manager component
 * Handles multi-panel grid layout with minimized/maximized states
 */

import React, { ReactNode } from 'react'
import { Window, WindowState, Theme } from '../types'
import { MinimizedBar } from './MinimizedBar'

export interface WindowManagerProps {
  /** Array of windows to display */
  windows: Window[]
  /** Theme configuration */
  theme: Theme
  /** Render function for window content */
  renderWindow: (window: Window) => ReactNode
  /** Get border color for a window based on its state/data */
  getBorderColor?: (window: Window) => string
  /** Get subtitle text for minimized windows */
  getSubtitle?: (window: Window) => string
  /** Callback when window state changes */
  onWindowStateChange?: (windowId: string, state: WindowState) => void
  /** Callback when window is closed */
  onWindowClose?: (windowId: string) => void
  /** Callback when window is minimized (reserved for future use) */
  onWindowMinimize?: (windowId: string) => void
  /** Callback when window is maximized */
  onWindowMaximize?: (windowId: string) => void
  /** Callback when window is restored */
  onWindowRestore?: (windowId: string) => void
  /** Check if a window is currently running/processing */
  isWindowRunning?: (windowId: string) => boolean
}

/**
 * Window Manager - handles multi-panel layout with window state management
 */
export const WindowManager: React.FC<WindowManagerProps> = ({
  windows,
  theme,
  renderWindow,
  getBorderColor = () => theme.colors.border.default,
  getSubtitle = () => undefined,
  onWindowClose = () => {},
  // onWindowMinimize reserved for future use
  onWindowMaximize = () => {},
  onWindowRestore = () => {},
  isWindowRunning = () => false,
}) => {
  // Separate windows by state
  const normalWindows = windows.filter(w => !w.state || w.state === 'normal')
  const minimizedWindows = windows.filter(w => w.state === 'minimized')
  const maximizedWindow = windows.find(w => w.state === 'maximized')

  // Calculate grid layout based on window count and screen size
  const getGridClass = () => {
    const count = normalWindows.length
    if (count === 0) return 'grid-cols-1'
    if (count === 1) return 'grid-cols-1'

    // Mobile/portrait/narrow: always stack vertically (1 column) up to 1024px
    // Desktop (>= 1024px): 2 columns
    // Wide desktop (>= 1280px): 2-3 columns based on count
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2'
    if (count === 3) return 'grid-cols-1 lg:grid-cols-2' // 2 top, 1 bottom on desktop
    if (count === 4) return 'grid-cols-1 lg:grid-cols-2'
    if (count <= 6) return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' // Default
  }

  const getGridItemClass = (index: number) => {
    // Special handling for 3 windows on desktop: make 3rd window span 2 columns
    if (normalWindows.length === 3 && index === 2) {
      return 'lg:col-span-2'
    }
    return ''
  }

  const renderWindowContainer = (window: Window, index?: number, isMaximized = false) => {
    const borderColor = window.borderColor || getBorderColor(window)

    return (
      <div
        key={window.id}
        className={`rounded-lg border-2 overflow-hidden ${isMaximized ? 'h-full' : 'min-h-[400px] md:min-h-[500px]'} ${index !== undefined ? getGridItemClass(index) : ''}`}
        style={{
          backgroundColor: theme.colors.panel,
          borderColor,
        }}
      >
        {renderWindow(window)}
      </div>
    )
  }

  if (windows.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        No windows open
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Main window area */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.colors.border.default} transparent`
        }}
      >
        {maximizedWindow ? (
          // Show only maximized window
          <div className="h-full">
            {renderWindowContainer(maximizedWindow, undefined, true)}
          </div>
        ) : (
          // Grid of normal windows - scrollable when needed
          <div className={`grid gap-4 auto-rows-max ${getGridClass()}`}>
            {normalWindows.map((window, index) => renderWindowContainer(window, index, false))}
          </div>
        )}
      </div>

      {/* Minimized windows bar */}
      {minimizedWindows.length > 0 && (
        <div className="flex gap-2" style={{ borderColor: theme.colors.border.default }}>
          {minimizedWindows.map(window => (
            <MinimizedBar
              key={window.id}
              panelId={window.id}
              title={window.title}
              subtitle={getSubtitle(window)}
              borderColor={window.borderColor || getBorderColor(window)}
              theme={theme}
              onRestore={() => onWindowRestore(window.id)}
              onMaximize={() => onWindowMaximize(window.id)}
              onClose={() => onWindowClose(window.id)}
              isRunning={isWindowRunning(window.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
