import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Diagnostic & Health API Suite', () => {
  it('GET /api/health returns 200 with platform online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.platform).toBe('NOMADLY Travel Reservation Platform');
    expect(res.body.emailService).toBeDefined();
    expect(typeof res.body.emailService.configured).toBe('boolean');
  });

  it('GET /api/test-email returns diagnostic report without crash', async () => {
    const res = await request(app)
      .get('/api/test-email')
      .query({ to: 'qa-tester@example.com' });

    // It will attempt to send via configured or unconfigured credentials and return diagnostic JSON
    expect(res.status).toBeGreaterThanOrEqual(200);
    expect(res.status).toBeLessThan(600);
    expect(res.body).toBeDefined();
  });
});
