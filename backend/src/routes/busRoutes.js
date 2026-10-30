import express from 'express';
import { searchBuses, getBusById, holdSeats, releaseSeats } from '../controllers/busController.js';

const router = express.Router();

router.get('/search', searchBuses);
router.get('/:id', getBusById);
router.post('/:id/hold', holdSeats);
router.post('/:id/release', releaseSeats);

export default router;
