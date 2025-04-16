import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import workspaceRoutes from './routes/workspaceRoutes'
import projectRoutes from './routes/projectRoutes'
import taskRoutes from './routes/taskRoutes'
import commentRoutes from './routes/commentRoutes'
import labelRoutes from './routes/labelRoutes'

// Load environment variables from .env file
dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TaskSultan backend running' }))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/tasks', taskRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api', commentRoutes)
app.use('/api', labelRoutes)

// Export the app for testing
export default app

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TaskSultan backend listening on port ${port}`)
})
