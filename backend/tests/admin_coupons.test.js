import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';

let customerToken = '';
let adminToken = '';

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  const custRes = await request(app)
    .post('/api/v1/auth/demo-login')
    .send({ role: 'customer' });
  customerToken = custRes.body.data.token;

  const adminRes = await request(app)
    .post('/api/v1/auth/demo-login')
    .send({ role: 'admin' });
  adminToken = adminRes.body.data.token;
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('Promotions, Coupons & Admin Governance Suite', () => {
  describe('Coupons Discovery & Validation', () => {
    it('GET /api/v1/coupons/active returns valid active promotional codes', async () => {
      const res = await request(app).get('/api/v1/coupons/active');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/coupons/validate returns 404 for nonexistent coupon code', async () => {
      const res = await request(app)
        .post('/api/v1/coupons/validate')
        .send({ code: 'INVALID_CODE_999', bookingAmount: 5000, category: 'flight' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Admin Role-Based Access Control (RBAC)', () => {
    it('rejects unauthenticated requests to /api/v1/admin/overview with 401', async () => {
      const res = await request(app).get('/api/v1/admin/overview');
      expect(res.status).toBe(401);
    });

    it('rejects non-admin customer tokens from accessing /api/v1/admin/overview with 403', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('allows verified admin to access /api/v1/admin/overview and returns KPIs', async () => {
      const res = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('allows verified admin to access /api/v1/admin/inventory-stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/inventory-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.flights).toBeDefined();
      expect(res.body.data.hotels).toBeDefined();
    });
  });
});
