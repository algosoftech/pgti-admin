self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('data',data);
    console.log('notification',data.notification);
    self.registration.showNotification(data.notification.title, data.notification)
});

self.addEventListener('notificationClick', event => {
    event.notification.close();
    console.log('close click');
    event.waitUntil(self.clients.openWindow('https://algodev.in:61000/'))
});