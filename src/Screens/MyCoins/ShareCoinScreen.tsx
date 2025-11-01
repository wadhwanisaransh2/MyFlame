import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import React, {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {BackArrow} from '../../Assets/Images/SVGs/CommonSVG';
import {navigateBack, navigate} from '../../Utils/navigation';
import {SearchInput} from '../../Components';
import {UserCard, UserCardLoader} from '../../Components/UserCard';
import {useGetFriendListQuery, useSendCoinsMutation} from '../../redux/api/profile';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {fontSize} from '../../Utils/fontIcon';
import FlamaCoinSVG from '../../Assets/Images/SVGs/FlamaCoinSVG';
import CustomHeader from '../../Components/Header/CustomHeader';

import {showToast} from '../../Utils/general';
import { removeCoins } from '../../redux/Store/AuthSlice';

import { User } from '../../redux/api/profile';

const CreativeEmptyComponent = () => {
  const {colors} = useTheme();
  const style = CreateStyles(colors);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  const [sendCoins, {isLoading}] = useSendCoinsMutation();
  useEffect(() => {
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
      ]),
    );
    bounceAnimation.start();
    return () => bounceAnimation.stop();
  }, [bounceAnim]);

  const translateY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={style.emptyContainer}>
      <Animated.View
        style={[style.emptyIconContainer, {transform: [{translateY}]}]}>
        <Text style={style.emptyIcon}>🤝</Text>
      </Animated.View>
      <Text style={style.emptyText}>No friends to share with</Text>
      <Text style={style.emptySubText}>
        Add friends and spread the coin love! 💰✨
      </Text>
    </View>
  );
};

const ItemSeparator = () => {
  const {colors} = useTheme();
  return (
    <View
      style={{height: 1, backgroundColor: colors.lightGrey2, opacity: 0.3}}
    />
  );
};

