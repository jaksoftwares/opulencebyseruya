'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/',
        })
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is available
                  console.log('New service worker is available');
                  // Optionally prompt user to refresh
                  if (confirm('A new version is available. Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Handle service worker updates via messaging
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SKIP_WAITING') {
              window.location.reload();
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle offline/online events
      const handleOnline = () => {
        console.log('App is online');
        // Sync pending data when back online
        syncPendingData();
      };

      const handleOffline = () => {
        console.log('App is offline');
        // Handle offline mode
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Sync pending data when connection is restored
  const syncPendingData = async () => {
    try {
      // Trigger background sync for cart updates
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // Check if sync is available
          if ('sync' in registration) {
            await (registration as any).sync.register('cart-sync');
          }
        } catch (error) {
          console.warn('Background sync not available:', error);
        }
      }

      // Sync with server
      await fetch('/api/sync', { method: 'POST' });
    } catch (error) {
      console.error('Failed to sync pending data:', error);
    }
  };

  return null; // This component doesn't render anything
}