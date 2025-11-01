import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomBottomSheetNew from './CustomBottomSheetNew';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import {hp, wp} from '../../Utils/responsive';
import FastImage from 'react-native-fast-image';
import {SendSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {fontSize} from '../../Utils/fontIcon';
import {
  useCommentOnPostMutation,
  useGetPostCommentsQuery,
} from '../../redux/api/post';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {formatPostDate} from '../../Utils/general';
import {IMAGES} from '../../Assets';
import {navigate} from '../../Utils/navigation';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {FlashList} from '@shopify/flash-list';

interface CommentSheetProps {
  commentSheetRef: any;
  setIsCommentSheetOpen: (value: boolean) => void;
  profile: any;
  postId: string;
}

interface CommentItem {
  _id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  text: string;
  createdAt: string;
}

export default function CommentSheet({
  commentSheetRef,
  setIsCommentSheetOpen,
  profile,
  postId,
}: CommentSheetProps) {
  const {colors, isDark} = useTheme();
  const styles = createStyle(colors);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentDetailsShowMore, setCommentDetailsShowMore] = useState('');

  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const [cursor, setCursor] = useState('');

  const [commentOnPost, {isLoading: commentOnPostLoading}] =
    useCommentOnPostMutation();

  const {data, isLoading}: any = useGetPostCommentsQuery({
    id: postId,
    cursor: cursor,
  });

  useEffect(() => {
    if (data) {
      if (cursor?.length === 0) {
        setComments(data?.comments);
      } else {
        setComments(prev => [...prev, ...data?.comments]);
      }
      setIsFooterLoading(false);
    }
  }, [data]);

  const handleLoadMore = () => {
    if (data?.nextCursor && data?.hasMore) {
      setIsFooterLoading(true);
      setCursor(data?.nextCursor);
    } else {
      }
  };

  const handleComment = async () => {
    if (comment.trim() !== '') {
      const res = await commentOnPost({id: postId, comment: comment});
      setComment('');
    }
  };

  const commentInput = () => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.emojiContainer}>
          {['😂', '😊', '😄', '🙏', '😡', '😢', '😍', '👍', '👎'].map(
            (emoji, index) => (
              <Text
                onPress={e => {
                  let temp = comment + emoji;
                  setComment(temp);
                }}
                style={styles.emoji}
                key={index}>
                {emoji}
              </Text>
            ),
          )}
        </View>
        <View style={styles.inputContainerBottom}>
          <FastImage
            source={{uri: profile?.profilePicture}}
            style={styles.avatar}
            resizeMode={FastImage.resizeMode.cover}
          />
          <TextInput
            placeholder="Add a comment..."
            placeholderTextColor={colors.grey}
            style={styles.input}
            onChangeText={text => setComment(text)}
            enterKeyHint="send"
            onSubmitEditing={() => handleComment()}
            value={comment}
          />
          <TouchableOpacity
            style={styles.sendButton}
            activeOpacity={0.7}
            disabled={commentOnPostLoading || comment.trim() === ''}
            onPress={handleComment}>
            {commentOnPostLoading ? (
              <ActivityIndicator size={'small'} color={'white'} />
            ) : (
              <SendSVG height={20} width={20} fill={'white'} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderComment = ({item}: {item: CommentItem}) => (
    <View style={styles.commentContainer}>
      <TouchableOpacity
        onPress={() => {
          navigate('ProfileScreen', {
            userId: item?.userId,
            username: item?.username,
          });
        }}>
        <FastImage
          style={[styles.avatar, {marginRight: wp('3%')}]}
          source={
            item?.profilePicture ? {uri: item?.profilePicture} : IMAGES.userImg
          }
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text
            style={styles.userName}
            onPress={() => {
              navigate('ProfileScreen', {
                userId: item?.userId,
                username: item?.username,
              });
            }}>
            @{item?.username}
          </Text>
          <Text style={styles.timestamp}>{formatPostDate(item.createdAt)}</Text>
        </View>
        <Text
          style={styles.commentText}
          onPress={() => {
            setCommentDetailsShowMore(prew =>
              prew === item._id ? '' : item._id,
            );
          }}
          numberOfLines={commentDetailsShowMore === item._id ? undefined : 1}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  const CommentLoader = () => {
    return (
      <View style={styles.commentContainer}>
        <View style={[styles.avatar, {marginRight: wp('5%'), backgroundColor: colors.lightGrey}]} />
        <View style={styles.commentContent}>
          <View style={{width: 100, height: 12, borderRadius: 12, backgroundColor: colors.lightGrey}} />
          <View style={{
            width: wp('70%'),
            height: 10,
            borderRadius: 12,
            marginTop: 6,
            backgroundColor: colors.lightGrey
          }} />
          <View style={{
            width: wp('50%'),
            height: 10,
            borderRadius: 12,
            marginTop: 2,
            backgroundColor: colors.lightGrey
          }} />
        </View>
      </View>
    );
  };

  const renderView = () => {
    return (
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.commentList}>
            {Array.from({length: 5}).map((_, i) => (
              <CommentLoader key={i} />
            ))}
          </View>
        ) : (
          <FlashList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item._id}
            contentContainerStyle={
              styles.commentList}
            style={styles.flatList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No comments yet.</Text>
              </View>
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              isFooterLoading ? (
                <ActivityIndicator
                  color={colors.primaryColor}
                  style={{marginVertical: 10}}
                />
              ) : null
            }
          />
        )}
      </View>
    );
  };

  return (
    <CustomBottomSheetNew
      label={'Comment Section'}
      ref={commentSheetRef}
      index={3}
      // withoutScrollView={true}
      RenderFooter={() => commentInput()}
      renderView={renderView}
      onClose={() => setIsCommentSheetOpen(false)}
    />
  );
}

const createStyle = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    input: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: wp('2%'),
      fontSize: hp('2%'),
      color: colors.black,
    },
    inputContainer: {
      paddingTop: hp('0.5% '),
      width: '100%',
    },
    emojiContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp('3%'),
      alignSelf: 'center',
      marginBottom: hp('1%'),
    },
    emoji: {
      fontSize: fontSize.f26,
    },

    inputContainerBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: wp('3%'),
      alignSelf: 'center',
      marginBottom: hp('1%'),
      width: '100%',
    },
    avatar: {
      width: wp('9%'),
      height: wp('9%'),
      borderRadius: 50,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },

    sendButton: {
      width: wp('8%'),
      height: wp('8%'),
      borderRadius: 50,
      padding: wp('5%'),
      backgroundColor: colors.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
    },

    commentContainer: {
      width: '100%',
      paddingVertical: 10,
      flexDirection: 'row',

      justifyContent: 'flex-start',
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    userName: {
      fontWeight: 'bold',
      fontSize: fontSize.f14,
      color: colors.black,
    },
    timestamp: {
      fontSize: fontSize.f12,
      color: colors.grey,
    },
    commentText: {
      fontSize: fontSize.f14,
      color: colors.black,
      marginBottom: 8,
    },

    commentContent: {
      flex: 1,
    },

    container: {
      flex: 1,
      width: '100%',
      position: 'relative',
    },
    flatList: {
      flex: 1,
      width: '100%',
    },
    commentList: {
      paddingHorizontal: wp('0%'),
      paddingTop: 10,
      paddingBottom: 20
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
    },
    emptyText: {
      fontSize: fontSize.f14,
      color: colors.grey,
    },
  });
