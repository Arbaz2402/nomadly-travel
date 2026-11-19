import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/utils/seed.js';
import { FlightOffer } from '../src/models/FlightOffer.js';
import { Hotel } from '../src/models/Hotel.js';

let customerToken = '';
let sampleFlightId = '';
let sampleHotelId = '';

beforeAll(async () => {
  await connectDB();
  await seedDatabase();

  const loginRes = await request(app)
    .post('/api/v1/auth/demo-login')
    .send({ role: 'customer' });
  customerToken = loginRes.body.data.token;

  const flight = await FlightOffer.findOne({ isActive: true });
  if (flight) sampleFlightId = flight._id.toString();

  const hotel = await Hotel.findOne({ isActive: true });
  if (hotel) sampleHotelId = hotel._id.toString();
}, 60000);

afterAll(async () => {
  await disconnectDB();
});

describe('Third-Party Partner Redirection & Direct Booking Ingestion Suite', () => {
  it('creates direct confirmed MakeMyTrip booking without filling passenger forms', async () => {
    const payload = {
      travelCategory: 'flight',
      inventoryId: sampleFlightId,
      isDirectConfirmed: true,
      providerName: 'MakeMyTrip Flights',
      providerReference: 'MMT-FL-99412',
      customSnapshot: {
        flightNumber: '6E-205',
        airline: 'IndiGo',
        originCode: 'BOM',
        destinationCode: 'DEL',
        departureDate: '2026-11-20',
      },
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingStatus).toBe('confirmed');
    expect(res.body.data.paymentStatus).toBe('paid');
    expect(res.body.data.providerName).toBe('MakeMyTrip Flights');
    expect(res.body.data.providerReference).toBe('MMT-FL-99412');
    expect(res.body.data.passengers.length).toBeGreaterThan(0);
    expect(res.body.data.passengers[0].firstName).toBeDefined();
  });

  it('allows PNR to be strictly optional for partner bookings', async () => {
    const payload = {
      travelCategory: 'flight',
      inventoryId: sampleFlightId,
      isDirectConfirmed: true,
      providerName: 'MakeMyTrip Flights',
      // PNR intentionally omitted
      customSnapshot: {
        flightNumber: 'AI-805',
        airline: 'Air India',
        originCode: 'BOM',
        destinationCode: 'DEL',
      },
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingStatus).toBe('confirmed');
    expect(res.body.data.providerReference).toBeUndefined();
  });

  it('creates direct confirmed Booking.com hotel reservation without friction', async () => {
    const payload = {
      travelCategory: 'hotel',
      inventoryId: sampleHotelId,
      isDirectConfirmed: true,
      providerName: 'Booking.com',
      providerReference: 'BK-8741029',
      customSnapshot: {
        hotelName: 'The Oberoi Udaivilas',
        city: 'Udaipur',
        checkIn: '2026-11-22',
        checkOut: '2026-11-25',
      },
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.providerName).toBe('Booking.com');
    expect(res.body.data.providerReference).toBe('BK-8741029');
    expect(res.body.data.bookingStatus).toBe('confirmed');
  });

  it('rejects standard non-direct bookings if no travelers are provided', async () => {
    const payload = {
      travelCategory: 'flight',
      inventoryId: sampleFlightId,
      isDirectConfirmed: false,
      passengers: [], // Empty passengers for standard booking must be rejected
    };

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('traveler is required');
  });

  it('retrieves user confirmed partner bookings in customer booking history', async () => {
    const res = await request(app)
      .get('/api/v1/bookings/my-bookings')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    const partnerBooking = res.body.data.find(
      (b) => b.providerName === 'MakeMyTrip Flights' || b.providerName === 'Booking.com'
    );
    expect(partnerBooking).toBeDefined();
    expect(partnerBooking.bookingStatus).toBe('confirmed');
  });
});