const CoinRainAnimation = ({visible}: {visible: boolean}) => {
  const coins = useRef(
    Array.from({length: 6}, (_, i) => ({
      id: i,
      anim: new Animated.Value(0),
      delay: i * 100,
    })),
  ).current;

  useEffect(() => {
    if (visible) {
      const animations = coins.map(coin =>
        Animated.sequence([
          Animated.delay(coin.delay),
          Animated.timing(coin.anim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      );

      Animated.parallel(animations).start(() => {
        // Reset animations
        coins.forEach(coin => coin.anim.setValue(0));
      });
    }
  }, [visible, coins]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {coins.map(coin => {
        const translateY = coin.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 300],
        });
        const opacity = coin.anim.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0],
        });
        const rotate = coin.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        });

        return (
          <Animated.Text
            key={coin.id}
            style={[
              {
                position: 'absolute',
                fontSize: 24,
                left: 50 + coin.id * 40,
                top: 50,
                transform: [{translateY}, {rotate}],
                opacity,
              },
            ]}>
            🪙
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default function ShareCoinScreen() {
  const {colors} = useTheme();
  const styles = useMemo(() => CreateStyles(colors), [colors]);

  // State
  const [coinAmount, setCoinAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [showCoinRain, setShowCoinRain] = useState(false);
  const flatListRef = useRef<FlatList<User>>(null);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const dispatch = useDispatch();

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [sendCoins, {isLoading: isLoadingSendCoins}] = useSendCoinsMutation();

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const goBack = () => {
    navigateBack();
  };

  // RTK Query hooks
  const {
    data: friendsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFriendListQuery({
    userId: profile?._id,
    page: currentPage,
    search: searchQuery,
  });

  // Update friends list when data changes
  useEffect(() => {
    if (friendsData?.friends) {
      if (currentPage === 1) {
        setFriends(friendsData.friends as User[]);
      } else {
        setFriends(prev => [...prev, ...(friendsData.friends as User[])]);
      }
      setLoadingMore(false);
    }
  }, [friendsData]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(tempSearch);
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [tempSearch]);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setCurrentPage(1);
    setTempSearch(text);
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({offset: 0, animated: true});
    }
  }, []);

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

  const handleFriendSelection = useCallback(
    (friend: User) => {
      setSelectedFriend(friend);
      // Animate selection
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [scaleAnim],
  );

  const handleShareCoin = useCallback(() => {
    if (!selectedFriend) {
      Alert.alert('Oops! 🤔', 'Please select a friend to share coins with', [
        {text: 'Got it!', style: 'default'},
      ]);
      return;
    }
    if (!coinAmount || parseFloat(coinAmount) <= 0) {
      Alert.alert('Invalid Amount 💰', 'Please enter a valid coin amount', [
        {text: 'Fix it!', style: 'default'},
      ]);
      return;
    }

    handleShareCoinAction();
  }, [selectedFriend, coinAmount]);

  const handleShareCoinAction = async () => {
    try {
      const res = await sendCoins({
        amount: Number(coinAmount),
        receiverId: selectedFriend?._id,
      }).unwrap();

      // update local state on success
      dispatch(removeCoins(Number(coinAmount)));
      setCoinAmount('');
      setSelectedFriend(null);
      showToast('Coins sent successfully');
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to send coins');
    }
  };

  const renderUserItem = useCallback(
    ({item}: {item: User}) => {
      const isSelected = selectedFriend?._id === item._id;

      return (
        <Animated.View
          style={[
            styles.friendItem,
            isSelected && styles.selectedFriendItem,
            {transform: [{scale: isSelected ? scaleAnim : 1}]},
          ]}>
          <UserCard
            userId={item._id}
            username={item.username}
            avatar={item.profilePicture}
            onFollowToggle={() => handleFriendSelection(item)}
            showBT={false}
            buttonTitle="Select"
            onPress={() => handleFriendSelection(item)}
          />
          {isSelected && (
            <Animated.View
              style={[
                styles.selectedIndicator,
                {transform: [{scale: pulseAnim}]},
              ]}>
              <Text style={styles.selectedText}>✨</Text>
            </Animated.View>
          )}
          {isSelected && <View style={styles.magicBorder} />}
        </Animated.View>
      );
    },
    [handleFriendSelection, selectedFriend, styles, scaleAnim, pulseAnim],
  );

  const keyExtractor = useCallback((item: User) => item._id, []);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    refetch();
  }, [refetch]);

  const quickAmountButtons = [100, 250, 500, 1000];

  return (
    <View style={styles.container}>
      <CoinRainAnimation visible={showCoinRain} />

      {/* Creative Header */}
      <CustomHeader
        title="Share Coins"
        onBackPress={goBack}
        // onPress={() =>n}
      />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Enhanced Coin Amount Section */}
        <View style={styles.coinAmountSection}>
          <View style={styles.gradientOverlay} />
          <Text style={styles.sectionTitle}>Choose Your Amount</Text>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountContainer}>
            {quickAmountButtons.map(amount => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.quickAmountButton,
                  coinAmount === amount.toString() &&
                    styles.quickAmountButtonActive,
                ]}
                onPress={() => setCoinAmount(amount.toString())}>
                <Text
                  style={[
                    styles.quickAmountText,
                    coinAmount === amount.toString() &&
                      styles.quickAmountTextActive,
                  ]}>
                  {amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.coinInputContainer}>
            <FlamaCoinSVG
              fill={colors.primaryColor}
              width={24}
              height={24}
              style={{marginRight: 12}}
            />
            <TextInput
              style={styles.coinInput}
              placeholder="Custom amount"
              placeholderTextColor={colors.lightText}
              value={coinAmount}
              onChangeText={setCoinAmount}
              keyboardType="numeric"
            />
            <Text style={styles.coinLabel}>Coins</Text>
          </View>
          <Text style={styles.availableCoins}>
            Your treasure: {profile?.coins} Flama coins
          </Text>
        </View>

        {/* Enhanced Selected Friend Section */}
        {selectedFriend && (
          <View style={styles.selectedFriendSection}>
            <Text style={styles.sectionTitle}>🎯 Chosen Friend:</Text>
            <View style={styles.selectedFriendCard}>
              <View style={styles.sparkleContainer}>
                {/* <Text style={styles.sparkle}>✨</Text>
                <Text style={styles.sparkle}>⭐</Text>
                <Text style={styles.sparkle}>💫</Text> */}
              </View>
              <UserCard
                userId={selectedFriend._id}
                username={selectedFriend.username}
                avatar={selectedFriend.profilePicture}
                showBT={false}
                onFollowToggle={() => {}}
                onPress={() => {}}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => setSelectedFriend(null)}>
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Enhanced Share Button */}
        {selectedFriend && coinAmount && (
          <TouchableOpacity
            disabled={isLoadingSendCoins}
            style={styles.shareButton}
            onPress={handleShareCoin}>
            {isLoadingSendCoins ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <View style={styles.shareButtonGradient} />
                <Text style={styles.shareButtonText}>
                  🚀 Send {coinAmount} Coins to {selectedFriend.username} ✨
                </Text>
                <Text style={styles.shareButtonSubtext}>
                  Tap to spread the magic!
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Enhanced Friends List Section */}
        <View style={styles.friendsListSection}>
          <Text style={styles.sectionTitle}>🤝 Your Amazing Friends</Text>

          <SearchInput
            placeholder="🔍 Find your friend..."
            containerStyle={styles.searchInput}
            value={tempSearch}
            onChangeText={text => setTempSearch(text)}
          />

          {isLoading && friends.length === 0 ? (
            <View style={styles.loadersContainer}>
              <Text style={styles.loadingTitle}>
                🔮 Finding your friends...
              </Text>
              {Array.from({length: 5}).map((_, index) => (
                <UserCardLoader key={index} showBT={false} />
              ))}
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={friends.filter((friend: any) => (friend as any).status === 'accepted')}
              renderItem={renderUserItem}
              keyExtractor={keyExtractor}
              ItemSeparatorComponent={ItemSeparator}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={isLoading ? null : <CreativeEmptyComponent />}
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
                  <View style={styles.footerLoader}>
                    <ActivityIndicator
                      size="small"
                      color={colors.primaryColor}
                    />
                    <Text style={styles.loadingText}>
                      Loading more magic... ✨
                    </Text>
                  </View>
                ) : null
              }
              nestedScrollEnabled={true}
              style={styles.friendsList}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function CreateStyles(colors: ColorThemeInterface) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 0,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: colors.backgroundColor,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.lightGrey,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: fontSize.f16,
      fontWeight: 'bold',
      color: colors.darkText,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: fontSize.f12,
      color: colors.lightText,
      textAlign: 'center',
      marginTop: 2,
    },
    placeholder: {
      width: 40,
    },
    scrollContent: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: fontSize.f18,
      fontWeight: 'bold',
      color: colors.darkText,
      marginBottom: 16,
      textAlign: 'center',
    },
    coinAmountSection: {
      margin: 20,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      padding: 24,
      elevation: 8,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      backgroundColor: colors.primaryColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    quickAmountContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    quickAmountButton: {
      backgroundColor: colors.backgroundColor,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 2,
      borderColor: colors.lightGrey,
      minWidth: 70,
      alignItems: 'center',
    },
    quickAmountButtonActive: {
      borderColor: colors.primaryColor,
      backgroundColor: colors.primaryColor,
    },
    quickAmountText: {
      fontSize: fontSize.f14,
      fontWeight: '600',
      color: colors.darkText,
    },
    quickAmountTextActive: {
      color: colors.white,
    },
    coinInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: colors.primaryColor,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    coinIcon: {
      fontSize: fontSize.f18,
      marginRight: 12,
    },
    coinInput: {
      flex: 1,
      fontSize: fontSize.f18,
      fontWeight: 'bold',
      color: colors.darkText,
      paddingVertical: 16,
    },
    coinLabel: {
      fontSize: fontSize.f16,
      fontWeight: '600',
      color: colors.primaryColor,
    },
    availableCoins: {
      fontSize: fontSize.f14,
      color: colors.lightText,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    selectedFriendSection: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      padding: 24,
      elevation: 8,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    selectedFriendCard: {
      position: 'relative',
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16,
      borderWidth: 3,
      borderColor: colors.primaryColor,
    },
    sparkleContainer: {
      position: 'absolute',
      top: -10,
      right: -10,
      flexDirection: 'row',
    },
    sparkle: {
      fontSize: 16,
      marginLeft: 4,
    },
    removeButton: {
      position: 'absolute',
      top: -12,
      right: -12,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.red,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.white,
    },
    removeButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: 'bold',
    },
    shareButton: {
      marginHorizontal: 20,
      marginBottom: 20,
      backgroundColor: colors.primaryColor,
      borderRadius: 20,
      paddingVertical: 20,
      alignItems: 'center',
      elevation: 12,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.4,
      shadowRadius: 16,
      position: 'relative',
      overflow: 'hidden',
    },
    shareButtonGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primaryColor,
    },
    shareButtonText: {
      color: colors.white,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
    },
    shareButtonSubtext: {
      color: colors.white,
      fontSize: 12,
      opacity: 0.9,
    },
    friendsListSection: {
      flex: 1,
      marginHorizontal: 20,
      marginBottom: 20,
    },
    searchInput: {
      marginBottom: 16,
    },
    loadersContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
    },
    loadingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 16,
    },
    friendsList: {
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      maxHeight: 400,
    },
    listContent: {
      padding: 20,
      flexGrow: 1,
    },
    friendItem: {
      backgroundColor: colors.backgroundColor,
      borderRadius: 16,
      marginBottom: 12,
      position: 'relative',
      overflow: 'hidden',
    },
    selectedFriendItem: {
      borderWidth: 3,
      borderColor: colors.primaryColor,
    },
    magicBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: colors.primaryColor,
    },
    selectedIndicator: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.white,
    },
    selectedText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyIconContainer: {
      marginBottom: 16,
    },
    emptyIcon: {
      fontSize: 64,
    },
    emptyText: {
      fontSize: 18,
      color: colors.darkText,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      color: colors.lightText,
      textAlign: 'center',
      lineHeight: 20,
    },
    footerLoader: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 12,
      color: colors.lightText,
      marginTop: 8,
    },
  });

}
