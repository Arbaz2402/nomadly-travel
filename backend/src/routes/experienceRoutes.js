import express from 'express';
import {
  searchExperiences,
  getFeaturedExperiences,
  getExperienceById,
} from '../controllers/experienceController.js';

const router = express.Router();

router.get('/', searchExperiences);
router.get('/featured', getFeaturedExperiences);
router.get('/:id', getExperienceById);

export default router;
