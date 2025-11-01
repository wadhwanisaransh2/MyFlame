import React, {useCallback, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, RefreshControl} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import {
  useGetAllNotificationsQuery,
  useMarkNotificationsReadMutation,
} from '../../redux/api/profile';
import {RootState} from '../../redux/Store';
import {useDispatch, useSelector} from 'react-redux';
import {
  NotificationCard,
  NotificationCardLoader,
} from '../../Components/Notifications/NotificationCard';
import {INotification} from '../../Interfaces/notification';
import {_makeAxiosGetRequest} from '../../Service';
import {endpoint} from '../../Constants/endpoints';
import {setUserProfile} from '../../redux/Store/AuthSlice';
import {useFocusEffect} from '@react-navigation/native';
import {wp} from '../../Utils/responsive';

const ItemSeparator = () => {
  const {colors} = useTheme();
  return <View style={{height: 1, backgroundColor: colors.lightGrey}} />;
};

export default function RequestListScreen({route}: any) {
  const dispatch = useDispatch();
  const {colors} = useTheme();
  const style = makeStyles(colors);
  const flatListRef = useRef<FlatList<INotification> | null>(null);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const {data, isLoading, isFetching, refetch} = useGetAllNotificationsQuery({
    page: 1,
  });
  const [markNotificationsRead] = useMarkNotificationsReadMutation();
  async function fetchProfile() {
    const res = await _makeAxiosGetRequest(endpoint.user.profile, {});
    if (res) {
      dispatch(setUserProfile(res));
    }
  }

  const markUserNotificationsRead = async () => {
    await markNotificationsRead({});
    fetchProfile();
  };

  useEffect(() => {
    if (profile?.notificationCount > 0) {
      // mark notification as read
      markUserNotificationsRead();
    }
  }, [profile]);

  // Render item
  const renderNotificationItem = useCallback(
    ({item}: {item: INotification}) => {
      return <NotificationCard notificationItem={item} refetchData={refetch} />;
    },
    [],
  );

  const keyExtractor = useCallback((item: INotification) => item._id, []);

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      // Refetch notifications when the screen is focused
      refetch();

      return () => {
        // Cleanup if needed when the screen loses focus
      };
    }, [refetch]),
  );

  return (
    <View style={style.container}>
      <CustomHeader title={'Notifications'} onBackPress={navigateBack} />

      {isLoading ? (
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: wp('3%'),
          }}
          data={Array.from({length: 12})}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => <NotificationCardLoader />}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={data?.data || []}
          renderItem={renderNotificationItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={style.listContent}
          ListEmptyComponent={
            isLoading ? null : (
              <View style={style.emptyContainer}>
                <Text style={style.emptyText}>No Notifications Available</Text>
              </View>
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              colors={[colors.primaryColor]}
              tintColor={colors.primaryColor}
            />
          }
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    searchInput: {
      marginHorizontal: 16,
      marginVertical: 12,
    },
    listContent: {
      paddingHorizontal: 16,
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 32,
      height: 200,
    },
    emptyText: {
      fontSize: 20,
      color: colors.lightText,
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
    },
    fullScreenLoader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
