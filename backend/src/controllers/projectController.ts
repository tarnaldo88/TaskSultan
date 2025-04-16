import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export async function listProjects(req: Request, res: Response) {
  const userId = (req as any).userId
  const { workspaceId } = req.params
  // Only allow if user is a member of workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const projects = await prisma.project.findMany({ where: { workspaceId } })
  res.json({ projects })
}

export async function createProject(req: Request, res: Response) {
  const userId = (req as any).userId
  const { workspaceId } = req.params
  const { name, description } = req.body
  // Only allow if user is a member of workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const project = await prisma.project.create({
    data: { name, description, workspaceId }
  })
  res.status(201).json({ project })
}

export async function getProject(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  // Only allow if user is a member of workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  res.json({ project })
}

export async function updateProject(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const { name, description } = req.body
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  // Only allow if user is a member of workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const updated = await prisma.project.update({ where: { id }, data: { name, description } })
  res.json({ project: updated })
}

export async function deleteProject(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  // Only allow if user is a member of workspace
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  await prisma.project.delete({ where: { id } })
  res.status(204).send()
}
