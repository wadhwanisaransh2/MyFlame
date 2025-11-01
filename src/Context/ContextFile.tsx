import React, {createContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AppContext = createContext({
  setAppLanguage: () => {},
  initializeAppLanguage: () => {},
  authModal: false,
  setAuthModal: () => {},
});

export const ContextProvider = ({children}: any) => {
  const [appLanguage, setAppLanguage] = useState('en');
  const [authModal, setAuthModal] = useState(false);

  return (
    <AppContext.Provider
      value={{
        setAppLanguage: () => {},
        initializeAppLanguage: () => {},
        authModal: false,
        setAuthModal: () => {},
      }}>
      {children}
    </AppContext.Provider>
  );
};
