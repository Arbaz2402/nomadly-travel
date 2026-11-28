import { getFreshIdToken } from './firebase';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
// Automatically correct legacy or misspelled service domain if present
const API_BASE = rawBase.replace('nomadly-api.onrender.com', 'nomadly-travel.onrender.com');

export class ApiClient {
  static async getHeaders(forceRefresh = false) {
    const headers = { 'Content-Type': 'application/json' };
    
    // Attempt to retrieve or refresh live Firebase token
    let token = await getFreshIdToken(forceRefresh);
    if (token) {
      localStorage.setItem('nomadly_token', token);
    } else {
      token = localStorage.getItem('nomadly_token');
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request(endpoint, options = {}, retryCount = 0) {
    const url = `${API_BASE}${endpoint}`;
    
    // Dynamic timeout safeguard: 60s for AI generation / complex tasks, 35s default
    const timeoutMs = options.timeout || (endpoint.includes('/ai/') ? 60000 : 35000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const authHeaders = await this.getHeaders();
    const config = {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Automatic 401 token refresh & seamless retry
      if (response.status === 401 && retryCount < 1) {
        console.info(`[ApiClient] Received 401 on ${endpoint}. Attempting silent token refresh & retry...`);
        const freshHeaders = await this.getHeaders(true);
        if (freshHeaders.Authorization) {
          return await this.request(endpoint, {
            ...options,
            headers: {
              ...freshHeaders,
              ...options.headers,
            },
          }, retryCount + 1);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // Auto-retry transient network or cold-start timeouts on GET requests once
      const isGet = !options.method || options.method.toUpperCase() === 'GET';
      if (isGet && retryCount < 1 && (error.name === 'AbortError' || error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError'))) {
        console.warn(`[ApiClient] Transient network hiccup on ${endpoint}. Retrying after 1.5s...`);
        await new Promise((r) => setTimeout(r, 1500));
        return await this.request(endpoint, options, retryCount + 1);
      }

      if (error.name === 'AbortError') {
        throw new Error('Connection timed out. The server may be waking up, please try again.');
      }
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
      throw error;
    }
  }

  // Auth
  static getMe() {
    return this.request('/auth/me');
  }

  static updateProfile(payload) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) });
  }

  static addTraveler(payload) {
    return this.request('/auth/travelers', { method: 'POST', body: JSON.stringify(payload) });
  }

  static deleteTraveler(id) {
    return this.request(`/auth/travelers/${id}`, { method: 'DELETE' });
  }

  static demoLogin(role = 'customer') {
    return this.request('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) });
  }

  // Bookings
  // Trips & My Journeys
  static getMyTrips(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/trips?${query}`);
  }

  static getTripById(id) {
    return this.request(`/trips/${id}`);
  }

  static createTrip(payload) {
    return this.request('/trips', { method: 'POST', body: JSON.stringify(payload) });
  }

  static updateTrip(id, payload) {
    return this.request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  static deleteTrip(id) {
    return this.request(`/trips/${id}`, { method: 'DELETE' });
  }

  // Itinerary
  static getTripItinerary(tripId) {
    return this.request(`/trips/${tripId}/itinerary`);
  }

  static addItineraryItem(tripId, payload) {
    return this.request(`/trips/${tripId}/itinerary`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static updateItineraryItem(tripId, itemId, payload) {
    return this.request(`/trips/${tripId}/itinerary/${itemId}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  static deleteItineraryItem(tripId, itemId) {
    return this.request(`/trips/${tripId}/itinerary/${itemId}`, { method: 'DELETE' });
  }

  static reorderItineraryItems(tripId, items) {
    return this.request(`/trips/${tripId}/itinerary/reorder`, { method: 'PATCH', body: JSON.stringify({ items }) });
  }

  // Expenses & Splitting
  static getTripExpenses(tripId) {
    return this.request(`/trips/${tripId}/expenses`);
  }

  static createTripExpense(tripId, payload) {
    return this.request(`/trips/${tripId}/expenses`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static updateTripExpense(tripId, expenseId, payload) {
    return this.request(`/trips/${tripId}/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  static deleteTripExpense(tripId, expenseId) {
    return this.request(`/trips/${tripId}/expenses/${expenseId}`, { method: 'DELETE' });
  }

  static getTripSettlement(tripId) {
    return this.request(`/trips/${tripId}/settlement`);
  }

  static settleExpenseShare(tripId, payload) {
    return this.request(`/trips/${tripId}/settlement/settle`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static notifySettlementDebtor(tripId, payload) {
    return this.request(`/trips/${tripId}/settlement/notify`, { method: 'POST', body: JSON.stringify(payload) });
  }

  // Analytics & Budget
  static getTripAnalytics(tripId) {
    return this.request(`/trips/${tripId}/analytics`);
  }

  static getTripWeather(tripId) {
    return this.request(`/trips/${tripId}/weather`);
  }

  // Collaboration & Members
  static getTripParticipants(tripId) {
    return this.request(`/trips/${tripId}/participants`);
  }

  static addTripParticipant(tripId, payload) {
    return this.request(`/trips/${tripId}/participants`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static resendTripInvitation(tripId, participantId) {
    return this.request(`/trips/${tripId}/participants/${participantId}/resend`, { method: 'POST' });
  }

  static respondToTripInvitation(tripId, action) {
    return this.request(`/trips/${tripId}/invitation/respond`, { method: 'POST', body: JSON.stringify({ action }) });
  }

  static updateTripParticipantRole(tripId, participantId, role) {
    return this.request(`/trips/${tripId}/participants/${participantId}`, { method: 'PUT', body: JSON.stringify({ role }) });
  }

  static removeTripParticipant(tripId, participantId) {
    return this.request(`/trips/${tripId}/participants/${participantId}`, { method: 'DELETE' });
  }

  static leaveJourney(tripId) {
    return this.request(`/trips/${tripId}/leave`, { method: 'POST' });
  }

  // Documents Vault
  static getTripDocuments(tripId) {
    return this.request(`/trips/${tripId}/documents`);
  }

  static uploadTripDocument(tripId, payload) {
    return this.request(`/trips/${tripId}/documents`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static downloadTripDocument(tripId, docId) {
    return this.request(`/trips/${tripId}/documents/${docId}/download`);
  }

  static deleteTripDocument(tripId, docId) {
    return this.request(`/trips/${tripId}/documents/${docId}`, { method: 'DELETE' });
  }

  // Activity Logs
  static getTripActivityLogs(tripId) {
    return this.request(`/trips/${tripId}/activity-logs`);
  }

  // Backwards compatibility
  static addTripSegment(tripId, payload) {
    return this.request(`/trips/${tripId}/segments`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static updateTripBudget(tripId, payload) {
    return this.request(`/trips/${tripId}/budget`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  // Currency Rates & Converter
  static getCurrencyRates(base = 'USD') {
    return this.request(`/currency/rates?base=${base}`);
  }

  static getLiveCurrencyPair(from = 'EUR', to = 'INR', range = '1mo', refresh = false) {
    return this.request(`/currency/pair?from=${from}&to=${to}&range=${range}${refresh ? '&refresh=true' : ''}`);
  }

  static convertCurrency(payload) {
    return this.request('/currency/convert', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Admin
  static getAdminOverview() {
    return this.request('/admin/overview');
  }

  static getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  static toggleUserSuspension(userId) {
    return this.request(`/admin/users/${userId}/suspend`, { method: 'PUT' });
  }

  static updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
  }

  static getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  // AI Smart Trip Planner
  static generateAIItinerary(payload) {
    return this.request('/ai/generate-itinerary', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeout: 60000,
    });
  }

  static exportAIItineraryToJourney(payload) {
    return this.request('/ai/export-to-journey', { method: 'POST', body: JSON.stringify(payload) });
  }

  static modifyActivityWithAI(payload) {
    return this.request('/ai/modify-activity', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeout: 30000,
    });
  }
}
