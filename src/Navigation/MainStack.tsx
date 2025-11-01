import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch} from 'react-redux';
import BottomTabNavigator from './BottomTab';
import ChatScreen from '../Screens/Chat/ChatScreen';
import LeaderBordScreen from '../Screens/Rank/LeaderBoardScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import FollowerersFollowingScreen from '../Screens/Profile/FollowerersFollowingScreen';
import SearchScreen from '../Screens/Search/SearchScreen';
import MySaving from '../Screens/MySaving/MySaving';
import {_makeAxiosGetRequest} from '../Service';
import {
  setCoinConfig,
  setHasNewMessage,
  setLocation,
  setSettings,
  setUserProfile,
} from '../redux/Store/AuthSlice';
import EditProfile from '../Screens/Auth/EditProfile';
import SettingScreen from '../Screens/Profile/SettingScreen';
import {
  socket,
  socketDisconnect,
  socketListen,
  socketService,
} from '../Service/socketio';
import AddPostScreen from '../Screens/Home/AddPostScreen';
import {endpoint} from '../Constants/endpoints';
import PostListScreen from '../Screens/Profile/PostListScreen';
import ArchivePostList from '../Screens/Profile/ArchivePostList';
import RequestListScreen from '../Screens/Notification/RequestListScreen';
import EditPost from '../Screens/Home/EditPost';
import UploadPostScreen from '../Screens/Home/UploadPostScreen';
import ChatListScreen from '../Screens/Chat/ChatListScreen';
import {useUpdateLocationMutation} from '../redux/api/auth';
import {getUserLocation} from '../Utils/permissions';
import AddReelsScreen from '../Screens/Home/AddReelsScreen';
import {
  useGetCurrentUserProfileQuery,
  useGetSettingQuery,
} from '../redux/api/profile';
import PostScreen from '../Screens/Home/PostScreen';
import ImagePreview from '../Screens/Chat/ImagePreviewScreen';
import {useNavigationState} from '@react-navigation/native';
import MyCoinsScreen from '../Screens/MyCoins/MyCoinsScreen';
import AdsPlayScreen from '../Screens/MyCoins/AdsPlayScreen';
import RefferScreen from '../Screens/MyCoins/RefferScreen';
import ShareCoinScreen from '../Screens/MyCoins/ShareCoinScreen';
import DailyBounsScreen from './DailyBounsScreen';
import BlockUserListScreen from '../Screens/Profile/BlockUserListScreen';
import MyShortsFeed from '../Screens/Reels/MyShortsFeed';
import {onMessageReceived} from '../Utils/NotificationService';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import EventScreen from '../Screens/Rank/EventScreen';
import HomeScreen from '../Screens/Home/HomeScreen';
import ShortsFeed from '../Screens/Reels/ShortsFeed';
import {useGetCoinConfigQuery} from '../redux/api/coins';
import ChangePasswordUsingOld from '../Screens/Profile/ChangePasswordUsingOld';
import {Alert} from '../Components/Common/Alert';
import {useAlert} from '../Hooks/useAlert';

const MainStacks = createNativeStackNavigator();

