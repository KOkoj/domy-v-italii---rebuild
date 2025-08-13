import type { Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { ok, fail } from '../utils/response.js';
import type { AuthRequest } from '../middlewares/auth.js';

// Allowed MIME types for image uploads
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`));
    }
  }
});

export const multerArray = upload.array('files', 10);

function uploadBuffer(file: Express.Multer.File): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'real-estate' }, (err, result) => {
      if (err || !result) return reject(err);
      resolve(result.secure_url);
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

export async function uploadImages(req: AuthRequest, res: Response) {
  const files = (req.files as Express.Multer.File[]) || [];

  if (!files.length) {
    return fail(res, 'No files uploaded', undefined, 400);
  }

  // Double-check file types and sizes (belt and suspenders)
  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return fail(res, `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`, undefined, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return fail(res, `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`, undefined, 400);
    }
  }

  try {
    const urls = await Promise.all(files.map(uploadBuffer));
    return ok(res, { urls }, 'Images uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    return fail(res, 'Failed to upload images', { error: (error as Error).message }, 500);
  }
}
