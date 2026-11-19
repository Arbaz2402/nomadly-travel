import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { HomePage } from '../pages/home/HomePage';
import { FlightsPage } from '../pages/flights/FlightsPage';
import { AITripPlannerPage } from '../pages/ai/AITripPlannerPage';

// Mock window.matchMedia for responsive UI components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderWithProviders = (ui, initialEntries = ['/']) => {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </ToastProvider>
  );
};

describe('Application Core Shell & Page Render Smoke Test Suite', () => {
  it('renders Navbar without any missing icon or ReferenceError', () => {
    const { container } = renderWithProviders(<Navbar />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText('Flights')).toBeInTheDocument();
    expect(screen.getByText('Trip Planner')).toBeInTheDocument();
  });

  it('renders Footer without any missing icon or ReferenceError', () => {
    const { container } = renderWithProviders(<Footer />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText('NOMADLY')).toBeInTheDocument();
    expect(screen.getByText('Custom Trip Planner')).toBeInTheDocument();
  });

  it('renders HomePage without crashing or throwing ReferenceError', () => {
    const { container } = renderWithProviders(<HomePage />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Featured Luxury Resorts & Boutique Stays/i)).toBeInTheDocument();
    expect(screen.getByText(/Launch Trip Planner/i)).toBeInTheDocument();
  });

  it('renders FlightsPage search view cleanly without ReferenceError', () => {
    const { container } = renderWithProviders(<FlightsPage />, ['/flights?origin=BOM&destination=DEL']);
    expect(container).toBeInTheDocument();
  });

  it('renders Trip Planner page cleanly without ReferenceError', () => {
    const { container } = renderWithProviders(<AITripPlannerPage />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText(/Custom Itinerary Planner/i)).toBeInTheDocument();
  });
});
