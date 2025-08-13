import {Platform, Alert, Linking} from 'react-native';
import {
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission: Permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED:
        return true;
      case RESULTS.DENIED:
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission to take photos.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => Linking.openSettings()},
          ],
        );
        return false;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Camera Permission Blocked',
          'Camera permission is blocked. Please enable it in device settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => Linking.openSettings()},
          ],
        );
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const requestGalleryPermission = async (): Promise<boolean> => {
  try {
    // For Android 13+, no permission needed for gallery
    if (Platform.OS === 'android') {
      return true;
    }

    const permission: Permission = PERMISSIONS.IOS.PHOTO_LIBRARY;
    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED: // iOS 14+ limited access is still usable
        return true;
      case RESULTS.DENIED:
        Alert.alert(
          'Photo Library Permission Required',
          'Please grant photo library permission to select images.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => Linking.openSettings()},
          ],
        );
        return false;
      case RESULTS.BLOCKED:
        Alert.alert(
          'Photo Library Permission Blocked',
          'Photo library permission is blocked. Please enable it in device settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Settings', onPress: () => Linking.openSettings()},
          ],
        );
        return false;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error requesting gallery permission:', error);
    return true; // Return true for Android as gallery doesn't need permission
  }
};
