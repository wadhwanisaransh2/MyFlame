import React, {memo, use} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {fontSize} from '../../Utils/fontIcon';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

interface UserCardProps {
  username: string;
  avatar: string | null;
  onFollowToggle: () => void;
  showBT: boolean;
  onPress?: () => void;
  buttonTitle?: string;
  userId: string;
  fullName?: string;
  friendShipStatus?: 'none' | 'accepted' | 'pending';
}

export const UserCard: React.FC<UserCardProps> = memo(
  ({
    username,
    avatar,
    onFollowToggle,
    showBT = true,
    onPress,
    buttonTitle,
    userId,
    fullName,
  }) => {
    const {colors} = useTheme();
    const style = makeStyles(colors);

    return (
      <TouchableOpacity
        disabled={!onPress}
        style={style.userCard}
        activeOpacity={0.8}
        onPress={onPress}>
        <View style={style.userInfo}>
          <FastImage
            source={avatar ? {uri: avatar} : IMAGES.userImage}
            style={style.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={{flexDirection: 'column'}}>
            {fullName && (
              <Text
                numberOfLines={1}
                style={[style.fullName, {color: colors.primaryColor }]}>
                {fullName}
              </Text>
            )}
            <Text style={style.usernameText}>
              @
              {username?.length > 10
                ? `${username?.slice(0, 10)}...`
                : username}
            </Text>
          </View>
        </View>
        {showBT && (
          <Pressable style={[style.followButton]} onPress={onFollowToggle}>
            <Text style={[style.followButtonText, style.unfollowButtonText]}>
              {buttonTitle}
            </Text>
          </Pressable>
        )}
      </TouchableOpacity>
    );
  },
);

interface RequestUserCardProps {
  username: string;
  fullName: string;
  avatar: string;
  onAcceptPress?: () => void;
  onRejectPress?: () => void;
  userId: string;
  onPress?: () => void;
}

export const UserCardLoader = ({showBT = false}: {showBT?: boolean}) => {
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const shimmerColors = isDark
    ? ['#181920', colors.grey]
    : [colors.lightGrey, colors.lightGrey2, colors.lightGrey];
  return (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.avatar}
          LinearGradient={LinearGradient}
        />
  <View style={styles.usernameContainer}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 100, height: 15, borderRadius: 12}}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 50, height: 10, borderRadius: 12, marginTop: 2}}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>
      {showBT && (
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={{width: 100, height: 30, borderRadius: 12}}
          LinearGradient={LinearGradient}
        />
      )}
    </View>
  );
};

export const RequestUserCard: React.FC<RequestUserCardProps> = memo(
  ({
    username,
    fullName,
    avatar,
    onAcceptPress,
    onRejectPress,
    userId,
    onPress,
  }) => {
    const {colors} = useTheme();
    const style = makeStyles(colors);
    return (
      <Pressable style={style.userCard} onPress={onPress}>
        <View style={style.userInfo}>
          <FastImage
            source={avatar ? {uri: avatar} : IMAGES.userImage}
            style={style.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={{flexDirection: 'column'}}>
            <Text style={style.fullName}>
              {fullName?.length > 10
                ? `${fullName?.slice(0, 10)}...`
                : fullName}
            </Text>
            <Text style={style.usernameText}>
              {username?.length > 10
                ? `${username?.slice(0, 10)}...`
                : username}
            </Text>
          </View>
        </View>
        <View style={style.followButtonContainer}>
          <Pressable onPress={onAcceptPress} style={[style.followButton]}>
            <Text style={style.followButtonText}>Accept</Text>
          </Pressable>
          <Pressable
            onPress={onRejectPress}
            style={[style.followButton, style.unfollowButton]}>
            <Text style={style.followButtonText}>Reject</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  },
);

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      backgroundColor: colors.lightGrey,
      marginVertical: 10,
      borderRadius: 30,
      paddingHorizontal: 10,
      // borderBottomWidth: 1,
      // borderColor: colors.lightGrey,
      // borderBottomColor: colors.lightGrey,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '60%',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    usernameText: {
      fontSize: fontSize.f14,
      fontWeight: '500',
      color: colors.darkText,
    },
    usernameContainer: {
      flexDirection: 'column',
    },
    followButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 15,
      backgroundColor: colors.primaryColor,
    },
    unfollowButton: {
      backgroundColor: colors.lightGrey2,
    },
    followButtonText: {
      color: '#fff',
      fontSize: fontSize.f16,
      fontWeight: '600',
    },
    unfollowButtonText: {
      color: '#fff',
    },

    followButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    fullName: {
      width: '80%',
      fontSize: fontSize.f16,
      fontWeight: '500',
      color: colors.darkText,
    },
  });
