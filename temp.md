# 📘 NOMADLY Master Guide: Testing Fundamentals & Frontend Architecture

> This document is your comprehensive learning and reference guide covering:
> 1. **How to create production-ready test cases from scratch** (even if you have never written a test before).
> 2. **Complete deep-dive into the Frontend architecture, libraries, and code structure**.

---

# PART 1: The Master Guide to Writing Test Cases

## 1. What is an Automated Test Case?

Imagine you are manufacturing cars. Before a car leaves the factory, an inspector tests:
- *Does the horn sound when pressed?*
- *Do the brakes stop the car within 10 meters?*
- *Does the engine refuse to start if there is no key?*

In software engineering, a **Test Case** is a small piece of code that automatically runs your application code, feeds it some input, and verifies whether the output matches what you expect.

### Why do we write tests?
1. **Never Break Working Code**: If you change a function 6 months from now, running tests guarantees you didn't accidentally break something else.
2. **Confidence in Deployment**: You can deploy to production on Friday afternoon knowing all 37 test cases passed 100%.
3. **Self-Documenting Code**: Anyone reading your tests immediately understands what each endpoint or function is supposed to do.

---

## 2. The 3 Levels of Testing (The Testing Pyramid)

```
        / \
       /   \      1. End-to-End (E2E) Tests (Fewest, slowest)
      / E2E \     e.g., Browser automation with Playwright/Cypress
     /-------\
    /         \   2. Integration Tests (Medium speed & quantity)
   /Integratn  \  e.g., Testing HTTP endpoints with Supertest + Database
  /-------------\
 /               \ 3. Unit Tests (Fastest, largest quantity)
/   Unit Tests    \ e.g., Testing individual functions (IATA resolution, math)
-------------------
```

1. **Unit Tests**:
   - Tests **one isolated function** without talking to external networks or databases.
   - *Example from our codebase*: Testing `resolveIataCode('Mumbai')`. Does it return `'BOM'`?
2. **Integration Tests**:
   - Tests how **multiple pieces work together**: HTTP Routes ➜ Controllers ➜ Business Logic ➜ Database.
   - *Example from our codebase*: Making an HTTP request to `GET /api/v1/flights/search?origin=BOM&destination=DEL` and verifying it returns status 200 with matching flights.
3. **End-to-End (E2E) Tests**:
   - Simulates a real human user opening Chrome, typing into inputs, clicking "Search", and checking out.

---

## 3. The Universal Testing Pattern: AAA (Arrange - Act - Assert)

Every good test case in the world follows the **AAA** structure:

```javascript
it('should calculate discount correctly', () => {
  // 1. ARRANGE: Set up the inputs and prerequisites
  const basePrice = 1000;
  const couponDiscount = 0.20; // 20% off

  // 2. ACT: Execute the function you want to test
  const finalPrice = basePrice - (basePrice * couponDiscount);

  // 3. ASSERT: Verify the result is exactly what you expected
  expect(finalPrice).toBe(800);
});
```

---

## 4. Understanding the Core Vitest / Jest Syntax

When you open any test file in our project (like `backend/tests/flights.test.js`), you will see these 5 keywords:

| Keyword | What It Does | Analogy |
| :--- | :--- | :--- |
| `describe('Suite Name', () => { ... })` | Groups related test cases together into a category | A folder or chapter name |
| `it('should do something', () => { ... })` | A single test case describing what behavior is tested | An individual checklist item |
| `expect(actual).toBe(expected)` | The assertion check. If true, test passes. If false, test fails! | The inspector's stamp of approval |
| `beforeAll(async () => { ... })` | Runs once **before** all the tests start (e.g. connect to database) | Turning on the lights in the workshop |
| `afterAll(async () => { ... })` | Runs once **after** all tests finish (e.g. disconnect from database) | Turning off the lights and locking the door |

---

## 5. Real-World Examples from Our Codebase

Here are 4 real production test cases from our test suites that you can learn from and reuse:

