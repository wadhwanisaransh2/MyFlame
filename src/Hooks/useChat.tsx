import {useState} from 'react';
import {
  useChangeMessageDeletionSettingsMutation,
  useDeleteChatMutation,
} from '../redux/api/chat';
import {
  useBlockUserMutation,
  useUnblockUserMutation,
} from '../redux/api/profile';
import {navigate} from '../Utils/navigation';
import {showToast} from '../Utils/general';
import {
  Platform,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {ReelsSVG} from '../Assets/Images/SVGs/BottomTabSVG';
import {ANDROID_GIPHY_KEY, GIF_API_URL, IOS_GIPHY_KEY} from '../Service/config';
import axios from 'axios';

export const useChat = () => {
  const [changeMessageSettings] = useChangeMessageDeletionSettingsMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  //   state
  const [showOptions, setShowOptions] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const apiKey = Platform.OS === 'android' ? ANDROID_GIPHY_KEY : IOS_GIPHY_KEY;

  async function handleDeleteChat(conversationId: string) {
    await deleteChat(conversationId).unwrap();
    // navigate to chat list
    setShowOptions(false);
    navigate('ChatListScreen');
  }

  async function handleBlock(
    data: IConversationData | null,
    refetch: any,
    friendId: string,
  ) {
    try {
      setShowOptions(false);
      const temp = data?.isBlocked
        ? await unblockUser({userId: friendId}).unwrap()
        : await blockUser({userId: friendId}).unwrap();

      showToast(
        `User ${data?.isBlocked ? 'unblocked' : 'blocked'} successfully'`,
      );
      refetch();
    } catch (e) {
      showToast(
        `Failed to ${data?.isBlocked ? 'unblock' : 'block'} user`,
      );
    }
  }

  async function handleMessageDeletionSettings(
    data: IConversationData | null,
    refetch?: any,
  ) {
    try {
      if (!data) return;
      setShowOptions(false);
      const temp = await changeMessageSettings({
        id: data.conversation?._id, // Use conversation ID, not friend ID
        messagesDisappear: !data.conversation?.messagesDisappear, // Toggle the current value
      }).unwrap();
      if (temp) {
        setIsSwitchOn((prev: boolean) => !prev);
        showToast(
          `This chat’s messages will ${
            data.conversation?.messagesDisappear ? 'not' : ''
          } disappear in 24 hours now`,
        );
        if (refetch) {
          refetch();
        }
      }
    } catch (error) {
      showToast('Failed to update message settings');
    }
  }

  function handleProfileNavigation(friendId: string, friendUsername: string) {
    setShowOptions(false);
    navigate('ProfileScreen', {userId: friendId, username: friendUsername});
  }

  function convertMessageFormat(message: IMessage, userId: string): IUIMessage {
    let temp = null;
    if (message.replyToMessageObject && message.replyToMessageObject.uuid) {
      temp = message.replyToMessageObject;
    }

    return {
      id: message.uuid,
      text: message.content,
      sender: message.sender === userId ? 'me' : 'other',
      time: formatTime(new Date(message.createdAt)),
      createdAt: message.createdAt,
      status: message.isRead ? 'read' : 'unread',
      type: message.type,
      post: message.post,
      replyTo: temp || message.replyTo || null,
      isPostPrivate: message.isPrivate || false,
    };
  }

  function formatTime(date: Date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // Hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${formattedMinutes} ${ampm}`;
  }

  async function getGIFData(gifId: string): Promise<{
    imageUrl: string;
    dimensions: {width: number; height: number};
  } | null> {
    try {
      const url = GIF_API_URL(gifId, apiKey);
      const res = await axios.get(url);
      const gifData = res?.data?.data.images?.original;
      let imageUrl = gifData?.url;
      let dimensions = {width: 0, height: 0};
      if (imageUrl) {
        // Calculate dimensions while respecting max size of 250
        const originalWidth = parseInt(gifData.width) || 250;
        const originalHeight = parseInt(gifData.height) || 250;

        let width = originalWidth;
        let height = originalHeight;

        // Scale down if either dimension exceeds 250
        if (width > 250 || height > 250) {
          const aspectRatio = originalWidth / originalHeight;
          if (width > height) {
            width = 250;
            height = 250 / aspectRatio;
          } else {
            height = 250;
            width = 250 * aspectRatio;
          }
        }

        dimensions = {
          width: Math.round(width),
          height: Math.round(height),
        };
      }
      return {
        imageUrl,
        dimensions: dimensions,
      };
    } catch (e) {
      return null;
    }
  }

  async function renderReplyToMessageContent(message: IUIMessage, styles: any) {
    const replyMessage = message.replyTo;
    if (!replyMessage) {
      return null;
    }
    switch (replyMessage.type) {
      case 'text':
        return (
          <Text style={styles.replyPreviewText} numberOfLines={2}>
            {replyMessage.content}
          </Text>
        );
      case 'image': {
        if (replyMessage.content) {
          return (
            <TouchableOpacity
              onPress={() => {
                navigate('ImagePreview', {
                  imagePath: replyMessage.content,
                  friendId: '',
                  isSending: false,
                });
              }}>
              <FastImage
                source={{
                  uri: replyMessage.content,
                }}
                style={{
                  width: 120,
                  height: 150,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          );
        } else {
          return (
            <Text style={styles.replyPreviewText} numberOfLines={2}>
              IMAGE
            </Text>
          );
        }
      }
      case 'gif':
        // get GIF by id
        const result = await getGIFData(replyMessage.content);
        if (result) {
          const {imageUrl, dimensions} = result;
          if (imageUrl && dimensions) {
            return (
              <FastImage
                source={{
                  uri: imageUrl,
                }}
                style={{
                  width: dimensions.width ? dimensions.width - 100 : 100,
                  height: dimensions.height ? dimensions.height - 100 : 100,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            );
          } else {
            return <Text style={styles.replyPreviewText}>GIF not found</Text>;
          }
        } else {
          return (
            <Text style={styles.replyPreviewText} numberOfLines={2}>
              GIF not available
            </Text>
          );
        }
      case 'post':
      case 'reel':
        if (replyMessage?.post?.imageUrl) {
          return (
            <TouchableOpacity
              onPress={() =>
                navigate('PostScreen', {
                  postId: replyMessage.post?._id,
                  type: replyMessage.type,
                })
              }>
              <View
                style={{
                  position: 'relative',
                  width: 120,
                  height: message.type === 'post' ? 120 : 220,
                }}>
                <FastImage
                  source={{
                    uri: replyMessage.post.imageUrl,
                  }}
                  style={{width: '100%', height: '100%'}}
                  resizeMode={
                    replyMessage.type === 'post'
                      ? FastImage.resizeMode.contain
                      : FastImage.resizeMode.cover
                  }
                />

                {/* Show Reels icon for reel thumbnail */}
                {replyMessage.type === 'reel' && (
                  <View style={styles.videoIconWrapper}>
                    <ReelsSVG
                      width={24}
                      height={24}
                      color={'white'}
                      fill={'white'}
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }
        return null;
      default:
        return (
          <Text style={styles.replyPreviewText} numberOfLines={2}>
            {replyMessage.type}
          </Text>
        );
    }
  }

  const getMessageStyle = (message: IUIMessage, baseStyle: any) => {
    // if message type is image, then background transparent and only border visible
    if (message.type !== 'image') {
      return baseStyle;
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 4,
        borderColor: baseStyle.backgroundColor,
      };
    }
  };

  return {
    formatTime,
    convertMessageFormat,
    handleDeleteChat,
    handleBlock,
    handleMessageDeletionSettings,
    handleProfileNavigation,
    isSwitchOn,
    showOptions,
    setIsSwitchOn,
    setShowOptions,
    getGIFData,
    renderReplyToMessageContent,
    getMessageStyle,
  };
};
