import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AdminKpiCards } from '../components/admin/AdminKpiCards';

describe('AdminKpiCards Component', () => {
  it('renders all 4 platform KPI cards with default values', () => {
    render(<AdminKpiCards kpis={{}} />);

    expect(screen.getByText(/Total Users/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Journeys/i)).toBeInTheDocument();
    expect(screen.getByText(/Tracked Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/Vault Documents/i)).toBeInTheDocument();
  });

  it('correctly displays passed KPI values', () => {
    const kpis = {
      totalUsers: 18,
      totalTrips: 42,
      activeTrips: 12,
      completedTrips: 30,
      totalDocuments: 64,
      totalTrackedExpenses: 125000,
    };

    render(<AdminKpiCards kpis={kpis} />);

    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('64')).toBeInTheDocument();
  });
});
