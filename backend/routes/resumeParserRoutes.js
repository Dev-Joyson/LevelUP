import express from 'express';
import multer from 'multer';
import { parseResume } from '../controllers/resumeParserController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// POST /parse-resume (accepts PDF file)
router.post('/parse-resume', upload.single("resume"), parseResume);

export default router; 