import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/navigation/Navbar';
import { Footer } from './components/navigation/Footer';
import { HomePage } from './pages/home/HomePage';
import { AITripPlannerPage } from './pages/ai/AITripPlannerPage';
import { CurrencyConverterPage } from './pages/tools/CurrencyConverterPage';
import { PackingChecklistPage } from './pages/tools/PackingChecklistPage';
import { JourneysDashboard } from './pages/journeys/JourneysDashboard';
import { CreateTripPage } from './pages/journeys/CreateTripPage';
import { TripWorkspacePage } from './pages/journeys/TripWorkspacePage';
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
          <Route path="/dashboard" element={<Navigate to="/journeys" replace />} />
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
