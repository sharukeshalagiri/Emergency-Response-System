const CACHE_VERSION = 'emergency-v1.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/offline.html'
];

// Install Event
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip Chrome extensions and non-HTTP protocols
  if (url.protocol === 'chrome-extension:' || !url.protocol.startsWith('http')) {
    return;
  }

  // API calls - Network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline response for API calls
              return new Response(
                JSON.stringify({
                  success: false,
                  error: 'You are offline. Data will be synced when you are back online.',
                  offline: true
                }),
                {
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Static assets - Cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Update cache in background
          fetchAndCache(event.request);
          return cachedResponse;
        }

        // Try network
        return fetch(event.request)
          .then(response => {
            // Cache the response
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Return error for other requests
            return new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Background sync for offline reports
self.addEventListener('sync', event => {
  if (event.tag === 'sync-emergency-reports') {
    console.log('Service Worker: Syncing emergency reports...');
    event.waitUntil(syncEmergencyReports());
  }
});

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Emergency update',
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      id: data.id
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Emergency Alert',
      options
    )
  );
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(clientList => {
          for (const client of clientList) {
            if (client.url === event.notification.data.url && 'focus' in client) {
              return client.focus();
            }
          }
          if (clients.openWindow) {
            return clients.openWindow(event.notification.data.url);
          }
        })
    );
  }
});

// Helper Functions
function fetchAndCache(request) {
  fetch(request)
    .then(response => {
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then(cache => cache.put(request, responseClone));
      }
    })
    .catch(() => {
      // Silently fail - this is background update
    });
}

async function syncEmergencyReports() {
  try {
    // Get queued reports from IndexedDB
    const db = await openEmergencyDB();
    const reports = await getAllReports(db);

    for (const report of reports) {
      try {
        const response = await fetch('/api/v1/emergency/sync-offline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reports: [report] })
        });

        if (response.ok) {
          await deleteReport(db, report.id);
        }
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// IndexedDB helpers
function openEmergencyDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('EmergencyQueueDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('emergencyQueue')) {
        const store = db.createObjectStore('emergencyQueue', {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('timestamp', 'timestamp');
      }
    };
  });
}

function getAllReports(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['emergencyQueue'], 'readonly');
    const store = transaction.objectStore('emergencyQueue');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteReport(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['emergencyQueue'], 'readwrite');
    const store = transaction.objectStore('emergencyQueue');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(true);
  });
}