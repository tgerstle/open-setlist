import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';
import { searchQueryStore, selectedVenueStore, dateRangeStore } from '../../stores/appState';
import { describe, it, expect, beforeEach } from 'vitest';

describe('FilterBar', () => {
  beforeEach(() => {
    searchQueryStore.set('');
    selectedVenueStore.set('');
    dateRangeStore.set(undefined);
  });

  it('updates searchQueryStore when user types', async () => {
    render(<FilterBar initialVenues={[]} />);
    const user = userEvent.setup();
    const filtersBtn = screen.getByRole('button', { name: /Search & Filter/i });
    expect(filtersBtn).toBeInTheDocument();

    await user.click(filtersBtn);
    const searchInput = await screen.findByPlaceholderText(/Search artists/i);
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, 'The Dandy Warhols');
    expect(searchQueryStore.get()).toBe('The Dandy Warhols');
    
    // Assert filter count has updated
    const updatedFiltersBtn = screen.getByRole('button', { name: /1/i });
    expect(updatedFiltersBtn).toBeInTheDocument();
  });
});
