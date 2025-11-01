import React, {
  useState,
  useRef,
  useCallback,
  memo,
  useMemo,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StyleProp,
  ViewStyle,
  Pressable,
  Platform,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {hp, wp} from '../../Utils/responsive';
import {CommentSVG, LikeSVG, LikeSVG2} from '../../Assets/Images/SVGs/PostSVG';
import {SendSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {
  PinchGestureHandler,
  TapGestureHandler,
  State,
  PinchGestureHandlerStateChangeEvent,
  GestureEvent,
  PinchGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import {
  usePostDislikeMutation,
  usePostLikeMutation,
} from '../../redux/api/post';
import {MoreSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {navigate} from '../../Utils/navigation';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {formatPostDate} from '../../Utils/general';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';

// Define more specific types
type PostActionHandler = () => void;

interface PostCardProps {
  username: string;
  handle: string;
  content: string;
  userAvatar?: string;
  image?: string;
  likes: number;
  comments: number;
  onComment?: PostActionHandler;
  onShare?: PostActionHandler;
  style?: StyleProp<ViewStyle>;
  _id: string;
  onMore?: PostActionHandler;
  userId: string;
  Liked: boolean;
  showMoreBT?: boolean;
  shares?: number;
  createdAt: string;
  colorsChange?: string;
}

// Clean Header Component
const CleanHeader = memo(
  ({
    userAvatar,
    username,
    handle,
    colors,
    onPress,
    onMore,
    showMoreBT,
    createdAt,
    isDark,
    userId,
  }: {
    userAvatar?: string;
    username: string;
    handle: string;
    createdAt: string;
    colors: ColorThemeInterface;
    onPress: () => void;
    onMore?: PostActionHandler;
    showMoreBT: boolean;
    isDark?: boolean;
    userId: string;
  }) => {
    const styles = makeStyles(colors);
    const {profile} = useSelector((state: RootState) => state.AuthManager);
    const createdAtText = useMemo(() => formatPostDate(createdAt), [createdAt]);

    return (
      <View style={styles.header}>
        <Pressable onPress={onPress} style={styles.userSection}>
          <FastImage
            source={userAvatar ? {uri: userAvatar} : IMAGES.userImage}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text
              style={[styles.username, {color: colors.darkText}]}
              numberOfLines={1}>
              {username}
            </Text>
            <View style={styles.metaInfo}>
              <Text style={[styles.location, {color: colors.lightText}]}>
                {handle}
              </Text>
              <Text style={[styles.dot, {color: colors.lightText}]}>•</Text>
              <Text style={[styles.time, {color: colors.lightText}]}>
                {createdAtText}
              </Text>
            </View>
          </View>
        </Pressable>

        {showMoreBT && (
          <TouchableOpacity style={styles.moreButton} onPress={onMore}>
            <MoreSVG width={20} height={20} fill={colors.lightText} />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

// Action Button Component
type ActionButtonProps = {
  icon: React.ReactNode;
  count: number;
  onPress?: () => void;
  color: string;
  isActive?: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  count,
  onPress,
  color,
  isActive = false,
}) => {
  return (
    <TouchableOpacity
      style={{flexDirection: 'row', alignItems: 'center'}}
      onPress={onPress}>
      {icon}
      <Text style={{color, fontSize: 14, marginLeft: 6, fontWeight: '500'}}>
        {count}
      </Text>
    </TouchableOpacity>
  );
};

export const PostCard: React.FC<PostCardProps> = ({
  username,
  handle,
  content,
  userAvatar,
  image,
  likes,
  comments,
  onComment,
  onShare,
  style,
  _id,
  onMore,
  userId,
  Liked,
  showMoreBT = false,
  shares = 0,
  createdAt,
}) => {
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const [isLiked, setIsLiked] = useState(Liked);

  const [likeCount, setLikeCount] = useState(likes);
  const [showFullContent, setShowFullContent] = useState(false);

  // Add useEffect to update state when props change
  useEffect(() => {
    setIsLiked(Liked);
    setLikeCount(likes);
  }, [Liked, likes]);

  
  // Animation values
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  const [postLike, {isLoading: likeLoading}] = usePostLikeMutation();
  const [postDislike, {isLoading: dislikeLoading}] = usePostDislikeMutation();

  // Refs
  const pinchRef = useRef<PinchGestureHandler>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  // Tracked values
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  const handleLike = useCallback(() => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prevCount => (newLikedState ? prevCount + 1 : prevCount - 1));

    if (newLikedState) {
      postLike({id: _id});
    } else {
      postDislike({id: _id});
    }
  }, [isLiked]);

  const onDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(prevCount => prevCount + 1);
      postLike({id: _id});
    }

    // Animate heart
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isLiked, heartScale, heartOpacity]);

  const onPinchGestureEvent = Animated.event<
    GestureEvent<PinchGestureHandlerEventPayload>
  >([{nativeEvent: {scale: baseScale}}], {useNativeDriver: true});

  const onPinchHandlerStateChange = useCallback(
    (event: PinchGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        lastScale.current *= event.nativeEvent.scale;
        lastScale.current = Math.max(1, Math.min(lastScale.current, 3));
        scale.setValue(lastScale.current);
        baseScale.setValue(1);

        lastScale.current = 1;
        lastTranslateX.current = 0;
        lastTranslateY.current = 0;

        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 40,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
          }),
        ]).start();
      }
    },
    [scale, translateX, translateY, baseScale],
  );

  const onNavigate = () => {
    navigate('ProfileScreen', {
      userId: userId,
      username: username,
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <CleanHeader
        userAvatar={userAvatar}
        username={username}
        handle={handle}
        colors={colors}
        onPress={onNavigate}
        onMore={onMore}
        showMoreBT={showMoreBT}
        createdAt={createdAt}
        isDark={isDark}
        userId={userId}
      />

      {/* Main Image */}
      {image && (
        <View style={styles.imageContainer}>
          <PinchGestureHandler
            ref={pinchRef}
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}>
            <Animated.View>
              <TapGestureHandler
                ref={doubleTapRef}
                numberOfTaps={2}
                onActivated={onDoubleTap}>
                <Animated.View>
                  <Animated.View
                    style={[
                      styles.imageWrapper,
                      {
                        transform: [
                          {scale: Animated.multiply(baseScale, scale)},
                          {translateX},
                          {translateY},
                        ],
                      },
                    ]}>
                    <FastImage
                      source={image ? {uri: image} : IMAGES.userImage}
                      style={styles.postImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </Animated.View>

                  {/* Heart animation overlay */}
                  <Animated.View
                    style={[
                      styles.heartOverlay,
                      {
                        opacity: heartOpacity,
                        transform: [{scale: heartScale}],
                      },
                    ]}>
                    <LikeSVG width={80} height={80} fill="#e74c3c" />
                  </Animated.View>
                </Animated.View>
              </TapGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </View>
      )}

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Reactions and Tags */}
        {/* <View style={styles.reactionSection}>
            <Text style={[styles.reactionEmoji]}>👍🏻 </Text>
            <Text style={[styles.reactionUser, {color: colors.darkText}]}>randylohr</Text>
            <Text style={[styles.reactionText, {color: colors.lightText}]}> and others</Text>
          </View> */}

        {/* Content Text */}
        {content.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowFullContent(!showFullContent)}>
            <Text style={[styles.contentText, {color: colors.darkText}]}>
              <Text style={[styles.contentUsername, {color: colors.darkText}]}>
                {username}{' '}
              </Text>
              {showFullContent
                ? content
                : content?.length > 80
                ? content?.slice(0, 80) + '... '
                : content}
              {!showFullContent && content?.length > 80 && (
                <Text style={[styles.moreText, {color: colors.lightText}]}>
                  more
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Bar */}
      {_id && (
        <View style={styles.actionBar}>
          <View style={styles.leftActions}>
            {}
            <ActionButton
              icon={
                isLiked ? (
                  <LikeSVG
                    width={24}
                    height={24}
                    fill={isLiked ? colors.primaryColor : 'transparent'}
                    stroke={isLiked ? colors.primaryColor : colors.lightText}
                    strokeWidth={1.5}
                  />
                ) : (
                  <LikeSVG2 width={24} height={24} fill={colors.lightText} />
                )
              }
              count={likeCount}
              onPress={handleLike}
              color={isLiked ? '#4A90E2' : colors.lightText}
            />

            {/* <ActionButton
              icon={
                
              }
              count={comments}
              onPress={onComment}
              color={colors.lightText}
            /> */}
            <TouchableOpacity onPress={onComment}>
              <CommentSVG width={24} height={24} fill={colors.lightText} />
            </TouchableOpacity>

            <TouchableOpacity onPress={onShare}>
              <SendSVG width={20} height={20} fill={colors.lightText} />
            </TouchableOpacity>
          </View>

          {/* <View style={styles.rightActions}>
          
          </View> */}
        </View>
      )}
    </View>
  );
};

export const PostCardLoader = () => {
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);

  const shimmerColors = isDark
    ? ['#181920', '#1f2027', '#181920']
    : [colors.lightGrey, colors.lightGrey2, colors.lightGrey];

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      {/* Header Shimmer */}
      <View style={styles.header}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.avatar}
          LinearGradient={LinearGradient}
        />
        <View style={styles.userInfo}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 120, height: 16, borderRadius: 8, marginBottom: 6}}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 80, height: 12, borderRadius: 6}}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>

      {/* Image Shimmer */}
      <ShimmerPlaceholder
        shimmerColors={shimmerColors}
        style={styles.postImage}
        LinearGradient={LinearGradient}
      />

      {/* Content Shimmer */}
      <View style={styles.contentSection}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={{width: '100%', height: 14, borderRadius: 7, marginBottom: 8}}
          LinearGradient={LinearGradient}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={{width: '70%', height: 14, borderRadius: 7}}
          LinearGradient={LinearGradient}
        />
      </View>
    </View>
  );
};

