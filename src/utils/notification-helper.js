class NotificationHelper {
  static async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker tidak didukung di browser ini');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
      });
      console.log('Service Worker berhasil didaftarkan', registration);
      return registration;
    } catch (error) {
      console.error('Registrasi Service Worker gagal:', error);
      return null;
    }
  }

  static async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return false;
    }

    const result = await Notification.requestPermission();
    if (result === 'denied') {
      console.log('Fitur notifikasi tidak diizinkan');
      return false;
    }

    if (result === 'default') {
      console.log('Pengguna menutup kotak dialog permintaan izin');
      return false;
    }

    return true;
  }

  static async getVapidPublicKey() {
    return 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  static async subscribePushNotification(registration) {
    if (!registration.active) {
      console.error('Service Worker tidak aktif');
      return;
    }

    const vapidPublicKey = await this.getVapidPublicKey();
    const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      console.log('Berhasil melakukan subscribe dengan endpoint:', subscription.endpoint);
      await this._sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error('Gagal melakukan subscribe:', error);
      return null;
    }
  }

  static async _sendSubscriptionToServer(subscription) {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('User perlu login untuk menerima notifikasi');
      return;
    }

    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.getKey('p256dh'),
            auth: subscription.getKey('auth'),
          },
        }),
      });

      const responseJson = await response.json();

      if (!response.ok || responseJson.error) {
        throw new Error(responseJson.message || 'Subscription failed');
      }

      console.log('Subscription berhasil dikirim ke server:', responseJson);
    } catch (error) {
      console.error('Gagal mengirim subscription ke server:', error);
    }
  }

  static _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  static showNotification(title, options) {
    if (!('Notification' in window)) {
      console.log('Browser tidak mendukung notifikasi');
      return;
    }

    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      console.log('Izin notifikasi tidak diberikan');
      alert('Anda belum memberikan izin untuk menerima notifikasi.');
    }
  }
}

export { NotificationHelper };
