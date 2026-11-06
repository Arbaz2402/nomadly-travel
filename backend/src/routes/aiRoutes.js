import express from 'express';
import { generateItinerary, exportToJourney } from '../controllers/aiController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate-itinerary', generateItinerary);
router.post('/export-to-journey', verifyAuth, exportToJourney);

export default router;
