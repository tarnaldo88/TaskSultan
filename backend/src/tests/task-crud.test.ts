import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import app from '../index'
import fs from 'fs'

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
let prisma: PrismaClient

describe('Task CRUD - assignment, subtasks, labels', () => {
  let user: any, user2: any, token: string, token2: string, workspace: any, project: any, label: any, task: any, subtask: any

  beforeAll(async () => {
    prisma = new PrismaClient()
    // Create users
    user = await prisma.user.create({ data: { email: 'task1@example.com', password: 'hashed', name: 'Task User', role: 'Member' } })
    user2 = await prisma.user.create({ data: { email: 'task2@example.com', password: 'hashed', name: 'Other Task User', role: 'Member' } })
    // Create workspace
    workspace = await prisma.workspace.create({ data: { name: 'Task Workspace', ownerId: user.id } })
    fs.appendFileSync('debug.log', `Workspace created: ${JSON.stringify(workspace)}\n`)
    const allWorkspaces = await prisma.workspace.findMany()
    fs.appendFileSync('debug.log', `All workspaces: ${JSON.stringify(allWorkspaces)}\n`)
    // Add both users as workspace members
    await prisma.workspaceMember.createMany({ data: [ { userId: user.id, workspaceId: workspace.id, role: 'admin' }, { userId: user2.id, workspaceId: workspace.id, role: 'member' } ] })
    // Generate JWT tokens only after users and workspace are created
    token = jwt.sign({ userId: user.id }, JWT_SECRET)
    token2 = jwt.sign({ userId: user2.id }, JWT_SECRET)
    // Create project via API
    const res = await request(app)
      .post(`/api/workspaces/${workspace.id}/projects`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project' })
    fs.appendFileSync('debug.log', `Project creation response: ${res.status} ${JSON.stringify(res.body)}\n`)
    expect(res.status).toBe(201)
    expect(res.body.project.id).toBeDefined()
    project = res.body.project
    fs.appendFileSync('debug.log', `Project created: ${JSON.stringify(project)}\n`)
    // Create label for the workspace
    label = await prisma.label.create({ data: { name: 'Urgent', color: '#f00', workspaceId: workspace.id } })
  })

  afterAll(async () => {
    await prisma.comment.deleteMany()
    await prisma.task.deleteMany()
    await prisma.label.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspaceMember.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('should create a task with assignee, label, and no parent', async () => {
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Main Task', assigneeId: user2.id, labels: [label.id] })
    fs.appendFileSync('debug.log', `Main task creation response: ${res.status} ${JSON.stringify(res.body)}\n`)
    expect(res.status).toBe(201)
    expect(res.body.task.title).toBe('Main Task')
    expect(res.body.task.assignee.id).toBe(user2.id)
    expect(res.body.task.labels[0].id).toBe(label.id)
    task = res.body.task
    fs.appendFileSync('debug.log', `Main task created: ${JSON.stringify(task)}\n`)
  })

  it('should create a subtask with parentTaskId', async () => {
    fs.appendFileSync('debug.log', `Parent task before subtask: ${JSON.stringify(task)}\n`)
    expect(task).toBeDefined()
    expect(task.id).toBeDefined()
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Subtask', parentTaskId: task.id })
    console.log('Subtask creation response:', res.status, res.body)
    fs.appendFileSync('debug.log', `Subtask response: ${res.status} ${JSON.stringify(res.body)}\n`)
    expect(res.status).toBe(201)
    expect(res.body.task.parentTask.id).toBe(task.id)
    subtask = res.body.task
  })

  it('should reject task with invalid assignee', async () => {
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad Task', assigneeId: 'doesnotexist' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Assignee not found/)
  })

  it('should reject task with invalid label', async () => {
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad Task', labels: ['doesnotexist'] })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/labels not found/)
  })

  it('should reject task with invalid parentTaskId', async () => {
    const res = await request(app)
      .post(`/api/projects/${project.id}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Bad Task', parentTaskId: 'doesnotexist' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Parent task not found/)
  })

  it('should update a task with new label and assignee', async () => {
    const newLabel = await prisma.label.create({ data: { name: 'Review', color: '#0f0', workspaceId: workspace.id } })
    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Main Task Updated', assigneeId: user.id, labels: [newLabel.id] })
    expect(res.status).toBe(200)
    expect(res.body.task.title).toBe('Main Task Updated')
    expect(res.body.task.assignee.id).toBe(user.id)
    expect(res.body.task.labels[0].id).toBe(newLabel.id)
  })

  it('should filter tasks by labelId', async () => {
    const res = await request(app)
      .get(`/api/projects/${project.id}/tasks?labelId=${label.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.tasks)).toBe(true)
    expect(res.body.tasks.some((t: any) => t.labels.some((l: any) => l.id === label.id))).toBe(true)
  })

  it('should filter tasks by assigneeId', async () => {
    const res = await request(app)
      .get(`/api/projects/${project.id}/tasks?assigneeId=${user.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.tasks)).toBe(true)
    expect(res.body.tasks.every((t: any) => t.assignee?.id === user.id)).toBe(true)
  })

  it('should filter tasks by parentTaskId', async () => {
    const res = await request(app)
      .get(`/api/projects/${project.id}/tasks?parentTaskId=${task.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.tasks)).toBe(true)
    expect(res.body.tasks.every((t: any) => t.parentTask?.id === task.id)).toBe(true)
  })
})
