import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminKpiCards } from '../components/admin/AdminKpiCards';

describe('AdminKpiCards Component', () => {
  it('renders all 4 financial telemetry cards with default values', () => {
    render(<AdminKpiCards kpis={{}} />);

    expect(screen.getByText(/Total Platform GMV/i)).toBeInTheDocument();
    expect(screen.getByText(/Platform Service Revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmed Reservations/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancellation Rate/i)).toBeInTheDocument();
  });

  it('correctly displays passed KPI values', () => {
    const kpis = {
      grossBookingValue: 1250000,
      totalGMV: 1250000,
      platformRevenue: 150000,
      confirmedBookings: 42,
      cancellationRate: 2.5,
      refundVolume: 12000,
    };

    render(<AdminKpiCards kpis={kpis} />);

    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('2.5%')).toBeInTheDocument();
  });
});
