import messaging from '@react-native-firebase/messaging';
import {Alert} from 'react-native';

// Request user permission for notifications
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  } else {
    Alert.alert(
      'Notification Permission',
      'Notifications are disabled. Enable them in settings for full functionality.',
    );
  }
}

// Get FCM token
export async function getToken() {
  try {
    // First check if device is already registered
    const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;

    if (!isRegistered) {
      // Register device for remote messages
      await messaging().registerDeviceForRemoteMessages();
      console.log('Device registered for remote messages');
    }

    // Wait a bit to ensure registration is complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now get the token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);

    // If registration fails, try again after a delay
    if (error.message?.includes('unregistered')) {
      try {
        console.log('Retrying device registration...');
        await messaging().registerDeviceForRemoteMessages();
        await new Promise(resolve => setTimeout(resolve, 2000));
        const token = await messaging().getToken();
        console.log('FCM Token (retry):', token);
        return token;
      } catch (retryError) {
        console.error('Error getting FCM token (retry):', retryError);
        return null;
      }
    }

    return null;
  }
}

// Listen for background and quit state notifications
export function registerNotificationHandlers() {
  // Foreground
  messaging().onMessage(async remoteMessage => {
    console.log('FCM Message Data (Foreground):', remoteMessage);
    // You can show an in-app notification here
  });

  // Background
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('FCM Message Data (Background):', remoteMessage);
    // Handle background notification
  });
}

// Listen for notification when app is opened from a quit state
export function listenForInitialNotification(
  onNotification: (remoteMessage: any) => void,
) {
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage,
        );
        onNotification(remoteMessage);
      }
    });
}
