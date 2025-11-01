import 'react-native-gesture-handler';
import 'react-native-reanimated'; // ✅ Add this too!
import {LogBox, StatusBar} from 'react-native';
import React, {useEffect} from 'react';

import Application from './src/Navigation/Application';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {persistor, store} from './src/redux/Store';
import {ContextProvider} from './src/Context/ContextFile';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaView} from 'react-native-safe-area-context';
// import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ThemeProvider, useTheme} from './src/Theme/ThemeContext';
import {Colors} from './src/Utils/colors'; // or wherever your Colors file is
import {requestNotificationPermission} from './src/Utils/permissions';

export default function App() {
  useEffect(() => {
    LogBox.ignoreAllLogs();

    // Request permission after a short delay to ensure app UI renders first
    setTimeout(() => {
      requestNotificationPermission().catch(err => {
        // Catch any errors to prevent app crashing
        console.error('Error requesting notification permission:', err);
      });
    }, 1000);
  }, []);

  const {colors} = useTheme();

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ContextProvider>
          <ThemeProvider>
            <GestureHandlerRootView style={{flex: 1}}>
              <StatusBar backgroundColor={Colors.primaryColor} />
              <Application />
            </GestureHandlerRootView>
          </ThemeProvider>
        </ContextProvider>
      </PersistGate>
    </Provider>
  );
}
