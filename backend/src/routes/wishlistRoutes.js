import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getPriceAlerts,
  createPriceAlert,
} from '../controllers/wishlistController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyAuth, getWishlist);
router.post('/', verifyAuth, addToWishlist);
router.delete('/:id', verifyAuth, removeFromWishlist);
router.get('/alerts', verifyAuth, getPriceAlerts);
router.post('/alerts', verifyAuth, createPriceAlert);

export default router;
