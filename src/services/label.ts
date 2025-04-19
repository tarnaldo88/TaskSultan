import type { Label } from '../types/label'

export async function listLabels({ workspaceId, token }: { workspaceId: string, token: string }): Promise<Label[]> {
  const res = await fetch(`http://localhost:4000/api/workspaces/${workspaceId}/labels`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch labels')
  const data = await res.json()
  return data.labels
}
