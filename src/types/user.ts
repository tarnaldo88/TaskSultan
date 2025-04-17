import type { Workspace } from './workspace'

export interface User {
  id: string
  email: string
  name: string
  role: string
  avatarUrl?: string | null
  workspaces: Workspace[]
}
