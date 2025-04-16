import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import {
  listWorkspaces, createWorkspace, getWorkspace, updateWorkspace, deleteWorkspace
} from '../controllers/workspaceController'

const router = Router()

router.use(requireAuth)
router.get('/', listWorkspaces)
router.post('/', createWorkspace)
router.get('/:id', getWorkspace)
router.put('/:id', updateWorkspace)
router.delete('/:id', deleteWorkspace)

export default router
