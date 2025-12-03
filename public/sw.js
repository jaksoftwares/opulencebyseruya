// Service Worker for Smart Caching and Offline Support
const CACHE_NAME = 'opulence-v1';
const STATIC_CACHE = 'opulence-static-v1';
const DYNAMIC_CACHE = 'opulence-dynamic-v1';
const IMAGE_CACHE = 'opulence-images-v1';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets as needed
];

// API routes to cache with smart strategies
const API_CACHE_PATTERNS = [
  /\/api\/categories/,
  /\/api\/products.*featured=true/,
  /\/api\/products.*featured=top_deal/,
  /\/api\/products.*new_arrival=true/,
];

// Dynamic caching patterns for different content types
const CACHE_STRATEGIES = {
  // Cache first for static assets and images
  static: {
    pattern: /\.(js|css|png|jpg|jpeg|svg|webp|ico)$/i,
    strategy: 'cache-first',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  
  // Network first for API calls with cache fallback
  api: {
    pattern: /\/api\//,
    strategy: 'network-first',
    maxAge: 5 * 60 * 1000, // 5 minutes
  },
  
  // Stale while revalidate for product data
  products: {
    pattern: /\/products/,
    strategy: 'stale-while-revalidate',
    maxAge: 10 * 60 * 1000, // 10 minutes
  },
  
  // Network first with cache fallback for user data
  user: {
    pattern: /\/(cart|orders|profile)/,
    strategy: 'network-first',
    maxAge: 2 * 60 * 1000, // 2 minutes
  },
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      self.skipWaiting(),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![
              STATIC_CACHE,
              DYNAMIC_CACHE,
              IMAGE_CACHE,
              CACHE_NAME
            ].includes(cacheName)) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

// Fetch event - handle requests with smart caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests (different origin)
  if (url.origin !== location.origin) return;
  
  // Handle different types of requests with appropriate strategies
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Determine caching strategy based on request type
    const strategy = getCacheStrategy(request);
    
    switch (strategy) {
      case 'cache-first':
        return await cacheFirstStrategy(request);
      
      case 'network-first':
        return await networkFirstStrategy(request);
      
      case 'stale-while-revalidate':
        return await staleWhileRevalidateStrategy(request);
      
      default:
        return await fetch(request);
    }
  } catch (error) {
    console.error('Service Worker: Fetch error:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback for navigations
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

function getCacheStrategy(request) {
  const url = new URL(request.url);
  
  // Check API routes
  if (url.pathname.startsWith('/api/')) {
    return 'network-first';
  }
  
  // Check static assets
  if (CACHE_STRATEGIES.static.pattern.test(url.pathname)) {
    return 'cache-first';
  }
  
  // Check product pages
  if (CACHE_STRATEGIES.products.pattern.test(url.pathname)) {
    return 'stale-while-revalidate';
  }
  
  // Check user-related pages
  if (CACHE_STRATEGIES.user.pattern.test(url.pathname)) {
    return 'network-first';
  }
  
  return 'network-first';
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  // Start fetching in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then((cacheInstance) => {
        cacheInstance.put(request, networkResponse.clone());
      });
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return fetchPromise;
}

// Background sync for cart updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  }
});

async function syncCart() {
  try {
    // Get pending cart updates from IndexedDB
    const pendingUpdates = await getPendingCartUpdates();
    
    if (pendingUpdates.length > 0) {
      // Sync each pending update
      for (const update of pendingUpdates) {
        try {
          const response = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
          });
          
          if (response.ok) {
            // Remove from pending updates
            await removePendingCartUpdate(update.id);
          }
        } catch (error) {
          console.error('Service Worker: Cart sync failed for update:', update.id);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Cart sync failed:', error);
  }
}

// IndexedDB helpers for offline data storage
async function getPendingCartUpdates() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OpulenceDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cart_updates'], 'readonly');
      const store = transaction.objectStore('cart_updates');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
  });
}

async function removePendingCartUpdate(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OpulenceDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cart_updates'], 'readwrite');
      const store = transaction.objectStore('cart_updates');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Opulence', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('Service Worker: Loaded successfully');