// Add additional types as needed

export interface CommentWithUser {
  id: string
  taskId: string
  content: string
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    avatarUrl: string
  }
}
