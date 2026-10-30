import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';
import { PricingService } from '../src/services/booking/pricingService.js';

let authToken = '';
let adminToken = '';

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  // Obtain demo customer token
  const custRes = await request(app)
    .post('/api/v1/auth/demo-login')
    .send({ role: 'customer' });
  authToken = custRes.body.data.token;

  // Obtain demo admin token
  const adminRes = await request(app)
    .post('/api/v1/auth/demo-login')
    .send({ role: 'admin' });
  adminToken = adminRes.body.data.token;
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('NOMADLY API Core Test Suite', () => {
  it('GET /api/health should return online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
  });

  describe('Search & Discovery Modules', () => {
    it('GET /api/v1/flights/search returns flight offers', async () => {
      const res = await request(app).get('/api/v1/flights/search?origin=BOM&destination=DEL');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/hotels/search returns hotels in city', async () => {
      const res = await request(app).get('/api/v1/hotels/search?city=Mumbai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/trains/search returns express trains', async () => {
      const res = await request(app).get('/api/v1/trains/search?origin=Mumbai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/buses/search returns buses with seat layouts', async () => {
      const res = await request(app).get('/api/v1/buses/search?origin=Mumbai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].seats.length).toBeGreaterThan(0);
    });
  });

  describe('Pricing Engine & Coupon Calculation', () => {
    it('calculates server-side base fare, taxes and applies valid percentage coupon', async () => {
      const pricing = await PricingService.calculate({
        category: 'flight',
        baseFare: 5000,
        quantity: 1,
        couponCode: 'NOMAD10',
      });

      expect(pricing.baseFare).toBe(5000);
      expect(pricing.taxes).toBe(900); // 18% of 5000
      expect(pricing.serviceFee).toBe(150);
      expect(pricing.discount).toBeGreaterThan(0);
      expect(pricing.totalPayable).toBe(5000 + 900 + 150 - pricing.discount);
    });

    it('POST /api/v1/coupons/validate returns applied discount', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({ code: 'NOMAD10', category: 'flight', amount: 5000 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.calculatedDiscount).toBe(500); // 10% of 5000
    });
  });

  describe('Security & Admin Role Authorization', () => {
    it('rejects unauthenticated requests to /api/v1/admin/overview', async () => {
      const res = await request(app).get('/api/v1/admin/overview');
      expect(res.status).toBe(401);
    });

    it('rejects regular customer from accessing admin routes (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(403);
    });

    it('allows admin user to access /api/v1/admin/overview with real KPIs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis).toBeDefined();
    });
  });
});
