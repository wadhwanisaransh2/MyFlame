import React, {useRef, useState, useEffect, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Keyboard,
  Dimensions,
  Animated,
  InteractionManager,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {CustomBottomSheet} from './CustomBottomSheet';
import {SendSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {IMAGES} from '../../Assets';
import {
  useCommentOnPostMutation,
  useLazyGetPostCommentsQuery,
  PostCommentsResponse,
  CommentItem,
} from '../../redux/api/post';
import {ActivityIndicator} from 'react-native';
import {formatPostDate} from '../../Utils/general';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { wp } from '../../Utils/responsive';

export interface CommentSheetRef {
  open: (id: string) => void;
  close: () => void;
}

interface PageData {
  page: number;
  totalPage: number;
}

// Memoized comment item component for better performance
const CommentItemComponent = React.memo<{item: CommentItem; colors: ColorThemeInterface}>(
  ({item, colors}) => {
    const styles = useMemo(() => getCommentItemStyles(colors), [colors]);
    
    const displayName = useMemo(() => 
      `${item.firstName} ${item.lastName}`, 
      [item.firstName, item.lastName]
    );
    
    const formattedDate = useMemo(() => 
      formatPostDate(item.createdAt), 
      [item.createdAt]
    );

    const imageSource = useMemo(() => 
      item?.profilePicture ? {uri: item.profilePicture} : IMAGES.userImg,
      [item.profilePicture]
    );

    return (
      <View style={styles.commentContainer}>
        <FastImage
          style={styles.avatar}
          source={imageSource}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.timestamp}>{formattedDate}</Text>
          </View>
          <Text style={styles.commentText} selectable>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }
);

// Memoized shimmer loader component
const CommentLoader = React.memo<{colors: ColorThemeInterface; isDark: boolean}>(
  ({colors, isDark}) => {
    const styles = useMemo(() => getCommentItemStyles(colors), [colors]);
    const shimmerColors = useMemo(() => 
      isDark ? ['#181920', colors.grey] : [colors.lightGrey, colors.lightGrey2],
      [isDark, colors.grey, colors.lightGrey, colors.lightGrey2]
    );

    return (
      <View style={styles.commentContainer}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.avatar}
          LinearGradient={LinearGradient}
        />
        <View style={styles.commentContent}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 100, height: 12, borderRadius: 12}}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: wp('70%'), height: 10, borderRadius: 12, marginTop: 6}}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: wp('50%'), height: 10, borderRadius: 12, marginTop: 2}}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>
    );
  }
);

