"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../prisma/client");
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
async function registerUser(req, res) {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
        return res.status(400).json({ error: 'Missing required fields' });
    const existing = await client_1.prisma.user.findUnique({ where: { email } });
    if (existing)
        return res.status(409).json({ error: 'Email already in use' });
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await client_1.prisma.user.create({
        data: { email, password: hashed, name, role: 'member' }
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Missing email or password' });
    const user = await client_1.prisma.user.findUnique({ where: { email } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
