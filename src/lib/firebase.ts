// ============================================
// 🔥 FIREBASE CONFIGURATION
// Including FCM for Push Notifications
// ============================================
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// VAPID key for web push (generate in Firebase Console > Cloud Messaging)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

// Validate config
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Firebase config:', missing);
    console.error('💡 Check your .env.local file');
    return false;
  }
  return true;
};

// Initialize Firebase
let app;
let auth;
let db;
let analytics = null;
let messaging: Messaging | null = null;

try {
  if (validateConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Initialize Analytics only in production and if supported
    if (import.meta.env.PROD) {
      isSupported().then(supported => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log('📊 Analytics initialized');
        }
      });
    }
    
    // Initialize FCM (only in browser with service worker support)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        messaging = getMessaging(app);
        console.log('🔔 FCM initialized');
      } catch (err) {
        console.warn('⚠️ FCM not available:', err);
      }
    }
    
    // Enable offline persistence
    enableIndexedDbPersistence(db, {
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    }).then(() => {
      console.log('💾 Offline persistence enabled');
    }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Persistence not supported in this browser');
      }
    });
    
    // Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔧 Connected to Firebase emulators');
    }
    
    console.log('✅ Firebase initialized successfully');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// ============================================
// FCM PUSH NOTIFICATION HELPERS
// ============================================

/**
 * Request permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('FCM not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token) {
        console.log('🔑 FCM Token:', token.substring(0, 20) + '...');
        return token;
      }
    } else {
      console.warn('❌ Notification permission denied');
    }
    
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    console.log('📬 Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Show local notification (for foreground messages)
 */
export const showLocalNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/logo-smarter.jpg',
      badge: '/logo-smarter.jpg',
      tag: 'smarter-notification',
      renotify: true,
    });
  }
};

// Auth state observer helper
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Current user getter
export const getCurrentUser = (): FirebaseUser | null => {
  return auth?.currentUser || null;
};

// Export instances
export { app, auth, db, analytics, messaging };

// Export types
export type { FirebaseUser };
