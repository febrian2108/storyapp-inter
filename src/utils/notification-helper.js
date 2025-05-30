class NotificationHelper {
    static async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.log('Service Worker is not supported in this browser');
            return null;
        }

        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker successfully registered', registration);
            return registration;
        } catch (error) {
            console.error('Service Worker Registration Failed:', error);
            return null;
        }
    }

    static async requestPermission() {
        if (!('Notification' in window)) {
            console.log('The browser does not support notifications');
            return false;
        }

        const result = await Notification.requestPermission();
        if (result === 'denied') {
            console.log('Notification features are not permitted');
            return false;
        }

        if (result === 'default') {
            console.log('User closes the permission request dialog box');
            return false;
        }

        return true;
    }

    static async getVapidPublicKey() {
        try {
            const response = await fetch('https://story-api.dicoding.dev/v1/stories/vapidPublicKey');
            const responseJson = await response.json();

            if (responseJson.error) {
                throw new Error(responseJson.message);
            }

            return responseJson.data.vapidPublicKey;
        } catch (error) {
            console.error('Failed to get VAPID public key:', error);
            return null;
        }
    }

    static async subscribePushNotification(registration) {
        const vapidPublicKey = await this.getVapidPublicKey();

        if (!vapidPublicKey) {
            console.error('VAPID public key not available');
            return null;
        }

        const convertedVapidKey = this._urlBase64ToUint8Array(vapidPublicKey);

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey,
            });

            console.log('Successfully subscribed with endpoint:', subscription.endpoint);
            await this._sendSubscriptionToServer(subscription);
            return subscription;
        } catch (error) {
            console.error('Failed to subscribe:', error);
            return null;
        }
    }

    static async _sendSubscriptionToServer(subscription) {
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('Users need to login to receive notifications.');
            return;
        }

        try {
            const response = await fetch('https://story-api.dicoding.dev/v1/stories/pushNotificationSubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    subscription: subscription,
                }),
            });

            const responseJson = await response.json();

            if (responseJson.error) {
                throw new Error(responseJson.message);
            }

            console.log('Subscription successfully sent to server:', responseJson);
        } catch (error) {
            console.error('Failed to send subscription to server:', error);
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
            console.log('The browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, options);
            });
        } else {
            console.log('Notification permission not granted');
        }
    }
}

export { NotificationHelper };