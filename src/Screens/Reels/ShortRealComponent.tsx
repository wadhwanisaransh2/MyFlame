import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Video, {VideoRef, OnProgressData, OnLoadData} from 'react-native-video';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {
  TapGestureHandler,
  State,
  HandlerStateChangeEvent,
  TapGestureHandlerEventPayload,
  Pressable,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

// Import your SVG components and utilities
import {BackArrow, MoreSVG, ShareSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {useTheme} from '../../Theme/ThemeContext';
import {IMAGES} from '../../Assets';
import {CommentSVG, LikeSVG, LikeSVG2} from '../../Assets/Images/SVGs/PostSVG';
import {ColorThemeInterface} from '../../Utils/colors';
import {getVideoHeight, hp, wp} from '../../Utils/responsive';
import {MuteSVG, UnMuteSVG} from '../../Assets/Images/SVGs/ReelsSVG';
import {PlaySVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {navigate, navigateBack} from '../../Utils/navigation';
import {
  usePostDislikeMutation,
  usePostLikeMutation,
} from '../../redux/api/post';
import {formatPostDate} from '../../Utils/general';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';

// Types
interface AuthorDetails {
  username: string;
  profilePicture?: string;
}

export interface ReelItem {
  _id: string;
  userId: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  videoUrl: string;
  imageUrl: string;
  type: 'reel';
  privacy: 'private';
  isArchived: boolean;
  isLiked: boolean;
  likes: any[];
  comments: any[];
  tags: string[];
  createdAt: string;
  caption: string;
  likeCount: number;
}

interface ShortReelComponentProps {
  item: ReelItem;
  index: number;
  isFocused?: boolean;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
  onPressComment: () => void;
  onBackPress: () => void;
  onMorePress: () => void;
  onSharePress: () => void;
  showMoreIcon?: boolean;
  height: number;
}

type RootStackParamList = {
  [key: string]: undefined | object;
};

// Constants
const {width, height} = Dimensions.get('window');
const CONTROLS_HIDE_DELAY = 3000;
const DOUBLE_TAP_DELAY = 300;

// Optimized video buffer config for better sync
const OPTIMIZED_BUFFER_CONFIG = {
  minBufferMs: 10000,
  maxBufferMs: 20000,
  bufferForPlaybackMs: 1000,
  bufferForPlaybackAfterRebufferMs: 2000,
  backBufferDurationMs: 3000,
  maxHeapAllocationPercent: 0.3,
  minBackBufferMemoryReservePercent: 0.1,
  minBufferMemoryReservePercent: 0.1,
};

// Optimized component with memo
const ShortReelComponent: React.FC<ShortReelComponentProps> = memo(
  ({
    item,
    index,
    isFocused = true,
    isMuted,
    setIsMuted,
    isPaused,
    setIsPaused,
    onPressComment,
    onBackPress,
    onMorePress,
    onSharePress,
    showMoreIcon = true,
    height 
  }) => {
    const {profile} = useSelector((state: RootState) => state.AuthManager);

    // Navigation and Theme
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const {colors} = useTheme();
    const styles = useMemo(() => createStyle(colors , height ), [colors]);

    // API mutations
    const [postLike, {isLoading: likeLoading}] = usePostLikeMutation();
    const [postDislike, {isLoading: dislikeLoading}] = usePostDislikeMutation();

    // Optimized state management - reduced state updates
    const [likeCount, setLikeCount] = useState<number>(item?.likeCount || 0);
    const [isLiked, setIsLiked] = useState<boolean>(item?.isLiked || false);
    const [showControls, setShowControls] = useState<boolean>(false);
    const [showMoreCaption, setShowMoreCaption] = useState<boolean>(false);
    const [videoState, setVideoState] = useState<{
      currentTime: number;
      duration: number;
      isLoading: boolean;
      isReady: boolean;
      hasError: boolean;
    }>({
      currentTime: 0,
      duration: 0,
      isLoading: true,
      isReady: false,
      hasError: false,
    });

    // Essential refs
    const videoRef = useRef<VideoRef>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const singleTapRef = useRef<TapGestureHandler>(null);
    const doubleTapRef = useRef<TapGestureHandler>(null);
    const lastTapRef = useRef<number>(0);
    const isComponentMountedRef = useRef<boolean>(true);

    // Optimized animated values
    const heartAnim = useRef(new Animated.Value(0)).current;
    const controlsOpacity = useRef(new Animated.Value(0)).current;
    const progressBarWidth = useRef(new Animated.Value(0)).current;

    // Memoized computed values
    const shouldVideoPlay = useMemo(() => {
      return (
        isFocused && !isPaused && videoState.isReady && !videoState.hasError
      );
    }, [isFocused, isPaused, videoState.isReady, videoState.hasError]);

    // Cleanup function
    const cleanup = useCallback(() => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = null;
      }
      isComponentMountedRef.current = false;
    }, []);

    // Component cleanup
    useEffect(() => {
      isComponentMountedRef.current = true;
      return cleanup;
    }, [cleanup]);

    // Video state reset when item changes
    useEffect(() => {
      setVideoState(prev => ({
        ...prev,
        isLoading: true,
        isReady: false,
        hasError: false,
      }));
    }, [item?.videoUrl]);

    // Controls auto-hide - optimized
    useEffect(() => {
      if (showControls && isComponentMountedRef.current) {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }

        Animated.timing(controlsOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();

        controlsTimeoutRef.current = setTimeout(() => {
          if (isComponentMountedRef.current) {
            setShowControls(false);
            Animated.timing(controlsOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }).start();
          }
        }, CONTROLS_HIDE_DELAY);
      }
    }, [showControls, controlsOpacity]);

    // Progress animation - optimized with throttling
    useEffect(() => {
      if (videoState.duration > 0 && videoState.currentTime >= 0) {
        const progressPercentage =
          (videoState.currentTime / videoState.duration) * width;
        Animated.timing(progressBarWidth, {
          toValue: progressPercentage,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
    }, [videoState.currentTime, videoState.duration, progressBarWidth]);

    // Optimized gesture handlers with debouncing
    const onSingleTap = useCallback(
      (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          const now = Date.now();
          if (now - lastTapRef.current > DOUBLE_TAP_DELAY) {
            setIsPaused(!isPaused);
            setShowControls(!showControls);
          }
          lastTapRef.current = now;
        }
      },
      [isPaused, showControls, setIsPaused],
    );

    const onDoubleTap = useCallback(
      (event: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          lastTapRef.current = Date.now();

          if (!isLiked && !likeLoading) {
            setIsLiked(true);
            setLikeCount(prevCount => prevCount + 1);
            postLike({id: item._id});
          }

          // Optimized heart animation
          Animated.sequence([
            Animated.timing(heartAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(heartAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
      [isLiked, item._id, postLike, heartAnim, likeLoading],
    );

    // Optimized action handlers
    const handleMuteToggle = useCallback(() => {
      setIsMuted(!isMuted);
    }, [isMuted, setIsMuted]);

    const handleLikeToggle = useCallback(() => {
      if (likeLoading || dislikeLoading) return;

      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prevCount =>
        newLikedState ? prevCount + 1 : prevCount - 1,
      );

      if (newLikedState) {
        postLike({id: item._id});
      } else {
        postDislike({id: item._id});
      }
    }, [isLiked, item._id, postLike, postDislike, likeLoading, dislikeLoading]);

    const handleBack = useCallback(() => {
      onBackPress();
    }, [onBackPress]);

    const handleComment = useCallback(() => {
      onPressComment();
    }, [onPressComment]);

    const handleUserPress = useCallback(() => {
      navigate('ProfileScreen', {
        userId: item?.userId,
        username: item?.user?.username,
      });
    }, [item?.userId, item?.user?.username]);

    const handleCaptionPress = useCallback(() => {
      setShowMoreCaption(!showMoreCaption);
    }, [showMoreCaption]);

    // Optimized video handlers with better error handling
    const handleVideoProgress = useCallback((data: OnProgressData) => {
      if (isComponentMountedRef.current) {
        setVideoState(prev => ({
          ...prev,
          currentTime: data.currentTime,
        }));
      }
    }, []);

    const handleVideoLoad = useCallback((data: OnLoadData) => {
      if (isComponentMountedRef.current) {
        setVideoState(prev => ({
          ...prev,
          duration: data.duration,
          isLoading: false,
          isReady: true,
          hasError: false,
        }));
      }
    }, []);

    const handleVideoLoadStart = useCallback(() => {
      if (isComponentMountedRef.current) {
        setVideoState(prev => ({
          ...prev,
          isLoading: true,
          isReady: false,
        }));
      }
    }, []);

    const handleVideoReadyForDisplay = useCallback(() => {
      if (isComponentMountedRef.current) {
        setVideoState(prev => ({
          ...prev,
          isLoading: false,
          isReady: true,
          hasError: false,
        }));
      }
    }, []);

    const handleVideoError = useCallback((error: any) => {
      if (isComponentMountedRef.current) {
        setVideoState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
        }));
      }
    }, []);

    const handleVideoEnd = useCallback(() => {
      if (isComponentMountedRef.current && videoRef.current) {
        videoRef.current.seek(0);
      }
    }, []);

    return (
      <View style={styles.container}>
        {/* Check for empty video URL */}
        {!item?.videoUrl ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Video not available</Text>
          </View>
        ) : (
          <>
            {/* Video with optimized configuration */}
            <Video
              ref={videoRef}
              source={{uri: item?.videoUrl}}
              style={styles.videoStyle}
              resizeMode="cover"
              repeat={true}
              controls={false}
              paused={!shouldVideoPlay || !isFocused}
              muted={isMuted}
              playInBackground={false}
              playWhenInactive={false}
              onProgress={handleVideoProgress}
              onLoad={handleVideoLoad}
              onLoadStart={handleVideoLoadStart}
              onReadyForDisplay={handleVideoReadyForDisplay}
              onError={handleVideoError}
              onEnd={handleVideoEnd}
              bufferConfig={OPTIMIZED_BUFFER_CONFIG}
              maxBitRate={2000000}
              reportBandwidth={true}
              automaticallyWaitsToMinimizeStalling={true}
              preventsDisplaySleepDuringVideoPlayback={true}
              // poster={item.imageUrl}
              posterResizeMode="cover"
              hideShutterView
              minLoadRetryCount={5}
              shutterColor="transparent"
              ignoreSilentSwitch={'ignore'}
              useTextureView={false}
              disableFocus={true}
            />

            {/* Video Loading Indicator */}
            {videoState.isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryColor} />
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}

            {/* Error State */}
            {videoState.hasError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to play video</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setVideoState(prev => ({
                      ...prev,
                      hasError: false,
                      isLoading: true,
                    }));
                  }}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientOverlay}
              pointerEvents="none"
            />

            {/* Optimized Gesture Handlers */}
            <TapGestureHandler
              ref={doubleTapRef}
              onHandlerStateChange={onDoubleTap}
              numberOfTaps={2}
              maxDurationMs={300}
              maxDelayMs={300}>
              <TapGestureHandler
                ref={singleTapRef}
                onHandlerStateChange={onSingleTap}
                waitFor={doubleTapRef}
                maxDurationMs={300}>
                <View style={styles.gestureArea} />
              </TapGestureHandler>
            </TapGestureHandler>

            {/* Optimized Animated Heart */}
            <Animated.View
              style={[
                styles.heartContainer,
                {
                  opacity: heartAnim,
                  transform: [
                    {
                      scale: heartAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1.2],
                      }),
                    },
                  ],
                },
              ]}
              pointerEvents="none">
              <LikeSVG height={80} width={80} fill={colors.primaryColor} />
            </Animated.View>

            {/* Top Controls */}
            <Animated.View
              style={[styles.topControls, {opacity: controlsOpacity}]}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <BackArrow height={20} width={20} fill="white" />
              </TouchableOpacity>
              {showMoreIcon && (
                <TouchableOpacity
                  onPress={onMorePress}
                  style={styles.moreButton}>
                  <MoreSVG height={24} width={24} fill="white" />
                </TouchableOpacity>
              )}
              {/* )} */}
            </Animated.View>

            {/* Side Actions */}
            <View style={styles.sideActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLikeToggle}
                activeOpacity={0.8}
                disabled={likeLoading || dislikeLoading}>
                <View
                  style={[
                    styles.actionButtonBg,
                    isLiked && styles.likedButton,
                  ]}>
                  {isLiked ? (
                    <LikeSVG height={20} width={20} fill="white" />
                  ) : (
                    <LikeSVG2 height={20} width={20} fill="white" />
                  )}
                </View>
                <Text style={styles.actionText}>{likeCount}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleComment}
                activeOpacity={0.8}>
                <View style={styles.actionButtonBg}>
                  <CommentSVG height={20} width={20} fill="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSharePress}
                activeOpacity={0.8}>
                <View style={styles.actionButtonBg}>
                  <ShareSVG height={20} width={20} fill="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMuteToggle}
                activeOpacity={0.8}>
                <View style={styles.actionButtonBg}>
                  {isMuted ? (
                    <MuteSVG height={20} width={20} fill="white" />
                  ) : (
                    <UnMuteSVG height={20} width={20} fill="white" />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Caption */}
            <View style={styles.captionContainer}>
              <TouchableOpacity
                onPress={handleUserPress}
                style={styles.userDetailContainer}>
                <View style={styles.userInfo}>
                  <FastImage
                    source={
                      item?.user?.profilePicture
                        ? {uri: item.user.profilePicture}
                        : IMAGES.userImg
                    }
                    style={styles.avatar}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View style={styles.userTextContainer}>
                    <Text style={styles.username}>{item?.user?.username}</Text>
                    <Text style={styles.timeAgo}>
                      {formatPostDate(item?.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {item?.caption && (
                <Text
                  style={styles.description}
                  onPress={handleCaptionPress}
                  numberOfLines={showMoreCaption ? undefined : 2}>
                  {item.caption}
                </Text>
              )}

              {item?.tags?.length > 0 && (
                <Text
                  numberOfLines={showMoreCaption ? undefined : 1}
                  style={styles.tags}>
                  {item.tags.map((tag: string) => `#${tag}`).join(' ')}
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    );
  },
);

ShortReelComponent.displayName = 'ShortReelComponent';
export default ShortReelComponent;

// Optimized ReelSkeleton component
export const ReelSkeleton = memo(({onBackPress}: {onBackPress: () => void}) => {
  const {colors} = useTheme();
  const styles = useMemo(() => createStyle(colors, height), [colors]);

  const shimmerColors = ['#181920', '#1f2027', '#181920'];

  return (
    <View style={[styles.container, {backgroundColor: '#1a1a1a'}]}>
      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.videoStyle}
        LinearGradient={LinearGradient}
      />

      <View style={styles.topControls}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <BackArrow height={24} width={24} fill="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.captionContainer}>
        <View style={styles.userDetailContainer}>
          <View style={styles.userInfo}>
            <View style={styles.skeletonAvatar} />
            <View style={styles.userTextContainer}>
              <View style={styles.skeletonUsername} />
              <View style={styles.skeletonTime} />
            </View>
          </View>
        </View>
        <View style={styles.skeletonCaption} />
        <View style={styles.skeletonCaptionShort} />
      </View>
    </View>
  );
});

ReelSkeleton.displayName = 'ReelSkeleton';

// Optimized Styles with better performance
const createStyle = (colors: ColorThemeInterface , height: number) =>
  StyleSheet.create({
    container: {
      height: height ,
      width: '100%',
      backgroundColor: '#000',
    },
    videoStyle: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    gestureArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
    heartContainer: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginTop: -40,
      marginLeft: -40,
      zIndex: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topControls: {
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      zIndex: 10,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userDetailContainer: {
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 5,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      height: 50,
      width: 50,
      borderRadius: 25,
      borderWidth: 2,
      borderColor: colors.primaryColor,
      marginRight: 12,
    },
    userTextContainer: {
      flex: 1,
    },
    username: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'SF-Bold',
    },
    timeAgo: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 12,
      fontFamily: 'SF-Medium',
      marginTop: 2,
    },
    sideActions: {
      position: 'absolute',
      right: 15,
      bottom: hp('10%'),
      alignItems: 'center',
      zIndex: 88,
    },
    actionButton: {
      alignItems: 'center',
      marginBottom: 20,
    },
    actionButtonBg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5,
    },
    likedButton: {
      backgroundColor: colors.primaryColor,
    },
    actionText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
      marginTop: 2,
    },
    captionContainer: {
      position: 'absolute',
      bottom: hp('10%'),
      left: 20,
      right: 100,
      zIndex: 200,
    },
    description: {
      color: 'white',
      fontSize: 15,
      fontWeight: '500',
      lineHeight: 20,
      marginBottom: 5,
    },
    tags: {
      color: colors.primaryColor,
      fontSize: 13,
      fontWeight: '400',
      marginTop: 5,
    },
    // Skeleton styles
    skeletonAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginRight: 12,
    },
    skeletonUsername: {
      width: 100,
      height: 15,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    skeletonTime: {
      width: 50,
      height: 10,
      borderRadius: 5,
      marginTop: 4,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    skeletonCaption: {
      width: '90%',
      height: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginLeft: 62,
      marginTop: 8,
    },
    skeletonCaptionShort: {
      width: '50%',
      height: 12,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginLeft: 62,
      marginTop: 4,
    },
    // Loading indicator styles
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 15,
    },
    loadingText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'SF-Bold',
      marginTop: 10,
    },
    // Error state styles
    errorContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 15,
    },
    errorText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'SF-Bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    retryButton: {
      padding: 10,
      backgroundColor: colors.primaryColor,
      borderRadius: 5,
    },
    retryText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'SF-Bold',
    },
  });
