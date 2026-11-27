import express from 'express';
import { getCurrencyRates, convertCurrencyAmount } from '../controllers/currencyController.js';

const router = express.Router();

router.get('/rates', getCurrencyRates);
router.get('/convert', convertCurrencyAmount);
router.post('/convert', convertCurrencyAmount);

export default router;
