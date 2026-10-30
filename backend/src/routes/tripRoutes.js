import express from 'express';
import {
  getMyTrips,
  getTripById,
  createTrip,
  addSegmentToTrip,
  updateTripBudget,
} from '../controllers/tripController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyAuth, getMyTrips);
router.post('/', verifyAuth, createTrip);
router.get('/:id', verifyAuth, getTripById);
router.post('/:id/segments', verifyAuth, addSegmentToTrip);
router.put('/:id/budget', verifyAuth, updateTripBudget);

export default router;
