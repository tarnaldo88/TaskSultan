import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  listTasks, createTask, getTask, updateTask, deleteTask
} from '../controllers/taskController'

const router = Router()

router.use(requireAuth)
router.get('/projects/:projectId/tasks', listTasks)
router.post('/projects/:projectId/tasks', createTask)
router.get('/tasks/:id', getTask)
router.put('/tasks/:id', updateTask)
router.delete('/tasks/:id', deleteTask)

export default router
