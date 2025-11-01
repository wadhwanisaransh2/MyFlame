import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Alert,
} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigate, navigateBack} from '../../Utils/navigation';
import FastImage from 'react-native-fast-image';
import {ANIMATION, IMAGES} from '../../Assets';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {hp, width, wp} from '../../Utils/responsive';
import {useSelector} from 'react-redux';
import {showToast} from '../../Utils/general';
import {RootState} from '../../redux/Store';
import {LockSVG, ReportSVGAC} from '../../Assets/Images/SVGs/SettingsSVG';
import LinearGradient from 'react-native-linear-gradient';
import {
  ArchiveSVG,
  CloseSVG,
  EditSVGIcon,
  MoreSVG,
  ShareSVG,
  UnblockSVG,
} from '../../Assets/Images/SVGs/CommonSVG';
import {
  useAcceptFriendRequestMutation,
  useBlockUserMutation,
  useCancelFriendRequestMutation,
  useLazyGetUserPostsQuery,
  User,
  useRejectFriendRequestMutation,
  useRemoveFriendMutation,
  useSendFriendRequestMutation,
  useUnblockUserMutation,
} from '../../redux/api/profile';
import {
  useGetUserProfileQuery,
  useGetUserPostsQuery,
  useGetPendingUsersQuery,
  Post,
  ProfileResponse,
} from '../../redux/api/profile';
import {CustomBottomSheet} from '../../Components/BottomSheet/CustomBottomSheet';
import {BlockUser} from '../../Assets/Images/SVGs/PostSVG';
import ProfileSkeleton from '../../Components/Skeleton/ProfileSkeleton';
import {GallerySVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {ChatSVG, ReelsSVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import LottieView from 'lottie-react-native';
import DataNotFound from '../../Components/Layout/DataNotFound';
import ReportModal from '../../Components/Modals/ReportModal';
import {ReportType} from '../../Enum/enum';
import CheckSVG from '../../Assets/Images/SVGs/CheckSVG';
import {useFocusEffect} from '@react-navigation/native';
import { EyeOpenSVG } from '../../Assets/Images/SVGs/AuthSVG';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

type ProfileScreenProps = NativeStackScreenProps<ParamListBase & {
  ProfileScreen: {
    userId?: string;
    username?: string;
  };
}, 'ProfileScreen'>;

// Constants to avoid recreating on each render
const ANIMATION_CONFIG = {
  SCALE_DOWN: 0.95,
  DURATION: 100,
};

const GRID_CONFIG = {
  NUM_COLUMNS: 3,
  ITEM_SIZE: width / 3 - 8,
  MARGIN: 1,
};

const FAST_IMAGE_CONFIG = {
  priority: FastImage.priority.normal,
  cache: FastImage.cacheControl.immutable,
};

// Memoized Post Item Component
const PostItem = memo(
  ({
    item,
    index,
    onPress,
  }: {
    item: Post;
    index: number;
    onPress: (item: Post, index: number) => void;
  }) => {
    const handlePress = useCallback(() => {
      onPress(item, index);
    }, [item, index, onPress]);
    const {colors} = useTheme();

    return (
      <TouchableOpacity
        style={{padding: 3}}
        activeOpacity={0.7}
        onPress={handlePress}>
        <FastImage
          source={{uri: item.imageUrl}}
          style={[postItemStyles.image, item.type === 'reel' && {height: 200}]}
          {...FAST_IMAGE_CONFIG}
        />
        {item.type === 'reel' && <View style={{position: 'absolute', bottom: 10, right: 20, zIndex: 1000, flexDirection: 'row', alignItems: 'center', gap: 5}}>
          <EyeOpenSVG height={20} width={20} fill={colors.white} />
          <Text style={{color: colors.white, fontSize: 12, fontWeight: 'bold'}}>
            {item.views}
          </Text>
        </View>}
      </TouchableOpacity>
    );
  },
);

const postItemStyles = StyleSheet.create({
  image: {
    height: GRID_CONFIG.ITEM_SIZE,
    width: GRID_CONFIG.ITEM_SIZE,
    borderRadius: 15,
    // aspectRatio: 1,
    marginVertical: GRID_CONFIG.MARGIN,
    marginHorizontal: GRID_CONFIG.MARGIN,
  },
});

// Memoized Creative Button Component
const CreativeButton = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    icon,
    disabled = false,
    flex = 1,
    colors,
    scaleAnim,
  }: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
    icon?: React.ReactNode;
    disabled?: boolean;
    flex?: number;
    colors: ColorThemeInterface;
    scaleAnim: Animated.Value;
  }) => {
    const buttonStyles = useMemo(() => createButtonStyles(colors), [colors]);

    const getButtonStyle = useCallback(() => {
      switch (variant) {
        case 'primary':
          return [
            buttonStyles.creativeButton,
            buttonStyles.primaryCreativeButton,
          ];
        case 'secondary':
          return [
            buttonStyles.creativeButton,
            buttonStyles.secondaryCreativeButton,
          ];
        case 'outline':
          return [
            buttonStyles.creativeButton,
            buttonStyles.outlineCreativeButton,
          ];
        case 'gradient':
          return [
            buttonStyles.creativeButton,
            buttonStyles.gradientCreativeButton,
          ];
        default:
          return [
            buttonStyles.creativeButton,
            buttonStyles.primaryCreativeButton,
          ];
      }
    }, [variant, buttonStyles]);

    const getTextStyle = useCallback(() => {
      switch (variant) {
        case 'primary':
        case 'gradient':
          return buttonStyles.primaryButtonCreativeText;
        case 'secondary':
          return buttonStyles.secondaryButtonCreativeText;
        case 'outline':
          return buttonStyles.outlineButtonCreativeText;
        default:
          return buttonStyles.primaryButtonCreativeText;
      }
    }, [variant, buttonStyles]);

    const handleButtonPress = useCallback(() => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: ANIMATION_CONFIG.SCALE_DOWN,
          duration: ANIMATION_CONFIG.DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.DURATION,
          useNativeDriver: true,
        }),
      ]).start();
      onPress();
    }, [scaleAnim, onPress]);

    if (variant === 'gradient') {
      return (
        <Animated.View style={[{flex}, {transform: [{scale: scaleAnim}]}]}>
          <TouchableOpacity
            onPress={handleButtonPress}
            disabled={disabled}
            activeOpacity={0.8}>
            <View
              style={[
                buttonStyles.creativeButton,
                buttonStyles.gradientCreativeButton,
              ]}>
              {/* <LinearGradient
              colors={[colors.primaryColor, '#FF6B9D', '#C44EFF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={[
                buttonStyles.creativeButton,
                buttonStyles.gradientCreativeButton,
              ]}> */}
              {icon && <View style={buttonStyles.buttonIcon}>{icon}</View>}
              <Text style={getTextStyle()}>{title}</Text>
            </View>
            {/* </LinearGradient> */}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[{flex}, {transform: [{scale: scaleAnim}]}]}>
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={handleButtonPress}
          disabled={disabled}
          activeOpacity={0.8}>
          {icon && <View style={buttonStyles.buttonIcon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

// Memoized Top Profile Component
const TopProfile = memo(
  ({
    profileData,
    totalPosts,
    isPrivate,
    isMyProfile,
    friendShipStatus,
    profileId,
    colors,
    scaleAnim,
    onAddFriend,
    onMessagePress,
    onEditProfile,
    onAddPost,
    onMorePress,
    sendingRequest,
    onUnblockPress,
    onAcceptAndRejectFriendRequest,
  }: {
    profileData: ProfileResponse | null;
    totalPosts: number;
    isPrivate: boolean;
    isMyProfile: boolean;
    friendShipStatus: string;
    profileId: string;
    colors: ColorThemeInterface;
    scaleAnim: Animated.Value;
    onAddFriend: () => void;
    onMessagePress: () => void;
    onEditProfile: () => void;
    onAddPost: () => void;
    onMorePress: () => void;
    sendingRequest: boolean;
    onUnblockPress: () => void;
    onAcceptAndRejectFriendRequest: (status: string) => void;
  }) => {
    const style = useMemo(() => makeStyles(colors), [colors]);
    const profileImageSource = useMemo(
      () =>
        profileData?.user?.profilePicture
          ? {uri: profileData.user.profilePicture}
          : IMAGES.userImage,
      [profileData?.user?.profilePicture],
    );

    const fullName = useMemo(
      () =>
        `${profileData?.user?.firstName || ''} ${
          profileData?.user?.lastName || ''
        }`,
      [profileData?.user?.firstName, profileData?.user?.lastName],
    );

    const buttonTitle = useMemo(() => {
      switch (friendShipStatus) {
        case 'none':
          return 'Flama';
        case 'pending_sent':
          return 'Cancel';
        case 'accepted':
          return 'Unflama';
        default:
          return 'Dont Know';
      }
    }, [friendShipStatus]);

    const onFollowersPress = useCallback(() => {
      if (!isPrivate) {
        navigate('FollowerersFollowingScreen', {
          userId: profileData?.user?._id,
          username: profileData?.user?.username,
        });
      }
    }, [isPrivate, profileData?.user?._id, profileData?.user?.username]);

    return (
      <View style={style.profileHeaderContainer}>
        <View style={style.MainprofileImageContainer}>
          {/* Stats Container */}
          <View style={style.statsContainer}>
            <Pressable onPress={onFollowersPress} style={style.statItem}>
              <Text style={style.statValue}>{profileData?.friendsCount}</Text>
              <Text style={style.statLabel}>Flama's</Text>
            </Pressable>

            <FastImage
              source={profileImageSource}
              style={[style.profileImage]}
              {...FAST_IMAGE_CONFIG}
            />
            <View style={style.statItem}>
              <Text style={style.statValue}>{totalPosts}</Text>
              <Text style={style.statLabel}>Posts</Text>
            </View>
          </View>

          {/* Achievements */}
          {!profileData?.isBlocked && (
            <View style={style.achievementsContainer}>
              {true && (
                <View style={style.achievementItem}>
                  <Text style={style.achievementLabel}>Rank</Text>
                  <View style={style.achievementIconContainer}>
                    <Image
                      source={IMAGES.Chart}
                      style={style.achievementIcon}
                    />
                  </View>
                  <Text style={style.achievementValue}>
                    {profileData?.rank}
                  </Text>
                </View>
              )}
              {true && (
                <View style={style.achievementItem}>
                  <Text style={style.achievementLabel}>Event Won</Text>
                  <View style={style.achievementIconContainer}>
                    <Image
                      source={IMAGES.Event}
                      style={style.achievementIcon}
                    />
                  </View>
                  <Text style={style.achievementValue}>
                    {profileData?.eventWon || 0}
                  </Text>
                </View>
              )}
              {true && (
                <View style={[style.achievementItem]}>
                  <Text style={style.achievementLabel}>Total Coins</Text>
                  <View style={style.achievementIconContainer}>
                    <Image
                      source={IMAGES.Coins}
                      resizeMode="contain"
                      style={style.achievementIcon}
                    />
                  </View>
                  <Text style={style.achievementValue}>
                    {profileData?.user?.coins || 0}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Username and Bio */}
          <View style={style.userInfoContainer}>
            <Text style={style.username}>
              @{profileData?.user?.username || ''}
            </Text>
            <Text style={style.bio}>
              {fullName}
              {profileData?.user?.bio && (
                <Text style={style.bio}> : {profileData?.user?.bio}</Text>
              )}
            </Text>
          </View>

          {/* Action Buttons */}
          {!profileData?.isBlocked && (
            <View style={style.actionButtonsContainer}>
              {!isMyProfile ? (
                <>
                  {friendShipStatus !== 'pending_received' && (
                    <CreativeButton
                      title={buttonTitle}
                      onPress={onAddFriend}
                      variant={
                        friendShipStatus === 'none' ? 'gradient' : 'outline'
                      }
                      disabled={sendingRequest}
                      colors={colors}
                      scaleAnim={scaleAnim}
                    />
                  )}

                  {friendShipStatus === 'pending_received' && (
                    <CreativeButton
                      title="Accept"
                      onPress={() => onAcceptAndRejectFriendRequest('accept')}
                      variant="primary"
                      colors={colors}
                      scaleAnim={scaleAnim}
                      icon={
                        <View style={style.editIcon}>
                          <CheckSVG
                            width={15}
                            height={15}
                            fill={colors.white}
                          />
                        </View>
                      }
                    />
                  )}

                  {friendShipStatus === 'pending_received' && (
                    <CreativeButton
                      title="Reject"
                      onPress={() => onAcceptAndRejectFriendRequest('reject')}
                      variant="primary"
                      colors={colors}
                      scaleAnim={scaleAnim}
                      icon={
                        <View style={style.editIcon}>
                          <CloseSVG
                            width={15}
                            height={15}
                            fill={colors.white}
                          />
                        </View>
                      }
                    />
                  )}

                  {/* {!isPrivate && friendShipStatus === 'pending_received' && (
                    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
                      <TouchableOpacity
                        onPress={onMessagePress}
                        style={style.creativeMoreButton}>
                        <LinearGradient
                          colors={['#667eea', '#764ba2']}
                          start={{x: 0, y: 0}}
                          end={{x: 1, y: 1}}
                          style={style.moreButtonGradient}>
                          <ChatSVG width={20} height={20} fill={colors.white} />
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  )} */}

                  {!isPrivate && friendShipStatus !== 'pending_received' && (
                    <CreativeButton
                      title="Message"
                      onPress={onMessagePress}
                      // variant="outline"
                      icon={
                        <View style={style.messageIcon}>
                          <ChatSVG width={15} height={15} fill={colors.white} />
                        </View>
                      }
                      colors={colors}
                      scaleAnim={scaleAnim}
                    />
                  )}
                </>
              ) : (
                <>
                  <CreativeButton
                    title="Edit Profile"
                    onPress={onEditProfile}
                    variant="primary"
                    icon={
                      <View style={style.editIcon}>
                        <EditSVGIcon
                          width={15}
                          height={15}
                          fill={colors.white}
                        />
                      </View>
                    }
                    colors={colors}
                    scaleAnim={scaleAnim}
                  />

                  {/* <CreativeButton
                    title="Add Post"
                    onPress={onAddPost}
                    variant="gradient"
                    icon={
                      <View style={style.editIcon}>
                        <GallerySVG
                          width={15}
                          height={15}
                          fill={colors.white}
                        />
                      </View>
                    }
                    colors={colors}
                    scaleAnim={scaleAnim}
                  /> */}
                </>
              )}

              <Animated.View style={{transform: [{scale: scaleAnim}]}}>
                <TouchableOpacity
                  onPress={onMorePress}
                  style={style.creativeMoreButton}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={style.moreButtonGradient}>
                    <MoreSVG width={20} height={20} fill={colors.white} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {profileData?.isBlocked && (
            <View
              style={{
                flex: 1,
                paddingHorizontal: wp('10'),
                marginTop: hp('5'),
              }}>
              <CreativeButton
                title="Unblock"
                onPress={onUnblockPress}
                variant="primary"
                icon={
                  <View style={style.editIcon}>
                    <UnblockSVG width={15} height={15} fill={colors.white} />
                  </View>
                }
                colors={colors}
                scaleAnim={scaleAnim}
              />
            </View>
          )}
        </View>
      </View>
    );
  },
);

// Memoized Empty List Component
const EmptyListComponent = memo(
  ({colors, type}: {colors: ColorThemeInterface; type: 'post' | 'reel'}) => {
    const style = useMemo(
      () => ({
        emptyContainer: {
          flex: 1,
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          backgroundColor: colors.profileColor,
          // marginTop: hp('10%'),
        },
        emptyText: {
          fontSize: fontSize.f16,
          color: colors.primaryColor,
        },
      }),
      [colors],
    );

    return (
      <View style={style.emptyContainer}>
        <LottieView
          source={ANIMATION.Splash}
          autoPlay
          loop
          style={{width: 100, height: 100}}
        />
        <Text style={style.emptyText}>
          No {type === 'reel' ? 'Clips' : 'Posts'} Available
        </Text>
      </View>
    );
  },
);

// Memoized Modal Component
const ActionModal = memo(
  ({
    visible,
    onClose,
    isMyProfile,
    colors,
    profileData,
    onArchivePress,
    onBlockPress,
    onBlockListPress,
    onReportPress,
  }: {
    visible: boolean;
    onClose: () => void;
    isMyProfile: boolean;
    colors: ColorThemeInterface;
    profileData: ProfileResponse | null;
    onArchivePress: () => void;
    onBlockPress: () => void;
    onBlockListPress: () => void;
    onReportPress: () => void;
  }) => {
    const modalStyles = useMemo(() => createModalStyles(colors), [colors]);

    return (
      <Modal
        visible={visible}
        transparent={true}
        statusBarTranslucent={true}
        animationType="fade"
        onRequestClose={onClose}>
        <Pressable style={modalStyles.modalOverlay} onPress={onClose}>
          <Pressable
            style={[
              modalStyles.modalContent,
              {backgroundColor: colors.inputBackground},
            ]}
            onPress={e => e.stopPropagation()}>
            {isMyProfile && (
              <TouchableOpacity
                style={modalStyles.actionButton}
                onPress={onArchivePress}>
                <ArchiveSVG width={24} height={24} fill={colors.primaryColor} />
                <View style={modalStyles.actionTextContainer}>
                  <Text style={modalStyles.actionTitle}>Archive Posts</Text>
                  <Text style={modalStyles.actionSubtitle}>
                    View all archived posts
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {!isMyProfile ? (
              <View>
                <TouchableOpacity
                  style={modalStyles.actionButton}
                  onPress={onBlockPress}>
                  <BlockUser
                    width={24}
                    height={24}
                    fill={colors.primaryColor}
                  />
                  <View style={modalStyles.actionTextContainer}>
                    <Text style={modalStyles.actionTitle}>Block User</Text>
                    <Text style={modalStyles.actionSubtitle}>
                      Restrict this account
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={modalStyles.actionButton}
                  onPress={onReportPress}>
                  <BlockUser
                    width={24}
                    height={24}
                    fill={colors.primaryColor}
                  />
                  <View style={modalStyles.actionTextContainer}>
                    <Text style={modalStyles.actionTitle}>Report profile</Text>
                    <Text style={modalStyles.actionSubtitle}>
                      Report this account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={modalStyles.actionButton}
                onPress={onBlockListPress}>
                <BlockUser width={24} height={24} fill={colors.primaryColor} />
                <View style={modalStyles.actionTextContainer}>
                  <Text style={modalStyles.actionTitle}>Block User List</Text>
                  <Text style={modalStyles.actionSubtitle}>
                    View all blocked users
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    );
  },
);

function ProfileScreen({route}: ProfileScreenProps) {
  const {colors, isDark} = useTheme();
  const style = useMemo(() => makeStyles(colors), [colors]);

  const {userId, username} = route.params;
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const [showReportModal, setShowReportModal] = useState(false);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [friendShipStatus, setFriendShipStatus] = useState('none');
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [profileErrorData, setProfileErrorData] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'post', title: 'Posts', icon: 'gallery'},
    {key: 'reel', title: 'Clips', icon: 'reels'},
  ]);

  // Separate state for posts and reels
  const [postPage, setPostPage] = useState(1);
  const [reelPage, setReelPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allReels, setAllReels] = useState<Post[]>([]);
  const [friendRequestID, setFriendRequestID] = useState('');

  // RTK Query hooks
  const profileId = useMemo(
    () => userId || profile?._id,
    [userId, profile?._id],
  );

  const {
    data: profileDataResponse,
    isLoading: profileLoading,
    refetch: refetchProfile,
    error: profileError,
  } = useGetUserProfileQuery(profileId, {
    pollingInterval: 0,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
    }, []),
  );

  useEffect(() => {
    if (profileError) {
      setProfileErrorData(true);
    }
  }, [profileError]);

  useEffect(() => {
    if (profileDataResponse) {
      setProfileData(profileDataResponse);
      setIsBlocked(profileDataResponse?.isBlocked);
      setFriendRequestID(profileDataResponse?.friendRequestID ?? '');
    }
  }, [profileDataResponse]);

  // Separate queries for posts and reels
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetUserPostsQuery({page: postPage, userId: profileId, type: 'post'});

  const {
    data: reelsData,
    isLoading: reelsLoading,
    refetch: refetchReels,
  } = useGetUserPostsQuery({page: reelPage, userId: profileId, type: 'reel'});

  const [sendFriendRequest, {isLoading: sendingRequest}] =
    useSendFriendRequestMutation();
  const [removeFriend, {isLoading: removingFriend}] = useRemoveFriendMutation();
  const [blockUser, {isLoading: blockingUser}] = useBlockUserMutation();
  const [unblockUser, {isLoading: unblockingUser}] = useUnblockUserMutation();
  const [cancelFriendRequest, {isLoading: cancelingFriendRequest}] =
    useCancelFriendRequestMutation();

  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();

  // Derived state with memoization
  const derivedState = useMemo(
    () => ({
      isMyProfile: profileData?.user?._id === profile?._id,
      isFriend: profileData?.isFriend,
      totalPosts: (postsData?.total || 0) + (reelsData?.total || 0),
      postsTotal: postsData?.total || 0,
      reelsTotal: reelsData?.total || 0,
    }),
    [
      profileData?.user?._id,
      profile?._id,
      profileData?.isFriend,
      postsData?.total,
      reelsData?.total,
    ],
  );

  const isPrivate = useMemo(
    () =>
      profileData?.user?.privacy === 'private' &&
      !derivedState.isFriend &&
      profileData?.user?._id !== profile?._id,
    [
      profileData?.user?.privacySettings?.profileVisibility,
      derivedState.isFriend,
      profileData?.user?._id,
      profile?._id,
    ],
  );

  useEffect(() => {
    if (profileData) {
      setFriendShipStatus(profileData?.friendStatus);
    }
  }, [profileData]);

  // Update posts when data changes
  useEffect(() => {
    if (postsData?.items) {
      if (postPage === 1) {
        setAllPosts(postsData.items);
      } else {
        setAllPosts(prev => [...prev, ...postsData.items]);
      }
    }
  }, [postsData, postPage]);

  // Update reels when data changes
  useEffect(() => {
    if (reelsData?.items) {
      if (reelPage === 1) {
        setAllReels(reelsData.items);
      } else {
        setAllReels(prev => [...prev, ...reelsData.items]);
      }
    }
  }, [reelsData, reelPage]);

  useFocusEffect(
    useCallback(() => {
      refetchPosts();
      refetchReels();
    }, []),
  );

  // Memoized callbacks
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchPosts(), refetchReels()]);
    setRefreshing(false);
  }, [refetchProfile, refetchPosts, refetchReels]);

  const handlePostsLoadMore = useCallback(() => {
    if (postPage < (postsData?.totalPage || 0) && !postsLoading) {
      setPostPage(postPage + 1);
    }
  }, [postPage, postsData?.totalPage, postsLoading]);

  const handleReelsLoadMore = useCallback(() => {
    if (reelPage < (reelsData?.totalPage || 0) && !reelsLoading) {
      setReelPage(reelPage + 1);
    }
  }, [reelPage, reelsData?.totalPage, reelsLoading]);

  const handleAddFriend = useCallback(async () => {
    if (friendShipStatus === 'accepted') {
      await removeFriend({userId: profileId});
      setFriendShipStatus('none');
    } else if (friendShipStatus === 'none') {
      try {
        if (profileData?.user?.username) {
          await sendFriendRequest({username: profileData.user.username});
          setFriendShipStatus('pending_sent');
        }
      } catch (error) {
        showToast('Failed to send friend request');
      }
    } else if (friendShipStatus === 'pending_sent') {
      await cancelFriendRequest({receiverId: profileId});
      setFriendShipStatus('none');
    }
  }, [
    friendShipStatus,
    removeFriend,
    profileId,
    profileData?.user?.username,
    sendFriendRequest,
    cancelFriendRequest,
  ]);

  const handleAcceptAndRejectFriendRequest = useCallback(
    async (status: string) => {
      if (friendRequestID) {
        if (status === 'accept') {
          await acceptFriendRequest({
            friendRequestId: profileData?.friendRequestID ?? '',
          })
            .unwrap()
            .then(() => {
              showToast('Friend request accepted');
              setFriendShipStatus('accepted');
            })
            .catch(error => {
              showToast('Failed to accept friend request');
            });
          showToast('Friend request accepted');
          setFriendShipStatus('accepted');
        } else if (status === 'reject') {
          await rejectFriendRequest({
            friendRequestId: profileData?.friendRequestID ?? '',
          })
            .unwrap()
            .then(() => {
              showToast('Friend request rejected');
              setFriendShipStatus('none');
            })
            .catch(error => {
              showToast('Failed to reject friend request');
            });
        }
        refetchProfile();
      } else {
        showToast('No friend request found');
      }
    },
    [acceptFriendRequest, rejectFriendRequest, friendRequestID],
  );

  const handleBlock = useCallback(async () => {
    try {
      await blockUser({userId: profileId});
      showToast('User blocked successfully');
    } catch (error) {
      showToast('Failed to block user');
    }
  }, [blockUser, profileId]);

  const handleUnblock = () => {
    const text =
      profileData?.user?.firstName && profileData?.user?.lastName
        ? `${profileData?.user?.firstName} ${profileData?.user?.lastName}`
        : 'this user';
    Alert.alert('Unblock User', `Are you sure you want to unblock ${text}?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Unblock',
        style: 'destructive',
        onPress: async () => {
          try {
            await unblockUser({userId: profileId}).unwrap();
            setIsBlocked(false);
            showToast('User unblocked successfully');
            refetchProfile();
          } catch (error) {
            showToast('Failed to unblock user');
          }
        },
      },
    ]);
  };

  const handlePostPress = useCallback(
    (item: Post, itemIndex: number, isReel: boolean = false) => {
      if (isReel) {
        navigate('MyShortsFeed', {
          short: item,
          user: {
            _id: profileData?.user?._id,
            username: profileData?.user?.username,
            firstName: profileData?.user?.firstName,
            lastName: profileData?.user?.lastName,
            profilePicture: profileData?.user?.profilePicture,
          },
        });
      } else {
        navigate('PostListScreen', {
          posts: allPosts,
          index: itemIndex,
          page: postPage,
          totalPages: postsData?.totalPage || 0,
          username: profileData?.user?.username,
          userId: profileData?.user?._id,
          userPicture: profileData?.user?.profilePicture,
          isMyProfile: derivedState.isMyProfile,
          fullName:
            profileData?.user?.firstName + ' ' + profileData?.user?.lastName,
        });
      }
    },
    [
      allPosts,
      postPage,
      postsData?.totalPage,
      profileData?.user?.username,
      profileData?.user?._id,
      profileData?.user?.profilePicture,
      derivedState.isMyProfile,
      profileData?.user?.firstName,
      profileData?.user?.lastName,
    ],
  );

  // Animation ref
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Memoized navigation callbacks
  const onBackPress = useCallback(() => navigateBack(), []);
  const headerTitle = useMemo(
    () => username || profileData?.user?.username || '',
    [username, profileData?.user?.username],
  );
  const onModalClose = useCallback(() => setIsCommentSheetOpen(false), []);

  // Memoized handlers for TopProfile
  const topProfileHandlers = useMemo(
    () => ({
      onAddFriend: handleAddFriend,
      onAcceptAndRejectFriendRequest: handleAcceptAndRejectFriendRequest,
      onMessagePress: () => {
        const conversationId = (profileData as any).conversationId || '';
        if (profileData) {
          navigate('ChatScreen', {
            friendId: profileData.user._id,
            friendUsername: profileData.user.username,
            conversationId,
          });
        }
      },
      onEditProfile: () => navigate('EditProfile'),
      onAddPost: () => navigate('BottomTab', {screen: 'AddPostScreen'}),
      onMorePress: () => setIsCommentSheetOpen(true),
      onUnblockPress: () => handleUnblock(),
    }),
    [
      handleAddFriend,
      profileId,
      profileData?.user?.username,
      profileData?.user?.profilePicture,
      handleUnblock,
      handleAcceptAndRejectFriendRequest,
    ],
  );

  // Memoized modal handlers
  const modalHandlers = useMemo(
    () => ({
      onArchivePress: () => {
        setIsCommentSheetOpen(false);
        navigate('ArchivePostList', {
          username: profileData?.user?.username,
          userId: profileData?.user?._id,
          userPicture: profileData?.user?.profilePicture,
          fullName:
            profileData?.user?.firstName + ' ' + profileData?.user?.lastName,
        });
      },
      onBlockPress: () => {
        setIsCommentSheetOpen(false);
        handleBlock();
      },
      onBlockListPress: () => {
        setIsCommentSheetOpen(false);
        navigate('BlockUserListScreen');
      },
    }),
    [
      profileData?.user?.username,
      profileData?.user?._id,
      profileData?.user?.profilePicture,
      profileData?.user?.firstName,
      profileData?.user?.lastName,
      handleBlock,
    ],
  );

  const keyExtractor = useCallback(
    (item: Post, index: number) => item._id || index.toString(),
    [],
  );

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: GRID_CONFIG.ITEM_SIZE,
      offset:
        GRID_CONFIG.ITEM_SIZE * Math.floor(index / GRID_CONFIG.NUM_COLUMNS),
      index,
    }),
    [],
  );

  // Render functions for Posts
  const renderPostItem = useCallback(
    ({item, index}: {item: Post; index: number}) => (
      <PostItem
        item={item}
        index={index}
        onPress={(item, index) => handlePostPress(item, index, false)}
      />
    ),
    [handlePostPress],
  );

  // Render functions for Reels
  const renderReelItem = useCallback(
    ({item, index}: {item: Post; index: number}) => (
      <PostItem
        item={item}
        index={index}
        onPress={(item, index) => handlePostPress(item, index, true)}
      />
    ),
    [handlePostPress],
  );

  // Posts Tab Scene
  const PostsScene = useCallback(
    () => (
      <FlatList
        data={allPosts}
        renderItem={renderPostItem}
        ListEmptyComponent={<EmptyListComponent colors={colors} type="post" />}
        keyExtractor={keyExtractor}
        numColumns={GRID_CONFIG.NUM_COLUMNS}
        contentContainerStyle={{flex: allPosts.length ? undefined : 1}}
        onEndReached={handlePostsLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          postsLoading && postPage > 1 ? (
            <ActivityIndicator size="small" color={colors.primaryColor} />
          ) : null
        }
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={8}
        initialNumToRender={6}
        showsVerticalScrollIndicator={false}
      />
    ),
    [
      allPosts,
      renderPostItem,
      colors,
      keyExtractor,
      handlePostsLoadMore,
      postsLoading,
      postPage,
      getItemLayout,
    ],
  );

  // Reels Tab Scene
  const ReelsScene = useCallback(
    () => (
      <FlatList
        data={allReels}
        renderItem={renderReelItem}
        ListEmptyComponent={<EmptyListComponent colors={colors} type="reel" />}
        keyExtractor={keyExtractor}
        numColumns={GRID_CONFIG.NUM_COLUMNS}
        contentContainerStyle={{flex: allReels.length ? undefined : 1}}
        onEndReached={handleReelsLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          reelsLoading && reelPage > 1 ? (
            <ActivityIndicator size="small" color={colors.primaryColor} />
          ) : null
        }
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        windowSize={8}
        initialNumToRender={6}
        showsVerticalScrollIndicator={false}
      />
    ),
    [
      allReels,
      renderReelItem,
      colors,
      keyExtractor,
      handleReelsLoadMore,
      reelsLoading,
      reelPage,
      getItemLayout,
    ],
  );

  // TabView render scenes
  const renderTabScene = useCallback(
    ({route}: {route: {key: string; title: string}}) => {
      return route.key === 'post' ? <PostsScene /> : <ReelsScene />;
    },
    [PostsScene, ReelsScene],
  );

  // Custom TabBar component
  const renderTabBar = useCallback(
    (props: any) => (
      <TabBar
        {...props}
        indicatorStyle={{
          backgroundColor: colors.primaryColor,
          height: 2,
        }}
        style={{
          backgroundColor: colors.profileColor,
          borderBottomWidth: 1,
          borderBottomColor: colors.inputBackground,
        }}
        labelStyle={{
          fontSize: fontSize.f14,
          fontWeight: '500',
          textTransform: 'none',
        }}
        activeColor={colors.black}
        inactiveColor={colors.grey}
        renderIcon={({route, focused}: {route: any; focused: boolean}) => {
          const iconProps = {
            width: 20,
            height: 20,
            fill: focused ? colors.black : colors.grey,
          };

          return route.key === 'post' ? (
            <GallerySVG {...iconProps} />
          ) : (
            <ReelsSVG {...iconProps} />
          );
        }}
        renderLabel={({route, focused}: {route: any; focused: boolean}) => (
          <Text
            style={{
              color: focused ? colors.black : colors.grey,
              fontSize: fontSize.f14,
              fontWeight: focused ? '500' : '400',
              marginLeft: 8,
            }}>
            {route.title}
          </Text>
        )}
      />
    ),
    [colors],
  );

  // Main render
  const isLoading =
    profileLoading ||
    (postPage === 1 && postsLoading) ||
    (reelPage === 1 && reelsLoading);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={handleRefresh}
        tintColor={colors.primaryColor}
        progressBackgroundColor={colors.backgroundColor}
        colors={[colors.primaryColor]}
      />
    ),
    [refreshing, handleRefresh, colors.primaryColor, colors.backgroundColor],
  );

  const headerComponent = useMemo(
    () => (
      <TopProfile
        profileData={profileData}
        totalPosts={derivedState.totalPosts}
        isPrivate={isPrivate}
        isMyProfile={derivedState.isMyProfile}
        friendShipStatus={friendShipStatus}
        profileId={profileId}
        colors={colors}
        scaleAnim={scaleAnim}
        sendingRequest={sendingRequest}
        {...topProfileHandlers}
      />
    ),
    [
      profileData,
      derivedState.totalPosts,
      isPrivate,
      derivedState.isMyProfile,
      friendShipStatus,
      profileId,
      colors,
      scaleAnim,
      sendingRequest,
      topProfileHandlers,
    ],
  );

  if (profileErrorData) {
    return (
      <View style={style.container}>
        <CustomHeader
          title={headerTitle}
          onBackPress={onBackPress}
          ShowSetting={true}
        />
        <DataNotFound
          title="Error fetching profile data"
          subtitle={(profileError as any)?.message}
          OnRefresh={handleRefresh}
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={style.container}>
        <CustomHeader
          title={headerTitle}
          onBackPress={onBackPress}
          ShowSetting={true}
        />
        <ProfileSkeleton />
      </View>
    );
  }

  if (isPrivate) {
    return (
      <View style={style.container}>
        <CustomHeader
          title={headerTitle}
          onBackPress={onBackPress}
          ShowSetting={true}
        />
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          refreshControl={refreshControl}>
          {headerComponent}
          <View style={style.privateContainer}>
            <View style={style.lockContainer}>
              <LockSVG width={60} height={60} fill={colors.grey} />
            </View>
            <Text style={style.privateText}>This profile is private</Text>
          </View>
        </ScrollView>

        <ActionModal
          visible={isCommentSheetOpen}
          onClose={onModalClose}
          isMyProfile={derivedState.isMyProfile}
          colors={colors}
          profileData={profileData}
          onReportPress={() => setShowReportModal(true)}
          {...modalHandlers}
        />

        <ReportModal
          visible={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportType={ReportType.PROFILE}
          id={profileId}
        />
      </View>
    );
  }

  return (
    <View style={style.container}>
      <CustomHeader
        title={headerTitle}
        onBackPress={onBackPress}
        ShowSetting={true}
      />
      <ScrollView
        refreshControl={refreshControl}
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}>
        {headerComponent}
        {!isPrivate && (
          <View style={{flex: 1, minHeight: hp('50%')}}>
            <TabView
              navigationState={{index, routes}}
              renderScene={renderTabScene}
              renderTabBar={renderTabBar}
              onIndexChange={setIndex}
              initialLayout={{width}}
            />
          </View>
        )}
      </ScrollView>
      <ActionModal
        visible={isCommentSheetOpen}
        onClose={onModalClose}
        isMyProfile={derivedState.isMyProfile}
        colors={colors}
        profileData={profileData}
        onReportPress={() => setShowReportModal(true)}
        {...modalHandlers}
      />
      {/* Report Modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportType={ReportType.PROFILE}
        id={profileId}
      />
    </View>
  );
}

// Button styles factory
const createButtonStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    creativeButton: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      backgroundColor: colors.primaryColor,
    },
    primaryCreativeButton: {
      backgroundColor: colors.primaryColor,
    },
    secondaryCreativeButton: {
      backgroundColor: '#4A90E2',
    },
    outlineCreativeButton: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primaryColor,
    },
    gradientCreativeButton: {},
    primaryButtonCreativeText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: fontSize.f14,
      textAlign: 'center',
    },
    secondaryButtonCreativeText: {
      color: colors.white,
      fontWeight: '600',
      fontSize: fontSize.f14,
      textAlign: 'center',
    },
    outlineButtonCreativeText: {
      color: colors.primaryColor,
      fontWeight: '600',
      fontSize: fontSize.f14,
      textAlign: 'center',
    },
    buttonIcon: {
      marginRight: 8,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

// Modal styles factory
const createModalStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(220, 147, 147, 0.1)',
    },
    actionTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    actionTitle: {
      fontSize: fontSize.f16,
      color: colors.primaryColor,
      fontWeight: '500',
    },
    actionSubtitle: {
      fontSize: fontSize.f14,
      color: colors.grey,
      marginTop: 2,
    },
  });

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    MainprofileImageContainer: {
      backgroundColor: colors.profileColor,
      marginTop: hp('10%'),
      borderTopStartRadius: 60,
      borderTopEndRadius: 60,
    },
    profileHeaderContainer: {
      backgroundColor: colors.white,
    },
    profileImageContainer: {
      alignItems: 'center',
      marginTop: 15,
    },
    profileImage: {
      width: wp('30%'),
      height: wp('30%'),
      borderRadius: wp('15%'),
      borderWidth: 10,
      borderColor: colors.white,
      position: 'relative',
      top: -hp('10%'),
      alignSelf: 'center',
      zIndex: 1,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingHorizontal: 30,
      borderRadius: 15,
      marginHorizontal: 20,
      paddingVertical: 5,
    },
    statItem: {
      alignItems: 'center',
      width: wp('18%'),
    },
    statValue: {
      fontSize: fontSize.f22,
      fontWeight: '600',
      color: colors.black,
    },
    statLabel: {
      fontSize: fontSize.f14,
      color: colors.primaryColor,
    },
    achievementsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -hp('5%'),
      paddingHorizontal: 30,
    },
    achievementItem: {
      alignItems: 'center',
      width: wp('25%'),
      marginVertical: 10,
    },
    achievementLabel: {
      fontSize: fontSize.f14,
      color: colors.grey,
    },
    achievementIconContainer: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 5,
    },
    achievementIcon: {
      width: 40,
      height: 40,
      tintColor: colors.primaryColor,
    },
    achievementValue: {
      fontSize: fontSize.f16,
      fontWeight: '500',
      color: colors.primaryColor,
    },
    userInfoContainer: {
      alignItems: 'center',
      marginTop: 15,
      paddingHorizontal: 20,
    },
    username: {
      fontSize: fontSize.f20,
      fontWeight: '600',
      color: colors.black,
    },
    bio: {
      fontSize: fontSize.f14,
      color: colors.grey,
      textAlign: 'center',
      marginTop: 5,
      marginHorizontal: 20,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: 20,
    },
    messageIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    creativeMoreButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    moreButtonGradient: {
      width: '100%',
      height: '100%',
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',

      borderBottomWidth: 1,
      borderBottomColor: colors.inputBackground,
      backgroundColor: colors.profileColor,
    },
    tabButton: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    activeTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: colors.primaryColor,
    },
    tabText: {
      fontSize: fontSize.f14,
      color: colors.grey,
    },
    activeTabText: {
      color: colors.black,
      fontWeight: '500',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: fontSize.f16,
      color: colors.primaryColor,
    },
    privateContainer: {
      height: hp('30%'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    lockContainer: {
      borderRadius: 50,
      overflow: 'hidden',
      width: 100,
      height: 100,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.grey,
      borderWidth: 1,
    },
    privateText: {
      fontSize: fontSize.f14,
      color: colors.grey,
      marginTop: 10,
      textAlign: 'center'
    }
  });

export default ProfileScreen;