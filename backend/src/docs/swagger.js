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
**NOMADLY** is a collaborative travel planner, expense splitting, and journey organizer platform.
This interactive Swagger documentation details the available API endpoints across:
- **Authentication & Profiles** (Firebase Identity + JWT Auth)
- **Trip Planner Engine** (Multi-day itinerary synthesis & export to My Journeys)
- **My Journeys Workspace** (Collaborative Itinerary Builder, Split Ledger, Document Vault, Activity Logs)
- **Currency & Cash Tools** (Live market FX rates & historical trends)
- **Admin Governance** (User Roles, Journey Metrics, Audit Logs)
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
    { name: 'Authentication & Profile', description: 'User authentication and Firebase token exchange' },
    { name: 'Trip Planner Engine', description: 'Day-by-day itinerary synthesis & export into Journey workspaces' },
    { name: 'My Journeys (Trips)', description: 'Collaborative travel planner, itinerary items, expense splitting, and documents vault' },
    { name: 'Admin Governance', description: 'User management, journey metrics, and audit logs' },
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
    // ADMIN GOVERNANCE
    // -------------------------------------------------------------
    '/admin/overview': {
      get: {
        tags: ['Admin Governance'],
        summary: 'Admin dashboard metrics overview',
        description: 'Aggregates platform total users, journeys, tracked expenses, and vault documents. Requires admin role.',
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
  },
};

