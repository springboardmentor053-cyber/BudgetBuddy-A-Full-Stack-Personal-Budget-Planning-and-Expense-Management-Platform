importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.2.1/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);
const firebaseConfig = JSON.parse(decodeURIComponent(params.get('firebaseConfig') || '{}'));

if (firebaseConfig && firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || 'BudgetBuddy';
    const options = {
      body: payload?.notification?.body || '',
      icon: '/favicon.svg',
      data: payload?.data || {},
    };
    self.registration.showNotification(title, options);
  });
}
