
const CACHE_NAME = 'launchboard-v3';
const STATIC_CACHE = 'launchboard-static-v3';
const DYNAMIC_CACHE = 'launchboard-dynamic-v3';

const staticAssets = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/offline.html'
];

const fallbackPage = '/offline.html';

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(staticAssets)),
      caches.open(DYNAMIC_CACHE)
    ]).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Enhanced fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests with network first strategy
  if (request.url.includes('/api/') || request.url.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Offline - data not available' }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503
              }
            );
          });
        })
    );
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful page responses
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Return cached page or fallback page
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match(fallbackPage) || 
              new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Handle static assets with cache first strategy
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then(response => {
        // Cache static assets
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Enhanced background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineData().catch(error => {
        console.error('Background sync failed:', error);
      })
    );
  }
});

// Enhanced push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || '1',
      url: data.url || '/'
    },
    actions: [
      {
        action: 'explore',
        title: 'Open LaunchBoard',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close notification',
        icon: '/icon-192x192.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'LaunchBoard', options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    const url = event.notification.data.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Message handling for manual sync triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOW') {
    event.waitUntil(
      syncOfflineData().then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }
});

async function syncOfflineData() {
  try {
    // Open IndexedDB to get unsynced data
    const request = indexedDB.open('LaunchBoardOfflineDB', 1);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['syncQueue'], 'readonly');
        const store = transaction.objectStore('syncQueue');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const syncItems = getAllRequest.result;
          if (syncItems.length > 0) {
            console.log(`Found ${syncItems.length} items to sync`);
            // Notify the main app about sync completion
            self.clients.matchAll().then(clients => {
              clients.forEach(client => {
                client.postMessage({
                  type: 'SYNC_COMPLETE',
                  count: syncItems.length
                });
              });
            });
          }
          resolve();
        };
        
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}

// Periodic background sync registration
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.sync.register('background-sync').catch(error => {
      console.error('Background sync registration failed:', error);
    })
  );
});
