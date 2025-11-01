import {StyleSheet} from 'react-native';
import {fontFamily} from '../../Utils/fontIcon';
import {hp} from '../../Utils/responsive';

export const chatlistScreenStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 'auto',
      paddingTop: hp('25%'),
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyText: {
      marginTop: 5,
      fontSize: 24,
      color: colors.primaryColor,
      fontFamily: fontFamily.regular,
    },
    searchContainer: {
      flex: 1,
    },
    searchInputWrapper: {
      width: '90%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 25,
      paddingHorizontal: 15,
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginBottom: 10,
    },
    searchIconContainer: {
      marginRight: 10,
    },
    searchIcon: {
      fontSize: 18,
    },
    searchInputContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      borderWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    searchInputStyle: {
      fontSize: 16,
      color: colors.black,
      fontWeight: '500',
      width: '100%',
      height: 40,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    backArrow: {
      height: 20,
      width: 12,
    },
    headerGradient: {
      elevation: 8,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      backgroundColor: colors.primaryColor,
      paddingBottom: 10,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 10,
      paddingRight: 25,
      paddingVertical: 15,
    },
    contentContainer: {
      flex: 1,
      marginTop: -15,
      backgroundColor: colors.backgroundColor,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
    },
    chatHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 25,
      paddingTop: 10,
      marginVertical: 10,
    },
    chatHeaderText: {
      color: colors.primaryColor,
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'left',
      textTransform: 'capitalize',
    },
    paginationIndicators: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginVertical: 2,
    },
    prevIndicator: {
      backgroundColor: colors.primaryColor + '60',
    },
    nextIndicator: {
      backgroundColor: colors.primaryColor,
    },
    loadingMoreContainer: {
      padding: 15,
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
    },
    loadingPrevContainer: {
      padding: 15,
      alignItems: 'center',
      backgroundColor: colors.backgroundColor,
    },
    loadingText: {
      color: colors.primaryColor,
      fontSize: 14,
      marginTop: 8,
      fontFamily: fontFamily.regular,
    },
  });

export const chatScreenStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primaryColor,
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    backButton: {
      padding: 5,
    },
    headerInfo: {
      flex: 1,
      marginLeft: 10,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.white,
      opacity: 0.8,
    },
    moreButton: {
      padding: 5,
    },
    messagesList: {
      padding: 15,
      paddingBottom: 30,
      flexGrow: 1,
    },
    messageWrapper: {
      marginBottom: 15,
      position: 'relative',
    },
    messageContainer: {
      maxWidth: '80%',
      borderRadius: 20,
      padding: 12,
      paddingBottom: 8,
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
    replyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.lightGrey,
      opacity: 0.7,
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: colors.lightGrey,
    },
    replyContent: {
      flex: 1,
      marginRight: 10,
    },
    replyingToText: {
      fontSize: 14,
      color: colors.primaryColor,
      fontWeight: 'bold',
      opacity: 1.0,
    },
    replyPreview: {
      fontSize: 14,
      color: colors.black,
      opacity: 1.0,
    },
    cancelButton: {
      padding: 5,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.lightGrey,
    },
    emojiButton: {
      paddingVertical: 10,
      paddingHorizontal: 5,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 60,
      backgroundColor: colors.lightGrey,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginHorizontal: 10,
      fontSize: 16,
      color: colors.black,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },
    disabledSendButton: {
      opacity: 0.5,
    },
    replyPreviewContainer: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      borderRadius: 10,
      padding: 8,
      marginBottom: 8,
    },
    replyPreviewSender: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.white,
      marginBottom: 2,
    },
    replyPreviewText: {
      fontSize: 13,
      color: colors.white,
      opacity: 0.9,
    },
    messageFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusText: {
      fontSize: 11,
      color: 'white',
      opacity: 0.7,
    },
    failedText: {
      color: '#FF5252',
      opacity: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    loadingMoreContainer: {
      padding: 10,
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 24,
      color: colors.grey,
      marginBottom: 10,
    },
    emptySubText: {
      fontSize: 20,
      color: colors.grey,
      opacity: 0.7,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#4CAF50',
      marginRight: 5,
    },
    messageStatus: {
      fontSize: 11,
      color: colors.white,
      opacity: 0.7,
    },
    failedStatus: {
      color: '#FF5252',
      opacity: 1,
    },
  });
