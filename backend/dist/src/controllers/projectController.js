"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProjects = listProjects;
exports.createProject = createProject;
exports.getProject = getProject;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
const client_1 = require("../prisma/client");
async function listProjects(req, res) {
    const userId = req.userId;
    const { workspaceId } = req.params;
    // Only allow if user is a member of workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    const projects = await client_1.prisma.project.findMany({ where: { workspaceId } });
    res.json({ projects });
}
async function createProject(req, res) {
    const userId = req.userId;
    const { workspaceId } = req.params;
    const { name, description } = req.body;
    // Only allow if user is a member of workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    const project = await client_1.prisma.project.create({
        data: { name, description, workspaceId }
    });
    res.status(201).json({ project });
}
async function getProject(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const project = await client_1.prisma.project.findUnique({ where: { id } });
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
    // Only allow if user is a member of workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    res.json({ project });
}
async function updateProject(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const { name, description } = req.body;
    const project = await client_1.prisma.project.findUnique({ where: { id } });
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
    // Only allow if user is a member of workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    const updated = await client_1.prisma.project.update({ where: { id }, data: { name, description } });
    res.json({ project: updated });
}
async function deleteProject(req, res) {
    const userId = req.userId;
    const { id } = req.params;
    const project = await client_1.prisma.project.findUnique({ where: { id } });
    if (!project)
        return res.status(404).json({ error: 'Project not found' });
    // Only allow if user is a member of workspace
    const isMember = await client_1.prisma.workspaceMember.findFirst({ where: { workspaceId: project.workspaceId, userId } });
    if (!isMember)
        return res.status(403).json({ error: 'Not a member of workspace' });
    await client_1.prisma.project.delete({ where: { id } });
    res.status(204).send();
}
