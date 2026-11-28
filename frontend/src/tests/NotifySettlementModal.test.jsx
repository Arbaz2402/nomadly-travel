import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '../context/ToastContext';
import { NotifySettlementModal } from '../components/journeys/modals/NotifySettlementModal';
import { ApiClient } from '../services/api';

describe('NotifySettlementModal', () => {
  const mockTrip = { _id: 'trip-1', title: 'Goa Trip', currency: 'INR' };
  const initialData = {
    from: 'Rohan',
    fromEmail: 'rohan@example.com',
    to: 'Aarav',
    amount: 1500,
  };

  it('renders debtor, creditor, custom message, and submits reminder', async () => {
    const spy = vi.spyOn(ApiClient, 'notifySettlementDebtor').mockResolvedValue({
      success: true,
      message: 'Reminder email sent to rohan@example.com!',
    });
    const onClose = vi.fn();

    render(
      <ToastProvider>
        <NotifySettlementModal
          trip={mockTrip}
          isOpen={true}
          onClose={onClose}
          initialData={initialData}
        />
      </ToastProvider>
    );

    expect(screen.getByText('Rohan')).toBeInTheDocument();
    expect(screen.getByText(/Owes Aarav/i)).toBeInTheDocument();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Hey Rohan, please settle ₹1,500.' } });

    const submitBtn = screen.getByRole('button', { name: /Send Email Reminder/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith('trip-1', {
        debtorName: 'Rohan',
        debtorEmail: 'rohan@example.com',
        creditorName: 'Aarav',
        amount: 1500,
        customMessage: 'Hey Rohan, please settle ₹1,500.',
      });
      expect(onClose).toHaveBeenCalled();
    });

    spy.mockRestore();
  });
});
