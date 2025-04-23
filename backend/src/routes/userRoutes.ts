// Routes (add as needed)

import { Router } from 'express'
import { getCurrentUser, updateCurrentUser, deleteCurrentUser } from '../controllers/userController'
import { requireAuth } from '../middleware/auth'
import { uploadAvatarHandler } from '../controllers/avatarController'
import { uploadAvatar } from '../middleware/uploadAvatar'

const router = Router()

router.get('/me', requireAuth, getCurrentUser)
router.put('/me', requireAuth, updateCurrentUser)
router.delete('/me', requireAuth, deleteCurrentUser)
router.post('/avatar', requireAuth, uploadAvatar, uploadAvatarHandler)

export default router
