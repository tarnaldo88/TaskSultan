import type { Workspace } from '../types/workspace'
import type { User } from '../types/user'

export async function createWorkspace({ name, token }: { name: string; token: string }): Promise<Workspace> {
  const res = await fetch('http://localhost:4000/api/workspaces', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create workspace')
  const { workspace } = await res.json()
  return workspace
}

export async function listWorkspaceMembers({ workspaceId, token }: { workspaceId: string; token: string }): Promise<User[]> {
  const res = await fetch(`http://localhost:4000/api/workspaces/${workspaceId}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch workspace members')
  const { members } = await res.json()
  return members
}
