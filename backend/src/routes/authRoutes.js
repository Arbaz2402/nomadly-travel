import express from 'express';
import {
  getMe,
  updateProfile,
  addSavedTraveler,
  deleteSavedTraveler,
  demoLogin,
} from '../controllers/authController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', verifyAuth, getMe);
router.put('/profile', verifyAuth, updateProfile);
router.post('/travelers', verifyAuth, addSavedTraveler);
router.delete('/travelers/:travelerId', verifyAuth, deleteSavedTraveler);
router.post('/demo-login', demoLogin);

export default router;
