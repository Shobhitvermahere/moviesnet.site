'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/stores';

export function AdminSessionBootstrap({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout } = useAdminStore();

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      try {
        const res = await fetch('/api/auth', { credentials: 'include' });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.username) {
            login(data.username);
            return;
          }
        }

        if (isAuthenticated) logout();
      } catch {
        if (isAuthenticated) logout();
      }
    }

    syncSession();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, login, logout]);

  return <>{children}</>;
}
