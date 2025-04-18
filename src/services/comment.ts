import type { Comment } from '../types/comment'

const API_URL = process.env.REACT_APP_API_URL || ''

export async function fetchComments({ taskId, token }: { taskId: string, token: string }): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) throw new Error('Failed to fetch comments')
  return res.json()
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
  return res.json()
}
