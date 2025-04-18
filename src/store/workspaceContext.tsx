import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Workspace } from '../types/workspace'
import { useAuth } from './authContext'

interface WorkspaceContextProps {
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string) => void
  workspaces: Workspace[]
  reloadWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>(user?.workspaces || [])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(user?.workspaces?.[0]?.id || null)

  // Always fetch workspaces on mount if token is present
  useEffect(() => {
    if (token) reloadWorkspaces()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Only set initial workspaces from user once, on mount
  useEffect(() => {
    if (workspaces.length === 0 && user?.workspaces?.length) {
      setWorkspaces(user.workspaces)
      if (!activeWorkspaceId) setActiveWorkspaceId(user.workspaces[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const reloadWorkspaces = useCallback(async () => {
    if (!token) return
    const res = await fetch('http://localhost:4000/api/workspaces', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) {
      console.log('reloadWorkspaces: failed to fetch')
      return
    }
    const data = await res.json()
    console.log('reloadWorkspaces: fetched', data.workspaces)
    setWorkspaces(data.workspaces)
    if (data.workspaces.length && !activeWorkspaceId) setActiveWorkspaceId(data.workspaces[0].id)
  }, [token, activeWorkspaceId])

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId, workspaces, reloadWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
