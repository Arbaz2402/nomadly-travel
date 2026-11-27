import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { HomePage } from './pages/home/HomePage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { BookingConfirmation } from './pages/bookings/BookingConfirmation';
import { AITripPlannerPage } from './pages/ai/AITripPlannerPage';
import { CurrencyConverterPage } from './pages/tools/CurrencyConverterPage';
import { PackingChecklistPage } from './pages/tools/PackingChecklistPage';
import { CustomerDashboard } from './pages/profile/CustomerDashboard';
import { TripBuilderPage } from './pages/trip-builder/TripBuilderPage';
import { JourneysDashboard } from './pages/journeys/JourneysDashboard';
import { CreateTripPage } from './pages/journeys/CreateTripPage';
import { TripWorkspacePage } from './pages/journeys/TripWorkspacePage';
import { WishlistPage } from './pages/wishlist/WishlistPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useAuthStore } from './store/authStore';

export const App = () => {
  const { initAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-ink-950 text-slate-100 selection:bg-coral-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
          <Route path="/currency-converter" element={<ErrorBoundary><CurrencyConverterPage /></ErrorBoundary>} />
          <Route path="/packing-checklist" element={<ErrorBoundary><PackingChecklistPage /></ErrorBoundary>} />
          <Route path="/ai-planner" element={<ErrorBoundary><AITripPlannerPage /></ErrorBoundary>} />
          <Route path="/hotels" element={<Navigate to="/journeys" replace />} />
          <Route path="/experiences" element={<Navigate to="/journeys" replace />} />
          <Route path="/packages" element={<Navigate to="/journeys" replace />} />
          <Route path="/packages/:id" element={<Navigate to="/journeys" replace />} />
          <Route path="/flights" element={<Navigate to="/journeys" replace />} />
          <Route path="/trains" element={<Navigate to="/journeys" replace />} />
          <Route path="/buses" element={<Navigate to="/journeys" replace />} />
          <Route
            path="/checkout"
            element={
              <ErrorBoundary>
                <CheckoutPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ErrorBoundary>
                <BookingConfirmation />
              </ErrorBoundary>
            }
          />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/journeys" element={<JourneysDashboard />} />
          <Route path="/my-journeys" element={<JourneysDashboard />} />
          <Route path="/journeys/new" element={<CreateTripPage />} />
          <Route
            path="/journeys/:id"
            element={
              <ErrorBoundary>
                <TripWorkspacePage />
              </ErrorBoundary>
            }
          />
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
