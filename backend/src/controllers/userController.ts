// Controllers (add as needed)

import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export async function getCurrentUser(req: Request, res: Response) {
  // req.userId is set by requireAuth middleware
  const userId = (req as any).userId
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user })
}

export async function updateCurrentUser(req: Request, res: Response) {
  const userId = (req as any).userId
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })
  const { name, avatarUrl } = req.body
  if (!name && !avatarUrl) return res.status(400).json({ error: 'No fields to update' })
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, avatarUrl },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true }
  })
  res.json({ user })
}

export async function deleteCurrentUser(req: Request, res: Response) {
  const userId = (req as any).userId
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })
  await prisma.user.delete({ where: { id: userId } })
  res.status(204).send()
}
