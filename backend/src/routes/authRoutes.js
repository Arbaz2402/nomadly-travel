import express from 'express';
import {
  getMe,
  updateProfile,
  demoLogin,
} from '../controllers/authController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', verifyAuth, getMe);
router.put('/profile', verifyAuth, updateProfile);
router.post('/demo-login', demoLogin);

export default router;
