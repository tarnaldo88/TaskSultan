import type { Request, Response } from 'express'
import { prisma } from '../prisma/client'
import path from 'path'

// Extend Request type to include file
interface MulterRequest extends Request {
  file: Express.Multer.File
}

export async function uploadAvatarHandler(req: MulterRequest, res: Response) {
  const userId = (req as any).userId
  if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' })
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' })
  try {
    const avatarPath = `/uploads/avatars/${req.file.filename}`
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: avatarPath }
    })
    res.json({ success: true, url: avatarPath })
  } catch (err: any) {
    // Log the error and return a user-friendly message
    console.error('Avatar upload failed:', err)
    res.status(500).json({ success: false, error: 'Failed to update avatar. Please try again.' })
  }
}
