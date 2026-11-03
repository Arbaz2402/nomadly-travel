import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Booking } from '../src/models/Booking.js';
import { generateToken } from '../src/middleware/auth.js';

let authToken = null;
let testUser = null;
let testBooking = null;

beforeAll(async () => {
  await connectDB();

  testUser = await User.create({
    displayName: 'Priya Payment Tester',
    email: `payment.tester.${Date.now()}@test.com`,
    role: 'customer',
  });
  authToken = generateToken(testUser);

  testBooking = await Booking.create({
    bookingReference: `BK-TEST-${Date.now()}`,
    user: testUser._id,
    travelCategory: 'flight',
    itinerarySnapshot: { title: 'Mumbai to Delhi Express Flight', flightNumber: '6E-101' },
    contactInfo: {
      email: 'priya.tester@test.com',
      phone: '+91 98765 00000',
    },
    passengers: [{ firstName: 'Priya', lastName: 'Sharma' }],
    pricing: {
      baseFare: 4200,
      taxes: 504,
      serviceFee: 150,
      discount: 0,
      totalPayable: 4854,
      currency: 'INR',
    },
    bookingStatus: 'pending_payment',
  });
});

afterAll(async () => {
  if (testBooking) await Booking.findByIdAndDelete(testBooking._id);
  if (testUser) await User.findByIdAndDelete(testUser._id);
  await disconnectDB();
});

describe('Production Payment Engine & Gateway Sandbox Suite', () => {
  let createdOrderId = null;

  it('POST /api/v1/payments/create-order creates a secure payment order', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookingId: testBooking._id,
        amount: 4854,
        currency: 'INR',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderId).toBeDefined();
    expect(res.body.data.amount).toBe(4854);
    createdOrderId = res.body.data.orderId;
  });

  it('POST /api/v1/payments/verify confirms payment and issues transaction receipt', async () => {
    expect(createdOrderId).toBeDefined();

    const res = await request(app)
      .post('/api/v1/payments/verify')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookingId: testBooking._id,
        orderId: createdOrderId,
        paymentId: `pay_mock_${Date.now()}`,
        signature: 'mock_signature_verified',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.booking.bookingStatus).toBe('confirmed');
    expect(res.body.data.payment.status).toBe('captured');

    // Verify booking status was updated in database
    const updatedBooking = await Booking.findById(testBooking._id);
    expect(updatedBooking.bookingStatus).toBe('confirmed');
    expect(updatedBooking.paymentStatus).toBe('paid');
  });

  it('POST /api/v1/payments/create-order rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .send({
        bookingId: testBooking._id,
        amount: 4854,
      });

    expect(res.status).toBe(401);
  });
});
