import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  InteractionManager,
  AppState,
  StatusBar,
  BackHandler,
  Platform,
  Dimensions,
  Text,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {getVideoHeight, hp} from '../../Utils/responsive';
import {ColorThemeInterface} from '../../Utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import ShortRealComponent, {ReelSkeleton} from './ShortRealComponent';
import {useGetFeedQuery} from '../../redux/api/post';
import {RefreshControl} from 'react-native-gesture-handler';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import CommentSheet from '../../Components/BottomSheet/CommentSheet';
import ActionSheet from '../../Components/BottomSheet/ActionSheet';
import {BlockUser} from '../../Assets/Images/SVGs/PostSVG';
import {ReportSVG} from '../../Assets/Images/SVGs/SettingsSVG';
import {useBlockUserMutation} from '../../redux/api/profile';
import {showToast} from '../../Utils/general';
import ReportModal from '../../Components/Modals/ReportModal';
import {ReportType} from '../../Enum/enum';
import SendPost from '../../Components/Chat/SendPost';
import VideoItem from '../../Components/reel/VideoItem';
import DataNotFound from '../../Components/Layout/DataNotFound';
import {ReelsSVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import { t } from 'i18next';

interface FeedItem {
  _id: string;
  userId: string;
  caption: string;
  imageUrl: string;
  videoUrl: string;
  [key: string]: any;
}

interface ShortsFeedProps {
  onBackPress: () => void;
}

interface ShortsFeedRef {
  pause: () => void;
  resume: () => void;
}

// Optimized constants
const FEED_LIMIT = 3; // Reduced for better performance
const REFRESH_THRESHOLD = 30; // seconds
const END_REACHED_THRESHOLD = 0.3; // Reduced for better UX
const INITIAL_NUM_TO_RENDER = 3;
const MAX_TO_RENDER_PER_BATCH = 2;
const WINDOW_SIZE = 2;

const ShortsFeed = forwardRef<ShortsFeedRef, ShortsFeedProps>(
  ({onBackPress}, ref) => {
    const {colors} = useTheme();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    // Calculate video height with insets at component level
    const videoHeight = useMemo(() => {
      return getVideoHeight(true) ;
    }, [insets]);

    const styles = useMemo(
      () => createStyle(colors, videoHeight),
      [colors, videoHeight],
    );

    // Optimized state management - combined related states
    const [feedState, setFeedState] = useState<{
      allFeedsData: FeedItem[];
      visibleIndex: number;
      loadingMore: boolean;
      refreshing: boolean;
      isScreenFocused: boolean;
    }>({
      allFeedsData: [],
      visibleIndex: 0,
      loadingMore: false,
      refreshing: false,
      isScreenFocused: true,
    });

    const [videoControls, setVideoControls] = useState<{
      isMuted: boolean;
      isPaused: boolean;
    }>({
      isMuted: false,
      isPaused: true,
    });

    const [cursorAndRefresh, setCursorAndRefresh] = useState<{
      cursor: string;
      refresh: boolean;
    }>({cursor: '', refresh: false});

    const [currentSheetName, setCurrentSheetName] = useState<
      'share' | 'comment' | '' | 'action' | 'report'
    >('');

    // Optimized refs
    const postDetailsRef = useRef<{caption: string; imageUrl: string}>({
      caption: '',
      imageUrl: '',
    });
    const flatListRef = useRef<FlatList>(null);
    const commentSheetRef = useRef<any>(null);
    const isLoadingMoreRef = useRef<boolean>(false);
    const postIdRef = useRef<string>('');
    const blockUserIdRef = useRef<string>('');
    const isComponentMountedRef = useRef<boolean>(true);

    const {profile} = useSelector((state: RootState) => state.AuthManager);
    const [blockUser] = useBlockUserMutation();

    // Optimized API call
    const {data, isLoading, error, refetch, isFetching} = useGetFeedQuery(
      {
        cursor: cursorAndRefresh.cursor,
        type: 'reel',
        limit: FEED_LIMIT,
        refresh: cursorAndRefresh.refresh,
      },
      {
        refetchOnMountOrArgChange: REFRESH_THRESHOLD,
        refetchOnFocus: false,
        refetchOnReconnect: true,
        skip: !feedState.isScreenFocused && !cursorAndRefresh.refresh,
      },
    );

    // // Imperative handle for parent component
    useImperativeHandle(ref, () => ({
      pause: () => {
        setVideoControls(prev => ({...prev, isPaused: true}));
      },
      resume: () => {
        setVideoControls(prev => ({...prev, isPaused: false}));
      },
    }));

    // Optimized cleanup
    const cleanup = useCallback(() => {
      isComponentMountedRef.current = false;
      setVideoControls(prev => ({...prev, isPaused: true}));
    }, []);

    // Component lifecycle
    useEffect(() => {
      isComponentMountedRef.current = true;
      return cleanup;
    }, [cleanup]);

    // Focus management
    useFocusEffect(
      useCallback(() => {
        setFeedState(prev => ({...prev, isScreenFocused: true}));

        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            handleBackPress();
            return true;
          },
        );

        return () => {
          backHandler.remove();
          setFeedState(prev => ({...prev, isScreenFocused: false}));
          setVideoControls(prev => ({...prev, isPaused: true}));
        };
      }, []),
    );

    // Optimized back press handler
    const handleBackPress = useCallback(() => {
      setVideoControls(prev => ({...prev, isPaused: true}));
      onBackPress();
    }, [onBackPress]);

    // Memoized current post ID
    const currentPostId = useMemo(
      () => feedState.allFeedsData[feedState.visibleIndex]?._id || '',
      [feedState.allFeedsData, feedState.visibleIndex],
    );
    

    // Update feeds data when API data changes
    useEffect(() => {
      if (data?.posts && isComponentMountedRef.current) {
        setFeedState(prev => ({
          ...prev,
          allFeedsData:
            cursorAndRefresh.cursor?.length === 0
              ? data.posts
              : [...prev.allFeedsData, ...data.posts],
          loadingMore: false,
          refreshing: false,
        }));
        isLoadingMoreRef.current = false;
      }
    }, [data, cursorAndRefresh.cursor]);

    // // Optimized viewable items handler with throttling
    const onViewableItemsChanged = useCallback(
      ({viewableItems}: {viewableItems: any}) => {
        if (viewableItems.length > 0 && isComponentMountedRef.current) {
          const newIndex = viewableItems[0].index;
          if (newIndex !== null && newIndex !== feedState.visibleIndex) {
            setFeedState(prev => ({...prev, visibleIndex: newIndex}));
          }
        }
      },
      [feedState.visibleIndex],
    );

    // Optimized load more handler
    const handleLoadMore = useCallback(() => {
      if (
        !isLoadingMoreRef.current &&
        !isFetching &&
        data?.nextCursor &&
        data.nextCursor.length > 0 &&
        data.hasMore &&
        isComponentMountedRef.current
      ) {
        isLoadingMoreRef.current = true;
        setFeedState(prev => ({...prev, loadingMore: true}));
        setCursorAndRefresh({cursor: data.nextCursor, refresh: false});
      }
    }, [data?.nextCursor, data?.hasMore, isFetching]);

    // Optimized refresh handler
    const refresh = useCallback(async () => {
      if (!isComponentMountedRef.current) return;

      try {
        setFeedState(prev => ({...prev, refreshing: true}));
        setCursorAndRefresh({cursor: '', refresh: true});
        isLoadingMoreRef.current = false;
        await refetch().unwrap();
      } catch (error) {
        } finally {
        if (isComponentMountedRef.current) {
          setFeedState(prev => ({...prev, refreshing: false}));
        }
      }
    }, [refetch]);

    // Action handlers
    const handleReportPost = useCallback(() => {
      setCurrentSheetName('report');
    }, []);

    const handleUserBlock = useCallback(async () => {
      setCurrentSheetName('');
      try {
        await blockUser({userId: blockUserIdRef.current}).unwrap();
        showToast('User blocked successfully');
        refetch();
      } catch (error) {
        showToast('Failed to block user');
      }
    }, [blockUser, refetch]);

    // Memoized action sheet data
    const actionSheetData = useMemo(
      () => [
        {
          id: '1',
          label: 'Block the user',
          icon: <BlockUser height={24} width={24} fill={colors.primaryColor} />,
          onPress: handleUserBlock,
        },
        {
          id: '2',
          label: 'Report the post',
          icon: <ReportSVG height={24} width={24} fill={colors.primaryColor} />,
          onPress: handleReportPost,
        },
      ],
      [colors.primaryColor, handleUserBlock, handleReportPost],
    );

    // Optimized render item
    const renderItem = useCallback(
      ({item, index}: {item: FeedItem; index: number}) => {
        const isFocused = index === feedState.visibleIndex;
        const isPaused = videoControls.isPaused || !feedState.isScreenFocused;

        return (
          <ShortRealComponent
            onMorePress={() => {
              setCurrentSheetName('action');
              postIdRef.current = item._id;
              blockUserIdRef.current = item.userId;
            }}
            item={item as any}
            onBackPress={handleBackPress}
            index={index}
            isFocused={isFocused}
            isMuted={videoControls.isMuted}
            setIsMuted={(value: boolean) =>
              setVideoControls(prev => ({...prev, isMuted: value}))
            }
            isPaused={isPaused}
            setIsPaused={(value: boolean) =>
              setVideoControls(prev => ({...prev, isPaused: value}))
            }
            onPressComment={() => {
              setCurrentSheetName('comment');
              // InteractionManager.runAfterInteractions(() => {
              // commentSheetRef.current?.open();
              // });
            }}
            onSharePress={() => {
              setCurrentSheetName('share');
              postDetailsRef.current = {
                caption: item.caption,
                imageUrl: item.imageUrl,
              };
              postIdRef.current = item._id;
            }}
            showMoreIcon={profile._id !== item.userId}
            height={videoHeight}
          />

        
        );
      },
      [
        feedState.visibleIndex,
        feedState.isScreenFocused,
        videoControls.isMuted,
        videoControls.isPaused,
        currentPostId,
        handleBackPress,
      ],
    );

    // Optimized key extractor
    const keyExtractor = useCallback((item: FeedItem) => item._id, []);

    // Optimized getItemLayout - use memoized height
    const getItemLayout = useCallback(
      (data: any, index: number) => ({
        length: videoHeight,
        offset: videoHeight * index,
        index,
      }),
      [videoHeight],
    );

    // Memoized viewability config
    const viewabilityConfig = useMemo(
      () => ({
        itemVisiblePercentThreshold: 85,
        minimumViewTime: 200,
        waitForInteraction: false,
      }),
      [],
    );

    // Memoized refresh control
    const refreshControl = useMemo(
      () => (
        <RefreshControl
          refreshing={feedState.refreshing}
          onRefresh={refresh}
          tintColor={colors.primaryColor}
          progressBackgroundColor={colors.backgroundColor}
          colors={[colors.primaryColor]}
        />
      ),
      [
        feedState.refreshing,
        refresh,
        colors.primaryColor,
        colors.backgroundColor,
      ],
    );

    // Memoized footer component
    const ListFooterComponent = useMemo(() => {
      if (feedState.loadingMore) {
        return <ReelSkeleton onBackPress={handleBackPress} />;
      }
      return null;
    }, [feedState.loadingMore, handleBackPress]);

    // Memoized empty component
    const ListEmptyComponent = useMemo(() => {
      if (isLoading) return <ReelSkeleton onBackPress={handleBackPress} />;
      return (
        <DataNotFound
          title="No Clips found"
          subtitle="No clips available"
          iconContainerStyle={{
            marginTop: 100,
          }}
          OnRefresh={() => {
            setCursorAndRefresh({cursor: '', refresh: true});
          }}
          icon={<ReelsSVG height={60} width={60} fill={colors.white} />}
        />
      );
    }, [isLoading, handleBackPress]);

    // Sheet handlers
    const handleCommentSheetClose = useCallback(() => {
      setCurrentSheetName('');
    }, []);

    const handleSheetOpenChange = useCallback(
      (isOpen: boolean, type: string) => {
        setCurrentSheetName(isOpen ? (type as any) : '');
      },
      [],
    );

    // Loading state
    if (isLoading && feedState.allFeedsData.length === 0) {
      return (
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent
          />
          <ReelSkeleton onBackPress={handleBackPress} />
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
          data={feedState.allFeedsData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          pagingEnabled={true}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          snapToAlignment="start"
          decelerationRate="fast"
          scrollEventThrottle={16}
          disableIntervalMomentum={true}
          getItemLayout={getItemLayout}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={END_REACHED_THRESHOLD}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={refreshControl}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={2}
          removeClippedSubviews={Platform.OS === 'android'}
          updateCellsBatchingPeriod={100}
          legacyImplementation={false}
        />

        {/* <FlatList
          ref={flatListRef}
          data={feedState.allFeedsData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onEndReached={handleLoadMore}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={refreshControl}
          windowSize={2}
          pagingEnabled
          viewabilityConfig={viewabilityConfig}
          disableIntervalMomentum={true}
          maxToRenderPerBatch={2}
          removeClippedSubviews={Platform.OS === 'android'}
          onViewableItemsChanged={onViewableItemsChanged}
          initialNumToRender={1}
          onEndReachedThreshold={0.1}
          decelerationRate={'normal'}
          scrollEventThrottle={16}
          // contentContainerStyle={styles.container}
        /> */}

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
            setIsOpen={(value: boolean) =>
              handleSheetOpenChange(value, 'share')
            }
          />
        )}

        {currentSheetName === 'action' && (
          <ActionSheet
            data={actionSheetData}
            isVisible={currentSheetName === 'action'}
            onClose={() => setCurrentSheetName('')}
          />
        )}

        <ReportModal
          visible={currentSheetName === 'report'}
          onClose={() => setCurrentSheetName('')}
          reportType={ReportType.REEL}
          id={postIdRef.current}
          submissionAction={refetch}
        />
      </View>
    );
  },
);

ShortsFeed.displayName = 'ShortsFeed';

export default React.memo(ShortsFeed);

const createStyle = (colors: ColorThemeInterface, height: number) =>
  StyleSheet.create({
    container: {
      height: getVideoHeight(true),
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
      minHeight: getVideoHeight( true),
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
