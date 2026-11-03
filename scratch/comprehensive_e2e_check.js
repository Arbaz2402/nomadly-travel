import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runE2E() {
  console.log('🧪 Starting Comprehensive E2E Bug Finding Suite...\n');
  const results = { passed: 0, failed: 0, issues: [] };

  function check(name, condition, errorMsg = '') {
    if (condition) {
      results.passed++;
      console.log(`  ✅ PASS: ${name}`);
    } else {
      results.failed++;
      results.issues.push(`${name}: ${errorMsg}`);
      console.log(`  ❌ FAIL: ${name} — ${errorMsg}`);
    }
  }

  try {
    // 1. Health check
    console.log('--- 1. Telemetry & Health ---');
    const health = await request('/api/health');
    check('Health Check', health.status === 200 && health.data.status === 'online', JSON.stringify(health.data));

    // 2. Auth & Personas
    console.log('\n--- 2. Authentication & Demo Personas ---');
    const customerLogin = await request('/api/v1/auth/demo-login', { method: 'POST', body: { role: 'customer' } });
    check('Customer Demo Login', customerLogin.status === 200 && customerLogin.data.data.token, 'Token missing');
    const customerToken = customerLogin.data.data?.token;

    const adminLogin = await request('/api/v1/auth/demo-login', { method: 'POST', body: { role: 'admin' } });
    check('Admin Demo Login', adminLogin.status === 200 && adminLogin.data.data.token, 'Token missing');
    const adminToken = adminLogin.data.data?.token;

    const me = await request('/api/v1/auth/me', { headers: { Authorization: `Bearer ${customerToken}` } });
    check('Get Current User (me)', me.status === 200 && me.data.data.email === 'traveler@nomadly.travel', 'Email mismatch');

    // 3. Travel Discovery
    console.log('\n--- 3. Travel Inventory Discovery ---');
    const flights = await request('/api/v1/flights/search?origin=BOM&destination=DEL');
    check('Flight Search (BOM->DEL)', flights.status === 200 && flights.data.count > 0, `Count was ${flights.data.count}`);

    const airports = await request('/api/v1/flights/airports');
    check('Airports Autocomplete', airports.status === 200 && airports.data.data.length > 0, 'No airports');

    const hotels = await request('/api/v1/hotels/search');
    check('Hotels Search', hotels.status === 200 && hotels.data.count > 0, 'No hotels');

    const trains = await request('/api/v1/trains/search');
    check('Trains Search', trains.status === 200 && trains.data.count > 0, 'No trains');

    const buses = await request('/api/v1/buses/search');
    check('Buses Search', buses.status === 200 && buses.data.count > 0, 'No buses');

    // 4. Bus Seat Hold Engine
    console.log('\n--- 4. Bus Seat Hold & Concurrency Engine ---');
    let busId = buses.data.data[0]?._id;
    let holdSuccess = false;
    if (busId) {
      const holdRes = await request(`/api/v1/buses/${busId}/hold`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customerToken}` },
        body: { seatNumbers: ['L1', 'L2'] },
      });
      holdSuccess = holdRes.status === 200 && holdRes.data.success;
      check('Atomic Bus Seat Hold', holdSuccess, JSON.stringify(holdRes.data));
    }

    // 5. Coupon Engine
    console.log('\n--- 5. Authoritative Coupon & Pricing Engine ---');
    const couponRes = await request('/api/v1/coupons/validate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { code: 'NOMAD10', category: 'flight', amount: 5000 },
    });
    const discount = couponRes.data.data?.calculatedDiscount || couponRes.data.data?.discountAmount;
    check('Coupon NOMAD10 Validation', couponRes.status === 200 && discount > 0, JSON.stringify(couponRes.data));

    // 6. Booking & Sandbox Payment
    console.log('\n--- 6. Reservation & Payment Processing ---');
    const flightId = flights.data.data[0]?._id;
    const createBookingRes = await request('/api/v1/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        travelCategory: 'flight',
        inventoryId: flightId,
        passengers: [{ firstName: 'Aarav', lastName: 'Sharma', gender: 'male', seatNumber: '14B' }],
        contactInfo: { email: 'traveler@nomadly.travel', phone: '+91 91234 56789' },
        couponCode: 'NOMAD10',
      },
    });

    let newBooking = createBookingRes.data.data;
    check('Booking Creation', createBookingRes.status === 201 && newBooking?.bookingReference, JSON.stringify(createBookingRes.data));

    // Payment Sandbox Order
    const payOrder = await request('/api/v1/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { bookingId: newBooking?._id, amount: 5473, currency: 'INR' },
    });
    check('Razorpay Sandbox Order Creation', payOrder.status === 200 && payOrder.data.data.orderId, JSON.stringify(payOrder.data));

    // Payment Verification
    const verifyPay = await request('/api/v1/payments/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        bookingId: newBooking?._id,
        razorpay_order_id: payOrder.data.data?.orderId || 'mock_order_1',
        razorpay_payment_id: 'pay_mock_123456',
        razorpay_signature: 'sandbox_valid_sig',
      },
    });
    check('Sandbox Payment Verification', verifyPay.status === 200 && verifyPay.data.success, JSON.stringify(verifyPay.data));

    // 7. My Journeys Suite
    console.log('\n--- 7. My Journeys Feature Suite ---');
    const tripsRes = await request('/api/v1/trips', { headers: { Authorization: `Bearer ${customerToken}` } });
    check('List User Journeys', tripsRes.status === 200 && Array.isArray(tripsRes.data.data), 'Not an array');

    // Create New Independent Trip
    const newTripRes = await request('/api/v1/trips', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Kerala Backwaters & Tea Trails 2026',
        destination: 'Kochi',
        additionalDestinations: ['Munnar', 'Alleppey'],
        startDate: '2026-11-25',
        endDate: '2026-12-02',
        travelersCount: 2,
        currency: 'INR',
        totalBudget: 65000,
        description: 'Houseboat stay, spice plantation walk, and hill station exploration.',
      },
    });
    check('Create Independent Trip (0 Bookings Required)', newTripRes.status === 201 && newTripRes.data.data._id, JSON.stringify(newTripRes.data));
    const tripId = newTripRes.data.data?._id;

    // Attach existing NOMADLY booking to trip
    const attachRes = await request(`/api/v1/trips/${tripId}/attach-booking`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { bookingId: newBooking?._id },
    });
    check('Attach NOMADLY Booking to Journey', attachRes.status === 200 && attachRes.data.success, JSON.stringify(attachRes.data));

    // Add External Booking (Booking.com hotel)
    const extHotelRes = await request(`/api/v1/trips/${tripId}/itinerary`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Spice Tree Munnar Resort',
        description: 'Jacuzzi villa booked via Booking.com',
        category: 'hotel',
        sourceType: 'external_booking',
        externalProvider: 'Booking.com',
        bookingReference: 'BK-MUN-77491',
        externalBookingUrl: 'https://booking.com/hotel/spice-tree',
        date: '2026-11-26',
        startTime: '14:00',
        endTime: '11:00',
        estimatedCost: 22000,
        actualCost: 22000,
        currency: 'INR',
        status: 'confirmed',
      },
    });
    check('Add External Reservation (Booking.com)', extHotelRes.status === 201 && extHotelRes.data.data._id, JSON.stringify(extHotelRes.data));
    const extHotelId = extHotelRes.data.data?._id;

    // Add Manual Sightseeing & Overlapping Activity to test warnings
    const act1 = await request(`/api/v1/trips/${tripId}/itinerary`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Tea Museum & Plantation Trek',
        category: 'sightseeing',
        sourceType: 'manual_entry',
        date: '2026-11-27',
        startTime: '10:00',
        endTime: '13:00',
        estimatedCost: 1500,
        actualCost: 1200,
      },
    });

    const act2 = await request(`/api/v1/trips/${tripId}/itinerary`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Eravikulam National Park Safari',
        category: 'activities',
        sourceType: 'manual_entry',
        date: '2026-11-27',
        startTime: '12:00', // Overlaps with act1 (10:00 - 13:00)
        endTime: '15:00',
        estimatedCost: 2000,
        actualCost: 2000,
      },
    });

    const itinCheck = await request(`/api/v1/trips/${tripId}/itinerary`, { headers: { Authorization: `Bearer ${customerToken}` } });
    const hasOverlapWarning = itinCheck.data.warnings?.some(w => w.type === 'TIME_OVERLAP');
    check('Itinerary Scheduling Overlap Detection', itinCheck.status === 200 && hasOverlapWarning, 'No overlap warning generated');

    // Multi-currency expense recording
    const usdExpense = await request(`/api/v1/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Outdoor Hiking Backpack (USD)',
        category: 'shopping',
        amount: 80,
        currency: 'USD',
        date: '2026-11-26',
        paidBy: { name: 'Aarav Sharma', email: 'traveler@nomadly.travel' },
      },
    });
    const convAmount = usdExpense.data.data?.convertedAmount;
    check('Multi-Currency Expense Conversion (USD -> INR)', usdExpense.status === 201 && convAmount > 6000, `Converted was ${convAmount}`);

    // Splitting & Settlement calculation
    const settlement = await request(`/api/v1/trips/${tripId}/settlement`, { headers: { Authorization: `Bearer ${customerToken}` } });
    check('Expense Splitting Settlement Algorithm', settlement.status === 200 && settlement.data.data.memberBalances?.length > 0, 'No member balances');

    // Document upload & download
    const docUpload = await request(`/api/v1/trips/${tripId}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        title: 'Houseboat Rental Voucher',
        category: 'hotel_confirmation',
        fileName: 'alleppey_houseboat.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCg==',
      },
    });
    check('Upload Trip Document', docUpload.status === 201 && docUpload.data.data._id, JSON.stringify(docUpload.data));
    const docId = docUpload.data.data?._id;

    const docDownload = await request(`/api/v1/trips/${tripId}/documents/${docId}/download`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    check('Private Document Download', docDownload.status === 200 && docDownload.data.data.fileData, 'Missing file data');

    // 8. Admin Portal Controls
    console.log('\n--- 8. Admin Telemetry & Governance ---');
    const adminOverview = await request('/api/v1/admin/overview', { headers: { Authorization: `Bearer ${adminToken}` } });
    check('Admin Overview Telemetry', adminOverview.status === 200 && adminOverview.data.data?.kpis, 'KPIs missing');

    const adminBookings = await request('/api/v1/admin/bookings', { headers: { Authorization: `Bearer ${adminToken}` } });
    check('Admin Bookings List', adminBookings.status === 200 && adminBookings.data.count > 0, 'No bookings in admin');

    const adminUsers = await request('/api/v1/admin/users', { headers: { Authorization: `Bearer ${adminToken}` } });
    check('Admin Users List', adminUsers.status === 200 && adminUsers.data.count > 0, 'No users in admin');

  } catch (err) {
    console.error('Fatal Test Exception:', err);
    results.failed++;
    results.issues.push(`Fatal: ${err.message}`);
  }

  console.log('\n=======================================');
  console.log(`🏁 Test Summary: ${results.passed} Passed, ${results.failed} Failed`);
  if (results.issues.length > 0) {
    console.log('🚨 Issues to resolve:');
    results.issues.forEach(i => console.log('  - ' + i));
  } else {
    console.log('🎉 ZERO BUGS DETECTED ACROSS ALL API ENDPOINTS & ZERO-CONFIG FALLBACKS!');
  }
  console.log('=======================================\n');
}

runE2E();
