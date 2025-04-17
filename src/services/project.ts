import type { Project } from '../types/project'

export interface ListProjectsParams {
  workspaceId: string
  token: string
}

export async function listProjects({ workspaceId, token }: ListProjectsParams): Promise<Project[]> {
  const res = await fetch(`http://localhost:4000/api/workspaces/${workspaceId}/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch projects')
  const data = await res.json()
  return data.projects
}
