import React from 'react';
import { useStore } from '@nanostores/react';
import { selectedShowStore } from '../../stores/appState';
import { ShowDetailDrawer } from './ShowDetailDrawer';

export function ShowDetailDrawerContainer() {
  const selectedShow = useStore(selectedShowStore);
  return (
    <ShowDetailDrawer
      show={selectedShow}
      onClose={() => selectedShowStore.set(null)}
    />
  );
}
