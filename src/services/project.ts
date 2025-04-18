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

export interface CreateProjectParams {
  workspaceId: string
  name: string
  description?: string
  token: string
}

export async function createProject({ workspaceId, name, description, token }: CreateProjectParams): Promise<Project> {
  const res = await fetch(`http://localhost:4000/api/workspaces/${workspaceId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, description })
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create project')
  const data = await res.json()
  return data.project
}

export async function getProject({ projectId, token }: { projectId: string; token: string }): Promise<Project> {
  const res = await fetch(`http://localhost:4000/api/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch project')
  const data = await res.json()
  return data.project
}
