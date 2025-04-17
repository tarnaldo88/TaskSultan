import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'

export async function listTasks(req: Request, res: Response) {
  const userId = (req as any).userId
  const { projectId, labelId, assigneeId, parentTaskId } = req.query as Record<string, string>
  // Only allow if user is a member of the workspace
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return res.status(404).json({ error: 'Project not found' })
  const isMember = await prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } })
  if (!isMember) return res.status(403).json({ error: 'Not a member of workspace' })
  const where: any = { projectId }
  if (assigneeId) where.assigneeId = assigneeId
  if (parentTaskId) where.parentTaskId = parentTaskId
  if (labelId) where.labels = { some: { id: labelId } }
  const tasks = await prisma.task.findMany({
    where,
    include: {
      labels: true,
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      subtasks: { select: { id: true, title: true, status: true } },
      parentTask: { select: { id: true, title: true } }
    }
  })
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
  // Validate assignee
  if (assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!user) return res.status(400).json({ error: 'Assignee not found' })
  }
  // Validate parentTask
  if (parentTaskId) {
    const parent = await prisma.task.findUnique({ where: { id: parentTaskId } })
    if (!parent) return res.status(400).json({ error: 'Parent task not found' })
  }
  // Validate labels
  let labelConnect
  if (labels) {
    const foundLabels = await prisma.label.findMany({ where: { id: { in: labels } } })
    if (foundLabels.length !== labels.length) return res.status(400).json({ error: 'One or more labels not found' })
    labelConnect = labels.map((id: string) => ({ id }))
  }
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
      labels: labelConnect ? { connect: labelConnect } : undefined
    },
    include: {
      labels: true,
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      subtasks: { select: { id: true, title: true, status: true } },
      parentTask: { select: { id: true, title: true } }
    }
  })
  res.status(201).json({ task })
}

export async function getTask(req: Request, res: Response) {
  const userId = (req as any).userId
  const { id } = req.params
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      labels: true,
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      subtasks: { select: { id: true, title: true, status: true } },
      parentTask: { select: { id: true, title: true } }
    }
  })
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
  // Validate assignee
  if (assigneeId) {
    const user = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!user) return res.status(400).json({ error: 'Assignee not found' })
  }
  // Validate parentTask
  if (parentTaskId) {
    const parent = await prisma.task.findUnique({ where: { id: parentTaskId } })
    if (!parent) return res.status(400).json({ error: 'Parent task not found' })
  }
  // Validate labels
  let labelSet
  if (labels) {
    const foundLabels = await prisma.label.findMany({ where: { id: { in: labels } } })
    if (foundLabels.length !== labels.length) return res.status(400).json({ error: 'One or more labels not found' })
    labelSet = labels.map((id: string) => ({ id }))
  }
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
      labels: labelSet ? { set: labelSet } : undefined
    },
    include: {
      labels: true,
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      subtasks: { select: { id: true, title: true, status: true } },
      parentTask: { select: { id: true, title: true } }
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
