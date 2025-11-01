import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import en from './en/translation.json';
import hi from './hi/translation.json';

// Detect device language
const getLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem('language');
  return savedLanguage || RNLocalize.getLocales()[0].languageCode;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
    },
    lng: await getLanguage(), // Default language
    fallbackLng: 'en', // Fallback to English if language not found
    interpolation: { escapeValue: false },
  });

export default i18n;
