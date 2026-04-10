import { Router } from 'express';
import { generateResponse } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.post('/ai', verifyToken, generateResponse);

export default router;

