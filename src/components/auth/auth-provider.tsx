'use client';

import React from 'react';
import AuthDialog from '@/components/auth/auth-dialog';
import { useAuthStore } from '@/stores/auth';

export default function AuthProvider() {
  const hydrate = useAuthStore((state) => state.hydrate);

  React.useEffect(() => {
    hydrate();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !event.key.startsWith('movieko:auth:')) {
        return;
      }
      hydrate();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [hydrate]);

  return <AuthDialog />;
}
