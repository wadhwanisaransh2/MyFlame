import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {useGetUserConversationsQuery} from '../../redux/api/chat';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {useTheme} from '../../Theme/ThemeContext';
import {hp} from '../../Utils/responsive';
import {Colors} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {CloseSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {TouchableOpacity} from 'react-native';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import FastImage from 'react-native-fast-image';
import {IMAGES} from '../../Assets';
import {socket, socketEmit, socketListen} from '../../Service/socketio';
import {socketEvents} from '../../Constants/socket';
import {CONVERSATION_DATA_LIMIT, MAXIMUM_POST_SENDS} from '../../Constants';
import CheckSVG from '../../Assets/Images/SVGs/CheckSVG';
import {showToast} from '../../Utils/general';
import CustomBottomSheetNew from '../BottomSheet/CustomBottomSheetNew';

interface Props {
  postId: string;
  postImage: string;
  postCaption: string;
  type: 'post' | 'reel';
  // ref: any;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const SendPost = ({postId, type, isOpen, setIsOpen}: Props) => {
  const {colors} = useTheme();
  const [page, setPage] = useState({
    current: 1,
    total: 1,
  });
  const [isSending, setIsSending] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<
    Array<IConversation>
  >([]);
  const [selectedSenders, setSelectedSenders] = useState<Array<string>>([]);
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showShimmer, setShowShimmer] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cursor, setCursor] = useState('');
  const containerRef = useRef<any>(null);

  const {
    data: conversationsData,
    isLoading: loading,
    refetch,
  } = useGetUserConversationsQuery({
    searchText: debouncedSearchText,
    cursor: cursor,
    limit: CONVERSATION_DATA_LIMIT,
  });

  useEffect(() => {
    if (loading) return;

    setShowShimmer(false);
    const newData = conversationsData?.data || [];

    // If cursor is empty, treat it as a fresh fetch/search
    const isFreshFetch = cursor === '';

    setFilteredConversations(prev => {
      if (isFreshFetch) {
        return newData;
      }

      // For pagination, add only unique conversations
      const existingIds = new Set(prev.map(item => item.conversationId));
      const uniqueNewData = newData.filter(
        (item: IConversation) => !existingIds.has(item.conversationId),
      );
      return [...prev, ...uniqueNewData];
    });

    setLoadingMore(false);
  }, [conversationsData, loading]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setCursor('');
      setDebouncedSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  useEffect(() => {
    socketListen('bulkPostComplete', () => {
      setIsSending(false);
      showToast('Post shared successfully!');
      setIsOpen(false);
      setSelectedSenders([]);
    });
    socketListen('bulkPostError', () => {
      setIsSending(false);
      showToast('Failed to share Post!');
      setSelectedSenders([]);
      setIsOpen(false);
    });
    return () => {
      socket?.off('bulkPostComplete');
      socket?.off('bulkPostError');
    };
  }, [socket?.connected]);

  const handleSendPost = () => {
    if (!socket?.connected || selectedSenders.length === 0) return;
    setIsSending(true);
    const data = {
      type,
      receiverIds: selectedSenders,
      postId: postId,
      post: {
        _id: postId,
        imageUrl:
          'https://myflamabucket.s3.amazonaws.com/posts/10a4dc95-4736-4fff-a32a-758a6d7df3da-image.jpg',
        caption: '🎉🎉🙃🙃🙄',
      },
    };
    socketEmit(socketEvents.sendPost, data);
    // reset state
    setSearchText('');
    setPage(prev => ({...prev, current: 1}));
    containerRef.current?.close();
  };

  const handleSenderClick = (id: string) => {
    const alreadyExists = selectedSenders.find(sId => sId === id);
    // if select
    if (!alreadyExists && selectedSenders.length + 1 > MAXIMUM_POST_SENDS) {
      showToast(`Cannot share post with more than ${MAXIMUM_POST_SENDS} users`);
      return;
    }
    setSelectedSenders(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id],
    );
  };

  const styles = makeStyles(colors);

  if (!isOpen) {
    return null;
  }

  // Calculate item width for equal spacing
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const horizontalPadding = 20;
  const itemSpacing = 15;
  const itemWidth =
    (screenWidth - horizontalPadding * 2 - itemSpacing * (numColumns - 1)) /
    numColumns;

  const renderConversationItem = ({
    item,
    index,
  }: {
    item: IConversation;
    index: number;
  }) => {
    const participantId = item?.participant?._id;
    const isSelected = participantId
      ? selectedSenders.includes(participantId)
      : false;

    const isLastInRow = (index + 1) % numColumns === 0;
    const isNotLastRow =
      index < (conversationsData?.data?.length || 0) - numColumns;

    return (
      <TouchableOpacity
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: itemWidth,
          marginRight: isLastInRow ? 0 : itemSpacing,
          marginBottom: isNotLastRow ? 15 : 0,
        }}
        onPress={() => {
          if (participantId) {
            handleSenderClick(participantId);
          }
        }}>
        <FastImage
          source={
            item?.participant?.profilePicture
              ? {uri: item.participant.profilePicture}
              : IMAGES.userImage
          }
          style={styles.avatar}
        />
        {item.participant?.username && (
          <Text style={styles.name}>
            {item.participant?.username?.length > 10
              ? item.participant.username.slice(0, 10) + '…'
              : item.participant?.username}
          </Text>
        )}
        {isSelected && (
          <View style={styles.checkIcon}>
            <CheckSVG width={16} height={16} fill={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <CustomBottomSheetNew
      ref={containerRef}
      index={3}
      paddingHorizontal={0}
      label="Share post"
      onClose={() => {
        setIsOpen(false);
      }}
      RenderFooter={() => (
        <TouchableOpacity style={styles.sendBtn} onPress={handleSendPost}>
          <Text style={[styles.sendText, {opacity: isSending ? 0.5 : 1}]}>
            {isSending ? 'Sending...' : 'Send'}
          </Text>
        </TouchableOpacity>
      )}
      renderView={() => (
        <View style={styles.container}>
          <View style={[styles.chatHeader]}>
            <View
              style={[
                styles.searchBar,
                {backgroundColor: colors.inputBackground},
              ]}>
              <SearchSVG width={27} height={27} fill={colors.grey} />
              <TextInput
                placeholder="Search"
                placeholderTextColor={colors.grey}
                style={styles.input}
                value={searchText}
                onChangeText={value => {
                  setSearchText(value);
                  setShowShimmer(true);
                }}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.primaryColor,
                    }}>
                    <CloseSVG width={20} height={20} fill={colors.white} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={{marginVertical: 20, width: '100%'}}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primaryColor} />
              </View>
            ) : (
              <FlatList
                contentContainerStyle={{
                  paddingVertical: 10,
                }}
                data={conversationsData?.data || []}
                numColumns={3}
                renderItem={renderConversationItem }
                keyExtractor={item => item.conversationId}
                onRefresh={refetch}
                refreshing={loading}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyText}>No conversations found.</Text>
                )}
              />
            )}
          </View>
        </View>
      )}
    />
  );
};

export default SendPost;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      position: 'relative',
      paddingHorizontal: 25,
      // marginHorizontal: 20,
    },
    chatHeader: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchBar: {
      width: '100%',
      borderRadius: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      borderColor: colors.primaryColor,
      borderWidth: 2,
      paddingHorizontal: 15,
      marginVertical: 10,
    },
    input: {
      flex: 1,
      fontSize: 20,
      color: Colors.grey,
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
      paddingTop: hp('10%'),
    },
    emptyText: {
      fontSize: 16,
      color: colors.textColor,
      fontFamily: fontFamily.regular,
    },
    name: {
      fontSize: fontSize.f16,
      color: colors.black,
      fontWeight: 'condensedBold',
    },
    avatar: {
      width: 62,
      height: 62,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      resizeMode: 'cover',
    },
    sendBtn: {
      backgroundColor: colors.primaryColor,
      paddingVertical: 10,
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'nowrap',
      gap: 2,
      position: 'absolute',
      bottom: 35,
      left: 35,
      right: 35,
    },
    sendText: {
      fontSize: fontSize.f18,
      color: 'white',
      fontWeight: 'bold',
    },
    checkIcon: {
      backgroundColor: colors.primaryColor,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      right: 0,
    },
  });
