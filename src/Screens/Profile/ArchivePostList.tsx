import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {ColorThemeInterface} from '../../Utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import {
  useDeletePostMutation,
  useGetArchivedPostsQuery,
  useUnarchivePostMutation,
} from '../../redux/api/post';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import {FlatList} from 'react-native-gesture-handler';
import {PostCard} from '../../Components/PostCard/PostCard';
import CommentSheet from '../../Components/BottomSheet/CommentSheet';
import {CustomBottomSheet} from '../../Components/BottomSheet/CustomBottomSheet';
import {TouchableOpacity} from 'react-native';
import {ArchiveSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {fontSize} from '../../Utils/fontIcon';
import {DeleteSVG, RestoreSVG} from '../../Assets/Images/SVGs/PostSVG';
import {hp, wp} from '../../Utils/responsive';
import {showToast} from '../../Utils/general';
import {Post} from '../../redux/api/profile';
import {ActivityIndicator} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import DataNotFound from '../../Components/Layout/DataNotFound';

export default function ArchivePostList({route}: {route: any}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [postsData, setPostsData] = useState<Post[]>([]);
  const {data, refetch}: any = useGetArchivedPostsQuery({
    page,
  });
  const commentSheetRef = useRef<any>(null);
  const actionSheetRef = useRef<any>(null);
  const [postId, setPostId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState<boolean>(false);
  const [currentPostId, setCurrentPostId] = useState<string>('');

  const [currentSheetName, setCurrentSheetName] = useState<
    'share' | 'comment' | '' | 'action' | 'report'
  >('');
  const {username, userId, userPicture, fullName} = route.params;

  // Get profile from Redux state
  const {profile} = useSelector((state: RootState) => state.AuthManager);

  useEffect(() => {
    if (data) {
      setTotalPages(data.totalPages);
      data?.page == 1
        ? setPostsData(data.posts)
        : setPostsData([...postsData, ...data.posts]);
      setMoreLoading(false);
    }
  }, [data]);

  // Handle comment sheet close
  const handleCommentSheetClose = () => {
    setIsCommentSheetOpen(false);
    setCurrentPostId('');
  };

  // Handle comment press
  const handleCommentPress = (postId: string, comments: any[]) => {
    setCurrentPostId(postId);
    setCurrentSheetName('comment');
  };

  const [restorePost, {isLoading: restorePostLoading}] =
    useUnarchivePostMutation();
  const [deletePost, {isLoading: deletePostLoading}] = useDeletePostMutation();
  const handleRestorePost = () => {
    restorePost({id: postId})
      .unwrap()
      .then(() => {
        refetch();
        if (actionSheetRef.current) {
          actionSheetRef.current.close();
        }
        showToast('Post restored successfully');
      })
      .catch((error: any) => {
        showToast('Failed to restore post');
      });
  };

  const handleDeletePost = () => {
    deletePost({id: postId})
      .unwrap()
      .then(() => {
        refetch();
        actionSheetRef.current?.close();
        showToast('Post deleted successfully');
      })
      .catch((error: any) => {
        showToast('Failed to delete post');
      });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const onLoadMore = () => {
    if (page < data?.totalPages) {
      setMoreLoading(true);
      setPage(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Archive Post" onBackPress={navigateBack} />
      <FlatList
        data={data?.posts}
        renderItem={({item}: {item: Post}) => (
          <PostCard
            userId={item.userId ?? item.user?._id}
            createdAt=""
            username={fullName}
            handle={username}
            userAvatar={userPicture}
            image={item?.imageUrl}
            content={item?.caption}
            likes={item?.likes?.length || 0}
            comments={item?.comments?.length || 0}
            shares={0}
            onComment={() => handleCommentPress(item._id, item?.comments || [])}
            onShare={() => {
              setCurrentPostId(item._id);
              setCurrentSheetName('share');
            }}
            onMore={() => {
              setPostId(item._id);
              actionSheetRef.current?.open();
              setCurrentSheetName('action');
            }}
            _id={item._id}
            Liked={item.isLiked || false}
            showMoreBT={true}
          />
        )}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={
          <View style={styles.listFooter}>
            {moreLoading && (
              <ActivityIndicator size="small" color={colors.primaryColor} />
            )}
          </View>
        }
        keyExtractor={item => item._id}
        ListEmptyComponent={
          <DataNotFound
            title="No posts Available"
            iconContainerStyle={{
              marginTop: hp('26%'),
            }}
            icon={<ArchiveSVG width={60} height={60} fill={'#fff'} />}
          />
        }
      />

      {isCommentSheetOpen && (
        <CommentSheet
          commentSheetRef={commentSheetRef}
          postId={currentPostId}
          setIsCommentSheetOpen={setIsCommentSheetOpen}
          profile={profile}
        />
      )}
      <CustomBottomSheet
        ref={actionSheetRef}
        title="More Actions"
        height={200}
        onDismiss={() => actionSheetRef.current?.close()}>
        <View style={styles.row}>
          <TouchableOpacity onPress={handleRestorePost}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: colors.primaryColor,
              }}>
              <RestoreSVG width={30} height={30} fill={colors.primaryColor} />
            </View>
            <Text
              style={{
                fontSize: fontSize.f18,
                color: colors.primaryColor,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              Restore Post
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePost}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                borderRadius: 50,
                borderWidth: 1,
                borderColor: colors.red,
              }}>
              <DeleteSVG width={30} height={30} fill={colors.red} />
            </View>
            <Text
              style={{
                fontSize: fontSize.f18,
                color: colors.red,
                fontWeight: '500',
                textAlign: 'center',
              }}>
              Delete Post
            </Text>
          </TouchableOpacity>
        </View>
      </CustomBottomSheet>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 30,
      paddingHorizontal: wp('20%'),
      width: wp('100%'),
    },

    listContent: {
      padding: 10,
    },
    listFooter: {
      padding: 10,
    },
  });
