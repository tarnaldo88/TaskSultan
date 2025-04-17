"use strict";
// Controllers (add as needed)
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
exports.updateCurrentUser = updateCurrentUser;
exports.deleteCurrentUser = deleteCurrentUser;
const client_1 = require("../prisma/client");
async function getCurrentUser(req, res) {
    // req.userId is set by requireAuth middleware
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ error: 'Not authenticated' });
    const user = await client_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true }
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({ user });
}
async function updateCurrentUser(req, res) {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ error: 'Not authenticated' });
    const { name, avatarUrl } = req.body;
    if (!name && !avatarUrl)
        return res.status(400).json({ error: 'No fields to update' });
    const user = await client_1.prisma.user.update({
        where: { id: userId },
        data: { name, avatarUrl },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true }
    });
    res.json({ user });
}
async function deleteCurrentUser(req, res) {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ error: 'Not authenticated' });
    await client_1.prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
}
