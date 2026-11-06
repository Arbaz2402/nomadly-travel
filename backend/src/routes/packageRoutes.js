import express from 'express';
import { getVacationPackages, getPackageById } from '../controllers/packageController.js';

const router = express.Router();

router.get('/', getVacationPackages);
router.get('/:id', getPackageById);

export default router;
