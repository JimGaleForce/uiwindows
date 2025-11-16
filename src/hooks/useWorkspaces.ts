/**
 * Workspace management hook
 * Handles saving/loading window layouts with session support
 */

import { useState, useEffect, useCallback } from 'react'
import { Window, Workspace, SavedWorkspace, UseWorkspacesReturn } from '../types'

/**
 * Storage keys
 */
const WORKSPACES_KEY = 'window-manager-workspaces'
const SESSION_KEY_PREFIX = 'window-manager-session-'

/**
 * Hook for managing workspaces (saved window layouts)
 * @param sessionId - Unique identifier for the current session (e.g., browser tab)
 * @returns Workspace management functions and state
 */
export function useWorkspaces(sessionId: string): UseWorkspacesReturn {
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>([])
  const [currentWorkspaceName, setCurrentWorkspaceName] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Load saved workspaces on mount
  useEffect(() => {
    loadSavedWorkspaces()
  }, [])

  const loadSavedWorkspaces = useCallback(() => {
    try {
      const saved = localStorage.getItem(WORKSPACES_KEY)
      if (saved) {
        setSavedWorkspaces(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    }
  }, [])

  /**
   * Save a named workspace
   */
  const saveWorkspace = useCallback(
    async (name: string, windows: Window[]) => {
      const workspace: SavedWorkspace = {
        name,
        windows,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updated = savedWorkspaces.filter((w) => w.name !== name)
      updated.push(workspace)

      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated))
      setSavedWorkspaces(updated)
      setCurrentWorkspaceName(name)
      setIsDirty(false)
    },
    [savedWorkspaces]
  )

  /**
   * Load a named workspace
   */
  const loadWorkspace = useCallback(
    async (name: string): Promise<Window[] | null> => {
      const workspace = savedWorkspaces.find((w) => w.name === name)
      if (workspace) {
        setCurrentWorkspaceName(name)
        setIsDirty(false)
        return workspace.windows
      }
      return null
    },
    [savedWorkspaces]
  )

  /**
   * Delete a named workspace
   */
  const deleteWorkspace = useCallback(
    async (name: string) => {
      const updated = savedWorkspaces.filter((w) => w.name !== name)
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated))
      setSavedWorkspaces(updated)
      if (currentWorkspaceName === name) {
        setCurrentWorkspaceName(null)
      }
    },
    [savedWorkspaces, currentWorkspaceName]
  )

  /**
   * Rename a workspace
   */
  const renameWorkspace = useCallback(
    async (oldName: string, newName: string) => {
      const updated = savedWorkspaces.map((w) =>
        w.name === oldName
          ? { ...w, name: newName, updatedAt: new Date().toISOString() }
          : w
      )
      localStorage.setItem(WORKSPACES_KEY, JSON.stringify(updated))
      setSavedWorkspaces(updated)
      if (currentWorkspaceName === oldName) {
        setCurrentWorkspaceName(newName)
      }
    },
    [savedWorkspaces, currentWorkspaceName]
  )

  /**
   * Load the workspace for the current session
   */
  const loadSessionWorkspace = useCallback(async (): Promise<Workspace> => {
    try {
      const sessionKey = `${SESSION_KEY_PREFIX}${sessionId}`
      const saved = localStorage.getItem(sessionKey)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load session workspace:', error)
    }

    // Return empty workspace if none exists
    return {
      sessionId,
      windows: [],
      closedItemIds: [],
      collapsedItemIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSaved: false,
    }
  }, [sessionId])

  /**
   * Save the current session workspace
   */
  const saveSessionWorkspace = useCallback(
    (windows: Window[], closedIds: string[] = [], collapsedIds: string[] = []) => {
      const workspace: Workspace = {
        sessionId,
        windows,
        closedItemIds: closedIds,
        collapsedItemIds: collapsedIds,
        name: currentWorkspaceName || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSaved: !!currentWorkspaceName,
      }

      const sessionKey = `${SESSION_KEY_PREFIX}${sessionId}`
      localStorage.setItem(sessionKey, JSON.stringify(workspace))

      // Mark as dirty if we have a named workspace
      if (currentWorkspaceName) {
        setIsDirty(true)
      }
    },
    [sessionId, currentWorkspaceName]
  )

  return {
    savedWorkspaces,
    currentWorkspaceName,
    isDirty,
    saveWorkspace,
    loadWorkspace,
    deleteWorkspace,
    renameWorkspace,
    loadSessionWorkspace,
    saveSessionWorkspace,
  }
}
