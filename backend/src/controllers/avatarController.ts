import type { Request, Response } from 'express'
import type { Multer } from 'multer'
import { prisma } from '../prisma/client'
import path from 'path'

// Extend Request type to include file
interface MulterRequest extends Request {
  file: Multer.File
}

export async function uploadAvatarHandler(req: MulterRequest, res: Response) {
  const userId = (req as any).userId
  if (!userId) return res.status(401).json({ success: false, error: 'Not authenticated' })
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' })
  const avatarPath = `/uploads/avatars/${req.file.filename}`
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: avatarPath }
  })
  res.json({ success: true, url: avatarPath })
}
