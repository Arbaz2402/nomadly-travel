import express from 'express';
import { searchTrains, getTrainById } from '../controllers/trainController.js';

const router = express.Router();

router.get('/search', searchTrains);
router.get('/:id', getTrainById);

export default router;
