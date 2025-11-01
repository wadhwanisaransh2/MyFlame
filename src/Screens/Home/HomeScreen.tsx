import React, {useCallback, useEffect, useRef, useState, useMemo} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Animated,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  StatusBar,
  Text,
} from 'react-native';
import {ColorThemeInterface} from '../../Utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import {PostCard, PostCardLoader} from '../../Components/PostCard/PostCard';
import {useLazyGetFeedQuery} from '../../redux/api/post';
import CommentSheet from '../../Components/BottomSheet/CommentSheet';
import {hp} from '../../Utils/responsive';
import SendPost from '../../Components/Chat/SendPost';
import HomeHeader from '../../Components/Header/HomeHeader';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {showToast} from '../../Utils/general';
import ActionSheet from '../../Components/BottomSheet/ActionSheet';
import {BlockUser} from '../../Assets/Images/SVGs/PostSVG';
import {ReportSVG} from '../../Assets/Images/SVGs/SettingsSVG';
import {ReportType} from '../../Enum/enum';
import {useBlockUserMutation} from '../../redux/api/profile';
import ReportModal from '../../Components/Modals/ReportModal';
import DataNotFound from '../../Components/Layout/DataNotFound';

const INITIAL_ITEMS_TO_RENDER = 3;
const ITEMS_PER_BATCH = 5;
const WINDOW_SIZE = 5;
const HEADER_HEIGHT = 60;
// Define minimum scroll distance to trigger header show/hide
const SCROLL_THRESHOLD = 29;

// Create an animated version of FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

