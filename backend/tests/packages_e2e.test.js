import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Booking } from '../src/models/Booking.js';
import { Trip } from '../src/models/Trip.js';
import { TripExpense } from '../src/models/TripExpense.js';
import { generateToken } from '../src/middleware/auth.js';

describe('Vacation Packages & Details End-to-End Test Suite', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    await connectDB();

    testUser = await User.create({
      firstName: 'Traveler',
      lastName: 'Explorer',
      displayName: 'Traveler Explorer',
      email: `traveler.${Date.now()}@nomadly.test`,
      role: 'customer',
      isEmailVerified: true,
    });

    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('1. GET /api/v1/packages returns curated packages with flights & hotels', async () => {
    const res = await request(app).get('/api/v1/packages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const firstPkg = res.body.data[0];
    expect(firstPkg.id).toBe('pkg-goa-3n');
    expect(firstPkg.title).toContain('Goa Exclusive');
    expect(firstPkg.pricing.packagePrice).toBeGreaterThan(0);
    expect(firstPkg.pricing.savings).toBeGreaterThan(0);
  });

  it('2. GET /api/v1/packages/pkg-goa-3n returns full package details, gallery & itinerary', async () => {
    const res = await request(app).get('/api/v1/packages/pkg-goa-3n');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const pkg = res.body.data;
    expect(pkg.id).toBe('pkg-goa-3n');
    expect(pkg.destinationCity).toBe('Goa');
    expect(Array.isArray(pkg.gallery)).toBe(true);
    expect(pkg.gallery.length).toBeGreaterThan(2);
    expect(pkg.overview).toContain('coastal escape');
    expect(pkg.roomType).toContain('Sea-Facing');
    expect(Array.isArray(pkg.itinerary)).toBe(true);
    expect(pkg.itinerary.length).toBe(4);
    expect(pkg.itinerary[0].day).toBe(1);
    expect(pkg.inclusions.length).toBeGreaterThan(0);
    expect(pkg.exclusions.length).toBeGreaterThan(0);
    expect(pkg.cancellationPolicy).toContain('Free cancellation');
  });

  it('3. POST /api/v1/bookings seamlessly books the package with no baseFare error', async () => {
    const bookingPayload = {
      travelCategory: 'package',
      inventoryId: 'pkg-goa-3n',
      travelClass: 'package_exclusive',
      departureDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      passengers: [
        {
          title: 'Mr',
          firstName: 'Traveler',
          lastName: 'Explorer',
          gender: 'male',
        },
      ],
      contactInfo: {
        email: testUser.email,
        phone: '+919876543210',
      },
      pricing: {
        baseFare: 18358,
        taxesAndFees: 2203,
        discount: 0,
        totalPayable: 20561,
        currency: 'INR',
      },
      itinerarySnapshot: {
        title: 'Goa Exclusive 3N Getaway',
        destinationCity: 'Goa',
        nights: 3,
        flight: { airline: 'Akasa Air', flightNumber: 'QP-1384' },
        hotel: { name: 'Goa Luxury Boutique Palace Resort' },
      },
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingReference).toBeDefined();
    expect(res.body.data.travelCategory).toBe('package');
    expect(res.body.data.bookingStatus).toBe('pending_payment');
  });

  it('4. Auto-creates trip and ensures activity category enum validation succeeds even with typo variations', async () => {
    const trip = await Trip.create({
      user: testUser._id,
      title: 'Goa Holiday Trip',
      destination: 'Goa',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 3),
      collaborators: [{ user: testUser._id, role: 'owner' }],
    });

    const itemRes = await request(app)
      .post(`/api/v1/trips/${trip._id}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Catamaran Cruise & Dolphin Spotting',
        date: new Date().toISOString(),
        category: 'activities',
        sourceType: 'unbooked_activity',
        actualCost: 3500,
      });

    expect(itemRes.status).toBe(201);
    expect(itemRes.body.success).toBe(true);

    const expenses = await TripExpense.find({ trip: trip._id });
    expect(expenses.length).toBe(1);
    expect(expenses[0].category).toBe('activities');
    expect(expenses[0].amount).toBe(3500);
  });
});
