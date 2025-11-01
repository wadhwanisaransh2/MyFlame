import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {ENotificationType, INotification} from '../../Interfaces/notification';
import {fontSize} from '../../Utils/fontIcon';
import {ColorThemeInterface} from '../../Utils/colors';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {navigate} from '../../Utils/navigation';
import {useTheme} from '../../Theme/ThemeContext';

interface Props {
  refetchData: () => void;
  notificationItem: INotification;
}

export const SystemNotificationCard = ({notificationItem}: Props) => {
  const {colors} = useTheme();
  const style = makeStyles(colors);
  function handleNavigation() {
    if (
      notificationItem.type === ENotificationType.EVENT &&
      notificationItem.metadata?.eventId
    ) {
      navigate('EventScreen');
    }
  }

  const hasMetadata =
    notificationItem.metadata?.eventId || notificationItem.metadata?.postId;

  return (
    <Pressable
      style={[
        style.card,
        {justifyContent: hasMetadata ? 'space-between' : 'flex-start'},
      ]}
      onPress={handleNavigation}>
      <TouchableOpacity>
        <FastImage
          source={IMAGES.logo}
          style={style.avatar}
          resizeMode={FastImage.resizeMode.cover}
        />
      </TouchableOpacity>
      <View style={style.userInfo}>
        <View
          style={{
            flexDirection: 'column',
            maxWidth: '90%',
            flexShrink: 1,
            justifyContent: 'flex-start',
          }}>
          {notificationItem.title && (
            <Text style={style.fullName}>{notificationItem.title}</Text>
          )}
          <Text style={style.content}>{notificationItem.content}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    card: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.lightGrey,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
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
