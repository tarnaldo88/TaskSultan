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
  parentTaskId?: string
  labels?: string[]
}

export async function createTask({ projectId, title, description, token, parentTaskId, labels }: CreateTaskParams): Promise<Task> {
  const res = await fetch(`http://localhost:4000/api/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, parentTaskId, labels })
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
  labels?: string[]
}

export async function updateTask({ id, token, labels, ...fields }: UpdateTaskParams): Promise<Task> {
  const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ ...fields, labels })
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to update task')
  const data = await res.json()
  return data.task
}

export async function deleteTask({ id, token }: { id: string; token: string }): Promise<void> {
  const res = await fetch(`http://localhost:4000/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete task')
}
