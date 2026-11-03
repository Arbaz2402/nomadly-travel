import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';

beforeAll(async () => {
  await connectDB();
  await seedDatabase();
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('Intercity Bus Engine & Atomic Seat Hold Suite', () => {
  let testBus = null;

  it('GET /api/v1/buses/search returns scheduled buses', async () => {
    const res = await request(app).get('/api/v1/buses/search');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
    testBus = res.body.data[0];
    expect(testBus.operatorName).toBeDefined();
    expect(testBus.seats.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/buses/search dynamically generates verified routes for new cities', async () => {
    const res = await request(app).get('/api/v1/buses/search?origin=Ahmedabad&destination=Surat');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
    expect(res.body.data[0].seats.length).toBe(30);
  });

  it('POST /api/v1/buses/:id/hold locks seats for 10 minutes', async () => {
    expect(testBus).toBeDefined();

    const holdRes = await request(app)
      .post(`/api/v1/buses/${testBus._id}/hold`)
      .send({
        seatNumbers: ['L1', 'L2'],
        sessionId: 'test-session-suite-1',
      });

    expect(holdRes.status).toBe(200);
    expect(holdRes.body.success).toBe(true);
    expect(holdRes.body.data.seatNumbers).toEqual(expect.arrayContaining(['L1', 'L2']));
  });

  it('POST /api/v1/buses/:id/hold rejects conflicting seat reservation by another user', async () => {
    // Attempting to hold the same seat 'L1' from a different session
    const conflictRes = await request(app)
      .post(`/api/v1/buses/${testBus._id}/hold`)
      .send({
        seatNumbers: ['L1'],
        sessionId: 'conflicting-session-2',
      });

    expect(conflictRes.status).toBe(409);
    expect(conflictRes.body.success).toBe(false);
  });

  it('POST /api/v1/buses/:id/release safely unlocks held seats', async () => {
    const releaseRes = await request(app)
      .post(`/api/v1/buses/${testBus._id}/release`)
      .send({
        seatNumbers: ['L1', 'L2'],
        sessionId: 'test-session-suite-1',
      });

    expect(releaseRes.status).toBe(200);
    expect(releaseRes.body.success).toBe(true);
  });
});
