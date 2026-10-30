const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
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

  // Trips (Unified Multi-segment Trip Builder)
  static getMyTrips() {
    return this.request('/trips');
  }

  static getTripById(id) {
    return this.request(`/trips/${id}`);
  }

  static createTrip(payload) {
    return this.request('/trips', { method: 'POST', body: JSON.stringify(payload) });
  }

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
