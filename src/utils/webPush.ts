"use client";

// This should be your VAPID public key, obtained from your push service provider.
// For development, you can generate a pair using `npx web-push generate-vapid-keys`.
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BDS_REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY_HERE_sDS';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    alert('Push messaging is not supported by your browser.');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('User IS subscribed.');
      return subscription;
    }

    console.log('User is NOT subscribed. Subscribing...');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permission for notifications was denied');
      alert('You denied permission for notifications. Please enable them in browser settings if you want to receive reminders.');
      return null;
    }
    
    if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'BDS_REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY_HERE_sDS') {
      console.error("VAPID public key is not configured. Push subscription will fail.");
      alert("Push notification setup is incomplete on the server. Please contact support.");
      return null;
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('User is subscribed:', subscription);

    // Send the subscription object to your backend server
    // Example:
    // await fetch('/api/subscribe', {
    //   method: 'POST',
    //   body: JSON.stringify(subscription),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
    alert('Failed to subscribe to push notifications. See console for details.');
    return null;
  }
}

export async function unsubscribeUserFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('User is not subscribed. No need to unsubscribe.');
      return true;
    }

    const successful = await subscription.unsubscribe();
    if (successful) {
      console.log('User unsubscribed successfully.');
      // Optionally, notify your backend about the unsubscription
      // Example:
      // await fetch('/api/unsubscribe', {
      //   method: 'POST',
      //   body: JSON.stringify({ endpoint: subscription.endpoint }),
      //   headers: { 'Content-Type': 'application/json' },
      // });
      return true;
    } else {
      console.error('Failed to unsubscribe user.');
      return false;
    }
  } catch (error) {
    console.error('Error unsubscribing user: ', error);
    return false;
  }
}