// Extract styles to separate function with TypeScript interface
const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.backgroundColor,
      marginHorizontal: 16,
      marginVertical: 12,
      borderRadius: 30,

      borderWidth: 0.5,
      shadowRadius: 12,
      borderColor: colors.lightGrey,
      elevation: 25,
      overflow: 'hidden',
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,

      // shadowRadius: 3.84,
    },

    // Header Styles
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      justifyContent: 'space-between',
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    userInfo: {
      marginLeft: 12,
      flex: 1,
    },
    username: {
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    location: {
      fontSize: 13,
      fontWeight: '500',
    },
    dot: {
      fontSize: 13,
      marginHorizontal: 6,
    },
    time: {
      fontSize: 13,
    },
    verifiedBadge: {
      backgroundColor: '#4A90E2',
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 6,
    },
    verifiedText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: 'bold',
    },
    moreButton: {
      padding: 8,
    },

    // Image Styles
    imageContainer: {
      width: '100%',
    },
    imageWrapper: {
      width: '100%',
    },
    postImage: {
      width: '90%',
      height: wp('90%'),
      alignSelf: 'center',
      paddingVertical: 10,
      borderRadius: 15,
    },
    heartOverlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -40,
      marginTop: -40,
      zIndex: 10,
    },

    // Content Styles
    contentSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    reactionSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    reactionEmoji: {
      fontSize: 14,
    },
    reactionUser: {
      fontSize: 14,
      fontWeight: '600',
    },
    reactionText: {
      fontSize: 14,
    },
    contentText: {
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    contentUsername: {
      fontWeight: '600',
    },
    moreText: {
      fontWeight: '500',
    },

    // Action Bar Styles
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      // justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingTop: 8,
    },
    leftActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 20,
      alignSelf: 'center',
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
