import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getBookingReceipt,
} from '../controllers/bookingController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyAuth, createBooking);
router.get('/my-bookings', verifyAuth, getMyBookings);
router.get('/:id', verifyAuth, getBookingById);
router.post('/:id/cancel', verifyAuth, cancelBooking);
router.get('/:id/receipt', verifyAuth, getBookingReceipt);

export default router;
