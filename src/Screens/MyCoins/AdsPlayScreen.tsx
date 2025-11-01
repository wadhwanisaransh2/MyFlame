import React, {useState, useRef, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import {PlaySVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {showToast} from '../../Utils/general';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import {hp, wp} from '../../Utils/responsive';
import {GiftSVG} from '../../Assets/Images/SVGs/CommonSVG';
import FlamaCoinSVG from '../../Assets/Images/SVGs/FlamaCoinSVG';
import {useAdmobCallbackMutation} from '../../redux/api/profile';
import {useDispatch, useSelector} from 'react-redux';
import {addCoins, updateCoins} from '../../redux/Store/AuthSlice';
import {RootState} from '../../redux/Store';

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : Platform.OS === 'ios'
  ? 'ca-app-pub-9892200700072490/4022963262'
  : 'ca-app-pub-9892200700072490/9681434306';

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  keywords: ['fashion', 'clothing'],
});

const AdsPlayScreen: React.FC = () => {
  const [loaded, setLoaded] = useState(false); // Set to true for demo

  const [admobCallback, {isLoading}] = useAdmobCallbackMutation();
  const dispatch = useDispatch();

  // Animation refs
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const unsubscribeLoadedRef = useRef<() => void>(() => {});
  const unsubscribeEarnedRef = useRef<() => void>(() => {});
  const {colors} = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const {coinConfig} = useSelector((state: RootState) => state.AuthManager);
  const [rewardAmount] = useState(coinConfig?.ad);

  // Load ad and set up listeners
  const loadAd = () => {
    unsubscribeLoadedRef.current = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
        setTimeout(() => {
          rewarded.show();
        }, 500);
      },
    );

    unsubscribeEarnedRef.current = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async reward => {
        // const res = await admobCallback({amount: reward?.amount}).unwrap();
        dispatch(addCoins(reward?.amount));

        showToast('Reward earned! 🎉');
        setTimeout(() => {
          navigateBack();
        }, 1500);
        setLoaded(false);
      },
    );

    rewarded.load();
    return () => {};
  };

  // Show rewarded ad manually (fallback)
  const showRewardedAd = () => {
    if (loaded) {
      rewarded.show();
      showToast(`🎉 Reward earned! ${coinConfig?.ad} coins`);
      setTimeout(() => {
        navigateBack();
      }, 1500);
    } else {
      showToast('Loading new ad...');
      loadAd();
    }
  };

  // Animations
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous animations
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    );

    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      }),
    );

    bounce.start();
    rotation.start();

    return () => {
      bounce.stop();
      rotation.stop();
    };
  }, []);

  // Button pulse animation
  useEffect(() => {
    if (loaded) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [loaded]);

  useEffect(() => {
    const cleanup = loadAd();
    return () => {
      unsubscribeLoadedRef.current?.();
      unsubscribeEarnedRef.current?.();
      cleanup?.();
    };
  }, []);

  // Animation interpolations
  const bounceY = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <CustomHeader
        title="Play"
        onBackPress={() => {
          navigateBack();
        }}
      />

      <Animated.View
        style={[
          styles.container,
          {
            opacity: opacityAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Decorative Background Elements */}
        <View style={styles.backgroundDecor}>
          <Animated.View
            style={[
              styles.decorCircle1,
              {transform: [{rotate: rotateInterpolate}]},
            ]}
          />
          <Animated.View
            style={[
              styles.decorCircle2,
              {transform: [{rotate: rotateInterpolate}, {scale: pulseAnim}]},
            ]}
          />
          <View style={styles.decorCircle3} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Coin Showcase */}
          <Animated.View
            style={[styles.coinShowcase, {transform: [{translateY: bounceY}]}]}>
            <View style={styles.coinContainer}>
              <View style={styles.coinBg}>
                <FlamaCoinSVG width={50} height={50} />
              </View>
              <View style={styles.sparkles}>
                <View style={[styles.sparkle, styles.sparkle1]} />
                <View style={[styles.sparkle, styles.sparkle2]} />
                <View style={[styles.sparkle, styles.sparkle3]} />
                <View style={[styles.sparkle, styles.sparkle4]} />
              </View>
            </View>

            <View style={styles.rewardDisplay}>
              <Text style={styles.earnText}>EARN</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.amountText}>{rewardAmount}</Text>
                <Text style={styles.coinsText}>COINS</Text>
              </View>
            </View>
          </Animated.View>

          {/* Video Card */}
          <Animated.View
            style={[styles.videoCard, {transform: [{translateX: slideAnim}]}]}>
            <View style={styles.videoHeader}>
              <View style={styles.videoIcon}>
                <GiftSVG width={20} height={20} fill={colors.primaryColor} />
              </View>
              <View>
                <Text style={styles.videoTitle}>Watch Video</Text>
                <Text style={styles.videoSubtitle}>Get instant rewards</Text>
              </View>
            </View>

            <View style={styles.videoContent}>
              <Text style={styles.videoDescription}>
                Watch a short advertisement video and earn coins instantly!
              </Text>

              <View style={styles.features}>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>⚡</Text>
                  <Text style={styles.featureText}>Instant reward</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>🎯</Text>
                  <Text style={styles.featureText}>Short duration</Text>
                </View>
                <View style={styles.feature}>
                  <Text style={styles.featureIcon}>🔒</Text>
                  <Text style={styles.featureText}>Safe & secure</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Action Button */}
          <Animated.View
            style={[styles.actionContainer, {transform: [{scale: pulseAnim}]}]}>
            <TouchableOpacity
              style={[
                styles.playButton,
                loaded ? styles.playButtonActive : styles.playButtonInactive,
              ]}
              onPress={showRewardedAd}
              activeOpacity={0.8}>
              <View style={styles.buttonContent}>
                <View
                  style={[
                    styles.playIconBg,
                    loaded
                      ? styles.playIconBgActive
                      : styles.playIconBgInactive,
                  ]}>
                  <PlaySVG width={24} height={24} fill="#FFFFFF" />
                </View>
                <View style={styles.buttonText}>
                  <Text
                    style={[
                      styles.buttonTitle,
                      loaded
                        ? styles.buttonTitleActive
                        : styles.buttonTitleInactive,
                    ]}>
                    {loaded ? 'PLAY VIDEO' : 'LOADING...'}
                  </Text>
                  <Text style={styles.buttonSubtext}>
                    {loaded ? 'Tap to start earning' : 'Please wait'}
                  </Text>
                </View>
              </View>

              {loaded && (
                <View style={styles.readyIndicator}>
                  <View style={styles.readyDot} />
                  <Text style={styles.readyText}>READY</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View
              style={[
                styles.statusDot,
                loaded ? styles.statusDotActive : styles.statusDotInactive,
              ]}
            />
            <Text style={styles.statusText}>
              {loaded ? 'Video ready to play!' : 'Loading content...'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const {width, height} = Dimensions.get('window');

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    backgroundDecor: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    decorCircle1: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      borderWidth: 2,
      borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    decorCircle2: {
      position: 'absolute',
      bottom: 100,
      left: -30,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      borderWidth: 2,
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    decorCircle3: {
      position: 'absolute',
      top: '40%',
      right: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(142, 83, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(142, 83, 255, 0.2)',
    },
    content: {
      flex: 1,
      paddingHorizontal: wp('5%'),
      paddingTop: hp('3%'),
    },
    coinShowcase: {
      alignItems: 'center',
      marginBottom: hp('4%'),
    },
    coinContainer: {
      position: 'relative',
      marginBottom: hp('2%'),
    },
    coinBg: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#FFD700',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    coinImage: {
      width: 50,
      height: 50,
    },
    sparkles: {
      position: 'absolute',
      width: 120,
      height: 120,
      top: -20,
      left: -20,
    },
    sparkle: {
      position: 'absolute',
      width: 8,
      height: 8,
      backgroundColor: '#FFD700',
      borderRadius: 4,
    },
    sparkle1: {top: 10, right: 20},
    sparkle2: {bottom: 15, left: 25},
    sparkle3: {top: 30, left: 10},
    sparkle4: {bottom: 35, right: 15},
    rewardDisplay: {
      alignItems: 'center',
    },
    earnText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.lightText,
      letterSpacing: 1,
    },
    amountContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    amountText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#FFD700',
      marginRight: 8,
    },
    coinsText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.darkText,
    },
    videoCard: {
      backgroundColor: colors.white,
      borderRadius: 10,
      padding: wp('5%'),
      marginBottom: hp('4%'),
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 15,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    },
    videoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp('2%'),
    },
    videoIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 107, 107, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp('4%'),
    },
    videoIconText: {
      fontSize: 24,
    },
    videoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.darkText,
    },
    videoSubtitle: {
      fontSize: 14,
      color: colors.lightText,
      marginTop: 2,
    },
    videoContent: {
      paddingTop: hp('1%'),
    },
    videoDescription: {
      fontSize: 16,
      color: colors.darkText,
      lineHeight: 24,
      marginBottom: hp('2%'),
    },
    features: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    feature: {
      alignItems: 'center',
      flex: 1,
    },
    featureIcon: {
      fontSize: 20,
      marginBottom: 4,
    },
    featureText: {
      fontSize: 12,
      color: colors.lightText,
      textAlign: 'center',
      fontWeight: '500',
    },
    actionContainer: {
      marginBottom: hp('3%'),
    },
    playButton: {
      borderRadius: 16,
      padding: wp('5%'),
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 8,
    },
    playButtonActive: {
      backgroundColor: '#FF6B6B',
    },
    playButtonInactive: {
      backgroundColor: '#9CA3AF',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    playIconBg: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp('4%'),
    },
    playIconBgActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    playIconBgInactive: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    buttonText: {
      alignItems: 'flex-start',
    },
    buttonTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    buttonTitleActive: {
      color: '#FFFFFF',
    },
    buttonTitleInactive: {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    buttonSubtext: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 2,
    },
    readyIndicator: {
      position: 'absolute',
      top: wp('3%'),
      right: wp('5%'),
      flexDirection: 'row',
      alignItems: 'center',
    },
    readyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#10B981',
      marginRight: 6,
    },
    readyText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    statusBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      paddingVertical: hp('1.5%'),
      paddingHorizontal: wp('6%'),
      borderRadius: 25,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    statusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
    },
    statusDotActive: {
      backgroundColor: '#10B981',
    },
    statusDotInactive: {
      backgroundColor: '#F59E0B',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.darkText,
    },
  });

export default AdsPlayScreen;
