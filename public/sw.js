const CACHE_NAME = 'light-v3';
const ASSETS_TO_PRECACHE = [
  '/didactic-engine/',
  '/didactic-engine/index.html',
];

// Notification schedule storage (in-memory, survives until SW terminates)
let scheduledTimers = [];

// Install: precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_PRECACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Skip API calls (don't cache Anthropic requests)
  if (event.request.url.includes('api.anthropic.com')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, return cached or offline fallback
            return cachedResponse;
          });

        // Return cached response immediately, update cache in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Message handler: receive commands from the app
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SHOW_NOTIFICATION': {
      const { title, body, tag, data } = payload;
      self.registration.showNotification(title, {
        body,
        icon: '/didactic-engine/icon-192.png',
        badge: '/didactic-engine/icon-192.png',
        vibrate: [100, 50, 100],
        tag: tag || 'light-notification',
        renotify: true,
        data: { url: '/didactic-engine/', ...data },
      });
      break;
    }

    case 'SCHEDULE_NOTIFICATIONS': {
      // Clear existing scheduled timers
      scheduledTimers.forEach(id => clearTimeout(id));
      scheduledTimers = [];

      const { reminders } = payload;
      if (!reminders) break;

      function scheduleAt(timeStr, title, body, tag, dayFilter) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);

        if (target <= now) {
          target.setDate(target.getDate() + 1);
        }

        // Check day filter (for workout days: Mon=1, Wed=3, Fri=5)
        if (dayFilter) {
          while (!dayFilter.includes(target.getDay())) {
            target.setDate(target.getDate() + 1);
          }
        }

        const ms = target - now;
        const timerId = setTimeout(() => {
          self.registration.showNotification(title, {
            body,
            icon: '/didactic-engine/icon-192.png',
            badge: '/didactic-engine/icon-192.png',
            vibrate: [100, 50, 100],
            tag: tag || 'light-reminder',
            renotify: true,
            data: { url: '/didactic-engine/' },
          });
          // Reschedule for next occurrence
          scheduleAt(timeStr, title, body, tag, dayFilter);
        }, ms);
        scheduledTimers.push(timerId);
      }

      if (reminders.sleepWindDown?.enabled) {
        scheduleAt(
          reminders.sleepWindDown.time || '22:30',
          'Wind-Down Time',
          'Time to start your sleep routine. Screens off, brain dump, cool room.',
          'sleep-reminder'
        );
      }
      if (reminders.workout?.enabled) {
        scheduleAt(
          reminders.workout.time || '07:00',
          'Workout Time',
          'Resistance band session today!',
          'workout-reminder',
          [1, 3, 5]
        );
      }
      if (reminders.vocalPractice?.enabled) {
        scheduleAt(
          reminders.vocalPractice.time || '18:00',
          'Vocal Practice',
          'Time for your SLS warm-up. 25 minutes for your voice!',
          'vocal-reminder'
        );
      }
      if (reminders.readingGoal?.enabled) {
        scheduleAt(
          reminders.readingGoal.time || '21:00',
          'Reading Time',
          'Grab your book — 20 pages before bed!',
          'reading-reminder'
        );
      }
      break;
    }

    case 'CLEAR_NOTIFICATIONS': {
      scheduledTimers.forEach(id => clearTimeout(id));
      scheduledTimers = [];
      break;
    }

    case 'SET_OFFLINE_MODE': {
      // Store offline preference
      self._offlineMode = payload.enabled;
      break;
    }

    default:
      break;
  }
});

// Push notification handler (for future server-side push)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Light';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/didactic-engine/icon-192.png',
    badge: '/didactic-engine/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/didactic-engine/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes('/didactic-engine') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(event.notification.data?.url || '/didactic-engine/');
    })
  );
});
