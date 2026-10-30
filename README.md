# 🧭 NOMADLY — Advanced MERN Travel Reservation Platform

> **"Your entire journey, intelligently organized."**
> A modern full-stack travel booking and itinerary platform built with **React 18, Node.js, Express, MongoDB Atlas, and Tailwind CSS**. Search, compare, hold, book, and orchestrate flights, luxury hotels, express railways, and intercity buses under a unified booking engine.

---

## 🌟 Key Architectural Highlights

- **Multi-Modal Travel Engine**: First-class discovery and reservation workflows for **Flights**, **Hotels & Stays**, **Express Trains (Vande Bharat / IRCTC)**, and **Intercity Buses**.
- **Interactive Dual-Deck Bus Seat Map**: Lower and Upper deck seat selection (sleeper berths vs. seater pushbacks) with **real-time concurrency locks** and 10-minute atomic hold expiration (`InventoryHold`).
- **Authoritative Server-Side Pricing Engine**: Dynamic calculation of base fares, GST taxes (12%/18%), platform fees, add-on protections, and promotional coupon discounts (`NOMAD10`, `FLYHIGH`, `STAY500`).
- **Unified Multi-Segment Trip Builder**: Combine rail, flight transfers, and boutique stays into a continuous chronological journey with **connection gap alerts** and a **Smart Trip Budget Calculator**.
- **Fare Price Watchlist**: Track routes and destinations with automated target price monitors.
- **Executive Admin Console**: Live telemetry metrics (Gross Booking Value, Platform Commission, Cancellation Rates), **Recharts financial visualizations**, user suspension toggles, booking management, and security audit logs.
- **Dual-Engine Zero-Config MongoDB**: Automatically connects to MongoDB Atlas or spins up an embedded **In-Memory MongoDB Server** if no URI is provided. Zero friction for evaluation!
- **Dual-Mode Authentication**: Supports **Firebase Authentication & Firebase Admin SDK** alongside instant **One-Click Demo Personas** (`Traveler Demo` & `Admin Demo`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended, tested on v22)
- npm (v9+)

### 1. Installation

Install all dependencies across root, backend, and frontend with a single command:
```bash
npm run install-all
```
*(Or install individually: `npm install`, `cd backend && npm install`, `cd frontend && npm install`)*

### 2. Environment Configuration

Copy the example environment files:
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```
*(By default, all fields in `.env` can remain empty — the app will automatically run in High-Fidelity Demo Mode with local in-memory MongoDB, realistic seeded catalogs, and a sandbox payment engine).*

> 📖 **Need real credentials?** Check [`CREDENTIALS_SETUP_GUIDE.md`](./CREDENTIALS_SETUP_GUIDE.md) for step-by-step instructions on setting up **MongoDB Atlas**, **Firebase Auth**, **Razorpay Test Mode**, and **Amadeus Flight API**.

### 3. Launch Development Servers

Run backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`
- **Health Check**: `http://localhost:5000/api/health`

### 4. Running Automated Tests

Run the automated test suite covering search, pricing calculations, and RBAC authorization:
```bash
npm test
```

---

## 🏗️ Repository Structure

```text
reservation_app/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── navigation/       # Navbar & Footer with Demo Switchers
│   │   │   ├── search/           # Unified 4-Tab Editorial Search Hero
│   │   │   ├── travel-cards/     # FlightCard, HotelCard, TrainCard, BusCard
│   │   │   └── booking/          # Interactive BusSeatMap & HotelRoomModal
│   │   ├── pages/
│   │   │   ├── home/             # Editorial Homepage with Seasonal Collections
│   │   │   ├── flights/          # Flight Discovery & Fare Filters
│   │   │   ├── hotels/           # Hotel Discovery & Star Ratings
│   │   │   ├── trains/           # Express Railways & Class Availability
│   │   │   ├── buses/            # Intercity Buses with Deck Selection
│   │   │   ├── checkout/         # Server-Validated Checkout & Coupon Engine
│   │   │   ├── bookings/         # Booking Confirmation & E-Ticket Voucher
│   │   │   ├── profile/          # Customer Dashboard & Saved Travelers
│   │   │   ├── trip-builder/     # Multi-Segment Timeline & Budget Tracker
│   │   │   ├── wishlist/         # Saved Stays & Fare Watchlist Alerts
│   │   │   └── admin/            # Executive Telemetry & Governance Console
│   │   ├── services/             # Centralized API Client
│   │   ├── store/                # Zustand State Management (Auth & Currency)
│   │   ├── context/              # Toast Provider & Notification System
│   │   └── utils/                # Currency, Duration & Date Formatters
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── config/               # Database Connection (Atlas + Memory Fallback)
│   │   ├── controllers/          # Flights, Hotels, Trains, Buses, Bookings, Payments, Admin
│   │   ├── middleware/           # Dual-Mode Auth (Firebase Admin + Demo JWT), RBAC
│   │   ├── models/               # 15+ Mongoose Schemas (User, Booking, Payment, Bus, Hold...)
│   │   ├── routes/               # Modular Express API v1 Route Handlers
│   │   ├── services/
│   │   │   ├── booking/          # Authoritative Pricing Engine
│   │   │   ├── inventory/        # Concurrency & Atomic Seat Holds
│   │   │   └── payments/         # Razorpay & Sandbox Payment Processing
│   │   ├── utils/                # Comprehensive Travel Catalog Seeding Script
│   │   ├── app.js                # Express App Setup, CORS & Security Headers
│   │   └── server.js             # HTTP Server Bootstrapper & Auto-Seed
│   ├── tests/                    # Vitest & Supertest API Test Suite
│   └── package.json
│
├── CHECKLIST.md                  # Master Implementation Checklist
├── CREDENTIALS_SETUP_GUIDE.md    # Guide for MongoDB, Firebase, Razorpay & Amadeus
└── package.json                  # Root Concurrent Runner Scripts
```

---

## 🎟️ Promotional Coupons for Evaluation

Test these promotional coupons during checkout:
- **`NOMAD10`**: 10% discount up to ₹1,500 on any reservation
- **`FLYHIGH`**: Flat ₹800 instant discount on flight bookings
- **`STAY500`**: Flat ₹500 off hotel & resort stays

---

## 🛡️ Security & Reliability Architecture

- **Server-Side Authorization**: Roles (`customer`, `admin`) are strictly verified on the server; client-supplied role parameters are ignored.
- **Race Condition Prevention**: Bus seat selection and booking inventory utilize atomic MongoDB updates and timed holds (`InventoryHold`) with automatic TTL purging.
- **Financial Integrity**: Prices are calculated authoritatively on the backend using trusted inventory data; client requests cannot submit arbitrary payment totals.
- **Sanitized Outputs**: Sensitive payment tokens, passwords, and private keys are never exposed in API responses.
