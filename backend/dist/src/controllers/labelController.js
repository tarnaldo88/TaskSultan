"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLabels = listLabels;
exports.createLabel = createLabel;
exports.updateLabel = updateLabel;
exports.deleteLabel = deleteLabel;
const client_1 = require("../prisma/client");
// List all labels for a workspace
async function listLabels(req, res) {
    const userId = req.userId;
    const { workspaceId } = req.params;
    // Only allow if user is a member of the workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    const labels = await client_1.prisma.label.findMany({ where: { workspaceId } });
    res.json({ labels });
}
// Create a label in a workspace
async function createLabel(req, res) {
    const userId = req.userId;
    const { workspaceId } = req.params;
    const { name, color } = req.body;
    if (!name)
        return res.status(400).json({ error: 'Label name required' });
    // Only allow if user is a member of the workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    const label = await client_1.prisma.label.create({ data: { name, color, workspaceId } });
    res.status(201).json({ label });
}
// Update a label
async function updateLabel(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { name, color } = req.body;
    const label = await client_1.prisma.label.findUnique({ where: { id } });
    if (!label)
        return res.status(404).json({ error: 'Label not found' });
    // Only allow if user is a member of the workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId: label.workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    const updated = await client_1.prisma.label.update({ where: { id }, data: { name, color } });
    res.json({ label: updated });
}
// Delete a label
async function deleteLabel(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const label = await client_1.prisma.label.findUnique({ where: { id } });
    if (!label)
        return res.status(404).json({ error: 'Label not found' });
    // Only allow if user is a member of the workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId: label.workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    await client_1.prisma.label.delete({ where: { id } });
    res.status(204).send();
}
