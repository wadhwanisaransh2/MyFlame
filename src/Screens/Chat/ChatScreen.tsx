import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Keyboard,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {BackArrow, CloseSVG, MoreSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {EmojiSVG, SendSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {navigate, navigateBack} from '../../Utils/navigation';
import {useTheme} from '../../Theme/ThemeContext';
import {RootState} from '../../redux/Store';
import {useSelector} from 'react-redux';
import {sendMessage, socket, socketListen} from '../../Service/socketio';
import {
  useGetChatQuery,
  useMarkMessagesReadMutation,
} from '../../redux/api/chat';
import EmojiPicker from 'rn-emoji-keyboard';
import {useFocusEffect} from '@react-navigation/native';
import {GIFSVG2} from '../../Assets/Images/SVGs/GIFSVG';
import SwipeableMessage from '../../Components/Chat/SwipeableMessage';
import {GIFInput} from '../../Components/Chat/GIF';
import {IMAGES} from '../../Assets';
import SendImage from '../../Components/Chat/SendImage';
import {chatScreenStyles} from './style';
import {FlashList} from '@shopify/flash-list';
import ChatOptionsModal from '../../Components/Chat/OptionsModal';
import {useChat} from '../../Hooks/useChat';

const ChatScreen = ({route}: {route: any}) => {
  const limit = 10;
  const {colors} = useTheme();
  const styles = chatScreenStyles(colors);
  const gestureRef = useRef<any>(null);
  const {conversationId, friendId, friendUsername} = route?.params;
  const {
    convertMessageFormat,
    handleBlock,
    handleDeleteChat,
    showOptions,
    isSwitchOn,
    setIsSwitchOn,
    setShowOptions,
    handleMessageDeletionSettings,
    handleProfileNavigation,
  } = useChat();

  // state
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<IUIMessage | null>(null);
  const [messages, setMessages] = useState<Array<IUIMessage>>([]);
  const flatListRef = useRef(null);
  const [moreLoading, setMoreLoading] = useState(false);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const {online_users} = useSelector((state: RootState) => state.ChatManager);
  const [isOnline, setIsOnline] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = React.useState('');
  const [markMessagesRead] = useMarkMessagesReadMutation();
  const [sortedMessages, setSortedMessages] = useState<Array<IUIMessage>>([]);
  const [isSwiping, setIsSwiping] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [data, setData] = useState<IConversationData | null>(null);
  const [cursor, setCursor] = useState('');
  const {
    data: response,
    isLoading: loading,
    refetch,
  } = useGetChatQuery({
    conversationId,
    nextCursor: cursor,
    limit,
  });

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (response?.success && response?.data) {
      setData(response.data);
    }
  }, [response]);

  // Re-fetch when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (data) {
      if (data?.messages?.length > 0) {
        const uniqueMessages = data.messages.filter(
          (msg: IMessage) =>
            !messages.find(existing => existing.id === msg.uuid),
        );
        const tempChat = uniqueMessages?.map((message: IMessage) =>
          convertMessageFormat(message, profile?._id || ''),
        );
        setMessages(prev => [...prev, ...tempChat]);
      }
      const isParticipantOnline = online_users?.some(id => id === friendId);
      setIsOnline(isParticipantOnline);
      const conversationId = data?.conversation?._id;
      if (data?.conversation?.messagesDisappear) {
        setIsSwitchOn(true);
      } else {
        setIsSwitchOn(false);
      }
      if (data?.unreadCount && data?.unreadCount > 0 && conversationId) {
        markMessagesRead(conversationId);
      }
      setMoreLoading(false);
      if (!hasInitiallyLoaded) {
        setHasInitiallyLoaded(true);
      }
    }
  }, [data, online_users, hasInitiallyLoaded]);

  useEffect(() => {
    if (messages.length > 0) {
      setSortedMessages(
        [...messages].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      );
    }
  }, [messages]);

  const handleNewReceivedMessage = (data: IMessage) => {
    // Ensure profile and friendId are available
    if (!profile?._id || !friendId) return;

    // Only add the message if:
    // - (sender is friendId AND receiver is current user) OR
    // - (sender is current user AND receiver is friendId)
    const isRelevantMessage =
      (data.sender === friendId && data.receiver === profile._id) ||
      (data.sender === profile._id && data.receiver === friendId);

    if (!isRelevantMessage) {
      // Ignore messages not meant for this chat
      return;
    }

    setMessages(prev => {
      const alreadyExists = prev.find(msg => msg.id === data.uuid);
      if (alreadyExists) return prev;
      const convertedMessage = convertMessageFormat(data, profile?._id || '');
      return [convertedMessage, ...prev];
    });
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (!socket?.connected) {
      socket.connect();
    }

    if (socket.connected) {
      socketListen('newMessage', handleNewReceivedMessage);
    }

    return () => {
      socket?.off('newMessage', handleNewReceivedMessage);
    };
  }, [socket?.connected]);

  const handleSend = () => {
    const replyToMessageObject = replyingTo
      ? {
          uuid: replyingTo.id,
          content: replyingTo.text,
          sender: replyingTo.sender === 'me' ? profile?._id : friendId,
          createdAt: replyingTo.createdAt,
          type: replyingTo.type,
          post: replyingTo.post,
        }
      : null;
    sendMessage(
      friendId,
      inputText,
      'text',
      replyingTo?.id,
      replyToMessageObject,
    );
    setInputText('');
    setReplyingTo(null);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const renderMessageItem = ({item}: {item: IUIMessage}) => {
    return (
      <SwipeableMessage
        message={item}
        onSwipe={(message: IUIMessage) => setReplyingTo(message)}
        messages={messages}
        onSwipeStart={() => setIsSwiping(true)}
        onSwipeEnd={() => setIsSwiping(false)}
        colors={colors}
        friendUsername={friendUsername || 'User'}
        gestureRef={gestureRef}
      />
    );
  };

  const loadMore = () => {
    if (!hasInitiallyLoaded) return; // Add this check first

    if (moreLoading) {
      return;
    }

    if (!data?.hasNextPage) {
      return;
    }

    setMoreLoading(true);
    setCursor(data.nextCursor || '');
  };

  function sendGIF(url: string) {
    sendMessage(friendId, url, 'gif');
    setKeyboardStatus('');
  }

  const inputContainerBottomPadding =
    isKeyboardVisible && keyboardStatus !== 'GIF'
      ? Platform.OS === 'ios'
        ? 20
        : 50
      : 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigateBack()}>
            <BackArrow width={24} height={24} fill={'white'} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <TouchableOpacity
              onPress={() =>
                navigate('ProfileScreen', {
                  userId: friendId,
                  username: friendUsername,
                })
              }>
              <Text style={styles.headerTitle}>{friendUsername || 'Chat'}</Text>
            </TouchableOpacity>
            <View style={styles.statusContainer}>
              {isOnline && (
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Online</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={e => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}>
            <MoreSVG width={24} height={24} fill={'white'} />
          </TouchableOpacity>
        </View>

        {sortedMessages.length === 0 ? (
          <View style={styles.loadingContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.primaryColor} />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubText}>Start a conversation!</Text>
              </View>
            )}
          </View>
        ) : null}

        <FlashList
          ref={flatListRef}
          scrollEnabled={true}
          data={sortedMessages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          inverted={true} // because messages list is inverted
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={false}
          ListFooterComponent={
            moreLoading ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size={30} color={colors.primaryColor} />
              </View>
            ) : null
          }
        />

        {replyingTo && (
          <View style={styles.replyContainer}>
            <View style={styles.replyContent}>
              <Text style={styles.replyingToText}>
                Replying to{' '}
                {replyingTo.sender === 'me'
                  ? 'yourself'
                  : friendUsername || 'User'}
              </Text>
              <Text style={styles.replyPreview} numberOfLines={1}>
                {replyingTo.type === 'text' ? (
                  replyingTo.text
                ) : (
                  <Text style={{textTransform: 'uppercase'}}>
                    {' '}
                    {replyingTo.type}
                  </Text>
                )}
              </Text>
            </View>
            <TouchableOpacity onPress={cancelReply} style={styles.cancelButton}>
              <CloseSVG width={20} height={20} fill={colors.black} />
            </TouchableOpacity>
          </View>
        )}

        {!data?.isBlocked && (
          <View
            style={[
              styles.inputContainer,
              {paddingBottom: inputContainerBottomPadding},
            ]}>
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {
                Keyboard.dismiss();
                setKeyboardStatus('emoji');
              }}>
              <EmojiSVG width={24} height={24} fill={colors.black} />
              <EmojiPicker
                onEmojiSelected={value => {
                  setInputText(prev => prev + value.emoji);
                }}
                allowMultipleSelections={true}
                open={keyboardStatus === 'emoji'}
                onClose={() => setKeyboardStatus('')}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {
                Keyboard.dismiss();
                keyboardStatus === 'GIF'
                  ? setKeyboardStatus('')
                  : setKeyboardStatus('GIF');
              }}>
              <GIFSVG2 width={28} height={28} fill={colors.black} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => {
                Keyboard.dismiss();
                keyboardStatus === 'image'
                  ? setKeyboardStatus('')
                  : setKeyboardStatus('image');
              }}>
              <Image
                source={IMAGES.Add}
                style={{
                  width: 28,
                  height: 28,
                  tintColor: colors.black,
                }}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Type message here..."
              value={inputText}
              onChangeText={text => {
                setInputText(text);
              }}
              placeholderTextColor={colors.lightText}
              multiline
              blurOnSubmit={false}
              returnKeyType="default"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.disabledSendButton,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}>
              <SendSVG width={20} height={20} stroke={'white'} />
            </TouchableOpacity>
          </View>
        )}

        {keyboardStatus === 'GIF' && <GIFInput sendGIF={sendGIF} />}
      </KeyboardAvoidingView>
      {keyboardStatus === 'image' && (
        <SendImage
          closeGallery={() => setKeyboardStatus('')}
          friendId={friendId}
        />
      )}

      <ChatOptionsModal
        visible={showOptions}
        handleBlock={() => handleBlock(data, refetch, friendId)}
        handleClose={() => setShowOptions(false)}
        handleDeleteChat={() => handleDeleteChat(conversationId)}
        handleProfileNavigation={() =>
          handleProfileNavigation(friendId, friendUsername)
        }
        handleMessageDeletionSettings={() => {
          handleMessageDeletionSettings(data, refetch);
        }}
        isBlocked={data?.isBlocked || false}
        isSwitchOn={isSwitchOn}
        messagesDisappear={data?.conversation?.messagesDisappear}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
