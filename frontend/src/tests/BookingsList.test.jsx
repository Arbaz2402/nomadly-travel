import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingsList } from '../components/customer/BookingsList';

describe('BookingsList Component', () => {
  it('renders empty state when no bookings exist', () => {
    render(
      <BookingsList
        bookings={[]}
        loadingBookings={false}
        fetchError={null}
        onRefresh={() => {}}
        onOpenTripPicker={() => {}}
        onCancelBooking={() => {}}
      />
    );

    expect(screen.getByText(/No reservations booked yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Exploring/i)).toBeInTheDocument();
  });

  it('renders error state with retry button when fetchError is provided', () => {
    const handleRefresh = vi.fn();
    render(
      <BookingsList
        bookings={[]}
        loadingBookings={false}
        fetchError="Network connection lost"
        onRefresh={handleRefresh}
        onOpenTripPicker={() => {}}
        onCancelBooking={() => {}}
      />
    );

    expect(screen.getByText(/Could not retrieve reservations/i)).toBeInTheDocument();
    expect(screen.getByText(/Network connection lost/i)).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(retryBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders booking items correctly and triggers actions', () => {
    const mockBookings = [
      {
        _id: 'booking_123',
        bookingReference: 'NOM-FL-9988',
        travelCategory: 'flight',
        providerName: 'Air India Express',
        bookingStatus: 'confirmed',
        createdAt: '2026-05-10T10:00:00.000Z',
        passengers: [{ firstName: 'Jane' }],
        pricing: { totalPayable: 8500, currency: 'INR' },
      },
    ];

    const handleOpenTrip = vi.fn();
    const handleCancel = vi.fn();

    render(
      <BookingsList
        bookings={mockBookings}
        loadingBookings={false}
        fetchError={null}
        onRefresh={() => {}}
        onOpenTripPicker={handleOpenTrip}
        onCancelBooking={handleCancel}
      />
    );

    expect(screen.getByText('NOM-FL-9988')).toBeInTheDocument();
    expect(screen.getByText('Air India Express')).toBeInTheDocument();
    expect(screen.getByText('confirmed')).toBeInTheDocument();

    const addToJourneyBtn = screen.getByText(/Add to Journey/i);
    fireEvent.click(addToJourneyBtn);
    expect(handleOpenTrip).toHaveBeenCalledWith(mockBookings[0]);

    const cancelBtn = screen.getByText(/Cancel Booking/i);
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledWith('booking_123');
  });
});
