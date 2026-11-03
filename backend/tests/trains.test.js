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

describe('IRCTC Train Engine & Discovery Suite', () => {
  it('GET /api/v1/trains/search returns trains for Mumbai to Delhi', async () => {
    const res = await request(app).get('/api/v1/trains/search?origin=Mumbai&destination=Delhi');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data)).toBe(true);

    const firstTrain = res.body.data[0];
    expect(firstTrain.trainNumber).toBeDefined();
    expect(firstTrain.trainName).toBeDefined();
    expect(firstTrain.classes.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/trains/search dynamically generates authentic IRCTC schedules for new routes', async () => {
    const res = await request(app).get('/api/v1/trains/search?origin=Varanasi&destination=Delhi');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);

    const trainNames = res.body.data.map((t) => t.trainName);
    const hasExpressOrVandeBharat = trainNames.some((name) =>
      name.includes('Express') || name.includes('Vande Bharat') || name.includes('Rajdhani')
    );
    expect(hasExpressOrVandeBharat).toBe(true);
  });

  it('GET /api/v1/trains/search filters accurately by travelClass', async () => {
    const res = await request(app).get('/api/v1/trains/search?travelClass=EC');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    res.body.data.forEach((train) => {
      const hasEC = train.classes.some((c) => c.classCode === 'EC');
      expect(hasEC).toBe(true);
    });
  });

  it('GET /api/v1/trains/:id returns full train timetable and stops', async () => {
    const listRes = await request(app).get('/api/v1/trains/search');
    expect(listRes.body.count).toBeGreaterThan(0);

    const sampleId = listRes.body.data[0]._id;
    const detailRes = await request(app).get(`/api/v1/trains/${sampleId}`);
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.success).toBe(true);
    expect(detailRes.body.data._id).toBe(sampleId);
    expect(detailRes.body.data.stops).toBeDefined();
  });
});

