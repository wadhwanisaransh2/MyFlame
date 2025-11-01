import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  FIRST_TIME_LAUNCH: 'FIRST_TIME_LAUNCH',
};

// Check if it's the first time launching the app
export const isFirstTimeLaunch = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_TIME_LAUNCH);
    return value === null; // If null, it's the first time
  } catch (error) {
    return true; // Default to true if there's an error
  }
};

// Set that the app has been launched
export const setAppLaunched = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FIRST_TIME_LAUNCH, 'false');
  } catch (error) {
    }
};

