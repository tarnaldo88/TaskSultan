import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import app from '../index'

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret'
let prisma: PrismaClient

describe('Comment CRUD API', () => {
  let user: any, user2: any, token: string, token2: string, task: any, comment: any

  beforeAll(async () => {
    prisma = new PrismaClient()
    // Create users
    user = await prisma.user.create({ data: { email: 'test1@example.com', password: 'hashed', name: 'Test User', role: 'Member' } })
    user2 = await prisma.user.create({ data: { email: 'test2@example.com', password: 'hashed', name: 'Other User', role: 'Member' } })
    // Create workspace, project, task
    const workspace = await prisma.workspace.create({ data: { name: 'Test Workspace', ownerId: user.id } })
    const project = await prisma.project.create({ data: { name: 'Test Project', workspaceId: workspace.id } })
    task = await prisma.task.create({ data: { title: 'Test Task', status: 'To Do', projectId: project.id } })
    // JWTs
    token = jwt.sign({ userId: user.id }, JWT_SECRET)
    token2 = jwt.sign({ userId: user2.id }, JWT_SECRET)
  })

  afterAll(async () => {
    await prisma.comment.deleteMany()
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.workspace.deleteMany()
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('should create a comment', async () => {
    const res = await request(app)
      .post(`/api/tasks/${task.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Hello world' })
    expect(res.status).toBe(201)
    expect(res.body.comment.content).toBe('Hello world')
    comment = res.body.comment
  })

  it('should list comments for a task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${task.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.comments)).toBe(true)
    expect(res.body.comments[0].content).toBe('Hello world')
  })

  it('should update a comment (author only)', async () => {
    const res = await request(app)
      .put(`/api/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Updated comment' })
    expect(res.status).toBe(200)
    expect(res.body.comment.content).toBe('Updated comment')
  })

  it('should not allow non-author to update', async () => {
    const res = await request(app)
      .put(`/api/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Hacked' })
    expect(res.status).toBe(403)
  })

  it('should not allow empty comment', async () => {
    const res = await request(app)
      .post(`/api/tasks/${task.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' })
    expect(res.status).toBe(400)
  })

  it('should delete a comment (author only)', async () => {
    const res = await request(app)
      .delete(`/api/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
  })

  it('should not allow non-author to delete', async () => {
    // Create new comment as user
    const res1 = await request(app)
      .post(`/api/tasks/${task.id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'To be deleted' })
    const commentId = res1.body.comment.id
    // Try to delete as user2
    const res2 = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${token2}`)
    expect(res2.status).toBe(403)
  })
})
