import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigate, navigateBack} from '../../Utils/navigation';
import {SearchInput} from '../../Components';
import {UserCard, UserCardLoader} from '../../Components/UserCard';
import {
  useCancelFriendRequestMutation,
  useGetFriendListQuery,
  useRemoveFriendMutation,
  useSendFriendRequestMutation,
} from '../../redux/api/profile';
import { User } from '../../redux/api/profile';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import DataNotFound from '../../Components/Layout/DataNotFound';

// Using User type from api/profile which includes optional 'status'

const ListEmptyComponent = () => {
  const {colors} = useTheme();
  const style = makeStyles(colors);

  return (
    <View style={style.emptyContainer}>
      <Text style={style.emptyText}>No friends found</Text>
    </View>
  );
};

const ItemSeparator = () => {
  const {colors} = useTheme();
  return <View style={{height: 1, backgroundColor: colors.lightGrey}} />;
};

export default function FollowersFollowingScreen({route}: any) {
  const {colors} = useTheme();
  const style = makeStyles(colors);
  const {userId, username} = route.params;

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const flatListRef = useRef<FlatList<User>>(null);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  // RTK Query hooks
  const {
    data: friendsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFriendListQuery({
    userId,
    page: currentPage,
    search: searchQuery,
  });

  const [removeFriend, {isLoading: isRemoving}] = useRemoveFriendMutation();
  const [sendFriendRequest, {isLoading: isSending}] =
    useSendFriendRequestMutation();

  const [cancelFriendRequest, {isLoading: isCancelling}] =
    useCancelFriendRequestMutation();

  // Update friends list when data changes
  useEffect(() => {
    if (friendsData?.friends) {
      if (currentPage === 1) {
        setFriends(friendsData.friends);
      } else {
        setFriends(prev => [...prev, ...friendsData.friends]);
      }
      setLoadingMore(false);
    }
  }, [friendsData]);

  useEffect(() => {
    // Set a timer for debouncing
    const debounceTimer = setTimeout(() => {
      handleSearch(tempSearch);
    }, 500); // 500ms delay

    // Cleanup function to clear the timer if component unmounts or searchText changes
    return () => clearTimeout(debounceTimer);
  }, [tempSearch]);

  // Handle search with debounce
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
    setTempSearch(text);
    // Reset to top when searching
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
  }, []);

  // Load more function for pagination
  const loadMore = useCallback(() => {
    if (
      !isLoading &&
      !loadingMore &&
      friendsData &&
      currentPage < friendsData.totalPages
    ) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [isLoading, loadingMore, friendsData, currentPage]);

  // Handle friend action (add/remove)
  const handleFriendAction = useCallback(
    async (item: User) => {
      try {
        if (item.status === 'accepted') {
          await removeFriend({userId: item._id}).unwrap();
          setFriends(prev =>
            prev.map(friend =>
              friend._id === item._id ? {...friend, status: 'none'} : friend,
            ),
          );
        } else if (item.status === 'pending') {
          await cancelFriendRequest({receiverId: item._id}).unwrap();
          setFriends(prev =>
            prev.map(friend =>
              friend._id === item._id ? {...friend, status: 'none'} : friend,
            ),
          );
        } else if (item.status === 'none') {
          await sendFriendRequest({username: item.username});
          setFriends(prev =>
            prev.map(friend =>
              friend._id === item._id ? {...friend, status: 'pending'} : friend,
            ),
          );
        }
        // Refresh the list after the action
        // refetch();
      } catch (error) {
        }
    },
    [removeFriend, sendFriendRequest, refetch],
  );

  // Render user item
  const renderUserItem = useCallback(
    ({item}: {item: User}) => {
      const buttonTitle =
        item.status === 'accepted'
          ? 'Unflama'
          : item.status === 'pending'
          ? 'Cancel'
          : 'Flama';

      return (
        <UserCard
          userId={item._id}
          fullName={`${item.firstName} ${item.lastName}`}
          username={item.username}
          avatar={item.profilePicture}
          onFollowToggle={() => handleFriendAction(item)}
          showBT={profile._id !== item._id}
          friendShipStatus={
            item.status === 'pending_sent' || item.status === 'pending_received'
              ? 'pending'
              : (item.status as 'none' | 'accepted' | 'pending' | undefined)
          }
          buttonTitle={buttonTitle}
          onPress={() =>
            navigate('ProfileScreen', {
              userId: item._id,
              username: item.username,
            })
          }
        />
      );
    },
    [handleFriendAction],
  );

  const keyExtractor = useCallback((item: User) => item._id, []);

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  return (
    <View style={style.container}>
      <CustomHeader title={username} onBackPress={navigateBack} />

      <SearchInput
        placeholder="Search"
        containerStyle={style.searchInput}
        value={tempSearch}
        onChangeText={text => setTempSearch(text)}
      />
      {/* isLoading && friends.length === 0 */}
      {isLoading && friends.length === 0 ? (
        <ScrollView contentContainerStyle={style.listContent}>
          {Array.from({length: 10}).map((_, index) => (
            <UserCardLoader key={index} showBT />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={friends}
          renderItem={renderUserItem}
          keyExtractor={keyExtractor}
          // ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={style.listContent}
          ListEmptyComponent={
            isLoading ? null : (
              <DataNotFound
                title="No friends found"
                OnRefresh={handleRefresh}
              />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching && currentPage === 1 && !loadingMore}
              onRefresh={handleRefresh}
              colors={[colors.primaryColor]}
              tintColor={colors.primaryColor}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={style.footerLoader}>
                <ActivityIndicator size="small" color={colors.primaryColor} />
              </View>
            ) : null
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
      fontSize: 16,
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