const HomeScreen = ({
  handleTabHide,
  keyboardVisible,
}: {
  handleTabHide: (value: boolean) => void;
  keyboardVisible: boolean;
}) => {
  const {colors} = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const commentSheetRef = useRef<any>(null);
  const flatListRef = useRef<FlatList<Post>>(null);

  // Track scroll position and direction
  const lastScrollY = useRef(0);
  const scrollDirection = useRef<'up' | 'down'>('up');

  // Animation values - moved outside to prevent recreation
  const headerVisible = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [postData, setPostData] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blockUser] = useBlockUserMutation();
  const [cursor, setCursor] = useState('');
  // Get profile from Redux state
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const [currentSheetName, setCurrentSheetName] = useState<
    'share' | 'comment' | '' | 'action' | 'report'
  >('');
  const postDetailsRef = useRef({caption: '', imageUrl: ''});
  const blockUserIdRef = useRef<string>('');
  const postIdRef = useRef<string>('');

  const [getFeed, {isLoading: postsLoading, data: userProfile}] =
    useLazyGetFeedQuery();

  useEffect(() => {
    getFeed({cursor: cursor, refresh: refreshing, limit: 4, type: 'post'});
  }, []);

  async function handleReportPost() {
    // First close the action sheet
    setCurrentSheetName('');

    // Then open the report modal after a short delay
    setTimeout(() => {
      setCurrentSheetName('report');
    });
  }

  async function handleUserBlock() {
    const blockUserId = blockUserIdRef.current;
    if (!blockUserId) {
      showToast('Failed to block user!');
      return;
    }
    setCurrentSheetName('');
    const res = await blockUser({userId: blockUserId}).unwrap();
    showToast('User blocked successfully');
    blockUserIdRef.current = '';
    getFeed({cursor, refresh: true, limit: 4, type: 'post'});
  }

  const actionSheetData = useMemo(() => {
    return [
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
    ];
  }, []);


  useEffect(() => {
    if (!userProfile) return;
    const batchedUpdates = () => {
      setPostData(prevData =>
        cursor?.length === 0
          ? userProfile.posts
          : [...prevData, ...userProfile.posts],
      );

      setFooterLoading(false);
      setRefreshing(false);
      setLoading(false);
    };

    // Use requestAnimationFrame for better performance
    const animationFrame = requestAnimationFrame(batchedUpdates);

    return () => cancelAnimationFrame(animationFrame);
  }, [userProfile]);

  const handleLoadMore = useCallback(() => {
    if (userProfile?.nextCursor && userProfile?.hasMore && !footerLoading) {
      setFooterLoading(true);
      setCursor(userProfile?.nextCursor);
      getFeed({
        cursor: userProfile?.nextCursor,
        refresh: false,
        limit: 4,
        type: 'post',
      });
    }
  }, [cursor, footerLoading, postsLoading]);

  const showHeader = useCallback(() => {
    if (scrollDirection.current === 'down') return;
    Animated.timing(headerVisible, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [headerVisible]);

  const hideHeader = useCallback(() => {
    if (scrollDirection.current === 'up') return;
    Animated.timing(headerVisible, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [headerVisible]);

  const refresh = useCallback(async () => {
    // Always show header when refreshing
    showHeader();
    setRefreshing(true);
    setCursor('');
    await getFeed({cursor: '', refresh: true, limit: 4, type: 'post'}).unwrap();
    setRefreshing(false);
  }, [getFeed, showHeader]);

  const handleCommentPress = useCallback(
    (postId: string, comments?: any[]) => {
      postIdRef.current = postId;
      setCurrentSheetName('comment');
      handleTabHide(true); // Hide bottom tab when comment sheet opens
    },
    [handleTabHide],
  );

  const handleSharePress = useCallback((postId: string) => {
    postIdRef.current = postId;
    setCurrentSheetName('share');
  }, []);

  const renderItem = useCallback(
    ({item}: {item: Post}) => {
      const user = item.user;
      const fullName = `${user?.firstName} ${user?.lastName}`;
      return (
        <PostCard
          username={fullName}
          handle={user?.username || ''}
          content={item.caption}
          userAvatar={user?.profilePicture || ''}
          image={item.imageUrl}
          likes={item.likeCount || 0}
          comments={item.commentCount || 0}
          _id={item._id}
          userId={item.userId}
          Liked={Boolean(item.isLiked)}
          colorsChange={colors.primaryColor}
          onComment={() => handleCommentPress(item._id)}
          onShare={() => {
            handleSharePress(item._id);
            handleTabHide(true);
            postDetailsRef.current = {
              caption: item.caption,
              imageUrl: item.imageUrl,
            };
          }}
          createdAt={item.createdAt}
          showMoreBT={item.userId !== profile._id}
          onMore={() => {
            blockUserIdRef.current = item.userId;
            postIdRef.current = item._id;
            setCurrentSheetName('action');
            handleTabHide(true);
          }}
        />
      );
    },
    [handleCommentPress, handleSharePress, profile, colors.primaryColor , postData],
  );

  const keyExtractor = useCallback((item: Post) => item._id, []);

  const renderFooter = useCallback(() => {
    return footerLoading ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primaryColor} />
      </View>
    ) : !cursor && postData?.length > 0 ? (
      <View style={styles.footerLoader}>
        <Text style={styles.noMorePostsText}>No more posts Available</Text>
      </View>
    ) : null;
  }, [
    footerLoading,
    colors.primaryColor,
    styles.footerLoader,
    cursor,
    postData,
  ]);

  // Optimized scroll handler with proper typing
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;

      // Always show header at the top
      if (currentScrollY <= 0) {
        scrollDirection.current = 'up';
        showHeader();
        lastScrollY.current = currentScrollY;
        return;
      }

      // Check if scrolled enough to trigger header change
      const isScrollingDown = currentScrollY > lastScrollY.current;
      const isScrollSignificant =
        Math.abs(currentScrollY - lastScrollY.current) > SCROLL_THRESHOLD;

      if (isScrollSignificant) {
        if (isScrollingDown && scrollDirection.current !== 'down') {
          scrollDirection.current = 'down';
          hideHeader();
        } else if (!isScrollingDown && scrollDirection.current !== 'up') {
          scrollDirection.current = 'up';
          showHeader();
        }
      }

      lastScrollY.current = currentScrollY;
    },
    [hideHeader, showHeader],
  );

  // Translate header based on visibility value
  const headerTranslateY = headerVisible.interpolate({
    inputRange: [0, 1],
    outputRange: [-HEADER_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  // Optimized FlatList props with proper typing
  const flatListProps = useMemo(
    () => ({
     
      keyExtractor,
      onEndReached: handleLoadMore,
      onEndReachedThreshold: 0.1,
      ListFooterComponent: renderFooter,
      removeClippedSubviews: true,
      initialNumToRender: INITIAL_ITEMS_TO_RENDER,
      maxToRenderPerBatch: ITEMS_PER_BATCH,
      windowSize: WINDOW_SIZE,
      refreshControl: (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={colors.primaryColor}
          progressBackgroundColor={colors.backgroundColor}
          colors={[colors.primaryColor]}
          progressViewOffset={HEADER_HEIGHT + 10} // Push refresh indicator below header
          style={{zIndex: 1}}
        />
      ),
      getItemLayout: undefined, // Let FlatList calculate automatically for variable heights
      onScroll: Animated.event([{nativeEvent: {contentOffset: {y: scrollY}}}], {
        useNativeDriver: true,
        listener: handleScroll,
      }),
      scrollEventThrottle: 8, // Reduced for smoother animation
      contentContainerStyle: {
        paddingTop: HEADER_HEIGHT + 20,
        paddingBottom: hp('4%'),
      },
      showsVerticalScrollIndicator: false,
      bounces: true,
      bouncesZoom: false,
      alwaysBounceVertical: false,
      decelerationRate: 'normal' as const,
      disableIntervalMomentum: true,
      disableScrollViewPanResponder: false,
      keyboardDismissMode: 'on-drag' as const,
      keyboardShouldPersistTaps: 'handled' as const,
      maintainVisibleContentPosition: {
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      },
    }),
    [
      postData,
      renderItem,
      keyExtractor,
      handleLoadMore,
      renderFooter,
      refresh,
      refreshing,
      handleScroll,
      scrollY,
      colors.primaryColor,
      colors.backgroundColor,
      colors,
      profile,
    ],
  );

  // Loading state optimization

  // Skeleton loading optimization
  const renderSkeletonLoaders = useMemo(
    () => (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          gap: hp('2%'),
          paddingTop: hp('10%'),
          paddingBottom: hp('4%'),
        }}
        showsVerticalScrollIndicator={false}>
        <PostCardLoader />
        <PostCardLoader />
        <PostCardLoader />
      </ScrollView>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.backgroundColor}
        barStyle={'dark-content'}
      />
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {transform: [{translateY: headerTranslateY}]},
        ]}>
        <HomeHeader
          onBackPress={() => {}}
          title="Home"
          ShowProfile={true}
          showNewPostBt={true}
        />
      </Animated.View>

      <View style={styles.container}>
        {loading && !postData?.length && !refreshing ? (
          renderSkeletonLoaders
        ) : (
          <AnimatedFlatList
            extraData={colors}
            data={postData}
            renderItem={renderItem}
            ListEmptyComponent={
              <DataNotFound
                iconContainerStyle={{marginTop: hp('15%'), padding: hp('0.5%')}}
                title="Posts Not Available"
                OnRefresh={refresh}
              />
            }
            ref={flatListRef}
            {...flatListProps}
          />
        )}
      </View>

      {currentSheetName === 'comment' && (
        <CommentSheet
          commentSheetRef={commentSheetRef}
          postId={postIdRef.current}
          setIsCommentSheetOpen={(value: boolean) => {
            if (value) {
              setCurrentSheetName('comment');
            } else {
              setCurrentSheetName('');
              handleTabHide(false);
            }
          }}
          profile={profile}
        />
      )}
      {currentSheetName === 'share' && (
        <SendPost
          postId={postIdRef.current}
          postCaption={postDetailsRef.current.caption}
          postImage={postDetailsRef.current.imageUrl}
          type="post"
          isOpen={currentSheetName === 'share'}
          setIsOpen={(value: boolean) => {
            if (value) {
              setCurrentSheetName('share');
            } else {
              setCurrentSheetName('');
              handleTabHide(false);
            }
          }}
        />
      )}

      {currentSheetName === 'action' && (
        <ActionSheet
          data={actionSheetData}
          isVisible={currentSheetName === 'action'}
          onClose={() => {
            setCurrentSheetName('');
            handleTabHide(false);
          }}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        visible={currentSheetName === 'report'}
        onClose={() => {
          setCurrentSheetName('');
          handleTabHide(false);
        }}
        reportType={ReportType.POST}
        id={postIdRef.current}
        submissionAction={() => {
          postIdRef.current = '';
          getFeed({cursor, refresh: true, limit: 4, type: 'post'});
        }}
      />
    </View>
  );
};

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      zIndex: 100,
      backgroundColor: colors.backgroundColor,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,

      overflow: 'hidden',
    },
    footerLoader: {
      paddingVertical: 16,
      alignItems: 'center',
      paddingBottom: hp('4%'),
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    noMorePostsText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primaryColor,
    },
  });

export default React.memo(HomeScreen);
