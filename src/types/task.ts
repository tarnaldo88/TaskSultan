export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority?: string
  dueDate?: string
  assigneeId?: string
  projectId: string
  parentTaskId?: string
  subtasks?: Task[]
  createdAt: string
  updatedAt: string
}
