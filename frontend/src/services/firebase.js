import api from './api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingModulePromise = null;
let messagingInstance = null;

async function loadFirebaseMessaging() {
  if (!messagingModulePromise) {
    messagingModulePromise = Promise.all([
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging.js'),
    ]);
  }
  return messagingModulePromise;
}

async function ensureFirebase() {
  const [appModule, messagingModule] = await loadFirebaseMessaging();
  if (!messagingInstance) {
    const app = appModule.initializeApp(firebaseConfig);
    messagingInstance = messagingModule.getMessaging(app);
  }
  return messagingInstance;
}

export const getFirebaseMessagingSupported = async () => {
  try {
    const [, messagingModule] = await loadFirebaseMessaging();
    return messagingModule.isSupported();
  } catch {
    return false;
  }
};

export const registerFirebaseForUser = async () => {
  const authToken = localStorage.getItem('token');
  if (!authToken || !vapidKey) return null;

  const supported = await getFirebaseMessagingSupported();
  if (!supported) return null;

  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
  }

  const [ , messagingModule ] = await loadFirebaseMessaging();
  const messaging = await ensureFirebase();

  const configParam = encodeURIComponent(JSON.stringify(firebaseConfig));
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?firebaseConfig=${configParam}`);
  const token = await messagingModule.getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (token) {
    await api.post('notifications/device-token/', { token });
  }

  messagingModule.onMessage(messaging, (payload) => {
    const title = payload?.notification?.title || 'BudgetBuddy';
    const options = {
      body: payload?.notification?.body || '',
      icon: '/favicon.svg',
      data: payload?.data || {},
    };
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
    window.dispatchEvent(new Event('notificationsUpdated'));
  });

  return token;
};
