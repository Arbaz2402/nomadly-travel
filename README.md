# 🧭 NOMADLY — Unified Travel Booking & Intelligent Journey Platform

[![Production App](https://img.shields.io/badge/Production-Live%20on%20Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://nomadly-travel.netlify.app)
[![API Server](https://img.shields.io/badge/Backend%20API-Live%20on%20Render-success?style=for-the-badge&logo=render)](https://nomadly-travel.onrender.com)
[![CI Quality Pipeline](https://img.shields.io/badge/CI%2FCD-100%25%20Passing-brightgreen?style=for-the-badge&logo=githubactions)](https://github.com/Arbaz2402/nomadly-travel/actions)
[![Automated Tests](https://img.shields.io/badge/Tests-68%20Passing-blue?style=for-the-badge&logo=vitest)](https://github.com/Arbaz2402/nomadly-travel)
[![Interactive Docs](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=for-the-badge&logo=swagger)](https://nomadly-travel.onrender.com/api-docs)

> **"Everything you need to travel, in one beautiful workspace."**  
> **NOMADLY** is a modern full-stack travel reservation platform and collaborative trip planner. Built with **React 18, Vite, Node.js, Express, and MongoDB**, it lets travelers discover, compare, hold, and book flights, boutique hotels, trains, buses, and curated vacation packages — complete with automated split expenses, team collaboration, and AI itinerary generation.

---

## 🌐 Live Deployments

| Component | Link | Status | What it does |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | [nomadly-travel.netlify.app](https://nomadly-travel.netlify.app) | 🟢 Live | Responsive React client with dark theme, instant checkout, and interactive trip workspace. |
| **Backend REST API** | [nomadly-travel.onrender.com](https://nomadly-travel.onrender.com) | 🟢 Live | Scalable Express API with rate limiting, secure authentication, and MongoDB Atlas database. |
| **Interactive API Docs** | [nomadly-travel.onrender.com/api-docs](https://nomadly-travel.onrender.com/api-docs) | 🟢 Live | Live Swagger OpenAPI explorer to test all endpoints directly in the browser. |
| **API Health Check** | [nomadly-travel.onrender.com/api/health](https://nomadly-travel.onrender.com/api/health) | 🟢 Live | Uptime monitoring endpoint reporting system status and email relay health. |

---

## ✨ What NOMADLY Can Do

* ✈️ **Flight Discovery:** Search domestic and international flights, compare fares, pick seats, and hold seats with real-time atomic timers.
* 🏨 **Hotels & Resorts:** Live hotel searches powered by RapidAPI Booking.com with photo galleries, verified amenities, and instant room reservations.
* 🚆 **Trains & Intercity Buses:** Integrated search for authentic IRCTC train schedules and regional bus services across Indian transit corridors.
* 🌴 **Curated Vacation Packages:** Flight + Hotel combo packages with built-in 15–20% bundled savings and day-by-day itineraries.
* 🧠 **AI Smart Concierge:** Synthesize personalized multi-day trip plans with authentic venues, timings, and Google Maps directions using Google Gemini AI.
* 👥 **Collaborative Journeys:** Invite friends and family to your trip with Editor/Viewer roles. Everyone sees the same itinerary, tickets, and packing list.
* 💸 **Split Expenses & Debt Settlement:** Track shared costs in multi-currency, split bills equally or custom, and calculate net payments with zero math needed.
* 🎟️ **Instant Boarding Passes & E-Tickets:** QR-validated receipts with 1-click printable PDF invoices.
* 🛡️ **Role-Based Admin Dashboard:** Real-time analytics, Gross Merchandise Volume (GMV) metrics, inventory seat locks, and user account governance.

---

## 🏛️ System Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend Client (Netlify)"]
        UI["React 18 + Vite SPA"]
        Store["Redux Toolkit Store (RTK)"]
        Hooks["Custom Hooks Layer"]
        UI --> Hooks --> Store
    end

    subgraph Backend["Backend API (Render)"]
        Express["Express ESM REST API"]
        Controllers["Domain Controllers"]
        Services["Business Services"]
        Express --> Controllers --> Services
    end

    subgraph Database["Data Layer"]
        Atlas[("MongoDB Atlas Cloud")]
        Services --> Atlas
    end

    subgraph External["Third-Party Integrations"]
        Gemini["Google Gemini AI"]
        Firebase["Firebase Auth"]
        Resend["Resend & Netlify Email Relay"]
        Services --> Gemini
        Services --> Firebase
        Services --> Resend
    end

    Client -->|HTTPS REST| Backend
```

---

## 🚀 Quickstart & Local Development

You can run the entire platform locally in **under 2 minutes** with zero cloud setup required!

### 1. Clone the repository
```bash
git clone https://github.com/Arbaz2402/nomadly-travel.git
cd nomadly-travel
```

### 2. Install dependencies
```bash
npm run install-all
```

### 3. Start Frontend & Backend together
```bash
npm run dev
```
* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend:** [http://localhost:5000](http://localhost:5000)
* **API Documentation:** [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

> [!TIP]
> **Zero-Config Database:** If no `MONGODB_URI` is provided in `.env`, the backend automatically spins up an ultra-fast in-memory database and pre-seeds it with demo flights, hotels, and trips!

---

## 🧪 Automated Testing & CI/CD Pipeline

NOMADLY uses a **100% automated CI/CD pipeline** powered by GitHub Actions. Every Pull Request and commit is tested on clean Ubuntu cloud runners before it can ever be merged.

### Run tests locally:
```bash
# Run all 68 automated tests (Backend + Frontend)
npm test

# Run only backend tests (50 tests with in-memory Mongo)
npm run test:backend

# Run only frontend tests (18 tests with Vitest)
npm run test:frontend
```

### What CI/CD verifies automatically:
1. **50 Backend Tests**: Verifies authentication, booking creation, payment verification, itinerary scheduling, expense settlements, and member invitations.
2. **18 Frontend Tests**: Verifies UI formatting, saved travelers autofill, booking lists, and KPI calculations.
3. **Vite Production Bundle Build**: Compiles 2,750+ modules to guarantee zero syntax errors, missing imports, or bundling regressions.
4. **Branch Protection**: GitHub automatically locks the `main` branch — only code with a 100% green CI test pass can be merged.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite 5, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti |
| **Frontend State & Router** | Redux Toolkit (RTK), React-Redux, React Router DOM 6, Custom React Hooks (SRP architecture) |
| **Backend Framework** | Node.js (ESM), Express 4.19, Zod Request Validation, Helmet Security, Rate Limiting |
| **Database & ORM** | MongoDB Atlas, Mongoose 8, In-Memory Mongo Server (Local/CI) |
| **Authentication** | Firebase Cloud Identity, Google OAuth 2.0, JWT Fallback |
| **Generative AI** | Google Gemini 1.5 & Flash-Lite API with structured schema synthesis |
| **Testing Engine** | Vitest 1.6, Supertest, Testing Library (React & DOM), JSDOM |
| **DevOps & CI/CD** | GitHub Actions, Netlify Automated Deploys, Render Cloud Webhooks |

---

## 📁 Clean Architecture Directory Structure

```text
reservation_app/
├── .github/
│   ├── workflows/ci.yml           # Automated CI/CD test & build pipeline
│   └── pull_request_template.md   # Standardized QA checklist for PRs
├── backend/
│   ├── src/
│   │   ├── controllers/           # Modular domain controllers (SRP)
│   │   ├── models/                # Mongoose database schemas
│   │   ├── routes/                # Express API endpoints
│   │   ├── services/              # Pure business logic & AI generators
│   │   ├── utils/                 # Currency rates, settlements, seeders
│   │   └── server.js              # Server entry point
│   └── tests/                     # 50 Automated Vitest test suites
└── frontend/
    ├── src/
    │   ├── components/            # Reusable domain UI components
    │   ├── hooks/                 # Custom React hooks (checkout, trips, AI)
    │   ├── pages/                 # Clean page orchestrators (<250 lines)
    │   ├── services/              # Centralized singleton ApiClient
    │   └── store/                 # Redux Toolkit store (slices, thunks, hooks)
    └── tests/                     # 18 Frontend unit test suites
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
