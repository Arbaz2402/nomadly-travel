import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';
import {
  AmadeusService,
  resolveIataCode,
  parseDurationMinutes,
  AIRLINE_REGISTRY,
  AIRPORT_REGISTRY,
} from '../src/services/inventory/amadeusService.js';

beforeAll(async () => {
  await connectDB();
  await seedDatabase();
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('Amadeus Provider & Travel Inventory Suite', () => {
  describe('Helper Utilities & IATA Code Resolution', () => {
    it('should resolve standard 3-letter IATA airport codes', () => {
      expect(resolveIataCode('BOM')).toBe('BOM');
      expect(resolveIataCode('del')).toBe('DEL');
      expect(resolveIataCode('blr')).toBe('BLR');
      expect(resolveIataCode('LHR')).toBe('LHR');
    });

    it('should resolve city names to appropriate IATA airport codes', () => {
      expect(resolveIataCode('Mumbai')).toBe('BOM');
      expect(resolveIataCode('Delhi')).toBe('DEL');
      expect(resolveIataCode('Bengaluru')).toBe('BLR');
      expect(resolveIataCode('Bangalore')).toBe('BLR');
      expect(resolveIataCode('Goa')).toBe('GOI');
      expect(resolveIataCode('Dubai')).toBe('DXB');
      expect(resolveIataCode('Singapore')).toBe('SIN');
    });

    it('should parse ISO 8601 flight duration strings accurately', () => {
      expect(parseDurationMinutes('PT2H15M')).toBe(135);
      expect(parseDurationMinutes('PT1H45M')).toBe(105);
      expect(parseDurationMinutes('PT55M')).toBe(55);
      expect(parseDurationMinutes('PT3H')).toBe(180);
      expect(parseDurationMinutes('')).toBe(120);
    });

    it('should have airline registries with names and logos', () => {
      expect(AIRLINE_REGISTRY['6E'].name).toBe('IndiGo');
      expect(AIRLINE_REGISTRY['AI'].name).toBe('Air India');
      expect(AIRLINE_REGISTRY['EK'].name).toBe('Emirates');
      expect(AIRLINE_REGISTRY['6E'].logo).toBeDefined();
    });

    it('should have comprehensive airport registries', () => {
      expect(AIRPORT_REGISTRY['BOM'].city).toBe('Mumbai');
      expect(AIRPORT_REGISTRY['DEL'].city).toBe('Delhi');
      expect(AIRPORT_REGISTRY['BLR'].city).toBe('Bengaluru');
      expect(AIRPORT_REGISTRY['GOI'].city).toBe('Goa');
    });
  });

  describe('Configuration & Zero-Config Fallback Behavior', () => {
    it('isConfigured() returns false when API keys are absent', () => {
      const origId = process.env.AMADEUS_CLIENT_ID;
      const origSecret = process.env.AMADEUS_CLIENT_SECRET;

      delete process.env.AMADEUS_CLIENT_ID;
      delete process.env.AMADEUS_CLIENT_SECRET;

      expect(AmadeusService.isConfigured()).toBe(false);

      if (origId) process.env.AMADEUS_CLIENT_ID = origId;
      if (origSecret) process.env.AMADEUS_CLIENT_SECRET = origSecret;
    });

    it('GET /api/v1/flights/airports returns populated airport registry', async () => {
      const res = await request(app).get('/api/v1/flights/airports');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(10);
      const codes = res.body.data.map((a) => a.code);
      expect(codes).toContain('BOM');
      expect(codes).toContain('DEL');
      expect(codes).toContain('BLR');
    });

    it('GET /api/v1/flights/search gracefully falls back to local catalog when Amadeus is unconfigured', async () => {
      const res = await request(app).get('/api/v1/flights/search?origin=BOM&destination=DEL');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].originCode).toBe('BOM');
      expect(res.body.data[0].destinationCode).toBe('DEL');
    });

    it('GET /api/v1/hotels/search gracefully falls back to local catalog when Amadeus is unconfigured', async () => {
      const res = await request(app).get('/api/v1/hotels/search?city=Mumbai');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].location.city).toBe('Mumbai');
    });
  });
});

