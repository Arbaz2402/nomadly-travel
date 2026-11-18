# 🧭 NOMADLY — Unified Travel Reservation & Intelligent Journey Platform

[![Production Status](https://img.shields.io/badge/Production-Live-success?style=for-the-badge&logo=render)](https://nomadly-travel.onrender.com)
[![Frontend Client](https://img.shields.io/badge/Frontend-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://nomadly-travel.netlify.app)
[![API Documentation](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger)](https://nomadly-travel.onrender.com/api-docs)
[![Test Suite](https://img.shields.io/badge/Tests-68%20Passing-brightgreen?style=for-the-badge&logo=vitest)](https://github.com/Arbaz2402/nomadly-travel)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **"Your entire journey, intelligently organized."**  
> **NOMADLY** is a production-grade full-stack travel booking, itinerary collaboration, and expense splitting platform built on the modern MERN architecture (**React 18, Vite, Node.js Express, MongoDB Atlas, Firebase Cloud Identity, RapidAPI Booking.com, and Tailwind CSS**). Search, compare, hold, book, and orchestrate flights, luxury boutique hotels, verified local tours, flight+hotel combo packages, and AI-generated multi-day itineraries from a single unified interface.

---

## 📑 Table of Contents

1. [Live Production Deployments](#-live-production-deployments)
2. [Interactive System Architecture](#-interactive-system-architecture)
3. [Core Feature Breakdown](#-core-feature-breakdown)
4. [Technology Stack](#-technology-stack)
5. [Database Architecture & Data Models](#-database-architecture--data-models)
6. [Interactive Swagger OpenAPI Documentation](#-interactive-swagger-openapi-documentation)
7. [API Endpoint Directory](#-api-endpoint-directory)
8. [Automated Testing Suite (100% Passing)](#-automated-testing-suite)
9. [Quickstart & Local Development](#-quickstart--local-development)
10. [Environment Variables Reference](#-environment-variables-reference)
11. [Project Directory Structure](#-project-directory-structure)

---

## 🌐 Live Production Deployments

| Component | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [nomadly-travel.netlify.app](https://nomadly-travel.netlify.app) | React 18 SPA deployed on Netlify with global CDN, responsive dark theme, and interactive travel tools. |
| **Backend REST API** | [nomadly-travel.onrender.com](https://nomadly-travel.onrender.com) | Express ESM API deployed on Render with rate limiting, helmet security, and MongoDB Atlas connection. |
| **Swagger OpenAPI UI** | [nomadly-travel.onrender.com/api-docs](https://nomadly-travel.onrender.com/api-docs) | Interactive Swagger UI for testing all REST endpoints with live request execution and schema examples. |
| **API Health Check** | [nomadly-travel.onrender.com/api/health](https://nomadly-travel.onrender.com/api/health) | Uptime health status endpoint returning server timestamp, version, and connectivity. |

---

## 🏛️ Interactive System Architecture

```mermaid
flowchart TD
    subgraph ClientTier["Frontend Client (Netlify : nomadly-travel.netlify.app)"]
        ReactApp["React 18 + Vite SPA"]
        ZustandStore["Zustand State (Auth & Session)"]
        ApiClient["Singleton ApiClient (Fetch Engine)"]
        FirebaseSDK["Firebase Web SDK 10.11 (OAuth Client)"]
        ReactApp --> ZustandStore
        ReactApp --> ApiClient
        ReactApp --> FirebaseSDK
    end

    subgraph EdgeAuth["Cloud Identity Provider"]
        FirebaseCloud["Firebase Auth Platform (nomadly-app-fe5b9)\n• Google OAuth Popup\n• Cryptographic ID Token Minting"]
    end

    subgraph BackendTier["Backend API (Render : nomadly-travel.onrender.com)"]
        ExpressApp["Express 4.19 REST API (/api/v1)"]
        SwaggerDoc["Swagger UI Engine (/api-docs)\n• OpenAPI 3.0.3 Interactive Spec"]
        AuthMid["Firebase Admin SDK 12.0 + JWT Middleware"]
        HoldEngine["Atomic 10-Minute Hold Engine"]
        PaymentEngine["NOMADLY Secure Payment Engine\n(Card, UPI QR, NetBanking)"]
        AIEngine["Google Gemini 1.5 Flash\nSmart Trip Concierge"]
        ExpressApp --> SwaggerDoc
        ExpressApp --> AuthMid
        ExpressApp --> HoldEngine
        ExpressApp --> PaymentEngine
        ExpressApp --> AIEngine
    end

    subgraph DataTier["Data & Cloud Storage Layer"]
        Atlas[("MongoDB Atlas Cloud Cluster\n• 19 Collections\n• Users, Bookings, Trips, Inventory")]
        RapidAPI["RapidAPI Booking.com Live API\n(Real Properties, Reviews, Pricing)"]
    end

    FirebaseSDK -->|1. OAuth Login Popup| FirebaseCloud
    FirebaseCloud -->|2. Returns Signed ID Token| FirebaseSDK
    ApiClient -->|3. POST /auth/firebase-login (ID Token)| ExpressApp
    AuthMid -->|4. Verifies Signature| FirebaseCloud
    ExpressApp -->|5. Find or Create User| Atlas
    ExpressApp -->|6. Search Live Stays| RapidAPI
    HoldEngine -->|7. Concurrency Lock & TTL Index| Atlas
    PaymentEngine -->|8. Store Confirmed Reservation| Atlas
```

---

## 🌟 Core Feature Breakdown

### 1. Flights Discovery Engine
- **Live Search**: Autocomplete for domestic and international airports (e.g. BOM, DEL, BLR, GOI, DXB).
- **Cabin Classes**: Economy, Premium Economy, Business, and First Class with realistic cabin amenities.
- **Dynamic Seating & Fares**: Live seat matrix, baggage allowances, duration calculation, and stops filtering.

### 2. Hotels & Boutique Stays (RapidAPI Booking.com)
- **Live Inventory**: Direct query against RapidAPI Booking.com for verified global properties.
- **Rich Media**: High-resolution room galleries, guest review scores, verified star ratings, and neighborhood tags.
- **Local Fallback**: Instant local destination caching and OpenStreetMap spatial discovery for 100% uptime.

### 3. Tours & Destination Experiences
- **Authentic Local Activities**: Scuba diving in Goa, sunset yacht sailing in Mumbai, royal boat cruises in Udaipur, red dunes desert safaris in Dubai, hot air balloons in Jaipur, and Shikara rides on Dal Lake.
- **Direct Integration**: Instant booking or 1-click **Add to Journey** to schedule activities into travel workspaces.

### 4. Curated Vacation Packages & Combos
- **Dynamic Bundling**: Pairs real live flights and boutique hotels with authentic package discounts (15–20% off).
- **Complimentary Perks**: Airport transfers, daily champagne breakfast, and activity credits included in a single e-ticket.

### 5. AI Smart Trip Planner (Google Gemini 1.5 Flash)
- **Zero Cost & Real Data**: Powered by Google Gemini 1.5 Flash via REST integration with local destination intelligence fallback.
- **Customization Wizard**: Input destination, days (2–7), budget style (*Budget*, *Balanced*, *Luxury*), and interests.
- **1-Click Export to My Journeys**: Automatically compiles day-by-day itineraries and creates live interactive `Trip` and `ItineraryItem` records.

### 6. Concurrency-Safe 10-Minute Hold Engine
- **Lock Protection**: Temporary seat and room reservation holds prevent double-booking collisions while travelers complete checkout.
- **TTL Indexing**: MongoDB native Time-To-Live index automatically releases abandoned seats after 10 minutes without polling.

### 7. Collaborative "My Journeys" Workspace
- **Multi-Day Itinerary Builder**: Morning, afternoon, and evening timeline with manual entries or linked reservations.
- **Split Expense Ledger**: Track shared trip costs, assign payers, compute who owes whom, and mark debts as settled.
- **Document Vault**: Upload and store flight tickets, boarding passes, hotel vouchers, and ID scans.
- **Travel Companion Collaboration**: Invite travel partners via email with *Owner*, *Editor*, or *Viewer* access controls and invitation request lifecycles.

### 8. Payment Gateway & E-Ticket Issuance
- **Sandbox Processing**: Supports Credit/Debit Cards, UPI QR codes, NetBanking, and Pay at Property.
- **Voucher Verification**: Issues printable and downloadable PDF receipts with official booking references (PNR), GST breakdown, and dynamic QR verification barcodes.

### 9. Admin Governance Dashboard
- **Executive Metrics**: Platform GMV, total bookings, active users, and system conversion rates.
- **User Governance**: Suspend/unsuspend user accounts and elevate roles.
- **Audit Trails**: Security logs documenting all administrative and financial actions.

---

## 💻 Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 (Vite 5) | Component-driven Single Page Application (SPA) with fast HMR |
| **Styling & Icons** | Tailwind CSS 3, Lucide React, Framer Motion | Modern midnight dark theme, responsive layouts, smooth micro-animations |
| **Client State** | Zustand, Context API | Lightweight session, authentication, and toast notification state |
| **Backend Framework** | Node.js (ESM), Express.js 4.19 | Modular RESTful API architecture with centralized error handling |
| **API Documentation** | Swagger UI Express, OpenAPI 3.0.3 | Interactive browser documentation mounted at `/api-docs` |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 | Cloud-hosted NoSQL cluster with schema validation and TTL indexes |
| **Authentication** | Firebase Admin SDK + Firebase Web SDK + JWT | Google OAuth 2.0 popup sign-in, email/password, and role-based authorization |
| **AI Generation** | Google Gemini 1.5 Flash | Structured multi-day itinerary generation |
| **Security & Middleware** | Helmet, CORS, Morgan, Express Rate Limit, Zod | Security headers, IP rate limiting, input validation, request logging |
| **Testing** | Vitest, Supertest, MongoDB Memory Server | Rapid automated integration and unit testing (39 passing tests) |

---

## 🗄️ Database Architecture & Data Models

NOMADLY uses **19 Mongoose schemas** on MongoDB Atlas to model travel inventory, reservations, and collaboration:

| # | Collection / Model | File Path | Description |
|---|---|---|---|
| 1 | **`users`** (`User`) | `backend/src/models/User.js` | User account records, bcrypt passwords, avatar, role (`customer`, `admin`), loyalty points, and saved co-travelers. |
| 2 | **`bookings`** (`Booking`) | `backend/src/models/Booking.js` | Confirmed travel reservations with unique PNR reference, category, passengers, payment status, and pricing. |
| 3 | **`inventoryholds`** (`InventoryHold`) | `backend/src/models/InventoryHold.js` | Atomic 10-minute hold lock preventing seat collisions during checkout with MongoDB TTL auto-expiry. |
| 4 | **`payments`** (`Payment`) | `backend/src/models/Payment.js` | Transaction logs, payment gateway orders, currency, and verification signatures. |
| 5 | **`refunds`** (`Refund`) | `backend/src/models/Refund.js` | Cancellation audit records, refund reference, penalty deductions, and processing status. |
| 6 | **`trips`** (`Trip`) | `backend/src/models/Trip.js` | "My Journeys" collaborative travel workspace with dates, total budget, linked bookings, and participants. |
| 7 | **`itineraryitems`** (`ItineraryItem`) | `backend/src/models/ItineraryItem.js` | Individual activities, scheduled times, locations, estimated costs, and order sequence in a trip. |
| 8 | **`tripexpenses`** (`TripExpense`) | `backend/src/models/TripExpense.js` | Shared budget ledger records with payer, split shares, and category mappings. |
| 9 | **`tripdocuments`** (`TripDocument`) | `backend/src/models/TripDocument.js` | Boarding passes, hotel confirmation vouchers, and insurance files attached to a journey. |
| 10 | **`tripactivitylogs`** (`TripActivityLog`) | `backend/src/models/TripActivityLog.js` | Audit trail of edits made by travel companions in a journey workspace. |
| 11 | **`flightoffers`** (`FlightOffer`) | `backend/src/models/FlightOffer.js` | Flight schedules, carrier details, airport codes, cabin classes, and pricing. |
| 12 | **`hotels`** (`Hotel`) | `backend/src/models/Hotel.js` | Hotel properties, address coordinates, star rating, amenities, and room availability. |
| 13 | **`experiences`** (`Experience`) | `backend/src/models/Experience.js` | Destination tours, scuba diving, safaris, inclusions, meeting points, and reviews. |
| 14 | **`trains`** (`Train`) | `backend/src/models/Train.js` | Express rail timetables, station codes, and coach class berth layouts (`EC`, `CC`, `1A`, `2A`, `3A`, `SL`). |
| 15 | **`buses`** (`Bus`) | `backend/src/models/Bus.js` | Intercity bus routes with upper and lower sleeper deck seat configurations. |
| 16 | **`coupons`** (`Coupon`) | `backend/src/models/Coupon.js` | Promotional discount vouchers (`NOMAD20`, `FIRST10`) with expiry and minimum order conditions. |
| 17 | **`wishlists`** (`Wishlist`) | `backend/src/models/Wishlist.js` | User bucket-list saved travel items with snapshot metadata. |
| 18 | **`pricealerts`** (`PriceAlert`) | `backend/src/models/PriceAlert.js` | Watchlist alerts triggering notifications when fares drop below a traveler's target price. |
| 19 | **`auditlogs`** (`AuditLog`) | `backend/src/models/AuditLog.js` | Immutable administrative audit log tracking privilege elevation, user status toggles, and payment captures. |

---

## 📖 Interactive Swagger OpenAPI Documentation

NOMADLY features complete, interactive OpenAPI 3.0.3 documentation hosted directly on the server:

- **Interactive UI**: [https://nomadly-travel.onrender.com/api-docs](https://nomadly-travel.onrender.com/api-docs) (or `http://localhost:5000/api-docs` locally)
- **Raw OpenAPI 3.0.3 JSON**: [https://nomadly-travel.onrender.com/api-docs.json](https://nomadly-travel.onrender.com/api-docs.json)

### Authorization in Swagger UI
Click the green **Authorize 🔓** button at the top of Swagger UI and provide:
```http
Bearer <YOUR_JWT_OR_FIREBASE_TOKEN>
```
*(You can obtain a demo token instantly by calling `POST /api/v1/auth/demo-login` with `{"role": "customer"}` or `{"role": "admin"}`!)*

---

## 📡 API Endpoint Directory

### 1. Authentication & Profile (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/me` | User | Get current profile, preferences, and saved travelers. |
| `PUT` | `/api/v1/auth/profile` | User | Update display name, phone, and notification settings. |
| `POST` | `/api/v1/auth/travelers` | User | Save frequent companion travelers for 1-click checkout autofill. |
| `DELETE` | `/api/v1/auth/travelers/:id` | User | Delete a saved companion traveler. |
| `POST` | `/api/v1/auth/demo-login` | Public | Instant 1-click sign-in as Customer or Admin demo persona. |

### 2. Flights Inventory (`/api/v1/flights`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/flights/search` | Public | Search live flights by origin, destination, date, cabin, and stops. |
| `GET` | `/api/v1/flights/airports` | Public | Autocomplete directory of registered airport codes and cities. |
| `GET` | `/api/v1/flights/:id` | Public | Get flight offer details and live seat inventory. |

### 3. Hotels & Resorts (`/api/v1/hotels`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/hotels/search` | Public | Search properties via RapidAPI Booking.com by city, dates, and stars. |
| `GET` | `/api/v1/hotels/featured` | Public | Retrieve curated boutique luxury stays and palace resorts. |
| `GET` | `/api/v1/hotels/:id` | Public | Get hotel property details, room types, and amenities. |

### 4. Tours & Experiences (`/api/v1/experiences`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/experiences` | Public | Search verified tours by city, category, and price range. |
| `GET` | `/api/v1/experiences/featured`| Public | Get top-rated featured destination experiences. |
| `GET` | `/api/v1/experiences/:id` | Public | Get tour itinerary, inclusions, meeting point, and photo gallery. |

### 5. Vacation Packages & Combos (`/api/v1/packages`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/packages` | Public | Get dynamic Flight + Hotel combo packages with 15–20% discounts. |
| `GET` | `/api/v1/packages/:id` | Public | Get package details with paired flight legs and resort amenities. |

### 6. AI Smart Trip Planner (`/api/v1/ai`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/ai/generate-itinerary` | Public | Synthesize day-by-day itinerary via Gemini 1.5 Flash. |
| `POST` | `/api/v1/ai/export-to-journey` | User | 1-Click Export generated plan into an interactive Journey workspace. |

### 7. Bookings & Reservations (`/api/v1/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/bookings` | User | Initialize reservation with travelers, contact info, and pricing. |
| `GET` | `/api/v1/bookings/my-bookings` | User | List all past and confirmed reservations for current user. |
| `GET` | `/api/v1/bookings/:id` | User | Get booking confirmation e-ticket with validation QR code. |
| `POST` | `/api/v1/bookings/:id/cancel` | User | Cancel reservation and calculate refund eligibility. |
| `GET` | `/api/v1/bookings/:id/receipt`| User | Generate printable PDF tax invoice receipt. |

### 8. Payments & Verification (`/api/v1/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/create-order` | User | Create payment order with gateway transaction ID. |
| `POST` | `/api/v1/payments/verify` | User | Cryptographically verify signature and confirm booking status. |
| `POST` | `/api/v1/payments/webhook` | Public | Payment gateway webhook handler. |

### 9. Collaborative Journeys (`/api/v1/trips`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/trips` | User | List all user journeys (as owner, editor, or viewer). |
| `POST` | `/api/v1/trips` | User | Create new trip workspace with dates and budget. |
| `GET` | `/api/v1/trips/:id` | Collaborator | Get complete trip workspace with itinerary and ledger. |
| `PUT` | `/api/v1/trips/:id` | Editor | Update trip destination, dates, and budget allocations. |
| `DELETE`| `/api/v1/trips/:id` | Owner | Delete trip workspace. |
| `POST` | `/api/v1/trips/:id/attach-booking` | Editor | Link a confirmed NOMADLY booking into trip itinerary. |
| `GET` | `/api/v1/trips/:id/itinerary` | Collaborator | Get chronological day-by-day scheduled activities. |
| `POST` | `/api/v1/trips/:id/itinerary` | Editor | Add activity or reservation to itinerary timeline. |
| `GET` | `/api/v1/trips/:id/expenses` | Collaborator | Get shared trip expense ledger and budget progress. |
| `POST` | `/api/v1/trips/:id/expenses` | Editor | Log shared trip expense with payer and split shares. |
| `GET` | `/api/v1/trips/:id/settlement` | Collaborator | Calculate net debt balances between travel companions. |
| `POST` | `/api/v1/trips/:id/participants` | Editor | Invite co-travelers by email with editor/viewer roles. |
| `POST` | `/api/v1/trips/:id/documents` | Editor | Upload boarding passes and hotel confirmation documents. |

### 10. Wishlist & Price Alerts (`/api/v1/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/wishlist` | User | Retrieve saved bucket-list flights, hotels, and tours. |
| `POST` | `/api/v1/wishlist` | User | Save item to wishlist. |
| `DELETE`| `/api/v1/wishlist/:id` | User | Remove item from wishlist. |
| `GET` | `/api/v1/wishlist/alerts` | User | List active price watch alerts. |
| `POST` | `/api/v1/wishlist/alerts` | User | Create price watch alert with target budget threshold. |

### 11. Coupons & Promotions (`/api/v1/coupons`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/coupons/validate` | Public | Validate promotional discount codes (`NOMAD20`, `FIRST10`). |
| `GET` | `/api/v1/coupons/active` | Public | List currently active public promotional codes. |

### 12. Admin Governance (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/overview` | Admin | Get executive dashboard metrics (GMV, users, bookings). |
| `GET` | `/api/v1/admin/users` | Admin | Search and paginate platform user accounts. |
| `PUT` | `/api/v1/admin/users/:id/suspend` | Admin | Toggle account suspension. |
| `PUT` | `/api/v1/admin/users/:id/role` | Admin | Elevate user role (`customer` ↔ `admin`). |
| `GET` | `/api/v1/admin/bookings` | Admin | System-wide booking records with audit details. |
| `GET` | `/api/v1/admin/audit-logs` | Admin | View immutable security and administrative audit trail. |
| `GET` | `/api/v1/admin/inventory-stats`| Admin | Real-time 10-minute hold metrics and inventory counts. |

---

## 🧪 Automated Testing Suite

The repository contains **12 comprehensive automated test suites (68 tests total)** spanning both backend and frontend, executed via **Vitest**, **React Testing Library**, **JSDOM**, and **Supertest** with an isolated in-memory MongoDB server:

```bash
# Execute the full automated test suite across backend and frontend
npm test

# Run backend test suite only (50 tests)
npm run test:backend

# Run frontend unit & component test suite only (18 tests)
npm run test:frontend
```

### Test Results: 68 / 68 Tests Passing (100%)

#### Backend Test Suites (50 / 50 Passing)
- **`backend/tests/api.test.js`** (15 tests): Health check, Swagger OpenAPI 3.0.3 spec, Swagger UI routes, discovery modules, server-side coupon calculations, and admin authorization guards.
- **`backend/tests/diagnostics.test.js`** (2 tests): Health endpoint status, email service telemetry, and diagnostic query resilience.
- **`backend/tests/flights.test.js`** (8 tests): IATA airport resolution engine, airline registry, and dynamic flight generation.
- **`backend/tests/trains.test.js`** (4 tests): Express train timetable generator, class filters (`EC`, `CC`, `1A`), and stop inspections.
- **`backend/tests/buses.test.js`** (5 tests): Intercity routes, atomic 10-minute seat hold acquisition, double-booking rejection, and release.
- **`backend/tests/payments.test.js`** (5 tests): Order creation, signature verification, booking status confirmation, and audit logging.
- **`backend/tests/journeys.test.js`** (7 tests): Collaborative trip planner, budget allocation calculations, documents vault, and itinerary items.
- **`backend/tests/packages_e2e.test.js`** (4 tests): Multi-modal vacation package search, pricing bundling, and detail inspections.

#### Frontend Test Suites (18 / 18 Passing)
- **`frontend/src/tests/formatters.test.js`** (11 tests): Currency (`formatCurrency`), duration (`formatDuration`), dates (`formatDate`), and time strings formatting.
- **`frontend/src/tests/AdminKpiCards.test.jsx`** (2 tests): Executive KPI telemetry metrics and revenue cards rendering.
- **`frontend/src/tests/BookingsList.test.jsx`** (3 tests): Empty states, network error recovery with retry, and active booking cards with cancellation/linking triggers.
- **`frontend/src/tests/SavedTravelersList.test.jsx`** (2 tests): Passenger cards rendering, delete action triggers, and new traveler form inputs.

---

## ⚡ Quickstart & Local Development

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20 & v22)
- **npm** v9+

### 2. Installation
Clone the repository and install dependencies across root, backend, and frontend with one command:
```bash
git clone https://github.com/Arbaz2402/nomadly-travel.git
cd nomadly-travel
npm run install-all
```

### 3. Launch Development Servers
Run both backend and frontend simultaneously with live hot-reloading:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`

---

## 🔐 Environment Variables Reference

### Backend (`backend/.env`)
See `backend/.env.example` for the complete production template:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nomadly?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
FIREBASE_PROJECT_ID=nomadly-app-fe5b9
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@nomadly-app-fe5b9.iam.gserviceaccount.com
RAPIDAPI_KEY=your_rapidapi_booking_com_key
GEMINI_API_KEY=your_free_google_gemini_api_key
RESEND_API_KEY=re_...
```

### Frontend (`frontend/.env`)
See `frontend/.env.example` for the complete client template:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=nomadly-app-fe5b9.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nomadly-app-fe5b9
```

---

## 📁 Project Directory Structure

```
reservation_app/
├── README.md                      # Complete project documentation & system reference
├── package.json                   # Root orchestrator scripts (dev, test, test:backend, test:frontend)
│
├── backend/                       # Express ESM REST API
│   ├── package.json
│   ├── src/
│   │   ├── server.js              # Server bootstrapper & port listener
│   │   ├── app.js                 # Express application, CORS, Helmet, Swagger mount
│   │   ├── config/                # Database (Mongoose), Firebase Admin, and Travel Constants
│   │   ├── controllers/           # Modular HTTP controllers (Auth, Flights, Hotels, Trips, etc.)
│   │   ├── docs/
│   │   │   └── swagger.js         # Complete OpenAPI 3.0.3 specification
│   │   ├── middleware/            # Auth, RBAC, Rate limit, and Trip collaborator guards
│   │   ├── models/                # 19 Mongoose Schemas (User, Booking, Trip, etc.)
│   │   ├── routes/                # Express API router definitions (/api/v1/* and /api/health)
│   │   ├── services/              # Business logic (Trip, AI destinations, Pricing, Payments, Holds)
│   │   └── utils/                 # AsyncHandler, Seed scripts, and Formatters
│   └── tests/                     # 8 Vitest integration test suites (50 tests passing)
│
└── frontend/                      # React 18 + Vite SPA
    ├── package.json
    ├── vite.config.js
    ├── vitest.config.js           # Vitest + JSDOM frontend testing configuration
    ├── tailwind.config.js
    └── src/
        ├── App.jsx                # Router, navigation, error boundary wrappers
        ├── main.jsx               # Application entrypoint & providers
        ├── components/
        │   ├── common/            # ErrorBoundary, AuthModal, PolicyModal
        │   ├── navigation/        # Navbar & Footer
        │   ├── search/            # UnifiedSearchHero (Flights, Hotels, Tours)
        │   ├── customer/          # Modular Customer Dashboard (BookingsList, SavedTravelersList, AttachModal)
        │   ├── admin/             # Modular Admin Dashboard (KPIs, Charts, BookingsTable, UsersTable)
        │   └── journeys/          # Modular Journeys Architecture
        │       ├── helpers.js     # Shared travel constants, venue normalizers & queries
        │       ├── modals/        # AddActivity, AddExpense, AddMember, UploadDoc, AIModify, EditActivity
        │       └── workspace/     # ItineraryView, OverviewView, CalendarView, ExpensesView, SplittingView, TripMapView, DocumentsView, MembersView
        ├── context/               # ToastContext notification manager
        ├── constants/             # Centralized fee rates, taxes, currencies, and roles
        ├── pages/
        │   ├── home/              # Landing page with featured stays & tour showcases
        │   ├── flights/           # Flight search, filters, and airline offers
        │   ├── hotels/            # Hotel discovery with photo carousels & room selector
        │   ├── experiences/       # Verified tours & scuba/safari booking
        │   ├── packages/          # Flight + Hotel vacation combo deals
        │   ├── ai/                # AI Smart Trip Planner wizard
        │   ├── checkout/          # Checkout stepper, seat hold timer, payment gateway
        │   ├── bookings/          # E-Ticket confirmation voucher with QR validation
        │   ├── journeys/          # Modularized Journeys Workspace & Trip Creation
        │   ├── wishlist/          # Bucket-list & price watch alerts
        │   ├── profile/           # Modularized Customer Profile & Reservations Hub
        │   └── admin/             # Modularized Admin Governance Console
        ├── services/              # ApiClient singleton fetch wrapper
        ├── store/                 # Zustand authentication store
        └── tests/                 # 4 Vitest + React Testing Library suites (18 tests passing)
```

---

## 📄 License
This project is licensed under the **MIT License**.
Distributed with pride by NOMADLY Platform Engineering.
