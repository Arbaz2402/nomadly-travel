import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';

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

  describe('Swagger OpenAPI Documentation', () => {
    it('GET /api-docs.json should serve OpenAPI 3.0.3 spec', async () => {
      const res = await request(app).get('/api-docs.json');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
      expect(res.body.info.title).toContain('NOMADLY');
      expect(res.body.paths['/auth/me']).toBeDefined();
      expect(res.body.paths['/ai/generate-itinerary']).toBeDefined();
    });

    it('GET /api-docs/ should serve interactive Swagger UI', async () => {
      const res = await request(app).get('/api-docs/');
      expect([200, 301, 302]).toContain(res.status);
    });
  });

  describe('Live Travel Utilities', () => {
    it('GET /api/v1/currency/rates returns live FX rates', async () => {
      const res = await request(app).get('/api/v1/currency/rates?base=USD');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.rates.INR).toBeGreaterThan(70);
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
