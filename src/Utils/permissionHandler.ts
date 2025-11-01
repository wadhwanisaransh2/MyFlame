import {Platform} from 'react-native';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';
import {isFirstTimeLaunch, setAppLaunched} from './storage';

// Define all the permissions needed by the app
const ANDROID_PERMISSIONS = [
  PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
  PERMISSIONS.ANDROID.CAMERA,
  PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
];

const IOS_PERMISSIONS = [
  PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  PERMISSIONS.IOS.CAMERA,
  PERMISSIONS.IOS.PHOTO_LIBRARY,
];

// Get permissions based on platform
const getPermissions = () => {
  return Platform.OS === 'ios' ? IOS_PERMISSIONS : ANDROID_PERMISSIONS;
};

// Request all permissions at once
export const requestAllPermissions = async () => {
  const permissions = getPermissions();
  try {
    const results = await requestMultiple(permissions);
    // Log results for debugging
    permissions.forEach(permission => {
      });
    // Return true if all permissions are granted
    return permissions.every(
      permission => results[permission] === RESULTS.GRANTED,
    );
  } catch (error) {
    return false;
  }
};

// Check if it's first launch and request permissions if needed
export const handleFirstLaunchPermissions = async () => {
  try {
    const isFirstLaunch = await isFirstTimeLaunch();
    if (isFirstLaunch) {
      // Request all permissions
      await requestAllPermissions();
      // Mark app as launched
      await setAppLaunched();
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
