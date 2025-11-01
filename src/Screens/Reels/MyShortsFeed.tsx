import React, {useMemo, useState, useRef, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  AppState,
  StatusBar,
  BackHandler,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native'; // Add this import
import {getVideoHeight, height, hp, width, wp} from '../../Utils/responsive';
import {ColorThemeInterface} from '../../Utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import ShortRealComponent, {ReelItem, ReelSkeleton} from './ShortRealComponent';
import {
  useArchivePostMutation,
  useDeletePostMutation,
  useGetFeedQuery,
} from '../../redux/api/post';
import {RefreshControl, Text} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import CommentSheet from '../../Components/BottomSheet/CommentSheet';
import {NavigationProp} from '@react-navigation/native';
import {useGetUserPostsQuery} from '../../redux/api/profile';
import ActionSheet from '../../Components/BottomSheet/ActionSheet';
import {ArchiveSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {DeleteSVG} from '../../Assets/Images/SVGs/PostSVG';
import {showToast} from '../../Utils/general';
import SendPost from '../../Components/Chat/SendPost';

interface FeedItem {
  _id: string;
  [key: string]: any;
}

interface Props {
  navigation: NavigationProp<any>;
  route: any;
}

const MyShortsFeed = ({navigation, route}: Props) => {
  const {short, user} = route.params ?? {
    short: '',
    user: {
      _id: '',
      username: '',
      firstName: '',
      lastName: '',
      profilePicture: '',
    },
  };

  const {colors} = useTheme();
  const styles = useMemo(() => createStyle(colors), [colors]);

  // State management
  const [allFeedsData, setAllFeedsData] = useState<FeedItem[]>([short]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [visibleIndex, setVisibleIndex] = useState<number>(0);
  const [isScreenFocused, setIsScreenFocused] = useState<boolean>(true); // Add this state
  const [currentSheetName, setCurrentSheetName] = useState<
    'share' | 'comment' | '' | 'action'
  >('');

  // Add refs for post details
  const postDetailsRef = useRef<{caption: string; imageUrl: string}>({
    caption: '',
    imageUrl: '',
  });
  const postIdRef = useRef<string>('');

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const commentSheetRef = useRef<any>(null);
  const currentPageRef = useRef<number>(1);
  const isLoadingMoreRef = useRef<boolean>(false);

  const {profile} = useSelector((state: RootState) => state.AuthManager);

  const [archivePost, {isLoading: archiveLoading}] = useArchivePostMutation();
  const [deletePost, {isLoading: deleteLoading}] = useDeletePostMutation();

  const {data, isLoading, error, refetch, isFetching} = useGetUserPostsQuery({
    page,
    userId: user?._id,
    type: 'reel',
  });





  function convertToReelItem(
    raw: any,
    currentUserId: string,
    user: any,
  ): ReelItem {
    return {
      _id: raw._id,
      userId: raw.userId,
      user: {
        username: user.username, // Replace `with actual user data
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture, // Replace with actual user profile picture URL
      },
      videoUrl: raw.videoUrl,
      imageUrl: raw.imageUrl,
      type: 'reel',
      privacy: 'private', // Set statically, or map from raw.privacy if needed
      isArchived: raw.isArchived,
      isLiked: raw.isLiked,
      likeCount: raw.likes?.length || 0,
      likes: raw.likes,
      comments: raw.comments,
      tags: raw.tags,
      createdAt: raw.createdAt,
      caption: raw.caption,
    };
  }

  // API call with optimized parameters
  //   const {data, isLoading, error, refetch, isFetching} = useGetFeedQuery(
  //     {
  //       page: page,
  //       type: 'reel',
  //       limit: 5, // Increased limit to reduce API calls
  //     },
  //     {
  //       // RTK Query optimizations
  //       refetchOnMountOrArgTime: 30, // Cache for 30 seconds
  //       refetchOnFocus: false,
  //       refetchOnReconnect: true,
  //     },
  //   );

  //   // Handle screen focus/blur events
  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      setIsScreenFocused(true);
      setIsPaused(false); // Resume video when screen comes into focus

      return () => {
        // Screen is unfocused (cleanup function)
        setIsScreenFocused(false);
        setIsPaused(true); // Pause video when leaving screen
      };
    }, []),
  );

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        setIsPaused(true);
      } else if (nextAppState === 'active' && isScreenFocused) {
        setIsPaused(false);
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription?.remove();
    };
  }, [isScreenFocused]);

  const onBackPress = () => {
    navigation.goBack();
    return true;
  };

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  // Memoized values
  const containerHeight = useMemo(() => getVideoHeight(), []);

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 60, // Increased threshold for better accuracy
      minimumViewTime: 150, // Add minimum view time
      waitForInteraction: false,
    }),
    [],
  );

  const currentPostId = useMemo(
    () => allFeedsData[visibleIndex]?._id || '',
    [allFeedsData, visibleIndex],
  );

  const handleArchivePost = useCallback(() => {
    archivePost({id: currentPostId})
      .unwrap()
      .then(() => {
        refresh();
        showToast('Post archived successfully');
        setCurrentSheetName('');
      })
      .catch((error: any) => {
        showToast('Failed to archive post');
      });
  }, [currentPostId]);

  const handleDeletePost = useCallback(() => {
    deletePost({id: currentPostId})
      .unwrap()
      .then(() => {
        refresh();
        showToast('Post deleted successfully');
      })
      .catch((error: any) => {
        showToast('Failed to delete post');
      });
  }, [currentPostId]);

  const actionSheetData = useMemo(() => {
    return [
      {
        id: '1',
        label: 'Archive',
        icon: <ArchiveSVG height={24} width={24} fill={colors.primaryColor} />,
        onPress: () => {
          handleArchivePost();
        },
      },
      {
        id: '2',
        label: 'Delete',
        icon: <DeleteSVG height={24} width={24} fill={colors.primaryColor} />,
        onPress: () => {
          handleDeletePost();
        },
      },
    ];
  }, []);

  // Update feeds data when API data changes
  useEffect(() => {
    if (data?.items) {
      setAllFeedsData(prevData => {
        const existingIds = new Set(prevData.map(item => item._id));
        const newPosts = data.items.filter(
          (post: any) => !existingIds.has(post._id),
        );
        if (page === 1) {
          return [short, ...newPosts];
        } else {
          // Prevent duplicates

          return [...prevData, ...newPosts];
        }
      });

      setLoadingMore(false);
      setRefreshing(false);
      isLoadingMoreRef.current = false;
    }
  }, [data, page]);

  // Optimized viewable items handler
  const onViewableItemsChanged = useCallback(
    ({viewableItems}: any) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== null && newIndex !== visibleIndex) {
          setVisibleIndex(newIndex);
        }
      }
    },
    [visibleIndex],
  );

  // Optimized load more handler
  const handleLoadMore = useCallback(() => {
    if (
      !isLoadingMoreRef.current &&
      !isFetching &&
      data?.totalPages &&
      currentPageRef.current < data.totalPages
    ) {
      isLoadingMoreRef.current = true;
      setLoadingMore(true);
      const nextPage = currentPageRef.current + 1;
      currentPageRef.current = nextPage;
      setPage(nextPage);
    }
  }, [data?.totalPages, isFetching]);

  // Optimized refresh handler
  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      currentPageRef.current = 1;
      setPage(1);
      isLoadingMoreRef.current = false;

      await refetch().unwrap();
    } catch (error) {
      } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Add handleSheetOpenChange function
  const handleSheetOpenChange = useCallback((isOpen: boolean, type: string) => {
    setCurrentSheetName(isOpen ? (type as any) : '');
  }, []);

  // Optimized render item - pass screen focus state
  const renderItem = useCallback(
    ({item, index}: {item: FeedItem; index: number}) => {
      const reelItem = convertToReelItem(item, profile?._id, user);
      return (
        <ShortRealComponent
          showMoreIcon={profile._id === item.userId}
          item={reelItem}
          onBackPress={onBackPress}
          onMorePress={() => {
            setCurrentSheetName('action');
          }}
          index={index}
          onSharePress={() => {
            setCurrentSheetName('share');
            postDetailsRef.current = {
              caption: item.caption,
              imageUrl: item.imageUrl,
            };
            postIdRef.current = item._id;
          }}
          isFocused={index === visibleIndex}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isPaused={isPaused || !isScreenFocused} // Pause if screen is not focused
          setIsPaused={setIsPaused}
          onPressComment={() => {
            setCurrentSheetName('comment');

            commentSheetRef.current?.open(currentPostId);
          }}
          height={containerHeight}
        />
      );
    },
    [visibleIndex, isMuted, isPaused, isScreenFocused, currentPostId],
  );

  // Optimized key extractor
  const keyExtractor = useCallback((item: FeedItem) => item._id, []);

  // Memoized refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={refresh}
        tintColor={colors.primaryColor}
        progressBackgroundColor={colors.backgroundColor}
        colors={[colors.primaryColor]}
      />
    ),
    [refreshing, refresh, colors.primaryColor, colors.backgroundColor],
  );

  // Memoized footer component
  const ListFooterComponent = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator color={colors.primaryColor} size="large" />
        </View>
      );
    }
    return null;
  }, [loadingMore, colors.primaryColor, styles.footerLoader]);

  // Memoized empty component
  const ListEmptyComponent = useMemo(() => {
    if (isLoading) return null;

    return <ReelSkeleton onBackPress={onBackPress} />;
  }, [isLoading, refresh, styles]);

  // Handle comment sheet close
  const handleCommentSheetClose = useCallback(() => {
    setCurrentSheetName('');
  }, []);

  // Get item layout for better performance
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: containerHeight,
      offset: containerHeight * index,
      index,
    }),
    [containerHeight],
  );

  if (isLoading && allFeedsData.length === 0) {
    return (
      <View style={styles.container}>
        <ReelSkeleton onBackPress={onBackPress} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <FlatList
        ref={flatListRef}
        data={allFeedsData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        // Performance optimizations
        pagingEnabled={true}
        snapToInterval={containerHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5} // Reduced window size for memory efficiency
        initialNumToRender={2}
        getItemLayout={getItemLayout}
        // Viewability
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        // Loading and refresh
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3} // Reduced threshold for better UX
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={refreshControl}
        // Additional optimizations
        bounces={false}
        scrollEventThrottle={16}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 1,
        }}
      />

      {currentSheetName === 'comment' && (
        <CommentSheet
          commentSheetRef={commentSheetRef}
          postId={currentPostId}
          setIsCommentSheetOpen={(value: boolean) =>
            handleSheetOpenChange(value, 'comment')
          }
          profile={profile}
        />
      )}

      {currentSheetName === 'share' && (
        <SendPost
          postId={postIdRef.current || currentPostId}
          postCaption={postDetailsRef.current.caption}
          postImage={postDetailsRef.current.imageUrl}
          type="reel"
          isOpen={currentSheetName === 'share'}
          setIsOpen={(value: boolean) => handleSheetOpenChange(value, 'share')}
        />
      )}

      {currentSheetName === 'action' && (
        <ActionSheet
          data={actionSheetData}
          isVisible={currentSheetName === 'action'}
          onClose={() => setCurrentSheetName('')}
        />
      )}
    </View>
  );
};

export default React.memo(MyShortsFeed);

const createStyle = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      height: getVideoHeight(),
      flex: 1,
      backgroundColor: colors.backgroundColor,
      overflow: 'hidden',
    },
    footerLoader: {
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      minHeight: getVideoHeight(),
    },
    retryButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: colors.primaryColor,
      borderRadius: 8,
    },
    retryText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
