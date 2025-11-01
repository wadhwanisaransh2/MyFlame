/**
 * @format
 */

import './src/Utils/polyfills';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {createChannels, onMessageReceived} from './src/Utils/NotificationService';
import { getMessaging } from '@react-native-firebase/messaging';

createChannels();
getMessaging().setBackgroundMessageHandler(async remoteMessage => {
  onMessageReceived(remoteMessage?.notification);
});

AppRegistry.registerComponent(appName, () => App);
