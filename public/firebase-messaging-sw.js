// ============================================
// 🔔 FIREBASE MESSAGING SERVICE WORKER
// Handles push notifications in background
// ============================================

/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config (must match main app)
const firebaseConfig = {
  apiKey: "AIzaSyBT3UJTHLuBQaB9kK0539-acw8ertf__vY",
  authDomain: "smarter-investment.firebaseapp.com",
  projectId: "smarter-investment",
  storageBucket: "smarter-investment.firebasestorage.app",
  messagingSenderId: "1037439323005",
  appId: "1:1037439323005:web:43b7b89a9c4a0313c45a14",
  measurementId: "G-DQKR8KNV2V"
};

// Initialize Firebase in Service Worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📬 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Smarter Investment';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes una nueva notificación',
    icon: '/logo-smarter.jpg',
    badge: '/logo-smarter.jpg',
    tag: payload.data?.tag || 'smarter-notification',
    data: payload.data,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Cerrar' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: payload.data?.priority === 'high',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'dismiss') return;

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        const url = event.notification.data?.url || '/';
        return clients.openWindow(url);
      }
    })
  );
});

// Handle push event directly (fallback)
self.addEventListener('push', (event) => {
  console.log('📥 Push event received:', event);
  
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.notification?.title || 'Smarter Investment';
    const options = {
      body: data.notification?.body || 'Nueva notificación',
      icon: '/logo-smarter.jpg',
      badge: '/logo-smarter.jpg',
      data: data.data,
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Error processing push:', error);
  }
});

console.log('🔔 Firebase Messaging Service Worker loaded');