const MainStackNavigator = () => {
  const dispatch = useDispatch();
  const locationPollingRef = useRef(null);
  const [isLocationUpdating, setIsLocationUpdating] = useState(false);
  const [updateLocation] = useUpdateLocationMutation();
  const {data: settingData} = useGetSettingQuery({});
  const {data: profileData} = useGetCurrentUserProfileQuery(undefined);
  const {data: coinConfigData} = useGetCoinConfigQuery({});

  const {alert, showAlert, hideAlert} = useAlert();
  useEffect(() => {
    if (coinConfigData) {
      dispatch(setCoinConfig(coinConfigData));
    }
  }, [coinConfigData]);

  useEffect(() => {
    dispatch(setSettings(settingData));
  }, [settingData]);

  useEffect(() => {
    if (profileData) {
      dispatch(setUserProfile(profileData));
    }
    dispatch(setHasNewMessage(false));
  }, [profileData]);

  const updateUserLocation = async () => {
    try {
      setIsLocationUpdating(true);
      const location = await getUserLocation();

      if (location) {
        const res = await updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        dispatch(
          setLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          }),
        );
      }
    } catch (error) {
      } finally {
      setIsLocationUpdating(false);
    }
  };

  // Stop location polling

  const connect = async () => {
    await socketService();
  };

  useEffect(() => {
    // Initialize everything when component mounts
    updateUserLocation();

    if (!socket?.connected) {
      connect();
    }

    // Clean up when component unmounts
    return () => {
      socketDisconnect();
      // stopLocationPolling();
    };
  }, []);

  // for notification
  useEffect(() => {
    let lastNotificationId: any = null;
    const handleNotification = async (res: any) => {
      const notificationId = res?.messageId;
      if (notificationId && notificationId !== lastNotificationId) {
        lastNotificationId = notificationId;
        if (res && res !== undefined && res !== null) {
          onMessageReceived(res?.notification);
        }
      }
    };
    const unsubscribeMessage = messaging().onMessage(handleNotification);
    return () => {
      unsubscribeMessage();
    };
  }, []);

  useEffect(() => {
    notifee.onBackgroundEvent(async ({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          break;
        case EventType.PRESS:
          break;
      }
    });
    return notifee.onForegroundEvent(async ({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          break;
        case EventType.PRESS:
          break;
      }
    });
  }, []);

  async function fetchProfile() {
    const res = await _makeAxiosGetRequest(endpoint.user.profile, {});
    if (res) {
      dispatch(setUserProfile(res));
    }
  }

  useEffect(() => {
    if (!socket?.connect) {
      socket?.connect();
    } else {
      socketListen('new_notification', (data: any) => {
        showAlert(data.title, data.content);

        fetchProfile();
      });
      socketListen('newMessage', (data: any) => {
        // show dot on chat icon to indicate new message
        dispatch(setHasNewMessage(true));
      });
    }

    return () => {
      // socket?.off('new_notification');
    };
  }, [socket?.connected]);

  return (
    <>
      <MainStacks.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <MainStacks.Screen name="BottomTab" component={BottomTabNavigator} />
        <MainStacks.Screen name="ChatListScreen" component={ChatListScreen} />
        <MainStacks.Screen name="ChatScreen" component={ChatScreen} />
        <MainStacks.Screen name="ImagePreview" component={ImagePreview} />
        <MainStacks.Screen name="PostScreen" component={PostScreen} />
        <MainStacks.Screen name="EventScreen" component={EventScreen} />
        <MainStacks.Screen
          name="LeaderBoardScreen"
          component={LeaderBordScreen}
        />
  <MainStacks.Screen name="ProfileScreen" component={ProfileScreen as any} />
        <MainStacks.Screen
          name="FollowerersFollowingScreen"
          component={FollowerersFollowingScreen}
        />
        <MainStacks.Screen name="SearchScreen" component={SearchScreen} />
        <MainStacks.Screen name="MySaving" component={MySaving} />
        <MainStacks.Screen name="EditProfile" component={EditProfile} />
        <MainStacks.Screen name="SettingScreen" component={SettingScreen} />
        {/* <MainStacks.Screen name="AddPostScreen" component={AddPostScreen} /> */}
  <MainStacks.Screen name="PostListScreen" component={PostListScreen as any} />
        <MainStacks.Screen name="ArchivePostList" component={ArchivePostList} />
        <MainStacks.Screen
          name="RequestListScreen"
          component={RequestListScreen}
        />
        <MainStacks.Screen name="AddPostScreen" component={AddPostScreen} />
        <MainStacks.Screen name="EditPost" component={EditPost} />
        <MainStacks.Screen
          name="UploadPostScreen"
          component={UploadPostScreen}
        />
        {/* <MainStacks.Screen name="AddReelsScreen" component={AddReelsScreen} /> */}
        <MainStacks.Screen name="MyCoinsScreen" component={MyCoinsScreen} />

        {/* My Coins */}
        <MainStacks.Screen name="AdsPlayScreen" component={AdsPlayScreen} />
        <MainStacks.Screen name="RefferScreen" component={RefferScreen} />
        <MainStacks.Screen name="ShareCoinScreen" component={ShareCoinScreen} />
        <MainStacks.Screen
          name="DailyBounsScreen"
          component={DailyBounsScreen}
        />
  <MainStacks.Screen name="Home" component={HomeScreen as any} />
        <MainStacks.Screen
          name="BlockUserListScreen"
          component={BlockUserListScreen}
        />
        <MainStacks.Screen name="MyShortsFeed" component={MyShortsFeed} />
  <MainStacks.Screen name="ShortsScreen" component={ShortsFeed as any} />
        <MainStacks.Screen
          name="ChangePasswordUsingOld"
          component={ChangePasswordUsingOld}
        />
      </MainStacks.Navigator>
      <Alert
        visible={alert.visible}
        title={alert.title}
        content={alert.content}
        onHide={hideAlert}
      />
    </>
  );
};

export default MainStackNavigator;
