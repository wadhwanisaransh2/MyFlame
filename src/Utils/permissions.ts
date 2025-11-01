import Geolocation from '@react-native-community/geolocation';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';
import {
  check,
  PERMISSIONS,
  RESULTS,
  openSettings,
  request,
  Permission,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';

export const Camera = 'Camera';
export const MediaLibrary = 'MediaLibrary';
export const Notifications = 'Notifications';
export const PhotoLibrary = 'PhotoLibrary';

export const CheckPermission = async (VALUE: any) => {
  let result = await check(VALUE);
  switch (result) {
    case RESULTS.DENIED:
      // openSettings();
      break;
    case RESULTS.GRANTED:
      return true;
    case RESULTS.BLOCKED:
      openSettings();
      break;
  }
};

export const CheckPermission2 = async (permissionType: Permission) => {
  try {
    const result = await check(permissionType);
    switch (result) {
      case RESULTS.DENIED:
        return false;
      case RESULTS.GRANTED:
        return true;
      case RESULTS.BLOCKED:
        // openSetting();
        return false;
    }
  } catch (error) {
    return false;
  }
};

export const requestPermission = async (permissionType: Permission) => {
  let msg = 'Please enable the required permission in your app settings.';
  if (
    permissionType === PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION ||
    permissionType === PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
  ) {
    msg = 'Please enable the Location permission in your app settings.';
  }

  try {
    const result = await request(permissionType);
    if (result === RESULTS.BLOCKED) {
      openSetting(msg);
      return false;
    } else if (result === RESULTS.DENIED) {
      // Permission denied
      return false;
    } else if (result === RESULTS.GRANTED) {
      // Permission blocked
      return true;
    }
  } catch (error) {
    return false;
  }
};

export const openSetting = (msg: string) => {
  Alert.alert('Permission Blocked', msg, [
    {
      text: 'Cancel',
      style: 'cancel',
      onPress: () => {},
    },
    {
      text: 'Open Settings',
      onPress: () => openSettings(),
    },
  ]);
};

export const CheckMediaPermissions = async (buttonIndex: number) => {
  let data = {
    buttonIndex: buttonIndex,
    status: true,
  };
  if (Platform.OS === 'ios') {
    try {
      const hasPermission = await CheckPermission(
        Platform.select({
          ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        }),
      );
      if (hasPermission) {
        return data;
      } else {
        const result = await requestPermission(
          Platform.select({
            ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
          }) as Permission,
        );
        if (result) {
          return data;
        } else {
          return {...data, status: false};
        }
      }
    } catch (err) {
      return {...data, status: false};
    }
  } else {
    return data;
  }
};

export const showSettingsAlert = () => {
  Alert.alert(
    'Enable Notifications',
    'Notifications are disabled. Please enable them in settings to get orders.',
    [
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {},
      },
    ],
  );
};

export const requestNotificationPermission = async () => {
  try {
    const {status} = await checkNotifications();
    if (status === RESULTS.GRANTED) {
      return true;
    }

    if (status === RESULTS.BLOCKED || status === RESULTS.DENIED) {
      const {status: newStatus} = await requestNotifications([
        'alert',
        'sound',
        'badge',
      ]);
      if (newStatus === RESULTS.GRANTED) {
        return true;
      }

      if (newStatus === RESULTS.BLOCKED) {
        setTimeout(() => showSettingsAlert(), 1000);
        return false;
      }

      if (newStatus === RESULTS.DENIED) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      // Check Android version to use the appropriate permission
      if (Platform.Version >= 33) {
        // For Android 13+ (API 33+), use the new granular permission
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          requestExternalStoragePermission();

          return false;
        }

        return result === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For older Android versions, use READ_EXTERNAL_STORAGE
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          requestExternalStoragePermission();
          return false;
        }

        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      return false;
    }
  } else {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return result === RESULTS.GRANTED;
  }
};

/**
 * Interface for location coordinates
 */
interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Utility function to check location permission and get user's latitude and longitude
 * @returns Promise resolving to location coordinates or null if permission denied
 */
export const getUserLocation =
  async (): Promise<LocationCoordinates | null> => {
    try {
      // Determine which permission to request based on platform
      const locationPermission: Permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      // Check current permission status
      const permissionStatus = await check(locationPermission);

      // If permission is not granted, request it
      let finalStatus = permissionStatus;
      if (permissionStatus !== RESULTS.GRANTED) {
        finalStatus = await request(locationPermission);
      }

      // If permission is still not granted, return null
      if (finalStatus !== RESULTS.GRANTED) {
        return null;
      }

      // For iOS, configure geolocation
      if (Platform.OS === 'ios') {
        Geolocation.setRNConfiguration({
          skipPermissionRequests: true, // We already handled permissions with react-native-permissions
          authorizationLevel: 'whenInUse',
        });
      }

      // Get the current position
      return new Promise<LocationCoordinates | null>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            resolve({latitude, longitude});
          },
          error => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      });
    } catch (error) {
      return null;
    }
  };

/**
 * Requests location permission and handles different permission states
 * @returns Promise<boolean> - true if permission granted, false otherwise
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    // Determine which permission to request based on platform
    const locationPermission: Permission = Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });

    // Check current permission status
    const permissionStatus = await check(locationPermission);

    // If already granted, return true
    if (permissionStatus === RESULTS.GRANTED) {
      return true;
    }

    // If not granted, request it
    const result = await request(locationPermission);

    // Return true if permission was granted
    return result === RESULTS.GRANTED;
  } catch (error) {
    return false;
  }
};

export const requestExternalStoragePermission = async () => {
  try {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (error) {
    return false;
  }
};
