import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Trip } from '../src/models/Trip.js';
import { ItineraryItem } from '../src/models/ItineraryItem.js';
import { TripExpense } from '../src/models/TripExpense.js';
import { generateToken } from '../src/middleware/auth.js';

let authToken = null;
let anotherUserToken = null;
let testUser = null;
let anotherUser = null;

beforeAll(async () => {
  await connectDB();

  // Create primary test user
  testUser = await User.create({
    displayName: 'Aarav Traveler',
    email: 'aarav.traveler@test.com',
    role: 'customer',
  });
  authToken = generateToken(testUser);

  // Create another user to test authorization protection
  anotherUser = await User.create({
    displayName: 'Unauthorized Stranger',
    email: 'stranger@test.com',
    role: 'customer',
  });
  anotherUserToken = generateToken(anotherUser);
});

afterAll(async () => {
  await disconnectDB();
});

describe('My Journeys — Independent Trip Planning & Expense Suite', () => {
  let createdTripId = null;
  let itineraryItemId = null;
  let expenseId = null;

  it('1. Successfully creates an independent trip with ZERO bookings', async () => {
    const res = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Manali & Spiti Valley Adventure',
        destination: 'Manali',
        additionalDestinations: ['Solang Valley', 'Kaza'],
        startDate: '2026-12-10',
        endDate: '2026-12-18',
        travelersCount: 3,
        currency: 'INR',
        totalBudget: 75000,
        description: 'Winter road trip and high-altitude exploration.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Manali & Spiti Valley Adventure');
    expect(res.body.data.destination).toBe('Manali');
    expect(res.body.data.additionalDestinations).toContain('Solang Valley');
    expect(res.body.data.participants).toHaveLength(1);
    expect(res.body.data.participants[0].role).toBe('owner');

    createdTripId = res.body.data._id;
  });

  it('2. Adds an EXTERNAL reservation (Booking.com hotel)', async () => {
    const res = await request(app)
      .post(`/api/v1/trips/${createdTripId}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'The Himalayan Hideaway Resort',
        description: 'Luxury mountain cottage booked on Booking.com',
        category: 'hotel',
        sourceType: 'external_booking',
        externalProvider: 'Booking.com',
        bookingReference: 'BK-992384',
        externalBookingUrl: 'https://booking.com/hotel/himalayan-hideaway',
        location: { name: 'Old Manali, HP', address: 'Club House Road, Old Manali' },
        date: '2026-12-10',
        startTime: '14:00',
        endTime: '11:00',
        estimatedCost: 18000,
        actualCost: 18000,
        currency: 'INR',
        status: 'confirmed',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sourceType).toBe('external_booking');
    expect(res.body.data.externalProvider).toBe('Booking.com');
    expect(res.body.data.bookingReference).toBe('BK-992384');

    itineraryItemId = res.body.data._id;
  });

  it('3. Adds a manual sightseeing activity and detects scheduling overlaps', async () => {
    // Activity 1: Solang Valley Skiing (10:00 to 14:00)
    const act1Res = await request(app)
      .post(`/api/v1/trips/${createdTripId}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Solang Valley Snowboarding & Skiing',
        category: 'activities',
        sourceType: 'manual_entry',
        date: '2026-12-12',
        startTime: '10:00',
        endTime: '14:00',
        estimatedCost: 3500,
        actualCost: 3500,
      });

    expect(act1Res.status).toBe(201);
    expect(act1Res.body.success).toBe(true);

    // Verify auto-generated expense has valid enum 'activities' and NOT 'activitiess'
    const autoExpense = await TripExpense.findOne({ trip: createdTripId, title: 'Solang Valley Snowboarding & Skiing' });
    expect(autoExpense).toBeTruthy();
    expect(autoExpense.category).toBe('activities');
    expect(autoExpense.amount).toBe(3500);

    // Activity 2: Overlapping Lunch Tour on same day (13:00 to 15:00)
    await request(app)
      .post(`/api/v1/trips/${createdTripId}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Riverside Trout Dining Experience',
        category: 'restaurant',
        sourceType: 'manual_entry',
        date: '2026-12-12',
        startTime: '13:00',
        endTime: '15:00',
        estimatedCost: 2000,
        actualCost: 2000,
      });

    // Query itinerary to verify overlap warning is flagged
    const itinRes = await request(app)
      .get(`/api/v1/trips/${createdTripId}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(itinRes.status).toBe(200);
    expect(itinRes.body.count).toBe(3);
    expect(itinRes.body.warnings.some((w) => w.type === 'TIME_OVERLAP')).toBe(true);
  });

  it('4. Records a multi-currency expense with automatic conversion and splitting', async () => {
    // Expense in USD (e.g. $100 travel gear purchase)
    const res = await request(app)
      .post(`/api/v1/trips/${createdTripId}/expenses`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Thermal Jackets & Crampons (Imported)',
        category: 'shopping',
        amount: 100,
        currency: 'USD',
        date: '2026-12-11',
        description: 'Gear for winter passes',
        paidBy: { name: 'Aarav Traveler', email: 'aarav@test.com' },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(100);
    expect(res.body.data.currency).toBe('USD');
    expect(res.body.data.exchangeRate).toBeGreaterThan(80);
    expect(res.body.data.convertedAmount).toBeGreaterThan(8000); // 100 * ~83.5 = 8350

    expenseId = res.body.data._id;
  });

  it('5. Invites a travel companion and computes debt settlement summary', async () => {
    // Invite Rohan
    const inviteRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/participants`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Rohan Sharma',
        email: 'rohan.sharma@example.com',
        role: 'editor',
      });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.data.some((p) => p.name === 'Rohan Sharma')).toBe(true);

    // Compute settlement
    const settlementRes = await request(app)
      .get(`/api/v1/trips/${createdTripId}/settlement`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(settlementRes.status).toBe(200);
    expect(settlementRes.body.data.memberBalances).toBeDefined();
    expect(settlementRes.body.data.totalSpent).toBeGreaterThan(0);
  });

  it('6. Securely uploads and downloads a private trip document', async () => {
    const docRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/documents`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Booking.com Hotel Confirmation Voucher',
        category: 'hotel_confirmation',
        fileName: 'himalayan_hotel_voucher.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
        notes: 'Reservation code BK-992384',
      });

    expect(docRes.status).toBe(201);
    expect(docRes.body.data.title).toBe('Booking.com Hotel Confirmation Voucher');
    const docId = docRes.body.data._id;

    // Download document privately
    const downloadRes = await request(app)
      .get(`/api/v1/trips/${createdTripId}/documents/${docId}/download`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(downloadRes.status).toBe(200);
    expect(downloadRes.body.data.fileName).toBe('himalayan_hotel_voucher.pdf');
    expect(downloadRes.body.data.fileData).toBeDefined();
  });

  it('7. Enforces authorization: Unauthorized user CANNOT view or edit another user private journey', async () => {
    // Stranger tries to get trip
    const getRes = await request(app)
      .get(`/api/v1/trips/${createdTripId}`)
      .set('Authorization', `Bearer ${anotherUserToken}`);

    expect(getRes.status).toBe(403);
    expect(getRes.body.success).toBe(false);

    // Stranger tries to delete trip
    const deleteRes = await request(app)
      .delete(`/api/v1/trips/${createdTripId}`)
      .set('Authorization', `Bearer ${anotherUserToken}`);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.success).toBe(false);
  });

  it('8. Allows an invited collaborator to voluntarily leave a journey, while preventing owner from leaving', async () => {
    // 1. Owner adds anotherUser as Editor
    const addRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/participants`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Unauthorized Stranger',
        email: 'stranger@test.com',
        role: 'editor',
      });
    expect(addRes.status).toBe(201);

    // 2. AnotherUser accepts invitation
    const acceptRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/invitation/respond`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ action: 'accept' });
    expect(acceptRes.status).toBe(200);

    // 3. AnotherUser (Editor) voluntarily leaves the journey
    const leaveRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/leave`)
      .set('Authorization', `Bearer ${anotherUserToken}`);

    expect(leaveRes.status).toBe(200);
    expect(leaveRes.body.success).toBe(true);
    expect(leaveRes.body.message).toContain('successfully left the journey');

    // 4. Verify anotherUser is no longer in participants
    const checkTrip = await Trip.findById(createdTripId);
    const isStillMember = checkTrip.participants.some(
      (p) => p.email.toLowerCase() === 'stranger@test.com'
    );
    expect(isStillMember).toBe(false);

    // 5. Verify owner CANNOT leave their own journey
    const ownerLeaveRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/leave`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(ownerLeaveRes.status).toBe(400);
    expect(ownerLeaveRes.body.success).toBe(false);
    expect(ownerLeaveRes.body.message).toContain('Journey owners cannot leave');
  });

  it('9. Excludes pending collaborators from expense splits until invitation is accepted', async () => {
    const inviteRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/participants`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Pending Guest',
        email: 'pending.guest@test.com',
        role: 'editor',
      });
    expect(inviteRes.status).toBe(201);

    const autoExpRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/expenses`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Group Dinner',
        category: 'food',
        amount: 2000,
        currency: 'INR',
        splitType: 'equal',
      });

    expect(autoExpRes.status).toBe(201);
    expect(autoExpRes.body.success).toBe(true);
    const splitEmails = (autoExpRes.body.data.splits || []).map((s) => s.email?.toLowerCase());
    expect(splitEmails).not.toContain('pending.guest@test.com');
  });

  it('10. Validates and processes settlement reminder notifications', async () => {
    const badRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/settlement/notify`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ debtorName: 'Rohan', amount: 0 });

    expect(badRes.status).toBe(400);
    expect(badRes.body.success).toBe(false);

    const okRes = await request(app)
      .post(`/api/v1/trips/${createdTripId}/settlement/notify`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        debtorName: 'Rohan Sharma',
        debtorEmail: 'rohan@test.com',
        creditorName: 'Aarav Traveler',
        amount: 1500,
        customMessage: 'Please settle ₹1,500 when you get a chance.',
      });

    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);
  });

  it('11. Updates journey status and persists journey-synced packing list', async () => {
    const updateRes = await request(app)
      .put(`/api/v1/trips/${createdTripId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'ongoing',
        packingList: [
          {
            name: 'Essentials',
            items: [{ text: 'Passport & IDs', packed: true }],
          },
        ],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.status).toBe('ongoing');
    expect(updateRes.body.data.packingList).toHaveLength(1);
    expect(updateRes.body.data.packingList[0].items[0].packed).toBe(true);
  });

  it('12. Does not emit MISSING_ACCOMMODATION warnings on multi-day trips without hotel items', async () => {
    const tripRes = await request(app)
      .post('/api/v1/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Weekend Road Trip',
        destination: 'Coorg',
        startDate: '2026-12-01',
        endDate: '2026-12-03',
      });
    expect(tripRes.status).toBe(201);

    const itinRes = await request(app)
      .get(`/api/v1/trips/${tripRes.body.data._id}/itinerary`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(itinRes.status).toBe(200);
    const hasAccommodationWarn = (itinRes.body.warnings || []).some(
      (w) => w.type === 'MISSING_ACCOMMODATION'
    );
    expect(hasAccommodationWarn).toBe(false);
  });
});

