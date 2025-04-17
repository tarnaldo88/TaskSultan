"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("../src/index"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
describe('Comment CRUD API', () => {
    let user, user2, token, token2, task, comment;
    beforeAll(async () => {
        // Create users
        user = await prisma.user.create({ data: { email: 'test1@example.com', password: 'hashed', name: 'Test User', role: 'Member' } });
        user2 = await prisma.user.create({ data: { email: 'test2@example.com', password: 'hashed', name: 'Other User', role: 'Member' } });
        // Create workspace, project, task
        const workspace = await prisma.workspace.create({ data: { name: 'Test Workspace', ownerId: user.id } });
        const project = await prisma.project.create({ data: { name: 'Test Project', workspaceId: workspace.id } });
        task = await prisma.task.create({ data: { title: 'Test Task', status: 'To Do', projectId: project.id } });
        // JWTs
        token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        token2 = jsonwebtoken_1.default.sign({ userId: user2.id }, JWT_SECRET);
    });
    afterAll(async () => {
        await prisma.comment.deleteMany();
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();
        await prisma.workspace.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });
    it('should create a comment', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post(`/api/tasks/${task.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Hello world' });
        expect(res.status).toBe(201);
        expect(res.body.comment.content).toBe('Hello world');
        comment = res.body.comment;
    });
    it('should list comments for a task', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .get(`/api/tasks/${task.id}/comments`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.comments)).toBe(true);
        expect(res.body.comments[0].content).toBe('Hello world');
    });
    it('should update a comment (author only)', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .put(`/api/comments/${comment.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Updated comment' });
        expect(res.status).toBe(200);
        expect(res.body.comment.content).toBe('Updated comment');
    });
    it('should not allow non-author to update', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .put(`/api/comments/${comment.id}`)
            .set('Authorization', `Bearer ${token2}`)
            .send({ content: 'Hacked' });
        expect(res.status).toBe(403);
    });
    it('should not allow empty comment', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .post(`/api/tasks/${task.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: '' });
        expect(res.status).toBe(400);
    });
    it('should delete a comment (author only)', async () => {
        const res = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/comments/${comment.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(204);
    });
    it('should not allow non-author to delete', async () => {
        // Create new comment as user
        const res1 = await (0, supertest_1.default)(index_1.default)
            .post(`/api/tasks/${task.id}/comments`)
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'To be deleted' });
        const commentId = res1.body.comment.id;
        // Try to delete as user2
        const res2 = await (0, supertest_1.default)(index_1.default)
            .delete(`/api/comments/${commentId}`)
            .set('Authorization', `Bearer ${token2}`);
        expect(res2.status).toBe(403);
    });
});