export const CommentSheet = React.forwardRef<CommentSheetRef>((props, ref) => {
  const {colors, isDark} = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);
  const [pageData, setPageData] = useState({
    page: 1,
    totalPage: 0,
  });
  const [postId, setPostId] = useState('');
  
  // Refs
  const bottomSheetRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const keyboardAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const bottomPosition = useRef(new Animated.Value(0)).current;
  
  // Memoized values
  const screenHeight = useMemo(() => Dimensions.get('window').height, []);
  
  const [commentOnPost, {isLoading: commentOnPostLoading}] = useCommentOnPostMutation();
  const [getPostComments] = useLazyGetPostCommentsQuery();
  const {profile} = useSelector((state: RootState) => state.AuthManager);

  // Optimized keyboard handling with smooth animations
  const keyboardDidShow = useCallback((e: any) => {
    const keyboardHeight = e.endCoordinates.height;
    
    // Cancel any existing animation
    if (keyboardAnimationRef.current) {
      keyboardAnimationRef.current.stop();
    }
    
    keyboardAnimationRef.current = Animated.timing(bottomPosition, {
      toValue: keyboardHeight,
      duration: Platform.OS === 'ios' ? 250 : 200,
      useNativeDriver: false,
    });
    
    keyboardAnimationRef.current.start(() => {
      // Scroll to end after animation completes for smoother experience
      InteractionManager.runAfterInteractions(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      });
    });
  }, [bottomPosition]);

  const keyboardDidHide = useCallback(() => {
    if (keyboardAnimationRef.current) {
      keyboardAnimationRef.current.stop();
    }
    
    keyboardAnimationRef.current = Animated.timing(bottomPosition, {
      toValue: 0,
      duration: Platform.OS === 'ios' ? 250 : 200,
      useNativeDriver: false,
    });
    
    keyboardAnimationRef.current.start();
  }, [bottomPosition]);

  useEffect(() => {
    const showListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', keyboardDidShow)
      : Keyboard.addListener('keyboardDidShow', keyboardDidShow);
      
    const hideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', keyboardDidHide)
      : Keyboard.addListener('keyboardDidHide', keyboardDidHide);

    return () => {
      // Clean up animations
      if (keyboardAnimationRef.current) {
        keyboardAnimationRef.current.stop();
      }
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardDidShow, keyboardDidHide]);

  const handleAddComment = useCallback(async () => {
    if (newComment.trim() === '') return;
    
    try {
      await commentOnPost({id: postId, comment: newComment});
      // Optimistically update UI
      setNewComment('');
      Keyboard.dismiss();
      // Refresh comments after a brief delay to ensure server update
      setTimeout(() => getComment(postId), 300);
    } catch (error) {
      }
  }, [newComment, postId, commentOnPost]);

  const getComment = useCallback(async (id: string, page: number = 1) => {
    if (!id) return;
    
    try {
      const cursor = page === 1 ? '' : page.toString();
      const response = await getPostComments({ 
        id, 
        cursor 
      }).unwrap();
      
      const result = response as unknown as PostCommentsResponse;
      
      if (page === 1) {
        setComments(result.comments);
      } else {
        setComments(prev => [...prev, ...result.comments]);
      }
      
      setPageData(prevData => ({
        ...prevData,
        page: result.currentPage,
        totalPage: result.totalPages
      }));
    } catch (err) {
      // Handle error
    } finally {
      setIsLoading(false);
      setIsFooterLoading(false);
    }
  }, [getPostComments]);

  const handleLoadMore = useCallback(() => {
    if (pageData.page < pageData.totalPage && !isFooterLoading) {
      setIsFooterLoading(true);
      const nextPage = pageData.page + 1;
      getComment(postId, nextPage);
    }
  }, [pageData, isFooterLoading, postId, getComment]);

  const renderComment = useCallback(({item}: {item: CommentItem}) => (
    <CommentItemComponent item={item} colors={colors} />
  ), [colors]);

  const keyExtractor = useCallback((item: CommentItem) => item._id, []);

  const onEndReached = useCallback(() => {
    handleLoadMore();
  }, [handleLoadMore]);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No comments yet.</Text>
    </View>
  ), [styles.emptyContainer, styles.emptyText]);

  const ListFooterComponent = useMemo(() => (
    isFooterLoading ? (
      <ActivityIndicator 
        color={colors.primaryColor} 
        style={{marginVertical: 10}} 
        size="small"
      />
    ) : null
  ), [isFooterLoading, colors.primaryColor]);

  const profileImageSource = useMemo(() => 
    profile?.profilePicture ? {uri: profile.profilePicture} : IMAGES.userImage,
    [profile?.profilePicture]
  );

  const isCommentValid = useMemo(() => 
    newComment.trim().length > 0,
    [newComment]
  );

  const onSheetDismiss = useCallback(() => {
    setPostId('');
    setComments([]);
    setNewComment('');
    setPageData({page: 1, totalPage: 0});
    Keyboard.dismiss();
  }, []);

  React.useImperativeHandle(ref, () => ({
    open: (id: string) => {
      setPostId(id);
      setIsLoading(true);
      bottomSheetRef.current?.open();
      // Delay comment fetching to ensure smooth sheet opening
      InteractionManager.runAfterInteractions(() => {
        getComment(id);
      });
    },
    close: () => {
      Keyboard.dismiss();
      bottomSheetRef.current?.close();
    },
  }), [getComment]);

  const loadingComponents = useMemo(() => 
    Array.from({length: 8}, (_, i) => (
      <CommentLoader key={i} colors={colors} isDark={isDark} />
    )),
    [colors, isDark]
  );

  return (
    <CustomBottomSheet
      ref={bottomSheetRef}
      title="Comments"
      height={500}
      onDismiss={onSheetDismiss}>
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.commentList}>
            {loadingComponents}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={comments}
            renderItem={renderComment}
            keyExtractor={keyExtractor}
            contentContainerStyle={[
              styles.commentList,
              { paddingBottom: 120 }
            ]}
            style={styles.flatList}
            ListEmptyComponent={ListEmptyComponent}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            ListFooterComponent={ListFooterComponent}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
            getItemLayout={(data, index) => ({
              length: 70, // Approximate height of comment item
              offset: 70 * index,
              index,
            })}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        <Animated.View 
          style={[
            styles.inputContainer, 
            { transform: [{ translateY: bottomPosition.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -1],
              extrapolate: 'clamp'
            })}] }
          ]}>
          <FastImage
            style={styles.avatar}
            source={profileImageSource}
            resizeMode={FastImage.resizeMode.cover}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.grey}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
            textAlignVertical="center"
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={handleAddComment}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !isCommentValid && styles.sendButtonDisabled
            ]}
            onPress={handleAddComment}
            disabled={commentOnPostLoading || !isCommentValid}
            activeOpacity={0.7}>
            {commentOnPostLoading ? (
              <ActivityIndicator color={'#ffff'} size="small" />
            ) : (
              <SendSVG width={20} height={20} />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </CustomBottomSheet>
  );
});

const getCommentItemStyles = (colors: ColorThemeInterface) => StyleSheet.create({
  commentContainer: {
    width: '100%',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    alignItems: 'center',
  },
  userName: {
    fontWeight: '600',
    fontSize: fontSize.f14,
    color: colors.black,
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: fontSize.f12,
    color: colors.grey,
    flexShrink: 0,
  },
  commentText: {
    fontSize: fontSize.f14,
    color: colors.black,
    lineHeight: 20,
    marginTop: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.lightGrey,
  },
  commentContent: {
    flex: 1,
  },
});

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
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
      paddingHorizontal: 16,
      paddingTop: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingVertical: 12,
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.lightGrey,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      color: colors.black,
      fontSize: fontSize.f14,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.inputBackground,
      borderRadius: 20,
      marginHorizontal: 8,
      textAlignVertical: 'center',
    },
    sendButton: {
      width: 40,
      height: 40,
      backgroundColor: colors.primaryColor,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.grey,
      opacity: 0.6,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.lightGrey,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 40,
    },
    emptyText: {
      fontSize: fontSize.f14,
      color: colors.grey,
      textAlign: 'center',
    },
  });