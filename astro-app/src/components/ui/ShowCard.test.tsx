import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShowCard } from './ShowCard';
import { selectedShowStore } from '../../stores/appState';
import { describe, it, expect, beforeEach } from 'vitest';
import type { Show } from '../../types/models';

describe('ShowCard Integration', () => {
  beforeEach(() => {
    selectedShowStore.set(null);
  });

  it('updates selectedShowStore when clicked', async () => {
    const mockShow: Show = {
      id: "card-test-1",
      artist: "Local Natives",
      venue_id: "pabst-theater",
      venue_name: "Pabst Theater",
      status: "active",
      date: "2026-05-01",
      event_time: "7:00 PM",
    };

    render(
      <ShowCard 
        show={mockShow} 
        onClick={() => selectedShowStore.set(mockShow)} 
      />
    );

    const user = userEvent.setup();
    const artistText = screen.getByText('Local Natives');
    
    // Simulate user clicking the show card
    await user.click(artistText);

    // Assert the global store has ingested the card's data
    expect(selectedShowStore.get()).toStrictEqual(mockShow);
  });
});
