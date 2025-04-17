import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  listProjects, createProject, getProject, updateProject, deleteProject
} from '../controllers/projectController'

const router = Router()

router.use(requireAuth)
router.get('/workspaces/:workspaceId/projects', listProjects)
router.post('/:workspaceId/projects', createProject)
router.get('/projects/:id', getProject)
router.put('/projects/:id', updateProject)
router.delete('/projects/:id', deleteProject)

export default router
