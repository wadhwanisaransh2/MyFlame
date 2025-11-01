import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import React, {useState, useRef, useEffect} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {fontSize} from '../../Utils/fontIcon';
import {hp, wp} from '../../Utils/responsive';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {
  useGetBlockListQuery,
  useUnblockUserMutation,
  User,
} from '../../redux/api/profile';
import {showToast} from '../../Utils/general';
import LinearGradient from 'react-native-linear-gradient';
import {UnblockSVG, ShieldCheckSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {BlockUser} from '../../Assets/Images/SVGs/PostSVG';

export default function BlockUserListScreen() {
  const {colors} = useTheme();
  const style = makeStyles(colors);
  const {profile} = useSelector((state: RootState) => state.AuthManager);

  // State management
  const [page, setPage] = useState(1);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // RTK Query hooks
  const {
    data: blockListData,
    isLoading,
    refetch,
    error,
  } = useGetBlockListQuery({userId: profile?._id || '', page});

  const [unblockUser, {isLoading: unblockingUser}] = useUnblockUserMutation();

  // Update blocked users when data changes
  useEffect(() => {
    if (blockListData?.blockedUsers) {
      if (page === 1) {
        setBlockedUsers(blockListData.blockedUsers);
      } else {
        setBlockedUsers(prev => [...prev, ...blockListData.blockedUsers]);
      }
    }
  }, [blockListData]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (
      blockListData?.totalPages &&
      page < blockListData.totalPages &&
      !isLoading
    ) {
      setPage(page + 1);
    }
  };

  // Handle unblock user
  const handleUnblock = (user: User) => {
    const text =
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
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
            await unblockUser({userId: user._id}).unwrap();
            setBlockedUsers(prev => prev.filter(u => u._id !== user._id));
            showToast('User unblocked successfully');
          } catch (error) {
            showToast('Failed to unblock user');
          }
        },
      },
    ]);
  };

  // Creative User Card Component
  const BlockedUserCard = ({item, index}: {item: User; index: number}) => {
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View
        style={[
          style.userCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(220, 53, 69, 0.05)']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={style.cardGradient}>
          {/* User Info Section */}
          <View style={style.userInfoSection}>
            <View style={style.avatarContainer}>
              <FastImage
                source={
                  item.profilePicture
                    ? {uri: item.profilePicture}
                    : IMAGES.userImage
                }
                style={style.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={style.blockedBadge}>
                <BlockUser width={12} height={12} fill={colors.white} />
              </View>
            </View>

            <View style={style.userDetails}>
              <Text style={style.userName}>
                <Text style={style.username}>@{item.username}</Text>
              </Text>

              <View style={style.statusContainer}>
                <View style={style.statusDot} />
                <Text style={style.statusText}>Blocked</Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={style.unblockButton}
            onPress={() => handleUnblock(item)}
            disabled={unblockingUser}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={style.unblockGradient}>
              {unblockingUser ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <UnblockSVG width={16} height={16} fill={colors.white} />
                  <Text style={style.unblockText}>Unblock</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <Animated.View
      style={[
        style.emptyContainer,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <View style={style.emptyIconContainer}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={style.emptyIconGradient}>
          <ShieldCheckSVG width={60} height={60} fill={colors.white} />
        </LinearGradient>
      </View>
      <Text style={style.emptyTitle}>No Blocked Users</Text>
      <Text style={style.emptySubtitle}>
        You haven't blocked anyone yet. When you block users, they'll appear
        here.
      </Text>
    </Animated.View>
  );

  // Loading state
  if (isLoading && page === 1) {
    return (
      <View style={style.container}>
        <CustomHeader
          title="Blocked Users"
          onBackPress={() => navigateBack()}
        />
        <View style={style.loadingContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={style.loadingGradient}>
            <ActivityIndicator size="large" color={colors.white} />
          </LinearGradient>
          <Text style={style.loadingText}>Loading blocked users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={style.container}>
      <CustomHeader title="Blocked Users" onBackPress={() => navigateBack()} />

      <Animated.View
        style={[
          style.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        {/* User List */}
        <FlatList
          data={blockedUsers}
          renderItem={({item, index}) => (
            <BlockedUserCard item={item} index={index} />
          )}
          keyExtractor={item => item._id}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primaryColor}
              colors={[colors.primaryColor]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingBottom: 20,
            paddingTop: hp('2%'),
          }}
          ListFooterComponent={
            isLoading && page > 1 ? (
              <ActivityIndicator
                size="small"
                color={colors.primaryColor}
                style={{marginVertical: 20}}
              />
            ) : null
          }
        />
      </Animated.View>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    contentContainer: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    loadingText: {
      fontSize: fontSize.f16,
      color: colors.grey,
      textAlign: 'center',
    },
    statsContainer: {
      margin: 16,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 0,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    statsGradient: {
      flexDirection: 'row',
      paddingVertical: 20,
      paddingHorizontal: 24,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: fontSize.f24,
      fontWeight: '700',
      color: colors.primaryColor,
    },
    statLabel: {
      fontSize: fontSize.f14,
      color: colors.grey,
      marginTop: 4,
    },
    statDivider: {
      width: 1,
      backgroundColor: 'rgba(220, 53, 69, 0.2)',
      marginHorizontal: 20,
    },
    userCard: {
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 0,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 12,
      borderWidth: 1,
      borderColor: colors.grey,
    },
    cardGradient: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.white,
    },
    userInfoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 3,
      borderColor: colors.white,
    },
    blockedBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.white,
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: fontSize.f18,
      fontWeight: '600',
      color: colors.black,
      marginBottom: 2,
    },
    username: {
      fontSize: fontSize.f14,
      color: colors.grey,
      marginBottom: 6,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primaryColor,
      marginRight: 6,
    },
    statusText: {
      fontSize: fontSize.f12,
      color: colors.primaryColor,
      fontWeight: '500',
    },
    unblockButton: {
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 0,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    unblockGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    unblockText: {
      color: colors.white,
      fontSize: fontSize.f14,
      fontWeight: '600',
      marginLeft: 6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: hp('10%'),
    },
    emptyIconContainer: {
      marginBottom: 24,
      borderRadius: 60,
      overflow: 'hidden',
    },
    emptyIconGradient: {
      width: 120,
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: fontSize.f22,
      fontWeight: '700',
      color: colors.black,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: fontSize.f16,
      color: colors.grey,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
