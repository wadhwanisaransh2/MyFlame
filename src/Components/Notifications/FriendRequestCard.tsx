import React, {memo} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {fontSize} from '../../Utils/fontIcon';
import {INotification} from '../../Interfaces/notification';
import {navigate} from '../../Utils/navigation';

interface FriendRequestCardProps {
  notificationItem: INotification;
  onAcceptPress: () => void;
  onRejectPress: () => void;
  onPress?: () => void;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = memo(
  ({notificationItem, onAcceptPress, onRejectPress, onPress}) => {
    const [showActionButtons, setShowActionButtons] = React.useState(
      notificationItem.actionRequired,
    );
    const {colors} = useTheme();
    const style = makeStyles(colors);
    const {
      _id,
      username,
      firstName,
      lastName,
      profilePicture: avatar,
    } = notificationItem.sender;
    const fullName = `${firstName} ${lastName}`;

    return (
      <View style={style.userCard}>
        <View style={style.userInfo}>
          <TouchableOpacity
            onPress={() =>
              navigate('ProfileScreen', {
                userId: _id,
                username: username,
              })
            }>
            <FastImage
              source={avatar ? {uri: avatar} : IMAGES.userImage}
              style={style.avatar}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
          <View
            style={[
              {flexDirection: 'column'},
              notificationItem.actionRequired && {maxWidth: '70%'},
            ]}>
            <Text style={style.fullName}>
              {fullName?.length > 10
                ? `${fullName?.slice(0, 10)}...`
                : fullName}
            </Text>
            <Text style={style.content}>{notificationItem.content}</Text>
          </View>
        </View>
        {showActionButtons && (
          <View style={style.buttonContainer}>
            <TouchableOpacity
              onPress={() => {
                setShowActionButtons(false);
                onAcceptPress();
              }}
              style={[style.actionButton]}>
              <Text style={[style.actionButtonText, {color: 'white'}]}>
                Accept
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowActionButtons(false);
                onRejectPress();
              }}
              style={[style.actionButton, style.rejectButton]}>
              <Text style={[style.actionButtonText, {color: colors.black}]}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  },
);

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    userCard: {
      flexDirection: 'column',
      // alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrey,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
    },
    actionButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.primaryColor,
    },
    actionButtonText: {
      fontSize: fontSize.f14,
      fontWeight: '500',
    },
    rejectButton: {
      backgroundColor: colors.white,
      borderColor: colors.darkText,
      borderWidth: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginLeft: 44,
      paddingLeft: 10,
      paddingVertical: 10,
    },
    content: {
      fontSize: fontSize.f14,
      fontWeight: '500',
      color: colors.darkText,
      width: '100%',
      position: 'relative',
    },
    fullName: {
      fontSize: fontSize.f16,
      fontWeight: '500',
      color: colors.darkText,
      marginBottom: 4,
    },
  });
