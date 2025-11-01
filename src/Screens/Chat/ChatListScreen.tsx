import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {wp} from '../../Utils/responsive';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {useTheme} from '../../Theme/ThemeContext';
import ChatListCard, {
  ChatListCardLoader,
} from '../../Components/Chat/ChatListCard';
import {useGetUserConversationsQuery} from '../../redux/api/chat';
import {socket, socketEmit, socketListen} from '../../Service/socketio';
import {socketEvents} from '../../Constants/socket';
import {useDispatch} from 'react-redux';
import {setOnlineUsers} from '../../redux/Store/ChatSlice';
import {useFocusEffect} from '@react-navigation/native';
import {CONVERSATION_DATA_LIMIT} from '../../Constants';
import {IMAGES} from '../../Assets';
import NoDataComponent from '../../Components/Common/NoDataComponent';
import {chatlistScreenStyles} from './style';
import {setHasNewMessage} from '../../redux/Store/AuthSlice';

export default function ChatListScreen({navigation}: any) {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const styles = chatlistScreenStyles(colors);
  const [cursor, setCursor] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showShimmer, setShowShimmer] = useState(true);
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Enhanced loading states for bidirectional scrolling
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<
    Array<IConversation>
  >([]);

  // FlatList ref for scroll control
  const flatListRef = useRef<FlatList>(null);

  const {
    data: conversationsData,
    isLoading: loading,
    refetch,
  } = useGetUserConversationsQuery({
    searchText: debouncedSearchText,
    cursor: cursor,
    limit: CONVERSATION_DATA_LIMIT,
  });

  useEffect(() => {
    if (loading) return;

    setShowShimmer(false);
    const newData = conversationsData?.data || [];

    // If cursor is empty, treat it as a fresh fetch/search
    const isFreshFetch = cursor === '';

    setFilteredConversations(prev => {
      if (isFreshFetch) {
        return newData;
      }

      // For pagination, add only unique conversations
      const existingIds = new Set(prev.map(item => item.conversationId));
      const uniqueNewData = newData.filter(
        (item: IConversation) => !existingIds.has(item.conversationId),
      );
      return [...prev, ...uniqueNewData];
    });

    setLoadingMore(false);
    setRefreshing(false); // Stop refreshing when data is loaded
  }, [conversationsData, loading]);

  useEffect(() => {
    socketEmit(socketEvents.getOnlineUsers);

    if (!socket) {
      return;
    }

    if (!socket?.connected) {
      socket.connect();
      return;
    }

    if (socket?.connected) {
      socketListen(socketEvents.onlineUsers, (data: Array<string>) => {
        dispatch(setOnlineUsers(data));
      });
      socketListen(socketEvents.refetchConversation, () => {
        refetch();
      });

      return () => {
        socket?.off(socketEvents.onlineUsers);
      };
    } else {
      }
  }, [socket?.connected]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setCursor('');
      setDebouncedSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // Re-fetch when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
      dispatch(setHasNewMessage(false));
    }, [refetch]),
  );

  const handleConversationPress = useCallback(
    (friend: IUser, conversationId: string) => {
      navigation.navigate('ChatScreen', {
        friendId: friend._id,
        friendUsername: friend.username,
        conversationId,
      });
    },
    [navigation],
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setCursor(''); // Reset cursor to fetch from beginning
    refetch();
  }, [refetch]);

  // Memoized empty list component
  const renderEmptyList = useMemo(
    () => (
      <NoDataComponent
        title={searchText ? 'No conversations found' : 'No conversations yet!'}
        subtitle={
          searchText
            ? 'No conversation found with this username'
            : 'Start your first conversation'
        }
      />
    ),
    [searchText],
  );

  // Footer component for loading more data
  const renderListFooter = useMemo(
    () =>
      loadingMore ? (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size={30} color={colors.primaryColor} />
          <Text style={styles.loadingText}>Loading more conversations...</Text>
        </View>
      ) : null,
    [loadingMore, colors.primaryColor, styles],
  );

  // Load more conversations (scroll down)
  const loadMore = useCallback(() => {
    if (!conversationsData?.nextCursor) {
      return;
    }

    if (conversationsData?.nextCursor) {
      setLoadingMore(true);
      setCursor(conversationsData?.nextCursor);
    }
  }, [loadingMore, conversationsData?.nextCursor]);

  return (
    <View style={[styles.container]}>
      <View style={styles.headerGradient}>
        <Animated.View style={[styles.headerContent]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              navigation.navigate('BottomTab', {
                screen: 'Home',
              })
            }
            activeOpacity={0.7}>
            <Animated.Image
              source={IMAGES.BackArrow}
              style={[styles.backArrow, {tintColor: colors.white}]}
            />
          </TouchableOpacity>
          <View style={styles.searchInputWrapper}>
            <Animated.View style={[styles.searchIconContainer]}>
              <SearchSVG fill={colors.primaryColor} width={22} height={22} />
            </Animated.View>
            <TextInput
              style={styles.searchInputStyle}
              placeholder="Search username"
              placeholderTextColor={colors.grey}
              value={searchText}
              onChangeText={value => {
                setSearchText(value);
                setShowShimmer(true);
              }}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        </Animated.View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.chatHeaderContainer}>
          <Text style={styles.chatHeaderText}>Chats</Text>
        </View>

        {showShimmer || loading ? (
          <FlatList
            style={{flex: 1}}
            contentContainerStyle={{
              paddingHorizontal: wp('3%'),
            }}
            data={Array.from({length: 5})}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => <ChatListCardLoader />}
          />
        ) : (
          <FlatList
            ref={flatListRef}
            style={{flex: 1}}
            contentContainerStyle={{
              paddingHorizontal: wp('3%'),
              flexGrow: 1,
            }}
            data={filteredConversations}
            renderItem={({item}) => (
              <ChatListCard
                key={item.conversationId}
                item={item}
                onPress={() => {
                  handleConversationPress(
                    item?.participant,
                    item.conversationId,
                  );
                }}
                refetchChatList={refetch}
              />
            )}
            keyExtractor={item => item.conversationId}
            scrollEventThrottle={16}
            refreshing={refreshing}
            onRefresh={handleRefresh} // Add this prop for pull-to-refresh
            ListEmptyComponent={renderEmptyList}
            ListFooterComponent={renderListFooter}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 100,
            }}
            onEndReached={loadMore}
          />
        )}
      </View>
    </View>
  );
}
