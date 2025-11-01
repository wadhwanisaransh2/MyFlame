import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from '../../redux/api/profile';
import {showToast} from '../../Utils/general';
import {FriendRequestCard} from './FriendRequestCard';
import {ENotificationType, INotification} from '../../Interfaces/notification';
import {fontSize} from '../../Utils/fontIcon';
import {ColorThemeInterface} from '../../Utils/colors';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {navigate} from '../../Utils/navigation';
import {SystemNotificationCard} from './SystemNotificationCard';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../Theme/ThemeContext';

interface Props {
  refetchData: () => void;
  notificationItem: INotification;
}

export const NotificationCard = ({refetchData, notificationItem}: Props) => {
  const {colors} = useTheme();
  const style = makeStyles(colors);
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const handleAcceptRequest = async (friendRequestId: string) => {
    try {
      const data = await acceptFriendRequest({friendRequestId});
      if (!data || data?.error) {
        showToast('Failed to accept friend request');
        return;
      }

      showToast('Friend request accepted');
      refetchData();
    } catch (error) {
      showToast('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (friendRequestId: string) => {
    try {
      const data = await rejectFriendRequest({friendRequestId});
      if (data?.error) {
        showToast('Failed to reject friend request');
        return;
      }

      showToast('Friend request rejected');
      refetchData();
    } catch (error) {
      showToast('Failed to reject friend request');
    }
  };

  if (notificationItem.type === ENotificationType.FRIEND_REQUEST) {
    return (
      <FriendRequestCard
        notificationItem={notificationItem}
        onAcceptPress={() => {
          handleAcceptRequest(notificationItem.relatedItemId);
        }}
        onRejectPress={() => {
          handleRejectRequest(notificationItem.relatedItemId);
        }}
      />
    );
  }

  if (
    !notificationItem?.sender ||
    typeof notificationItem?.sender === 'string'
  ) {
    return (
      <SystemNotificationCard
        refetchData={refetchData}
        notificationItem={notificationItem}
      />
    );
  }

  const {
    _id = '',
    username = '',
    firstName = '',
    lastName = '',
    profilePicture: avatar = '',
  } = notificationItem.sender;

  const fullName = `${firstName} ${lastName}`;
  return (
    <Pressable style={style.card} onPress={() => {}}>
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

        <View style={{flexDirection: 'column', maxWidth: '70%', flexShrink: 1}}>
          <Text style={style.fullName}>
            {fullName?.length > 20 ? `${fullName?.slice(0, 20)}...` : fullName}
          </Text>
          <Text style={style.content}>{notificationItem.content}</Text>
        </View>
      </View>
      {notificationItem.metadata?.postImageUrl && (
        <TouchableOpacity
          onPress={() => {
            if (notificationItem.metadata.postId) {
              navigate('PostScreen', {
                postId: notificationItem.metadata.postId,
                type:
                  notificationItem.metadata.type === 'reel' ? 'reel' : 'post',
              });
            }
          }}>
          <FastImage
            source={{uri: notificationItem.metadata.postImageUrl}}
            style={style.postImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
      )}
    </Pressable>
  );
};

export const NotificationCardLoader = () => {
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);

  const shimmerColors = isDark
    ? ['#181920', colors.grey]
    : [colors.lightGrey, colors.lightGrey2, colors.lightGrey];

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.avatar}
          LinearGradient={LinearGradient}
        />
        <View style={{flexDirection: 'column', maxWidth: '70%', flexShrink: 1}}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{
              width: 120,
              height: 16,
              borderRadius: 4,
              marginBottom: 6,
            }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{
              width: '90%',
              height: 14,
              borderRadius: 4,
            }}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>
    </View>
  );
};

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
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
    postImage: {
      width: 50,
      height: 50,
      borderRadius: 5,
      marginLeft: 12,
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
