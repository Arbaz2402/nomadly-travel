import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Currency & FX Exchange Service Suite', () => {
  it('1. GET /api/v1/currency/rates returns live rates for major travel currencies', async () => {
    const res = await request(app).get('/api/v1/currency/rates?base=USD');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.base).toBe('USD');
    expect(res.body.rates).toBeDefined();
    expect(res.body.rates.INR).toBeGreaterThan(70);
    expect(res.body.rates.EUR).toBeGreaterThan(0.5);
  });

  it('2. POST /api/v1/currency/convert converts amounts accurately with inverse rate', async () => {
    const res = await request(app)
      .post('/api/v1/currency/convert')
      .send({ amount: 100, from: 'USD', to: 'INR' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(100);
    expect(res.body.data.from).toBe('USD');
    expect(res.body.data.to).toBe('INR');
    expect(res.body.data.rate).toBeGreaterThan(70);
    expect(res.body.data.result).toBeGreaterThan(7000);
    expect(res.body.data.inverseRate).toBeGreaterThan(0);
  });

  it('3. Rejects invalid negative or missing amount', async () => {
    const res = await request(app)
      .post('/api/v1/currency/convert')
      .send({ amount: -50, from: 'USD', to: 'INR' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