### Example 1: Testing a Pure Function (Unit Test)
*From `backend/tests/flights.test.js`:*
```javascript
import { describe, it, expect } from 'vitest';
import { resolveIataCode } from '../src/services/inventory/openDataService.js';

describe('IATA Code Resolution Engine', () => {
  it('should convert city names to official 3-letter IATA airport codes', () => {
    // We pass "Mumbai" and expect "BOM"
    expect(resolveIataCode('Mumbai')).toBe('BOM');

    // We pass "Delhi" and expect "DEL"
    expect(resolveIataCode('Delhi')).toBe('DEL');

    // We pass an already uppercase IATA code and expect it untouched
    expect(resolveIataCode('DXB')).toBe('DXB');
  });
});
```

### Example 2: Testing an HTTP API Endpoint (Integration Test with Supertest)
*From `backend/tests/trains.test.js`:*
```javascript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js'; // Your Express server

describe('Trains API', () => {
  it('GET /api/v1/trains/search returns express trains matching query', async () => {
    // 1. ACT: Make a simulated HTTP GET request
    const response = await request(app)
      .get('/api/v1/trains/search?origin=Mumbai&destination=Delhi');

    // 2. ASSERT: Check HTTP status and JSON response
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBeGreaterThan(0);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

### Example 3: Testing an Authenticated Endpoint (Testing Security)
*From `backend/tests/payments.test.js`:*
```javascript
describe('Payment Security', () => {
  it('rejects order creation if no auth token is provided (401 Unauthorized)', async () => {
    // We send request WITHOUT Authorization header
    const response = await request(app)
      .post('/api/v1/payments/create-order')
      .send({ amount: 5000 });

    // It MUST be rejected with HTTP 401
    expect(response.status).toBe(401);
  });

  it('allows order creation when valid Bearer token is provided', async () => {
    // We send request WITH valid Authorization token
    const response = await request(app)
      .post('/api/v1/payments/create-order')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ bookingId: myBookingId, amount: 5000 });

    expect(response.status).toBe(200);
    expect(response.body.data.orderId).toBeDefined();
  });
});
```

### Example 4: Testing Concurrency & Business Logic (Edge Cases)
*From `backend/tests/buses.test.js`:*
```javascript
it('rejects conflicting seat reservation if another customer already held it (409 Conflict)', async () => {
  // User 1 holds seat L1
  await request(app)
    .post(`/api/v1/buses/${busId}/hold`)
    .send({ seatNumbers: ['L1'], sessionId: 'user-session-1' });

  // User 2 tries to hold the same seat L1 at the same time
  const conflictRes = await request(app)
    .post(`/api/v1/buses/${busId}/hold`)
    .send({ seatNumbers: ['L1'], sessionId: 'user-session-2' });

  // System MUST reject with 409 Conflict to prevent double-booking!
  expect(conflictRes.status).toBe(409);
  expect(conflictRes.body.success).toBe(false);
});
```

---

## 6. How to Run and Watch Tests

In your terminal:
```bash
# 1. Run all tests once
npm test

# 2. Run tests in watch mode (re-runs automatically whenever you save a file!)
npm --prefix backend run test -- --watch

# 3. Run only one specific test file
npx vitest backend/tests/trains.test.js
```

---

## 7. The 5 Golden Rules of Writing Tests

1. **Test Names Should Tell a Story**: Write `it('rejects expired coupon code')` instead of `it('test 1')`.
2. **Keep Tests Independent**: Test B should never depend on Test A running first. Each test must set up what it needs.
3. **Test Failures, Not Just Success**: Always test what happens when invalid data is sent (e.g., negative prices, missing emails, expired tokens).
4. **Don't Test Third-Party Libraries**: Don't test if `mongoose` saves data; test if *your controller* handles the save properly.
5. **Fast Tests are Run Tests**: Keep your test suite running under 15 seconds so developers run it before every commit.

---

# PART 2: Deep-Dive into the Frontend Architecture & Tech Stack

## 1. Frontend Architectural Philosophy

The NOMADLY frontend is built as a **Single Page Application (SPA)** with **React 18** and **Vite 5**.

### Key Architectural Pillars:
- **Instant Client-Side Navigation**: Clicking between Flights, Hotels, Trains, and Journeys is instantaneous with zero page reloads (via `react-router-dom`).
- **Resilient Fallback Design**: Every page gracefully handles loading states, error boundaries, empty states, and offline situations.
- **Cinematic Dark Luxury Theme**: High-contrast midnight ink background (`#070a13`), vibrant coral primary (`#f43f5e`), teal secondary accents (`#14b8a6`), and backdrop glass blur panels (`backdrop-blur-md`).

