import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {ANIMATION, IMAGES} from '../../Assets';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {navigate} from '../../Utils/navigation';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {wp} from '../../Utils/responsive';
import BellSVG from '../../Assets/Images/SVGs/BellSVG';
import LinearGradient from 'react-native-linear-gradient';
import LottieView from 'lottie-react-native';
import {socket, socketListen} from '../../Service/socketio';
import {setHasNewMessage, setUserProfile} from '../../redux/Store/AuthSlice';
import {_makeAxiosGetRequest} from '../../Service';
import {endpoint} from '../../Constants/endpoints';
import {ChatSVG} from '../../Assets/Images/SVGs/BottomTabSVG';

export interface ICustomHeaderProps {
  /**
   * Title of the header
   */
  title: string;
  /**
   * onPress event for back button
   */
  onBackPress?: () => void;

  ShowProfile?: boolean;
  ShowSetting?: boolean;

  showNewPostBt?: boolean;
}

export default function HomeHeader({
  title,
  onBackPress,
  ShowProfile,
  ShowSetting,
  showNewPostBt,
}: ICustomHeaderProps) {
  const {colors} = useTheme();
  const style = makeStyles(colors);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const {hasNewMessage} = useSelector((state: RootState) => state.AuthManager);
  const hasNewNotification = profile?.notificationCount > 0;
  // Animation values
  const profileScale = useRef(new Animated.Value(1)).current;
  const bellShake = useRef(new Animated.Value(0)).current;
  const coinGlow = useRef(new Animated.Value(0)).current;

  const dispatch = useDispatch();
  async function fetchProfile() {
    const res = await _makeAxiosGetRequest(endpoint.user.profile, {});
    if (res) {
      dispatch(setUserProfile(res));
    }
  }

  useEffect(() => {
    // Profile image subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(profileScale, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(profileScale, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Notification bell shake animation when there are notifications
    if (hasNewNotification) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bellShake, {
            toValue: 5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bellShake, {
            toValue: -5,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bellShake, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(2000),
        ]),
      ).start();
    }

    // Simple coin pulse effect instead of interpolated glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinGlow, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(coinGlow, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [hasNewNotification]);

  const coinGlowStyle = {
    // shadowColor: '#EECD57',
    // shadowOffset: {width: 0, height: 0},
    // shadowOpacity: 0.5,
    // shadowRadius: 5,
    // elevation: 5,
  };

  return (
    <LinearGradient
      colors={[
        colors.backgroundColor,
        colors.backgroundColor,
        colors.backgroundColor,
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={style.HeaderContainer}>
      <View style={style.leftContainer}>
        <TouchableOpacity
          onPress={() => navigate('ProfileScreen', {})}
          style={style.profileContainer}>
          <Animated.Image
            source={
              profile?.profilePicture
                ? {uri: profile?.profilePicture}
                : IMAGES.userImage
            }
            style={[
              style.Profile,
              {
                transform: [{scale: profileScale}],
              },
            ]}
          />
          <View style={style.profileGlow} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigate('MyCoinsScreen')}
          style={[style.coinContainer, coinGlowStyle]}>
          <LottieView
            source={ANIMATION.FlamaCoin}
            autoPlay
            // renderMode='HARDWARE'
            style={{width: 40, height: 40, marginTop: 0}}
          />
          <Text style={style.coinText}>{profile?.coins || 0}</Text>
        </TouchableOpacity>
      </View>

      <View style={style.rightContainer}>
        {ShowProfile && (
          <TouchableOpacity
            style={style.iconButton}
            onPress={() => navigate('SearchScreen')}>
            <SearchSVG width={30} height={30} fill={colors.primaryColor} />
          </TouchableOpacity>
        )}

        <Animated.View
          style={{
            transform: [{translateX: bellShake}],
          }}>
          <TouchableOpacity
            style={[
              style.iconButton,
              hasNewNotification && style.notificationActive,
            ]}
            onPress={() => navigate('RequestListScreen')}>
            {hasNewNotification ? (
              <LottieView
                source={ANIMATION.Notification}
                autoPlay
                loop
                style={{width: 30, height: 30}}
              />
            ) : (
              <BellSVG width={30} height={30} />
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={style.iconButton}
          onPress={() => navigate('ChatListScreen')}>
          <View style={{position: 'relative'}}>
            {hasNewMessage ? (
              <LottieView
                source={ANIMATION.Shorts}
                autoPlay
                loop
                style={{width: 50, height: 50}}
              />
            ) : (
              <ChatSVG
                fill={colors.primaryColor}
                height={24}
                width={24}
                stroke={colors.primaryColor}
              />
            )}

            {hasNewMessage && (
              <View
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: colors.primaryColor,
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              />
            )}
          </View>
        </TouchableOpacity>

        {ShowSetting && (
          <TouchableOpacity
            style={style.iconButton}
            onPress={() => navigate('SettingScreen')}>
            <Image source={IMAGES.Setting} style={style.iconImage} />
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    HeaderContainer: {
      width: '100%',
      height: 60,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      // paddingHorizontal: 15,
      elevation: 0,
      zIndex: 1000,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.3,
      shadowRadius: 5,
    
      // borderBottomLeftRadius: 20,
      // borderBottomRightRadius: 20,
      // overflow: 'hidden',
      // backgroundColor: 'red',
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15,
      backgroundColor: 'transparent',
      paddingLeft: 15,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    profileContainer: {
      position: 'relative',
      borderRadius: 25,
      padding: 2,
      backgroundColor: 'transparent',
    },
    profileGlow: {
      position: 'absolute',
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: colors.primaryColor,
      opacity: 0.5,
    },
    Profile: {
      width: wp('10%'),
      height: wp('10%'),
      resizeMode: 'cover',
      borderRadius: 25,
      borderWidth: 2.5,
      borderColor: colors.primaryColor,
    },
    coinContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      backgroundColor: colors.inputBackground,
      // borderWidth: 1.5,
      // borderColor: colors.primaryColor,
      padding: 0,
      borderRadius: 25,
      paddingHorizontal: 12,
      // backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    coinText: {
      fontSize: fontSize.f14,
      fontFamily: fontFamily.boldfont,
      color: '#947A58',
      fontWeight: '600',
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 0,
    },
    notificationActive: {
      backgroundColor: 'rgba(255, 200, 200, 0.15)',
      borderColor: 'rgba(255, 150, 150, 0.4)',
    },
    notificationDot: {
      position: 'absolute',
      top: 8,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF4D4D',
      borderWidth: 1,
      borderColor: '#FFF',
    },
    iconImage: {
      height: 22,
      width: 22,
    },
    title: {
      fontSize: fontSize.f20,
      color: colors.primaryColor,
      fontFamily: fontFamily.boldfont,
    },
    Bell: {
      height: 22,
      width: 22,
    },
  });
