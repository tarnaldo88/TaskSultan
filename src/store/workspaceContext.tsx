import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { Workspace } from '../types/workspace'
import { useAuth } from './authContext'

interface WorkspaceContextProps {
  activeWorkspaceId: string | null
  setActiveWorkspaceId: (id: string) => void
  workspaces: Workspace[]
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>(user?.workspaces || [])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(user?.workspaces?.[0]?.id || null)

  useEffect(() => {
    setWorkspaces(user?.workspaces || [])
    if (user?.workspaces?.length && !activeWorkspaceId) setActiveWorkspaceId(user.workspaces[0].id)
  }, [user])

  return (
    <WorkspaceContext.Provider value={{ activeWorkspaceId, setActiveWorkspaceId, workspaces }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
