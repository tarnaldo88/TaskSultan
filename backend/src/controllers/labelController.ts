import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'

// List all labels for a workspace
export async function listLabels(req: Request, res: Response) {
  const userId = (req as any).userId
  const { workspaceId } = req.params
  // Only allow if user is a member of the workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const labels = await prisma.label.findMany({ where: { workspaceId } })
  res.json({ labels })
}

// Create a label in a workspace
export async function createLabel(req: Request, res: Response) {
  const userId = (req as any).userId
  const { workspaceId } = req.params
  const { name, color } = req.body
  if (!name) return res.status(400).json({ error: 'Label name required' })
  // Only allow if user is a member of the workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const label = await prisma.label.create({ data: { name, color, workspaceId } })
  res.status(201).json({ label })
}

// Update a label
export async function updateLabel(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const { name, color } = req.body
  const label = await prisma.label.findUnique({ where: { id } })
  if (!label) return res.status(404).json({ error: 'Label not found' })
  // Only allow if user is a member of the workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: label.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const updated = await prisma.label.update({ where: { id }, data: { name, color } })
  res.json({ label: updated })
}

// Delete a label
export async function deleteLabel(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const label = await prisma.label.findUnique({ where: { id } })
  if (!label) return res.status(404).json({ error: 'Label not found' })
  // Only allow if user is a member of the workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: label.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  await prisma.label.delete({ where: { id } })
  res.status(204).send()
}
