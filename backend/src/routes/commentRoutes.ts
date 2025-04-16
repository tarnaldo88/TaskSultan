import { Router } from 'express'
import * as commentController from '../controllers/commentController'
import { requireAuth } from '../middleware/auth'

const router = Router()

// GET /api/tasks/:taskId/comments - List comments for a task
router.get('/tasks/:taskId/comments', requireAuth, commentController.listComments)

// POST /api/tasks/:taskId/comments - Create a comment on a task
router.post('/tasks/:taskId/comments', requireAuth, commentController.createComment)

// PUT /api/comments/:id - Update a comment
router.put('/comments/:id', requireAuth, commentController.updateComment)

// DELETE /api/comments/:id - Delete a comment
router.delete('/comments/:id', requireAuth, commentController.deleteComment)

export default router
