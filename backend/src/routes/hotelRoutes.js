import express from 'express';
import { searchHotels, getHotelById, getFeaturedHotels } from '../controllers/hotelController.js';

const router = express.Router();

router.get('/search', searchHotels);
router.get('/featured', getFeaturedHotels);
router.get('/:id', getHotelById);

export default router;
