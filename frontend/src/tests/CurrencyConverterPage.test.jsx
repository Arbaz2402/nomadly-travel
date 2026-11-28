import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../context/ToastContext';
import { CurrencyConverterPage } from '../pages/tools/CurrencyConverterPage';

// Mock Recharts ResponsiveContainer for jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

const renderPage = () =>
  render(
    <ToastProvider>
      <MemoryRouter>
        <CurrencyConverterPage />
      </MemoryRouter>
    </ToastProvider>
  );

describe('CurrencyConverterPage Features', () => {
  it('renders the two-card Quick Conversion Cheat Sheet', () => {
    renderPage();
    expect(screen.getByText(/Quick Conversion Cheat Sheet/i)).toBeInTheDocument();
    expect(screen.getByText(/Foreign to Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Home to Foreign/i)).toBeInTheDocument();
  });

  it('pins the Currency Rate Disclaimer open on click and closes via Close button', () => {
    renderPage();
    const infoBtn = screen.getByRole('button', { name: /Currency Rate Disclaimer/i });
    fireEvent.click(infoBtn);

    expect(screen.getByRole('dialog', { name: /Currency Rate Disclaimer/i })).toBeInTheDocument();
    expect(screen.getByText(/Indicative market rates only\./i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close disclaimer/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole('dialog', { name: /Currency Rate Disclaimer/i })).not.toBeInTheDocument();
  });
});
