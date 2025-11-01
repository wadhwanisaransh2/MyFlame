import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
export const PRESS_ID = 'PRESS_ID';


export function createChannels() {
  notifee.createChannel({
    id: 'notification',
    name: 'notification',
    lights: false,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}


export async function onMessageReceived(notificationData: any) {
  try {
    await notifee.displayNotification({
      title: notificationData?.title,
      body: notificationData?.body,
      android: {
        channelId: 'notification',
        importance: AndroidImportance.HIGH,
        color: '#19A7CE',
        pressAction: {
          id: PRESS_ID,
          launchActivity: 'default',
        },
      },
      data: {notificationData},
    });
  } catch (e) {
    }
}

export const getFcmToken = async () => {
  try {
    return await getToken(getMessaging());
  } catch (error) {
    return null;
  }
};

// export const getFcmToken = async () => {
//   try {
//     return await AsyncStorage.getItem('fcmToken');
//   } catch (error) {
//     //     return null;
//   }
// };