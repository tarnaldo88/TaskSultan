import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export async function listTasks(req: Request, res: Response) {
  const userId = (req as any).userId
  const { projectId } = req.params
  // Only allow if user is a member of the workspace
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const tasks = await prisma.task.findMany({ where: { projectId } })
  res.json({ tasks })
}

export async function createTask(req: Request, res: Response) {
  const userId = (req as any).userId
  const { projectId } = req.params
  const { title, description, status, priority, dueDate, assigneeId, parentTaskId, labels } = req.body
  if (!title) return res.status(400).json({ error: 'Task title required' })
  // Only allow if user is a member of the workspace
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || 'todo',
      priority,
      dueDate,
      assigneeId,
      parentTaskId,
      projectId,
      labels: labels ? { connect: labels.map((id: string) => ({ id })) } : undefined
    }
  })
  res.status(201).json({ task })
}

export async function getTask(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  // Only allow if user is a member of the workspace
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  res.json({ task })
}

export async function updateTask(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const { title, description, status, priority, dueDate, assigneeId, parentTaskId, labels } = req.body
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  // Only allow if user is a member of the workspace
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const updated = await prisma.task.update({
    where: { id },
    data: {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      parentTaskId,
      labels: labels ? { set: labels.map((id: string) => ({ id })) } : undefined
    }
  })
  res.json({ task: updated })
}

export async function deleteTask(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Task not found' })
  // Only allow if user is a member of the workspace
  const project = await prisma.project.findUnique({ where: { id: task.projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  await prisma.task.delete({ where: { id } })
  res.status(204).send()
}
