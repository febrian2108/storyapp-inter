import express from 'express';
import bodyParser from 'body-parser';
import webpush from 'web-push';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Ganti dengan VAPID keys Anda
const VAPID_PUBLIC_KEY = 'BIUMUfEgx5RMsv8Y0M77-8XLWvUdjk259OIqHYXjAq_m-b9gbKyz4n4hruS4TuiwFMnnQIqBfQ0H-N3rBuMtZ3s';
const VAPID_PRIVATE_KEY = '_3EtP4vklHghUU7pO9sXklInAMPRDI-ah_v4LIUmF3U';

webpush.setVapidDetails(
    'mailto:email@domain.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

let subscriptions = [];

app.post('/save-subscription', (req, res) => {
    const subscription = req.body;
    const exists = subscriptions.findIndex(sub => sub.endpoint === subscription.endpoint) !== -1;
    if (!exists) {
        subscriptions.push(subscription);
        console.log('Subscription saved:', subscription.endpoint);
    }
    res.status(201).json({ message: 'Subscription saved successfully.' });
});

app.post('/send-notification', async (req, res) => {
    const { title, body, url } = req.body;
    const notificationPayload = JSON.stringify({
        title: title || 'Notifikasi dari Server',
        body: body || 'Ada update terbaru!',
        url: url || '/'
    });
    const sendPromises = subscriptions.map(sub =>
        webpush.sendNotification(sub, notificationPayload).catch(err => {
            console.error('Failed to send notification to', sub.endpoint, err);
        })
    );
    await Promise.all(sendPromises);
    res.json({ message: 'Notifikasi terkirim ke semua subscriber.' });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Gunakan VAPID_PUBLIC_KEY: ${VAPID_PUBLIC_KEY}`);
});