---

## 2. Complete Tech Stack Inventory

Here is every library installed in `frontend/package.json` and the exact role it plays:

| Library | Version | Why We Use It |
| :--- | :--- | :--- |
| **`react` & `react-dom`** | `^18.2.0` | Core UI engine. Uses functional components and modern React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`). |
| **`vite`** | `^5.2.0` | Ultra-fast build tool and dev server. Replaces heavy legacy Webpack with instant Hot Module Replacement (HMR). |
| **`tailwindcss`** | `^3.4.3` | Utility-first CSS framework. Allows rapid styling using responsive utility classes directly in JSX without messy global CSS. |
| **`zustand`** | `^4.5.2` | Minimalist global state management. Used for `authStore.js` to manage the authenticated user session, tokens, and active currency (`INR`, `USD`). |
| **`@tanstack/react-query`** | `^5.29.2` | Server-state management. Caches API responses, manages background refetching, and eliminates redundant network calls. |
| **`firebase`** | `^10.11.0` | Official Firebase Web SDK. Handles client-side Google popup authentication (`signInWithPopup`) and email account registration. |
| **`lucide-react`** | `^0.368.0` | Lightweight, scalable vector icons (Plane, Hotel, Train, Bus, Map, Compass, Shield, User, Luggage). |
| **`framer-motion`** | `^11.1.7` | Production motion library powering page transitions, floating modal overlays, and micro-interactions. |
| **`recharts`** | `^2.12.5` | SVG charting library used in the Admin Dashboard (`/admin`) for revenue trends, monthly volume bars, and category breakdown pies. |
| **`react-hook-form` + `zod`** | `^7.51.3` | Form management and schema validation. Validates traveler names, passport numbers, email formats, and credit card fields with instant error hints. |
| **`canvas-confetti`** | `^1.9.2` | Delights users with a colorful confetti celebration burst when a booking is confirmed on the checkout success screen. |

---

## 3. Directory Structure Explained

```
frontend/src/
├── components/          # Reusable UI building blocks
│   ├── common/          # Modals, ErrorBoundary, AuthModal
│   ├── navigation/      # Navbar (with Google Auth popup), Footer
│   ├── travel-cards/    # FlightCard, HotelCard, TrainCard, BusCard
│   ├── booking/         # HotelRoomModal, SeatMap layouts
│   └── journeys/        # Kanban board, Itinerary timeline, AttachBookingModal
├── context/             # Global React contexts (ToastContext for alert popups)
├── pages/               # Main route views
│   ├── home/            # HomePage (Search hero, destination carousels)
│   ├── flights/         # FlightsPage (Search bar, airline filters, flight list)
│   ├── hotels/          # HotelsPage (City search, keyword filters, star rating)
│   ├── trains/          # TrainsPage (From/To stations, class selector EC/CC/1A)
│   ├── buses/           # BusesPage (From/To city, 30-seat interactive deck map)
│   ├── checkout/        # CheckoutPage (Traveler details, coupon, payment gateway)
│   ├── confirmation/    # BookingConfirmationPage (Ticket receipt with QR code)
│   ├── journeys/        # JourneysPage & TripWorkspacePage (Multi-modal planner)
│   ├── dashboard/       # DashboardPage (User bookings, profile, saved travelers)
│   └── admin/           # AdminDashboardPage (Financial KPIs, booking management)
├── services/            # External network communication
│   ├── api.js           # Centralized HTTP client (injects JWT Bearer tokens)
│   └── firebase.js      # Firebase Web SDK initialization & Google auth methods
└── store/               # Zustand global state stores
    └── authStore.js     # User session, login, logout, Google OAuth actions
