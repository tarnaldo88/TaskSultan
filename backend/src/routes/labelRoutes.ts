import { Router } from 'express'
import * as labelController from '../controllers/labelController'
import { requireAuth } from '../middleware/auth'

const router = Router()

// List all labels for a workspace
router.get('/workspaces/:workspaceId/labels', requireAuth, labelController.listLabels)
// Create a label
router.post('/workspaces/:workspaceId/labels', requireAuth, labelController.createLabel)
// Update a label
router.put('/labels/:id', requireAuth, labelController.updateLabel)
// Delete a label
router.delete('/labels/:id', requireAuth, labelController.deleteLabel)

export default router
