import express from 'express';
import { validateCoupon, getActiveCoupons } from '../controllers/couponController.js';

const router = express.Router();

router.post('/validate', validateCoupon);
router.get('/active', getActiveCoupons);

export default router;
