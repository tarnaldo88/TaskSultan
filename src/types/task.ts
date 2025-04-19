import type { Label } from './label'

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  dueDate?: string
  assigneeId?: string
  assignee?: {
    id: string
    name: string
    email?: string
    avatarUrl?: string | null
  }
  projectId: string
  parentTaskId?: string
  subtasks?: Task[]
  labels?: Label[]
  createdAt: string
  updatedAt: string
}
