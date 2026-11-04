const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
// Automatically correct legacy or misspelled service domain if present
const API_BASE = rawBase.replace('nomadly-api.onrender.com', 'nomadly-travel.onrender.com');

export class ApiClient {
  static getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('nomadly_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // 15-second timeout safeguard to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const config = {
      ...options,
      signal: options.signal || controller.signal,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Connection timed out. Please verify your internet or try again.');
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

  // Flights
  static searchFlights(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/flights/search?${query}`);
  }

  static getFlightById(id) {
    return this.request(`/flights/${id}`);
  }

  static getAirports() {
    return this.request('/flights/airports');
  }

  // Hotels
  static searchHotels(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/hotels/search?${query}`);
  }

  static getHotelById(id) {
    return this.request(`/hotels/${id}`);
  }

  static getFeaturedHotels() {
    return this.request('/hotels/featured');
  }

  // Trains
  static searchTrains(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/trains/search?${query}`);
  }

  static getTrainById(id) {
    return this.request(`/trains/${id}`);
  }

  // Buses
  static searchBuses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/buses/search?${query}`);
  }

  static getBusById(id) {
    return this.request(`/buses/${id}`);
  }

  static holdBusSeats(busId, payload) {
    return this.request(`/buses/${busId}/hold`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static releaseBusSeats(busId, payload) {
    return this.request(`/buses/${busId}/release`, { method: 'POST', body: JSON.stringify(payload) });
  }

  // Bookings
  static createBooking(payload) {
    return this.request('/bookings', { method: 'POST', body: JSON.stringify(payload) });
  }

  static getMyBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bookings/my-bookings?${query}`);
  }

  static getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  static cancelBooking(id, payload = {}) {
    return this.request(`/bookings/${id}/cancel`, { method: 'POST', body: JSON.stringify(payload) });
  }

  static getBookingReceipt(id) {
    return this.request(`/bookings/${id}/receipt`);
  }

  // Payments
  static createPaymentOrder(payload) {
    return this.request('/payments/create-order', { method: 'POST', body: JSON.stringify(payload) });
  }

  static verifyPayment(payload) {
    return this.request('/payments/verify', { method: 'POST', body: JSON.stringify(payload) });
  }

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

  static attachBookingToTrip(tripId, payload) {
    return this.request(`/trips/${tripId}/attach-booking`, { method: 'POST', body: JSON.stringify(payload) });
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

  // Analytics & Budget
  static getTripAnalytics(tripId) {
    return this.request(`/trips/${tripId}/analytics`);
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

  // Wishlist & Alerts
  static getWishlist() {
    return this.request('/wishlist');
  }

  static addToWishlist(payload) {
    return this.request('/wishlist', { method: 'POST', body: JSON.stringify(payload) });
  }

  static removeFromWishlist(id) {
    return this.request(`/wishlist/${id}`, { method: 'DELETE' });
  }

  static getPriceAlerts() {
    return this.request('/wishlist/alerts');
  }

  static createPriceAlert(payload) {
    return this.request('/wishlist/alerts', { method: 'POST', body: JSON.stringify(payload) });
  }

  // Coupons
  static validateCoupon(payload) {
    return this.request('/coupons/validate', { method: 'POST', body: JSON.stringify(payload) });
  }

  static getActiveCoupons() {
    return this.request('/coupons/active');
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

  static getAdminBookings(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/bookings?${query}`);
  }

  static getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  static getAdminInventoryStats() {
    return this.request('/admin/inventory-stats');
  }
}
