import express from 'express';
import { getCurrencyRates, getLivePairQuote, convertCurrencyAmount } from '../controllers/currencyController.js';

const router = express.Router();

router.get('/rates', getCurrencyRates);
router.get('/pair', getLivePairQuote);
router.get('/convert', convertCurrencyAmount);
router.post('/convert', convertCurrencyAmount);

export default router;