```

---

## 4. How Data Flows Through the Application (3 Real Scenarios)

### Scenario A: A User Searches for Hotels in Goa
1. **User Action**: Types "Goa" in the search input on [`HotelsPage.jsx`](file:///d:/reservation_app/frontend/src/pages/hotels/HotelsPage.jsx) and clicks **"Search Hotels"**.
2. **Frontend State**: Updates query parameters `?city=Goa`.
3. **API Call**: Triggers `ApiClient.searchHotels({ city: 'Goa' })` in [`frontend/src/services/api.js`](file:///d:/reservation_app/frontend/src/services/api.js).
4. **Backend Route**: Request hits `GET /api/v1/hotels/search` in Express.
5. **Controller**: [`hotelController.js`](file:///d:/reservation_app/backend/src/controllers/hotelController.js) checks Tier 1 (RapidAPI Booking.com).
6. **External Fetch**: RapidAPI queries Booking.com live servers, formats real photos and guest ratings.
7. **Response**: Express sends JSON back to React.
8. **UI Render**: `HotelsPage.jsx` maps the array into [`HotelCard.jsx`](file:///d:/reservation_app/frontend/src/components/travel-cards/HotelCard.jsx) items displaying real pictures and prices.

---

### Scenario B: A User Signs In with Google
1. **User Action**: Clicks **"Sign In / Register"** in the top navigation bar.
2. **Modal Opens**: [`AuthModal.jsx`](file:///d:/reservation_app/frontend/src/components/common/AuthModal.jsx) pops up and user clicks **"Continue with Google"**.
3. **Firebase Popup**: [`signInWithGoogle()`](file:///d:/reservation_app/frontend/src/services/firebase.js) opens Google's official OAuth window.
4. **Token Generation**: Upon successful Google login, Firebase returns a signed JWT `idToken`.
5. **State Sync**: [`authStore.js`](file:///d:/reservation_app/frontend/src/store/authStore.js) saves the token to `localStorage` (`nomadly_token`).
6. **Backend Sync**: Frontend calls `ApiClient.getMe()`. The backend middleware [`auth.js`](file:///d:/reservation_app/backend/src/middleware/auth.js) verifies the token using the Firebase Admin SDK, automatically creates or updates the user record in **MongoDB Atlas**, and returns the full profile.
7. **UI Update**: Navbar immediately switches from "Sign In" to the user's avatar and name!

---

### Scenario C: Reserving and Locking a Bus Seat
1. **User Action**: Opens [`BusesPage.jsx`](file:///d:/reservation_app/frontend/src/pages/buses/BusesPage.jsx) (e.g. Mumbai ➜ Goa) and clicks "Select Seats".
2. **Deck Map Rendered**: Renders the 30-seat interactive SVG map (Lower & Upper Decks).
3. **Atomic Hold Request**: When user selects seats (e.g., `L1`, `L2`), the frontend calls `POST /api/v1/buses/:id/hold`.
4. **Server Concurrency Lock**: Backend [`holdService.js`](file:///d:/reservation_app/backend/src/services/inventory/holdService.js) checks if anyone else holds those seats. If free, it creates an `InventoryHold` record expiring in 10 minutes.
5. **Checkout Navigation**: User proceeds to [`CheckoutPage.jsx`](file:///d:/reservation_app/frontend/src/pages/checkout/CheckoutPage.jsx). If another user attempts to book `L1`, the server will reject them with `409 Conflict`.
6. **Payment & Invoice**: Upon selecting payment and confirming, the hold converts to `confirmed`, the booking is marked `paid`, and a downloadable PDF invoice is generated with a verification QR code.

---

## 5. Summary Cheat Sheet for Developers

- **To run the whole app**: `npm run dev` (Runs backend on `:5000` & frontend on `:5173`).
- **To run test suites**: `npm test` (Runs 37 automated Vitest unit & integration tests).
- **To build for production**: `npm run build` (Compiles optimized bundle into `frontend/dist`).
- **To add a new API call**: Add a static method in `frontend/src/services/api.js`.
- **To access the logged-in user anywhere in React**:
  ```javascript
  import { useAuthStore } from '../store/authStore';
  const { user, logout } = useAuthStore();
  ```

