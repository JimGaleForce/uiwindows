/**
 * Window state management hook
 * Provides functions to manage window states (open, close, minimize, maximize)
 */

import { useState, useCallback } from 'react'
import { Window, WindowState, UseWindowsReturn } from '../types'

/**
 * Hook for managing window state
 * @param initialWindows - Initial windows to display
 * @returns Window management functions and state
 */
export function useWindows(initialWindows: Window[] = []): UseWindowsReturn {
  const [windows, setWindows] = useState<Window[]>(initialWindows)

  /**
   * Open a new window
   */
  const openWindow = useCallback((window: Omit<Window, 'order'>) => {
    setWindows((prev) => {
      // Check if window already exists
      const exists = prev.find((w) => w.id === window.id)
      if (exists) {
        return prev
      }

      // Calculate next order
      const maxOrder = prev.reduce((max, w) => Math.max(max, w.order), -1)

      return [
        ...prev,
        {
          ...window,
          order: maxOrder + 1,
          state: window.state || 'normal',
        },
      ]
    })
  }, [])

  /**
   * Close a window
   */
  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
  }, [])

  /**
   * Minimize a window
   */
  const minimizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, state: 'minimized' as WindowState } : w))
    )
  }, [])

  /**
   * Maximize a window
   */
  const maximizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, state: 'maximized' as WindowState } : w))
    )
  }, [])

  /**
   * Restore a window to normal state
   */
  const restoreWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, state: 'normal' as WindowState } : w))
    )
  }, [])

  /**
   * Update window properties
   */
  const updateWindow = useCallback((windowId: string, updates: Partial<Window>) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, ...updates } : w))
    )
  }, [])

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updateWindow,
  }
}
