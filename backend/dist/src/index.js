"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const labelRoutes_1 = __importDefault(require("./routes/labelRoutes"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TaskSultan backend running' }));
app.use('/api/auth', authRoutes_1.default);
app.use('/api/user', userRoutes_1.default);
app.use('/api/workspaces', workspaceRoutes_1.default);
app.use('/api/workspaces', projectRoutes_1.default);
app.use('/api', taskRoutes_1.default);
app.use('/api', commentRoutes_1.default);
app.use('/api', labelRoutes_1.default);
// Export the app for testing
exports.default = app;
// Only start server if run directly, not when imported for tests
if (require.main === module) {
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`TaskSultan backend listening on port ${port}`);
    });
}
