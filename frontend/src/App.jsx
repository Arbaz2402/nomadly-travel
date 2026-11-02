import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { HomePage } from './pages/home/HomePage';
import { FlightsPage } from './pages/flights/FlightsPage';
import { HotelsPage } from './pages/hotels/HotelsPage';
import { TrainsPage } from './pages/trains/TrainsPage';
import { BusesPage } from './pages/buses/BusesPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { BookingConfirmation } from './pages/bookings/BookingConfirmation';
import { CustomerDashboard } from './pages/profile/CustomerDashboard';
import { TripBuilderPage } from './pages/trip-builder/TripBuilderPage';
import { JourneysDashboard } from './pages/journeys/JourneysDashboard';
import { CreateTripPage } from './pages/journeys/CreateTripPage';
import { TripWorkspacePage } from './pages/journeys/TripWorkspacePage';
import { WishlistPage } from './pages/wishlist/WishlistPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useAuthStore } from './store/authStore';

export const App = () => {
  const { checkSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkSession();
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-slate-100 selection:bg-coral-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/trains" element={<TrainsPage />} />
          <Route path="/buses" element={<BusesPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmation" element={<BookingConfirmation />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/journeys" element={<JourneysDashboard />} />
          <Route path="/my-journeys" element={<JourneysDashboard />} />
          <Route path="/journeys/new" element={<CreateTripPage />} />
          <Route path="/journeys/:id" element={<TripWorkspacePage />} />
          <Route path="/trip-builder" element={<TripBuilderPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Catch-all 404 */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
