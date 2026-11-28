/**
 * NOMADLY Travel Platform — Complete OpenAPI 3.0.3 Specification
 * Comprehensive documentation for all backend REST API endpoints
 */

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NOMADLY Travel Platform REST API',
    version: '1.0.0',
    description: `
**NOMADLY** is a production-ready, full-stack travel reservation and multi-modal journey orchestrator platform.
This interactive Swagger documentation details all available API endpoints across:
- **Authentication & Profiles** (Firebase Cloud Identity + JWT Dual Auth, Saved Travelers, Demo Personas)
- **Flights** (Live Airport Autocomplete, Route Schedules, Cabin Classes, Pricing)
- **Hotels & Stays** (RapidAPI Booking.com Integration, Star Ratings, Luxury Stays, Real Photos)
- **Experiences & Tours** (Scuba Diving, Desert Safaris, Lake Cruises, Hot Air Balloons)
- **Vacation Packages** (Dynamically Bundled Flights + Boutique Resorts with 15–20% combo discounts)
- **AI Smart Trip Planner** (Google Gemini 1.5 Flash multi-day synthesis & 1-click export to My Journeys)
- **Bookings & Reservations** (Atomic 10-Minute Seat Holds, E-Tickets, PNR Generation, QR Verification)
- **Payments & Verification** (PCI-DSS Sandbox, Automated Invoice Generation, Signatures)
- **My Journeys Workspace** (Collaborative Itinerary Builder, Real-time Split Ledger, Document Vault, Audit Logs)
- **Wishlist & Price Alerts** (Fares Tracking, Target Threshold Triggers)
- **Coupons & Promotions** (Dynamic Promo Code Validation & Reductions)
- **Admin Governance** (User Roles, Booking Audits, Inventory Statistics)
    `,
    contact: {
      name: 'NOMADLY Platform Engineering',
      url: 'https://nomadly-travel.netlify.app',
      email: 'engineering@nomadly-travel.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
    {
      url: 'https://nomadly-travel.onrender.com/api/v1',
      description: 'Production Cloud API (Render)',
    },
  ],
  tags: [
    { name: 'Authentication & Profile', description: 'User authentication, Firebase token exchange, saved travelers, demo personas' },
    { name: 'Flights', description: 'Flight search, schedules, seat inventory, and airport directories' },
    { name: 'Hotels & Stays', description: 'Live hotel discovery, room categories, and featured luxury properties' },
    { name: 'Experiences & Tours', description: 'Authentic local adventures, scuba diving, desert safaris, and heritage cruises' },
    { name: 'Vacation Packages', description: 'Curated Flight + Hotel combos with bundled package discounts' },
    { name: 'Trip Planner Engine', description: 'Day-by-day itinerary synthesis & 1-click export into Journey workspaces' },
    { name: 'Bookings & Reservations', description: 'Ticket issuance, booking references (PNR), cancellations, and PDF receipts' },
    { name: 'Payments & Verification', description: 'Payment order initialization, cryptographic signature verification, and sandbox transactions' },
    { name: 'My Journeys (Trips)', description: 'Collaborative travel planner, itinerary items, expense splitting, and documents vault' },
    { name: 'Wishlist & Price Alerts', description: 'Saved bucket-list items and automated target price watch alerts' },
    { name: 'Coupons & Discounts', description: 'Promotional discount validation and active coupons directory' },
    { name: 'Admin Governance', description: 'User management, booking audit logs, and inventory metrics' },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Supply your JWT access token or Firebase ID token in the Authorization header as: `Bearer <token>`',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Descriptive error message' },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f10a8b92d8f0012a4b891' },
          email: { type: 'string', example: 'traveler@nomadly.com' },
          firstName: { type: 'string', example: 'Arbaz' },
          lastName: { type: 'string', example: 'Kaladiya' },
          role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
          avatar: { type: 'string', example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' },
          loyaltyPoints: { type: 'number', example: 1250 },
          savedTravelers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '663f10a8b92d8f0012a4b892' },
                title: { type: 'string', example: 'Mr' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                gender: { type: 'string', example: 'male' },
              },
            },
          },
        },
      },
      FlightOffer: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f10a8b92d8f0012a4b893' },
          flightNumber: { type: 'string', example: 'AI-842' },
          airline: { type: 'string', example: 'Air India' },
          originCity: { type: 'string', example: 'Mumbai' },
          originCode: { type: 'string', example: 'BOM' },
          destinationCity: { type: 'string', example: 'Delhi' },
          destinationCode: { type: 'string', example: 'DEL' },
          departureTime: { type: 'string', format: 'date-time', example: '2026-11-20T08:30:00Z' },
          arrivalTime: { type: 'string', format: 'date-time', example: '2026-11-20T10:45:00Z' },
          totalDurationMinutes: { type: 'number', example: 135 },
          cabinClass: { type: 'string', example: 'economy' },
          availableSeats: { type: 'number', example: 18 },
          pricing: {
            type: 'object',
            properties: {
              currency: { type: 'string', example: 'INR' },
              baseFare: { type: 'number', example: 4850 },
              taxesAndFees: { type: 'number', example: 873 },
              totalPayable: { type: 'number', example: 5723 },
            },
          },
        },
      },
      Hotel: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f10a8b92d8f0012a4b894' },
          name: { type: 'string', example: 'The Oberoi Udaivilas, Udaipur' },
          city: { type: 'string', example: 'Udaipur' },
          starRating: { type: 'number', example: 5 },
          rating: { type: 'number', example: 9.8 },
          featuredPhoto: { type: 'string', example: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800' },
          cheapestPrice: { type: 'number', example: 18500 },
          amenities: { type: 'array', items: { type: 'string' }, example: ['Infinity Pool', 'Ayurvedic Spa', 'Free High-Speed Wi-Fi', 'Lake Views'] },
        },
      },
      Experience: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f10a8b92d8f0012a4b895' },
          title: { type: 'string', example: 'Grand Island Scuba Diving & Dolphin Cruise' },
          category: { type: 'string', example: 'water_sports' },
          destinationCity: { type: 'string', example: 'Goa' },
          durationHours: { type: 'number', example: 6 },
          pricePerPerson: { type: 'number', example: 2850 },
          rating: { type: 'number', example: 4.9 },
          reviewsCount: { type: 'number', example: 480 },
          featuredPhoto: { type: 'string', example: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800' },
          highlights: {
            type: 'array',
            items: { type: 'string' },
            example: ['PADI certified underwater dive instructor', 'Complimentary 4K underwater video'],
          },
        },
      },
      VacationPackage: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'pkg-goa-3n' },
          title: { type: 'string', example: 'Goa Exclusive 3N Getaway' },
          destinationCity: { type: 'string', example: 'Goa' },
          originCity: { type: 'string', example: 'New Delhi' },
          nights: { type: 'number', example: 3 },
          discountPercent: { type: 'number', example: 15 },
          pricing: {
            type: 'object',
            properties: {
              originalTotal: { type: 'number', example: 29800 },
              packagePrice: { type: 'number', example: 25330 },
              savings: { type: 'number', example: 4470 },
              perPerson: { type: 'number', example: 12665 },
              currency: { type: 'string', example: 'INR' },
            },
          },
          perks: {
            type: 'array',
            items: { type: 'string' },
            example: ['Daily Champagne Breakfast', 'Private Airport Transfers in AC SUV'],
          },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f10a8b92d8f0012a4b896' },
          bookingReference: { type: 'string', example: 'NMD-FL-839210' },
          travelCategory: { type: 'string', enum: ['flight', 'hotel', 'experience', 'package'], example: 'flight' },
          bookingStatus: { type: 'string', enum: ['confirmed', 'cancelled', 'completed'], example: 'confirmed' },
          paymentStatus: { type: 'string', enum: ['paid', 'pending', 'refunded'], example: 'paid' },
          contactInfo: {
            type: 'object',
            properties: {
              email: { type: 'string', example: 'traveler@nomadly.com' },
              phone: { type: 'string', example: '+919876543210' },
            },
          },
          pricing: {
            type: 'object',
            properties: {
              baseFare: { type: 'number', example: 4850 },
              taxesAndFees: { type: 'number', example: 873 },
              totalPayable: { type: 'number', example: 5723 },
              currency: { type: 'string', example: 'INR' },
            },
          },
        },
      },
      Trip: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '663f10a8b92d8f0012a4b897' },
          title: { type: 'string', example: 'South India Coastal Escapes' },
          destination: { type: 'string', example: 'Goa' },
          startDate: { type: 'string', format: 'date', example: '2026-11-20' },
          endDate: { type: 'string', format: 'date', example: '2026-11-25' },
          travelersCount: { type: 'number', example: 2 },
          budget: {
            type: 'object',
            properties: {
              totalBudget: { type: 'number', example: 60000 },
              currency: { type: 'string', example: 'INR' },
              allocatedTransport: { type: 'number', example: 20000 },
              allocatedStay: { type: 'number', example: 30000 },
              allocatedActivities: { type: 'number', example: 10000 },
            },
          },
          status: { type: 'string', enum: ['draft', 'upcoming', 'ongoing', 'completed'], example: 'upcoming' },
        },
      },
    },
  },
  paths: {
    // -------------------------------------------------------------
    // AUTHENTICATION & PROFILE
    // -------------------------------------------------------------
    '/auth/me': {
      get: {
        tags: ['Authentication & Profile'],
        summary: 'Get currently authenticated user profile',
        description: 'Returns profile details, saved travelers, preferences, and loyalty status for the session bearer token.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          401: { description: 'Missing or expired Bearer token' },
        },
      },
    },
    '/auth/profile': {
      put: {
        tags: ['Authentication & Profile'],
        summary: 'Update personal profile details',
        description: 'Update user first name, last name, phone number, and notification preferences.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'Arbaz' },
                  lastName: { type: 'string', example: 'Kaladiya' },
                  phone: { type: 'string', example: '+919876543210' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated successfully' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/auth/travelers': {
      post: {
        tags: ['Authentication & Profile'],
        summary: 'Add a saved companion traveler',
        description: 'Save frequent co-travelers (friends, spouse, children) for 1-click checkout autofill.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName'],
                properties: {
                  title: { type: 'string', enum: ['Mr', 'Mrs', 'Ms', 'Master'], example: 'Mr' },
                  firstName: { type: 'string', example: 'Aayan' },
                  lastName: { type: 'string', example: 'Kaladiya' },
                  gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                  dateOfBirth: { type: 'string', format: 'date', example: '1998-05-14' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Companion traveler saved successfully' },
          400: { description: 'Invalid companion data' },
        },
      },
    },
    '/auth/travelers/{travelerId}': {
      delete: {
        tags: ['Authentication & Profile'],
        summary: 'Delete a saved companion traveler',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'travelerId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            example: '663f10a8b92d8f0012a4b892',
          },
        ],
        responses: {
          200: { description: 'Traveler deleted successfully' },
          404: { description: 'Traveler not found' },
        },
      },
    },
    '/auth/demo-login': {
      post: {
        tags: ['Authentication & Profile'],
        summary: 'Instant 1-Click Demo Login',
        description: 'Enables immediate evaluation by issuing a signed session token for Traveler or Admin demo personas.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['role'],
                properties: {
                  role: { type: 'string', enum: ['customer', 'admin'], example: 'customer' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Authentication token issued',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------
    // AI SMART PLANNER
    // -------------------------------------------------------------
    '/ai/generate-itinerary': {
      post: {
        tags: ['AI Smart Planner'],
        summary: 'Synthesize custom multi-day itinerary',
        description: 'Generates structured day-by-day plans with real spots, timings, budget estimations, and matched hotels.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['destination'],
                properties: {
                  destination: { type: 'string', example: 'Goa' },
                  days: { type: 'number', default: 3, example: 3 },
                  travelersCount: { type: 'number', default: 2, example: 2 },
                  budgetStyle: { type: 'string', enum: ['budget', 'moderate', 'luxury'], default: 'moderate', example: 'moderate' },
                  interests: { type: 'array', items: { type: 'string' }, example: ['sightseeing', 'culture', 'food'] },
                  customPrompt: {
                    type: 'string',
                    example: 'Focus on authentic vegetarian food, stroller-friendly paths, and sunset dining',
                    description: 'Custom prompt or special requirements for Gemini AI to personalize the itinerary',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Generated itinerary schema',
          },
        },
      },
    },
    '/ai/export-to-journey': {
      post: {
        tags: ['AI Smart Planner'],
        summary: '1-Click Export AI Itinerary into My Journeys',
        description: 'Creates a real Trip record and inserts each synthesized activity as an interactive ItineraryItem.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['destination', 'days'],
                properties: {
                  title: { type: 'string', example: 'Goa Coastal Getaway & Scuba' },
                  destination: { type: 'string', example: 'Goa' },
                  days: { type: 'array', items: { type: 'object' } },
                  travelersCount: { type: 'number', example: 2 },
                  estimatedTotalBudget: { type: 'number', example: 45000 },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Itinerary exported and Trip created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        tripId: { type: 'string', example: '663f10a8b92d8f0012a4b897' },
                        itemsCount: { type: 'number', example: 8 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // -------------------------------------------------------------
    // BOOKINGS & CHECKOUT
    // -------------------------------------------------------------
    '/bookings': {
      post: {
        tags: ['Bookings & Reservations'],
        summary: 'Create a reservation',
        description: 'Initializes a confirmed reservation with traveler details, contact information, and pricing.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['travelCategory', 'passengers', 'pricing'],
                properties: {
                  travelCategory: { type: 'string', enum: ['flight', 'hotel', 'experience', 'package'], example: 'flight' },
                  passengers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', example: 'Mr' },
                        firstName: { type: 'string', example: 'Arbaz' },
                        lastName: { type: 'string', example: 'Kaladiya' },
                        gender: { type: 'string', example: 'male' },
                      },
                    },
                  },
                  contactInfo: {
                    type: 'object',
                    properties: {
                      email: { type: 'string', example: 'traveler@nomadly.com' },
                      phone: { type: 'string', example: '+919876543210' },
                    },
                  },
                  pricing: {
                    type: 'object',
                    properties: {
                      baseFare: { type: 'number', example: 4850 },
                      taxesAndFees: { type: 'number', example: 873 },
                      totalPayable: { type: 'number', example: 5723 },
                      currency: { type: 'string', example: 'INR' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Booking created successfully with unique PNR reference',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Booking' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/bookings/my-bookings': {
      get: {
        tags: ['Bookings & Reservations'],
        summary: 'List bookings for current user',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['confirmed', 'cancelled', 'completed'] } },
        ],
        responses: {
          200: { description: 'List of confirmed and past travel reservations' },
        },
      },
    },
    '/bookings/{id}': {
      get: {
        tags: ['Bookings & Reservations'],
        summary: 'Get reservation details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '663f10a8b92d8f0012a4b896' },
        ],
        responses: {
          200: { description: 'Booking e-ticket details' },
          404: { description: 'Reservation not found' },
        },
      },
    },
    '/bookings/{id}/cancel': {
      post: {
        tags: ['Bookings & Reservations'],
        summary: 'Cancel a reservation',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reason: { type: 'string', example: 'Change of travel schedule' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reservation cancelled and refund calculated' },
        },
      },
    },
    '/bookings/{id}/receipt': {
      get: {
        tags: ['Bookings & Reservations'],
        summary: 'Get printable receipt and invoice payload',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Official tax invoice receipt with GST breakdown and validation QR' },
        },
      },
    },

    // -------------------------------------------------------------
    // PAYMENTS
    // -------------------------------------------------------------
    '/payments/create-order': {
      post: {
        tags: ['Payments & Verification'],
        summary: 'Create payment order',
        description: 'Initializes a transaction order in the secure payment gateway.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'amount'],
                properties: {
                  bookingId: { type: 'string', example: '663f10a8b92d8f0012a4b896' },
                  amount: { type: 'number', example: 5723 },
                  currency: { type: 'string', default: 'INR', example: 'INR' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Payment order created with orderId',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        orderId: { type: 'string', example: 'order_983147820' },
                        amount: { type: 'number', example: 5723 },
                        currency: { type: 'string', example: 'INR' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/payments/verify': {
      post: {
        tags: ['Payments & Verification'],
        summary: 'Verify payment signature & confirm booking',
        description: 'Validates cryptographic payment token, updates booking status to confirmed, and generates audit log.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['bookingId', 'orderId'],
                properties: {
                  bookingId: { type: 'string', example: '663f10a8b92d8f0012a4b896' },
                  orderId: { type: 'string', example: 'order_983147820' },
                  paymentId: { type: 'string', example: 'pay_sandbox_1731302849' },
                  signature: { type: 'string', example: 'sandbox_verified_secure_signature' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Payment confirmed and e-ticket issued',
          },
        },
      },
    },

    // -------------------------------------------------------------
    // MY JOURNEYS (TRIPS WORKSPACE)
    // -------------------------------------------------------------
    '/trips': {
      get: {
        tags: ['My Journeys (Trips)'],
        summary: 'Get user journeys',
        description: 'Returns all journeys where user is owner, editor, or viewer.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'List of trips with collaborator counts and budget progress',
          },
        },
      },
      post: {
        tags: ['My Journeys (Trips)'],
        summary: 'Create a new journey',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'destination', 'startDate', 'endDate'],
                properties: {
                  title: { type: 'string', example: 'South India Coastal Escapes' },
                  destination: { type: 'string', example: 'Goa' },
                  startDate: { type: 'string', format: 'date', example: '2026-11-20' },
                  endDate: { type: 'string', format: 'date', example: '2026-11-25' },
                  travelersCount: { type: 'number', default: 2, example: 2 },
                  budget: {
                    type: 'object',
                    properties: {
                      totalBudget: { type: 'number', example: 60000 },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Journey created successfully' },
        },
      },
    },
    '/trips/{id}': {
      get: {
        tags: ['My Journeys (Trips)'],
        summary: 'Get full journey workspace by ID',
        description: 'Returns trip metadata, itinerary timeline, collaborators, budget ledger, and attached documents.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, example: '663f10a8b92d8f0012a4b897' },
        ],
        responses: {
          200: { description: 'Full journey workspace payload' },
          403: { description: 'Insufficient collaborator role' },
          404: { description: 'Trip not found' },
        },
      },
      put: {
        tags: ['My Journeys (Trips)'],
        summary: 'Update journey settings & dates',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string', example: 'Updated Trip Title' },
                  destination: { type: 'string', example: 'Goa & Gokarna' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Trip updated successfully' },
        },
      },
      delete: {
        tags: ['My Journeys (Trips)'],
        summary: 'Delete journey',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Trip deleted successfully' },
        },
      },
    },
    '/trips/{id}/itinerary': {
      get: {
        tags: ['My Journeys (Trips)'],
        summary: 'Get chronological itinerary items for journey',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of scheduled itinerary activities' },
        },
      },
      post: {
        tags: ['My Journeys (Trips)'],
        summary: 'Add an activity or booking to itinerary',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'date'],
                properties: {
                  title: { type: 'string', example: 'Scuba Diving at Grande Island' },
                  category: { type: 'string', enum: ['flight', 'hotel', 'sightseeing', 'activities', 'restaurant', 'shopping'], example: 'activities' },
                  date: { type: 'string', format: 'date', example: '2026-11-21' },
                  startTime: { type: 'string', example: '09:00' },
                  endTime: { type: 'string', example: '13:00' },
                  estimatedCost: { type: 'number', example: 2850 },
                  location: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Sinquerim Jetty' },
                      city: { type: 'string', example: 'Goa' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Itinerary item created' },
        },
      },
    },
    '/trips/{id}/expenses': {
      get: {
        tags: ['My Journeys (Trips)'],
        summary: 'Get trip budget expenses and ledger',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'All logged expenses and allocation breakdown' },
        },
      },
      post: {
        tags: ['My Journeys (Trips)'],
        summary: 'Log a new shared expense',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'amount'],
                properties: {
                  title: { type: 'string', example: 'Dinner at Fisherman’s Wharf' },
                  amount: { type: 'number', example: 3400 },
                  category: { type: 'string', enum: ['transport', 'stay', 'food', 'activities', 'shopping', 'other'], example: 'food' },
                  paidBy: { type: 'string', example: 'Arbaz' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Expense recorded' },
        },
      },
    },
    '/trips/{id}/participants': {
      get: {
        tags: ['My Journeys (Trips)'],
        summary: 'Get travel companions & collaborators',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of trip participants with roles and invite statuses' },
        },
      },
      post: {
        tags: ['My Journeys (Trips)'],
        summary: 'Invite companion to journey by email',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'Sarah Jenkins' },
                  email: { type: 'string', example: 'sarah@example.com' },
                  role: { type: 'string', enum: ['editor', 'viewer'], default: 'editor', example: 'editor' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Invitation sent with pending status' },
        },
      },
    },

    // -------------------------------------------------------------
    // WISHLIST & PRICE ALERTS
    // -------------------------------------------------------------
    '/wishlist': {
      get: {
        tags: ['Wishlist & Price Alerts'],
        summary: 'Get user saved wishlist items',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of bookmarked flights, hotels, and tours' },
        },
      },
      post: {
        tags: ['Wishlist & Price Alerts'],
        summary: 'Save item to wishlist',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category', 'itemId'],
                properties: {
                  category: { type: 'string', enum: ['flight', 'hotel', 'experience'], example: 'hotel' },
                  itemId: { type: 'string', example: '663f10a8b92d8f0012a4b894' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Item saved to wishlist' },
        },
      },
    },
    '/wishlist/alerts': {
      get: {
        tags: ['Wishlist & Price Alerts'],
        summary: 'Get active price alerts',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Active price alerts list' },
        },
      },
      post: {
        tags: ['Wishlist & Price Alerts'],
        summary: 'Create a price watch alert',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['category', 'origin', 'destination', 'targetPrice'],
                properties: {
                  category: { type: 'string', enum: ['flight', 'hotel'], example: 'flight' },
                  origin: { type: 'string', example: 'BOM' },
                  destination: { type: 'string', example: 'GOI' },
                  targetPrice: { type: 'number', example: 3500 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Price watch alert active' },
        },
      },
    },

    // -------------------------------------------------------------
    // COUPONS
    // -------------------------------------------------------------
    '/coupons/validate': {
      post: {
        tags: ['Coupons & Discounts'],
        summary: 'Validate promo coupon code',
        description: 'Validates promotional discount codes (e.g. NOMAD20, FIRST10) against order amount.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['code', 'orderAmount'],
                properties: {
                  code: { type: 'string', example: 'NOMAD20' },
                  category: { type: 'string', enum: ['flight', 'hotel', 'package', 'experience'], example: 'flight' },
                  orderAmount: { type: 'number', example: 5723 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Coupon valid and discount calculated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    valid: { type: 'boolean', example: true },
                    discountAmount: { type: 'number', example: 1000 },
                    finalAmount: { type: 'number', example: 4723 },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid or expired coupon code' },
        },
      },
    },
    '/coupons/active': {
      get: {
        tags: ['Coupons & Discounts'],
        summary: 'List active public coupons',
        responses: {
          200: { description: 'List of currently active discount promotional codes' },
        },
      },
    },

    // -------------------------------------------------------------
    // ADMIN GOVERNANCE
    // -------------------------------------------------------------
    '/admin/overview': {
      get: {
        tags: ['Admin Governance'],
        summary: 'Admin dashboard metrics overview',
        description: 'Aggregates platform total users, GMV revenue, active bookings, and conversion statistics. Requires admin role.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Executive summary statistics' },
          403: { description: 'Admin access required' },
        },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin Governance'],
        summary: 'List platform users',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['customer', 'admin'] } },
        ],
        responses: {
          200: { description: 'Paginated user accounts directory' },
        },
      },
    },
    '/admin/bookings': {
      get: {
        tags: ['Admin Governance'],
        summary: 'List all platform reservations with audit logs',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'System-wide bookings list' },
        },
      },
    },
    '/admin/inventory-stats': {
      get: {
        tags: ['Admin Governance'],
        summary: 'Real-time inventory hold & seat status',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Active 10-minute hold metrics and inventory counts' },
        },
      },
    },
  },
};

