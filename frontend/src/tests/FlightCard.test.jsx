import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlightCard } from '../components/travel-cards/FlightCard';

const mockFlight = {
  _id: 'flight_test_1',
  originCode: 'BOM',
  originCity: 'Mumbai',
  destinationCode: 'DEL',
  destinationCity: 'Delhi',
  cabinClass: 'economy',
  totalDurationMinutes: 130,
  stops: 0,
  pricing: {
    currency: 'INR',
    baseFare: 4200,
    taxes: 750,
    totalAmount: 4950,
  },
  baggage: {
    cabin: '7 kg',
    checkIn: '15 kg',
  },
  fareRules: {
    isRefundable: true,
  },
  legs: [
    {
      flightNumber: '6E-205',
      airline: 'IndiGo',
      departureTime: '2026-11-20T06:00:00Z',
      arrivalTime: '2026-11-20T08:10:00Z',
    },
  ],
};

describe('FlightCard Component', () => {
  it('renders flight information, timing, duration, and non-stop tag', () => {
    render(
      <FlightCard
        flight={mockFlight}
        onBook={() => {}}
        onPartnerBook={() => {}}
      />
    );

    expect(screen.getByText('IndiGo')).toBeInTheDocument();
    expect(screen.getByText('6E-205')).toBeInTheDocument();
    expect(screen.getByText('BOM')).toBeInTheDocument();
    expect(screen.getByText('DEL')).toBeInTheDocument();
    expect(screen.getByText('Non-Stop')).toBeInTheDocument();
    expect(screen.getByText(/Refundable/i)).toBeInTheDocument();
  });

  it('triggers onPartnerBook callback when "Book on MMT" button is clicked without form filling', () => {
    const handlePartnerBook = vi.fn();
    render(
      <FlightCard
        flight={mockFlight}
        onBook={() => {}}
        onPartnerBook={handlePartnerBook}
      />
    );

    const mmtBtn = screen.getByRole('button', { name: /Book on MMT/i });
    expect(mmtBtn).toBeInTheDocument();

    fireEvent.click(mmtBtn);
    expect(handlePartnerBook).toHaveBeenCalledTimes(1);
    expect(handlePartnerBook).toHaveBeenCalledWith(mockFlight);
  });

  it('triggers onBook callback when "Details" button is clicked', () => {
    const handleBook = vi.fn();
    render(
      <FlightCard
        flight={mockFlight}
        onBook={handleBook}
        onPartnerBook={() => {}}
      />
    );

    const detailsBtn = screen.getByRole('button', { name: /Details/i });
    fireEvent.click(detailsBtn);
    expect(handleBook).toHaveBeenCalledTimes(1);
    expect(handleBook).toHaveBeenCalledWith(mockFlight);
  });

  it('triggers onToggleSave callback when heart icon is clicked', () => {
    const handleToggleSave = vi.fn();
    render(
      <FlightCard
        flight={mockFlight}
        onBook={() => {}}
        onToggleSave={handleToggleSave}
        isSaved={false}
      />
    );

    const heartBtn = screen.getAllByRole('button')[0];
    fireEvent.click(heartBtn);
    expect(handleToggleSave).toHaveBeenCalledTimes(1);
  });
});
