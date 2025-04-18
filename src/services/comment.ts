import type { Comment } from '../types/comment'

const API_URL = process.env.REACT_APP_API_URL || ''

// Backend shape
interface CommentWithUser {
  id: string
  taskId: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
  user: {
    id: string
    name: string
    avatarUrl?: string | null
  }
}

function mapCommentWithUser(comment: CommentWithUser): Comment {
  if (!comment.user) throw new Error('Comment missing user field')
  return {
    id: comment.id,
    taskId: comment.taskId,
    authorId: comment.user.id,
    authorName: comment.user.name,
    content: comment.content,
    createdAt: String(comment.createdAt),
    updatedAt: String(comment.updatedAt)
  }
}

export async function fetchComments({ taskId, token }: { taskId: string, token: string }): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch comments')
  const data = await res.json()
  // Handle both array or object response
  if (Array.isArray(data)) return data.map(mapCommentWithUser)
  if (Array.isArray(data.comments)) return data.comments.map(mapCommentWithUser)
  throw new Error('Unexpected comments response')
}

export async function addComment({ taskId, content, token }: { taskId: string, content: string, token: string }): Promise<Comment> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  })
  if (!res.ok) throw new Error('Failed to add comment')
  const data = await res.json()
  // Handle object or {comment} response
  if (data && data.user) return mapCommentWithUser(data)
  if (data && data.comment) return mapCommentWithUser(data.comment)
  throw new Error('Unexpected comment response')
}
