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
  createdAt: string
  updatedAt: string
}
