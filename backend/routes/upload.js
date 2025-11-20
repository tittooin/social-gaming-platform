import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { handleFileUpload } from '../controllers/uploadController.js';

const uploadsDir = path.join(process.cwd(), 'backend', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '_' + Math.random().toString(36).slice(2);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, unique + '_' + safeName);
  },
});

const upload = multer({ storage });

export const router = express.Router();
router.post('/upload', requireAuth, upload.single('file'), handleFileUpload);