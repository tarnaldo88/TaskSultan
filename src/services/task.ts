import type { Task } from '../types/task'

export interface ListTasksParams {
  projectId: string
  token: string
}

export async function listTasks({ projectId, token }: ListTasksParams): Promise<Task[]> {
  const res = await fetch(`http://localhost:4000/api/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch tasks')
  const data = await res.json()
  return data.tasks
}

export interface CreateTaskParams {
  projectId: string
  title: string
  description?: string
  token: string
}

export async function createTask({ projectId, title, description, token }: CreateTaskParams): Promise<Task> {
  const res = await fetch(`http://localhost:4000/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description })
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to create task')
  const data = await res.json()
  return data.task
}

export interface UpdateTaskParams {
  id: string
  token: string
  title?: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  assigneeId?: string
}

export async function updateTask({ id, token, ...fields }: UpdateTaskParams): Promise<Task> {
  const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(fields)
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update task')
  const data = await res.json()
  return data.task
}
