import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import type { CommentWithUser } from '../types'

// Get all comments for a task
export async function listComments(req: Request, res: Response) {
  const { taskId } = req.params
  const comments: CommentWithUser[] = await prisma.comment.findMany({
    where: { taskId },
    select: {
      id: true,
      taskId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
  res.json({ comments })
}

// Create a new comment on a task
export async function createComment(req: Request, res: Response) {
  const userId = (req as any).userId
  const { taskId } = req.params
  const { content } = req.body
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' })
  }
  const comment: CommentWithUser = await prisma.comment.create({
    data: { content: content.trim(), userId, taskId },
    select: {
      id: true,
      taskId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  })
  res.status(201).json({ comment })
}

// Update a comment (only author)
export async function updateComment(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const { content } = req.body
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return res.status(404).json({ error: 'Comment not found' })
  if (comment.userId !== userId) return res.status(403).json({ error: 'Not authorized' })
  const updated: CommentWithUser = await prisma.comment.update({
    where: { id },
    data: { content },
    select: {
      id: true,
      taskId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    }
  })
  res.json({ comment: updated })
}

// Delete a comment (only author)
export async function deleteComment(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return res.status(404).json({ error: 'Comment not found' })
  if (comment.userId !== userId) return res.status(403).json({ error: 'Not authorized' })
  await prisma.comment.delete({ where: { id } })
  res.status(204).send()
}
