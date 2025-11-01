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
import CustomButton from '../Buttons/CustomButton';
import {navigate} from '../../Utils/navigation';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import BellSVG from '../../Assets/Images/SVGs/BellSVG';
import {_makeAxiosGetRequest} from '../../Service';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import LottieView from 'lottie-react-native';

export interface ICustomHeaderProps {
  title: string;
  onBackPress?: () => void;
  ShowProfile?: boolean;
  ShowSetting?: boolean;
  showNewPostBt?: boolean;
}

export default function CustomHeader({
  title,
  onBackPress,
  ShowProfile,
  ShowSetting,
  showNewPostBt,
}: ICustomHeaderProps) {
  const {colors} = useTheme();
  const style = makeStyles(colors);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const hasNewNotification = profile?.notificationCount > 0;

  // Animation values
  const profileScale = useRef(new Animated.Value(1)).current;
  const bellShake = useRef(new Animated.Value(0)).current;
  const coinGlow = useRef(new Animated.Value(0)).current;

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

    // Simple coin pulse effect
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

  return (
    <View style={style.HeaderContainer}>
      {showNewPostBt ? (
        <CustomButton
          title="New Post"
          onPress={() => {
            navigate('AddPostScreen');
          }}
          iconName={
            <Image source={IMAGES.Add} style={{width: 25, height: 25}} />
          }
          titleStyle={{fontSize: fontSize.f12}}
          containerStyle={{width: 120, height: 40}}
        />
      ) : (
        <View style={style.leftContainer}>
          <TouchableOpacity onPress={onBackPress}>
            <Image source={IMAGES.BackArrow} style={style.BackArrow} />
          </TouchableOpacity>
          <Text style={style.title}>
            {title?.length > 16 ? title?.slice(0, 16) + '...' : title}
          </Text>
        </View>
      )}
      <View style={style.rightContainer}>
        {ShowProfile && (
          <TouchableOpacity onPress={() => navigate('SearchScreen')}>
            <SearchSVG width={24} height={24} fill={colors.primaryColor} />
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
          style={style.coinContainer}
          onPress={() => navigate('MyCoinsScreen')}>
          <LottieView
            source={ANIMATION.FlamaCoin}
            autoPlay
            loop
            style={{width: 40, height: 40, marginTop: 0}}
          />
          <Text style={style.coinText}>{profile?.coins || 0}</Text>
        </TouchableOpacity>

        {ShowSetting && (
          <TouchableOpacity onPress={() => navigate('SettingScreen')}>
            <Image
              source={IMAGES.Setting}
              style={style.Bell}
              tintColor={colors.primaryColor}
            />
          </TouchableOpacity>
        )}
        {ShowProfile && (
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
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    HeaderContainer: {
      width: '100%',
      height: 70,
      backgroundColor: colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      paddingHorizontal: 10,
      elevation: 5,
      zIndex: 1000,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    leftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    BackArrow: {
      height: 27,
      width: 12,
      tintColor: colors.primaryColor,
      marginRight: 15,
    },
    title: {
      fontSize: fontSize.f20,
      color: colors.primaryColor,
      fontFamily: fontFamily.boldfont,
    },
    Bell: {
      height: 27,
      width: 27,
    },
    coins: {
      height: 23,
      width: 40,
      resizeMode: 'contain',
    },
    coinContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 5,
      backgroundColor: colors.inputBackground,
      // padding: 5,
      borderRadius: 15,
      paddingHorizontal: 10,
      // borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    coinText: {
      fontSize: fontSize.f14,
      fontFamily: fontFamily.boldfont,
      color: '#947A58',
      fontWeight: '600',
    },
    profileContainer: {
      position: 'relative',
      borderRadius: 20,
      padding: 1,
      backgroundColor: 'transparent',
    },
    Profile: {
      width: 35,
      height: 35,
      resizeMode: 'cover',
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.primaryColor,
    },
    iconButton: {
      width: 35,
      height: 35,
      borderRadius: 17.5,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
      top: 5,
      right: 7,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF4D4D',
      borderWidth: 1,
      borderColor: '#FFF',
    },
  });
