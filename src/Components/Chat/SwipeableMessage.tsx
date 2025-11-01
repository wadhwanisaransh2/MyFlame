import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {ReplySVG} from '../../Assets/Images/SVGs/CommonSVG';
import {_makeAxiosGetRequest} from '../../Service';
import MessagePost from './MessagePost';
import {GIFMessage} from './GIF';
import FastImage from 'react-native-fast-image';
import {navigate} from '../../Utils/navigation';
import {ANDROID_GIPHY_KEY, IOS_GIPHY_KEY} from '../../Service/config';
import {GiphySDK} from '@giphy/react-native-sdk';
import {useChat} from '../../Hooks/useChat';
import {makeMessageStyles} from './messageStyle';

const SWIPE_THRESHOLD = 80;
const apiKey = Platform.OS === 'android' ? ANDROID_GIPHY_KEY : IOS_GIPHY_KEY;
GiphySDK.configure({apiKey: apiKey});

const SwipeableMessage = ({
  message,
  onSwipe,
  messages,
  colors,
  friendUsername,
  onSwipeStart,
  onSwipeEnd,
  gestureRef,
}: {
  message: IUIMessage;
  onSwipe: any;
  messages: any;
  colors: any;
  friendUsername: string;
  onSwipeStart: any;
  onSwipeEnd: any;
  gestureRef: any;
}) => {
  const {renderReplyToMessageContent, getGIFData, getMessageStyle} = useChat();

  // no swipe effect for sender and for private
  const isSwipeable = message.sender !== 'me' && !message.isPostPrivate;
  const [replyPreview, setReplyPreview] = useState<React.ReactNode>(null);
  const styles = makeMessageStyles(colors);
  const translateX = useSharedValue(0);

  const onSwipeComplete = (msg: IUIMessage) => {
    onSwipe(msg);
  };

  // PanResponder configuration
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isSwipeable,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to horizontal swipes
      return (
        isSwipeable && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
      );
    },

    onPanResponderGrant: () => {
      if (onSwipeStart) {
        onSwipeStart();
      }
    },

    onPanResponderMove: (evt, gestureState) => {
      // Only allow right swipe (positive dx)
      if (isSwipeable && gestureState.dx > 0) {
        translateX.value = gestureState.dx;
      }
    },

    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > SWIPE_THRESHOLD) {
        runOnJS(onSwipeComplete)(message);
      }

      // Animate back to original position
      translateX.value = withSpring(0);

      if (onSwipeEnd) {
        onSwipeEnd();
      }
    },

    onPanResponderTerminate: () => {
      // Reset position if gesture is terminated
      translateX.value = withSpring(0);
      if (onSwipeEnd) {
        onSwipeEnd();
      }
    },
  });

  const messageAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  const replyIndicatorStyle = useAnimatedStyle(() => {
    const opacity = translateX.value / 100;
    return {
      opacity: opacity > 1 ? 1 : opacity,
      transform: [{translateX: translateX.value * 0.5 - 30}],
    };
  });

  // Check if this message is replying to another message
  const replyToMessage = message.replyTo ? message.replyTo : null;

  useEffect(() => {
    const getReplyContent = async () => {
      if (message.replyTo) {
        const renderedContent = await renderReplyToMessageContent(
          message,
          styles,
        );
        setReplyPreview(renderedContent);
      }
    };
    getReplyContent();
  }, [message.replyTo]);

  return (
    <View style={styles.messageWrapper}>
      {isSwipeable && (
        <Animated.View style={[styles.replyIndicator, replyIndicatorStyle]}>
          <ReplySVG width={20} height={20} fill={colors.black} />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.messageContainer,
          message.sender === 'me'
            ? getMessageStyle(message, styles.sentMessage)
            : getMessageStyle(message, styles.receivedMessage),
          messageAnimStyle,
        ]}
        {...(isSwipeable ? panResponder.panHandlers : {})}>
        {message.replyTo && (
          <View>
            <View style={styles.replyPreviewContainer}>
              <Text style={styles.replyPreviewSender}>
                {replyToMessage.sender === 'me' ? 'You' : friendUsername}{' '}
                shared:
              </Text>
              {replyPreview}
            </View>
          </View>
        )}

        {message.type === 'text' && (
          <Text
            style={[
              styles.messageText,
              message.sender !== 'me'
                ? styles.receivedMessage
                : styles.sentMessage,
            ]}>
            {message.text}
          </Text>
        )}

        {message.type === 'post' && <MessagePost message={message} />}

        {message.type === 'gif' && (
          <GIFMessage id={message.text} getGIFData={getGIFData} />
        )}

        {message.type === 'image' && message.text && (
          <TouchableOpacity
            onPress={() => {
              navigate('ImagePreview', {
                imagePath: message.text,
                friendId: '',
                isSending: false,
              });
            }}>
            <FastImage
              source={{
                uri: message.text,
              }}
              style={{
                width: 180,
                height: 300,
              }}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        )}
        {message.type === 'reel' && <MessagePost message={message} />}
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              {
                color:
                  message.type === 'image'
                    ? 'black'
                    : message.sender !== 'me'
                    ? colors.receiverMessageTextColor
                    : colors.senderMessageTextColor,
              },
            ]}>
            {message.time}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default SwipeableMessage;
