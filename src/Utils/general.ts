import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import Toast from 'react-native-simple-toast';

export const setAsyncStorage = async (key: string, value: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
};

export const renderDot = () => {
  return '•';
};

export const rupeeSymbol = () => {
  return '₹';
};

export function formatTime(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Hour '0' should be '12'
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
}

export const getAsyncStorage = async (key: string) => {
  try {
    const data: any = await AsyncStorage.getItem(key);
    if (data === null) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

export const setTheme = async (theme: string) => {
  try {
    await AsyncStorage.setItem('theme', theme);
  } catch (error) {
    }
};

export const getTheme = async () => {
  try {
    const theme = await AsyncStorage.getItem('theme');
    return theme;
  } catch (error) {
    return null;
  }
};

export const formatDate = (
  date: moment.MomentInput,
  format: string | undefined,
) => {
  return moment(date).format(format);
};

export const showToast = (msg: string) => {
  Toast.show(`${msg}`, Toast.LONG);
};

export function formatPostDate(isoString: string): string {
  const eventDate = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor(
    (eventDate.getTime() - now.getTime()) / 1000,
  );
  const absSeconds = Math.abs(diffInSeconds);

  const format = (value: number, unit: string): string => {
    const plural = value === 1 ? unit : `${unit}s`;
    return diffInSeconds >= 0
      ? `in ${value} ${plural}`
      : `${value} ${plural} ago`;
  };

  if (absSeconds < 5) return 'Just now';
  if (absSeconds < 60) return format(absSeconds, 'second');
  if (absSeconds < 3600) return format(Math.floor(absSeconds / 60), 'minute');
  if (absSeconds < 86400) return format(Math.floor(absSeconds / 3600), 'hour');
  if (absSeconds < 2592000)
    return format(Math.floor(absSeconds / 86400), 'day');
  if (absSeconds < 31536000)
    return format(Math.floor(absSeconds / 2592000), 'month');

  return format(Math.floor(absSeconds / 31536000), 'year');
}

/**
 * Converts a short file path to a long absolute path
 * @param shortPath - The short file path (e.g., "/data/user/0/com.myflamaapp/files/file.mp4")
 * @returns The long absolute path (e.g., "file:///storage/emulated/0/Android/data/com.myflamaapp/files/file.mp4")
 */
export const convertToLongPath = (shortPath: string): string => {
  if (!shortPath) return '';

  // If path already starts with 'file://', return as is
  if (shortPath.startsWith('file://')) {
    return shortPath;
  }

  // Extract filename from the short path
  const filename = shortPath.split('/').pop() || '';

  // Construct the long path
  const longPath = `file:///storage/emulated/0/Android/data/com.myflama.safeapp/files/Pictures/${filename}`;

  return longPath;
};

// For video files specifically
export const convertVideoToLongPath = (shortPath: string): string => {
  if (!shortPath) return '';

  // If path already starts with 'file://', return as is
  if (shortPath.startsWith('file://')) {
    return shortPath;
  }

  // Simply prepend 'file://' to the existing path for Android
  const longPath = `file://${shortPath}`;

  return longPath;
};

// Function to determine if a path is a video file
export const isVideoFile = (path: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv'];
  const extension = path.toLowerCase().substring(path.lastIndexOf('.'));
  return videoExtensions.includes(extension);
};

// Smart path converter that handles both image and video paths
export const convertPath = (path: string): string => {
  if (!path) return '';

  // If path already starts with 'file://', return as is
  if (path.startsWith('file://')) {
    return path;
  }

  return isVideoFile(path)
    ? convertVideoToLongPath(path)
    : convertToLongPath(path);
};

/**
 * Manually decodes a JWT token
 * @param token - The JWT token to decode
 * @returns The decoded payload as an object
 */
export const decodeJWT = (token: string) => {
  try {
    // JWT has three parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Get the payload (middle part)
    const base64Payload = parts[1];

    // Replace characters that are URL-safe with standard base64 characters
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decode the base64 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );

    // Parse the JSON
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};
