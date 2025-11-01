import {Dimensions, StyleSheet} from 'react-native';
import {fontSize} from '../../Utils/fontIcon';
import {hp, wp} from '../../Utils/responsive';

export const makeMessageStyles = (colors: any) =>
  StyleSheet.create({
    messageWrapper: {
      marginBottom: 15,
      position: 'relative',
    },
    messageContainer: {
      // minWidth: '20%',
      maxWidth: '80%',
      borderRadius: 20,
      padding: 12,
      paddingBottom: 8,
    },
    sentMessage: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primaryColor,
      color: colors.senderMessageTextColor,
      borderTopRightRadius: 5,
    },
    receivedMessage: {
      alignSelf: 'flex-start',
      backgroundColor: colors.lightGrey2,
      color: colors.receiverMessageTextColor,
      borderTopLeftRadius: 5,
    },
    messageText: {
      fontSize: 16,
      marginBottom: 4,
      opacity: 100,
    },
    timestamp: {
      fontSize: 10,
      opacity: 0.7,
      alignSelf: 'flex-end',
      textAlign: 'right',
      backgroundColor: 'transparent',
    },
    replyIndicator: {
      position: 'absolute',
      left: 10,
      top: '50%',
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.white,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    replyPreviewContainer: {
      backgroundColor: 'rgba(74, 90, 229, 0.1)',
      borderRadius: 8,
      padding: 5,
      marginBottom: 8,
      borderWidth: 0.5,
      borderLeftWidth: 3,
      borderColor: 'white',
      paddingLeft: 10,
    },
    replyPreviewSender: {
      fontSize: 12,
      color: 'white',
      fontWeight: 'bold',
      marginBottom: 4,
    },
    replyPreviewText: {
      fontSize: 14,
      paddingTop: 8,
      color: 'white',
      opacity: 0.9,
    },
    messageFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      textAlign: 'right',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 18,
      color: colors.textColor,
      marginBottom: 10,
    },
    emptySubText: {
      fontSize: 14,
      color: colors.textColor,
      opacity: 0.7,
    },
    videoIconWrapper: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 4,
      borderRadius: 12,
    },
  });

export const makeSendImageStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      height: 56,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderColor,
    },
    headerButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: colors.textColor,
    },
    backIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 15,
      height: 15,
      borderLeftWidth: 2,
      borderBottomWidth: 2,
      transform: [{rotate: '45deg'}],
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraInner: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
    },
    galleryInner: {
      width: 18,
      height: 18,
      borderRadius: 3,
      borderWidth: 2,
    },
    contentContainer: {
      flex: 1,
    },
    imagePreviewContainer: {
      width: '100%',
      aspectRatio: 1,
      backgroundColor: '#000',
      position: 'relative',
    },
    selectedImagePreview: {
      width: '100%',
      height: '100%',
    },
    noImageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1a1a1a',
    },
    noImageText: {
      color: '#fff',
      fontSize: 16,
      opacity: 0.7,
      marginBottom: 16,
    },
    selectButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#3897f0',
      borderRadius: 4,
    },
    selectButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    tabBar: {
      flexDirection: 'row',
      height: 50,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.borderColor,
    },
    tabButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    activeTabButton: {
      borderBottomWidth: 2,
      borderBottomColor: '#3897f0',
    },
    tabText: {
      color: colors.primaryColor,
      fontSize: fontSize.f14,
      marginLeft: 6,
    },
    activeTabText: {
      fontWeight: 'bold',
      color: '#3897f0',
    },
    galleryList: {
      padding: 1,
    },
    galleryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    galleryTitle: {
      color: colors.textColor,
      fontWeight: '600',
      fontSize: 16,
    },
    browseButton: {
      color: '#3897f0',
      fontSize: 14,
    },
    galleryItem: {
      width: (Dimensions.get('window').width - 6) / 3,
      height: (Dimensions.get('window').width - 6) / 3,
      margin: 1,
    },
    selectedGalleryItem: {
      opacity: 0.7,
      borderWidth: 2,
      borderColor: '#3897f0',
    },
    galleryItemImage: {
      width: '100%',
      height: '100%',
    },
  });

export const makeChatlistCardStyles = (colors: any) =>
  StyleSheet.create({
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      resizeMode: 'cover',
      borderColor: colors.primaryColor,
      borderWidth: 1,
      marginTop: 5,
      marginRight: 5,
    },
    avatarText: {
      fontSize: 20,
    },
    chatContainer: {
      // flex: 1,
      paddingTop: hp('13%'),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: wp('5%'),
    },
    chatList: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 15,
      paddingBottom: 8,
      backgroundColor: colors.lightGrey,
      borderRadius: 65,
      height: 80,
    },
    name: {
      fontSize: fontSize.f18,
      color: colors.black,
    },
    message: {
      fontSize: fontSize.f14,
      color: colors.grey,
      overflow: 'hidden',
      position: 'relative',
      maxWidth: wp('50%'),
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 50,
      backgroundColor: colors.darkGreen,
    },
    time: {
      fontSize: fontSize.f12,
      color: colors.black,
      width: '100%',
      textAlign: 'right',
    },
    strike: {
      width: 50,
      height: 30,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 5,
    },
    strikeText: {
      fontSize: fontSize.f18,
      color: colors.black,
      fontWeight: 'bold',
      marginRight: 4,
    },
  });
