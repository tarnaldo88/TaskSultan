"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWorkspaces = listWorkspaces;
exports.createWorkspace = createWorkspace;
exports.getWorkspace = getWorkspace;
exports.updateWorkspace = updateWorkspace;
exports.deleteWorkspace = deleteWorkspace;
const client_1 = require("../prisma/client");
async function listWorkspaces(req, res) {
    const userId = req.userId;
    const workspaces = await client_1.prisma.workspace.findMany({
        where: { members: { some: { userId } } },
        select: { id: true, name: true, ownerId: true, createdAt: true }
    });
    res.json({ workspaces });
}
async function createWorkspace(req, res) {
    const userId = req.userId;
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Workspace name required' });
    const workspace = await client_1.prisma.workspace.create({
        data: {
            name,
            ownerId: userId,
            members: {
                create: { userId, role: 'admin' }
            }
        },
        select: { id: true, name: true, ownerId: true, createdAt: true }
    });
    res.status(201).json({ workspace });
}
async function getWorkspace(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const workspace = await client_1.prisma.workspace.findFirst({
        where: { id, members: { some: { userId } } },
        select: { id: true, name: true, ownerId: true, createdAt: true }
    });
    if (!workspace)
        return res.status(404).json({ error: 'Workspace not found or access denied' });
    res.json({ workspace });
}
async function updateWorkspace(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { name } = req.body;
    const workspace = await client_1.prisma.workspace.findUnique({ where: { id } });
    if (!workspace)
        return res.status(404).json({ error: 'Workspace not found' });
    if (workspace.ownerId !== userId)
        return res.status(403).json({ error: 'Only owner can update workspace' });
    const updated = await client_1.prisma.workspace.update({ where: { id }, data: { name } });
    res.json({ workspace: updated });
}
async function deleteWorkspace(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const workspace = await client_1.prisma.workspace.findUnique({ where: { id } });
    if (!workspace)
        return res.status(404).json({ error: 'Workspace not found' });
    if (workspace.ownerId !== userId)
        return res.status(403).json({ error: 'Only owner can delete workspace' });
    await client_1.prisma.workspace.delete({ where: { id } });
    res.status(204).send();
}
