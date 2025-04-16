// Routes (add as needed)

import { Router } from 'express'
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from '../controllers/userController'
import { requireAuth } from '../middleware/auth'

const router = Router()

router.get('/me', requireAuth, getCurrentUser)
router.put('/me', requireAuth, updateCurrentUser)
router.delete('/me', requireAuth, deleteCurrentUser)

export default router
