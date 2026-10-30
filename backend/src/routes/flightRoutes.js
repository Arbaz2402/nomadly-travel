import express from 'express';
import { searchFlights, getFlightById, getFlightAirports } from '../controllers/flightController.js';

const router = express.Router();

router.get('/search', searchFlights);
router.get('/airports', getFlightAirports);
router.get('/:id', getFlightById);

export default router;
