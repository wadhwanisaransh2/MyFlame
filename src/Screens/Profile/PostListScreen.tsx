import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {FlatList, RefreshControl} from 'react-native-gesture-handler';
import {useLazyGetUserPostsQuery} from '../../redux/api/profile';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {PostCard} from '../../Components/PostCard/PostCard';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import CommentSheet from '../../Components/BottomSheet/CommentSheet';
import {ArchiveSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {DeleteSVG} from '../../Assets/Images/SVGs/PostSVG';
import {
  useArchivePostMutation,
  useDeletePostMutation,
} from '../../redux/api/post';
import {showToast} from '../../Utils/general';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import ActionSheet from '../../Components/BottomSheet/ActionSheet';
import DataNotFound from '../../Components/Layout/DataNotFound';
import SendPost from '../../Components/Chat/SendPost';

export default function PostListScreen({route}: PostListScreenProps) {
  const {
    userId,
    index,
    page,
    totalPage,
    posts,
    username,
    userPicture,
    fullName,
    isMyProfile,
  } = route.params;

  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);
  const flatListRef = useRef<FlatList<Post>>(null);
  const [isInitialScrollComplete, setIsInitialScrollComplete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [postsData, setPostsData] = useState<Post[]>([...posts]);
  const [pageNumber, setPageNumber] = useState(page);
  const [totalPages, setTotalPages] = useState(totalPage);
  // const [currentPostId, setCurrentPostId] = useState<string>('');
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState<boolean>(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState<boolean>(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState<boolean>(false);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const [getUserPosts, {isLoading: postsLoading}] = useLazyGetUserPostsQuery();
  const [archivePost] = useArchivePostMutation();
  const [deletePost] = useDeletePostMutation();
  const postIdRef = useRef<string>('');
  const postDetailsRef = useRef({caption: '', imageUrl: ''});
  const commentSheetRef = useRef<any>(null);

  // Handle comment press
  const handleCommentPress = (postId: string, comments: any[]) => {
    postIdRef.current = postId;
    setIsCommentSheetOpen(true);
  };

  // Handle refreshing
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getUserPosts({page: 1, userId, type: 'post'})
      .unwrap()
      .then(response => {
        setPostsData(response.items);
        setPageNumber(1);
        setTotalPages(response.totalPages);
      })
      .catch((error: any) => {
        })
      .finally(() => {
        setRefreshing(false);
      });
  }, [userId]);

  const onLoadMore = useCallback(() => {
    if (pageNumber < totalPages && !postsLoading) {
      getUserPosts({page: pageNumber + 1, userId, type: 'post'})
        .unwrap()
        .then(response => {
          setPostsData(prev => [...prev, ...response.items]);
          setPageNumber(prev => prev + 1);
        })
        .catch((error: any) => {
          });
    }
  }, [pageNumber, totalPages, postsLoading, userId]);

  const handleArchivePost = useCallback(() => {
    archivePost({id: postIdRef.current})
      .unwrap()
      .then(() => {
        onRefresh();
        showToast('Post archived successfully');
        setIsActionSheetOpen(false);
      })
      .catch((error: any) => {
        showToast('Failed to archive post');
      });
  }, [postIdRef.current, onRefresh]);

  const handleDeletePost = useCallback(() => {
    deletePost({id: postIdRef.current})
      .unwrap()
      .then(() => {
        onRefresh();
        showToast('Post deleted successfully');
        setIsActionSheetOpen(false);
      })
      .catch((error: any) => {
        showToast('Failed to delete post');
      });
  }, [postIdRef.current, onRefresh]);

  // Auto-scroll to the selected post index when screen loads
  useEffect(() => {
    if (posts.length > 0 && index >= 0 && !isInitialScrollComplete) {
      const timer = setTimeout(() => {
        try {
          flatListRef.current?.scrollToIndex({
            index,
            animated: false,
            viewPosition: 0,
          });
          setIsInitialScrollComplete(true);
        } catch (error) {
          }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [index, posts.length, isInitialScrollComplete]);

  const actionSheetData = useMemo(() => {
    return [
      {
        id: '1',
        label: 'Archive',
        icon: <ArchiveSVG height={24} width={24} fill={colors.primaryColor} />,
        onPress: handleArchivePost,
      },
      {
        id: '2',
        label: 'Delete',
        icon: <DeleteSVG height={24} width={24} fill={colors.red} />,
        onPress: handleDeletePost,
      },
    ];
  }, [colors.primaryColor, colors.red, handleArchivePost, handleDeletePost]);

  const onScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: Math.min(info.highestMeasuredFrameIndex, posts.length - 1),
          animated: false,
        });

        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: info.index,
            animated: false,
            viewPosition: 0,
          });
        }, 100);
      }, 100);

      return () => clearTimeout(timer);
    },
    [posts.length],
  );

  const renderItem = useCallback(
    ({item}: {item: Post}) => (
      <PostCard
        createdAt={item.createdAt}
        username={fullName}
        Liked={item.isLiked || false}
        handle={username}
        userAvatar={userPicture}
        image={item.imageUrl}
        content={item.caption}
        likes={item.likes?.length}
        comments={item.comments?.length}
        shares={0}
        onComment={() => handleCommentPress(item._id, item.comments)}
        onShare={() => {
          setIsShareSheetOpen(true);
          postDetailsRef.current = {
            caption: item.caption,
            imageUrl: item.imageUrl,
          };
          postIdRef.current = item._id;
        }}
        onMore={() => {
          postIdRef.current = item._id;
          setIsActionSheetOpen(true);
        }}
        _id={item._id}
        showMoreBT={isMyProfile}
        userId={item.userId}
      />
    ),
    [fullName, username, userPicture, isMyProfile],
  );

  if (!postsData.length && !postsLoading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Posts" onBackPress={navigateBack} />
        <DataNotFound
          title="No Posts Found"
          subtitle="There are no posts to display at the moment."
          OnRefresh={onRefresh}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Posts" onBackPress={navigateBack} />

      <FlatList
        ref={flatListRef}
        data={postsData}
        renderItem={renderItem}
        keyExtractor={item => `${item._id}`}
        onScrollToIndexFailed={onScrollToIndexFailed}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primaryColor}
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
      />

      {isCommentSheetOpen && (
        <CommentSheet
          commentSheetRef={commentSheetRef}
          postId={postIdRef.current}
          setIsCommentSheetOpen={setIsCommentSheetOpen}
          profile={profile}
        />
      )}

      {isActionSheetOpen && (
        <ActionSheet
          data={actionSheetData}
          isVisible={isActionSheetOpen}
          onClose={() => setIsActionSheetOpen(false)}
        />
      )}
      {isShareSheetOpen && (
        <SendPost
          postId={postIdRef.current}
          postCaption={postDetailsRef.current.caption}
          postImage={postDetailsRef.current.imageUrl}
          type="post"
          isOpen={isShareSheetOpen}
          setIsOpen={setIsShareSheetOpen}
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    listContent: {
      paddingBottom: 20,
    },
  });
