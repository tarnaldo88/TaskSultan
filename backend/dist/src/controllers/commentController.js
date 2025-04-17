"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listComments = listComments;
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
const client_1 = require("../prisma/client");
// Get all comments for a task
async function listComments(req, res) {
    const { taskId } = req.params;
    const comments = await client_1.prisma.comment.findMany({
        where: { taskId },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' }
    });
    res.json({ comments });
}
// Create a new comment on a task
async function createComment(req, res) {
    const userId = req.userId;
    const { taskId } = req.params;
    const { content } = req.body;
    if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'Content is required' });
    }
    const comment = await client_1.prisma.comment.create({
        data: { content: content.trim(), userId, taskId }
    });
    res.status(201).json({ comment });
}
// Update a comment (only author)
async function updateComment(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { content } = req.body;
    const comment = await client_1.prisma.comment.findUnique({ where: { id } });
    if (!comment)
        return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId)
        return res.status(403).json({ error: 'Not authorized' });
    const updated = await client_1.prisma.comment.update({ where: { id }, data: { content } });
    res.json({ comment: updated });
}
// Delete a comment (only author)
async function deleteComment(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const comment = await client_1.prisma.comment.findUnique({ where: { id } });
    if (!comment)
        return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId)
        return res.status(403).json({ error: 'Not authorized' });
    await client_1.prisma.comment.delete({ where: { id } });
    res.status(204).send();
}
