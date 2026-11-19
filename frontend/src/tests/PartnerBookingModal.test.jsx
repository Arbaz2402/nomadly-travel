import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PartnerBookingModal } from '../components/checkout/PartnerBookingModal';

const mockPartnerInfo = {
  name: 'MakeMyTrip Flights',
  badge: 'Official Airline Partner',
  url: 'https://www.makemytrip.com/flight/search?itinerary=BOM-DEL-20/11/2026',
};

describe('PartnerBookingModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PartnerBookingModal
        isOpen={false}
        onClose={() => {}}
        partnerInfo={mockPartnerInfo}
        category="flight"
        title="Flight Reservation"
        pricingMetrics={{ estimatedPayable: 4950 }}
        onConfirmBooking={() => {}}
        isProcessing={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal details, partner badge, and optional PNR field when isOpen is true', () => {
    render(
      <PartnerBookingModal
        isOpen={true}
        onClose={() => {}}
        partnerInfo={mockPartnerInfo}
        category="flight"
        title="IndiGo Flight (BOM → DEL)"
        pricingMetrics={{ estimatedPayable: 4950 }}
        onConfirmBooking={() => {}}
        isProcessing={false}
      />
    );

    expect(screen.getByText(/Complete on MakeMyTrip Flights/i)).toBeInTheDocument();
    expect(screen.getByText(/Official Airline Partner/i)).toBeInTheDocument();
    expect(screen.getByText(/IndiGo Flight \(BOM → DEL\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. WX9K2L or leave empty/i)).toBeInTheDocument();
    expect(screen.getByText(/\(Optional\)/i)).toBeInTheDocument();
  });

  it('submits confirmation with empty PNR string when user leaves PNR blank', () => {
    const handleConfirm = vi.fn();
    render(
      <PartnerBookingModal
        isOpen={true}
        onClose={() => {}}
        partnerInfo={mockPartnerInfo}
        category="flight"
        title="IndiGo Flight"
        pricingMetrics={{ estimatedPayable: 4950 }}
        onConfirmBooking={handleConfirm}
        isProcessing={false}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Add to My Journeys/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith('');
  });

  it('submits confirmation with typed PNR when provided', () => {
    const handleConfirm = vi.fn();
    render(
      <PartnerBookingModal
        isOpen={true}
        onClose={() => {}}
        partnerInfo={mockPartnerInfo}
        category="flight"
        title="IndiGo Flight"
        pricingMetrics={{ estimatedPayable: 4950 }}
        onConfirmBooking={handleConfirm}
        isProcessing={false}
      />
    );

    const input = screen.getByPlaceholderText(/e\.g\. WX9K2L or leave empty/i);
    fireEvent.change(input, { target: { value: 'MMT987654' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm & Add to My Journeys/i });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleConfirm).toHaveBeenCalledWith('MMT987654');
  });

  it('triggers onClose when close icon button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <PartnerBookingModal
        isOpen={true}
        onClose={handleClose}
        partnerInfo={mockPartnerInfo}
        category="flight"
        title="IndiGo Flight"
        pricingMetrics={{ estimatedPayable: 4950 }}
        onConfirmBooking={() => {}}
        isProcessing={false}
      />
    );

    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
