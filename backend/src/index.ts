import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
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

// Serve uploaded avatars and other static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'TaskSultan backend running' }))

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/workspaces', projectRoutes)
app.use('/api', projectRoutes)
app.use('/api', taskRoutes)
app.use('/api', commentRoutes)
app.use('/api', labelRoutes)

// Add a catch-all 404 JSON handler to avoid HTML responses
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Export the app for testing
export default app

// Only start server if run directly, not when imported for tests
if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`TaskSultan backend listening on port ${port}`)
  })
}
