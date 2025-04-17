import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export async function listWorkspaces(req: Request, res: Response) {
  const userId = (req as any).userId
  const workspaces = await prisma.workspace.findMany({
    where: { members: { some: { userId } } },
    select: { id: true, name: true, ownerId: true, createdAt: true }
  })
  res.json({ workspaces })
}

export async function createWorkspace(req: Request, res: Response) {
  console.log('createWorkspace handler called')
  const userId = (req as any).userId
  const { name } = req.body
  if (!name) {
    console.log('createWorkspace: missing name')
    return res.status(400).json({ error: 'Workspace name required' })
  }
  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: { userId, role: 'admin' }
      }
    },
    select: { id: true, name: true, ownerId: true, createdAt: true }
  })
  console.log('createWorkspace: created', workspace)
  res.status(201).json({ workspace })
}

export async function getWorkspace(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const workspace = await prisma.workspace.findFirst({
    where: { id, members: { some: { userId } } },
    select: { id: true, name: true, ownerId: true, createdAt: true }
  })
  if (!workspace) return res.status(404).json({ error: 'Workspace not found or access denied' })
  res.json({ workspace })
}

export async function updateWorkspace(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const { name } = req.body
  const workspace = await prisma.workspace.findUnique({ where: { id } })
  if (!workspace) return res.status(404).json({ error: 'Workspace not found' })
  if (workspace.ownerId !== userId) return res.status(403).json({ error: 'Only owner can update workspace' })
  const updated = await prisma.workspace.update({ where: { id }, data: { name } })
  res.json({ workspace: updated })
}

export async function deleteWorkspace(req: Request, res: Response) {
  console.log('deleteWorkspace handler called')
  const userId = (req as any).userId
  const { id } = req.params
  const workspace = await prisma.workspace.findUnique({ where: { id } })
  if (!workspace) {
    console.log('deleteWorkspace: not found')
    return res.status(404).json({ error: 'Workspace not found' })
  }
  if (workspace.ownerId !== userId) {
    console.log('deleteWorkspace: forbidden')
    return res.status(403).json({ error: 'Only owner can delete workspace' })
  }
  await prisma.workspace.delete({ where: { id } })
  console.log('deleteWorkspace: deleted workspace', id)
  res.status(204).send()
}
