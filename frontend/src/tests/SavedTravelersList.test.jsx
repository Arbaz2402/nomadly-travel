import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavedTravelersList } from '../components/customer/SavedTravelersList';

describe('SavedTravelersList Component', () => {
  it('renders saved traveler cards and handles delete click', () => {
    const mockTravelers = [
      {
        _id: 'trav_1',
        title: 'Dr',
        firstName: 'Sarah',
        lastName: 'Connor',
        gender: 'female',
        nationality: 'Indian',
      },
    ];

    const handleDelete = vi.fn();
    const handleOpenAdd = vi.fn();

    render(
      <SavedTravelersList
        travelers={mockTravelers}
        showAddTraveler={false}
        setShowAddTraveler={handleOpenAdd}
        travelerForm={{}}
        setTravelerForm={() => {}}
        handleSaveTraveler={() => {}}
        handleDeleteTraveler={handleDelete}
      />
    );

    expect(screen.getByText('Dr Sarah Connor')).toBeInTheDocument();
    expect(screen.getByText(/female • Indian/i)).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('Remove traveler');
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('trav_1');
  });

  it('renders the traveler form when showAddTraveler is true', () => {
    const formState = {
      title: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      nationality: 'Indian',
    };

    render(
      <SavedTravelersList
        travelers={[]}
        showAddTraveler={true}
        setShowAddTraveler={() => {}}
        travelerForm={formState}
        setTravelerForm={() => {}}
        handleSaveTraveler={(e) => e.preventDefault()}
        handleDeleteTraveler={() => {}}
      />
    );

    expect(screen.getByText('Add Traveler Details')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
  });
});
