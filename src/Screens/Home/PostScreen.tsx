import React, {useCallback, useMemo, useRef, useState} from 'react';
import {View, StyleSheet, InteractionManager, Dimensions} from 'react-native';
import {Text} from 'react-native-gesture-handler';
import {useRoute} from '@react-navigation/native';
import {useGetPostByIdQuery} from '../../redux/api/post';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigateBack} from '../../Utils/navigation';
import {ColorThemeInterface} from '../../Utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import {PostCard, PostCardLoader} from '../../Components/PostCard/PostCard';
import SendPost from '../../Components/Chat/SendPost';
import ShortReelComponent, {ReelSkeleton} from '../Reels/ShortRealComponent';
import ActionSheet from '../../Components/BottomSheet/ActionSheet';
import {ReportSVG} from '../../Assets/Images/SVGs/SettingsSVG';
import {BlockUser} from '../../Assets/Images/SVGs/PostSVG';
import {showToast} from '../../Utils/general';
import {useBlockUserMutation} from '../../redux/api/profile';
import ReportModal from '../../Components/Modals/ReportModal';
import {ReportType} from '../../Enum/enum';
import CommentSheet from '../../Components/BottomSheet/CommentSheet';
import {RootState} from '../../redux/Store';
import {useSelector} from 'react-redux';
import {fontSize} from '../../Utils/fontIcon';

const PostScreen = () => {
  const route = useRoute();
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const {postId, type} = route.params as {postId: string; type: string};
  const {data, isLoading, error, refetch} = useGetPostByIdQuery({id: postId});
  const postDetailsRef = useRef({caption: '', imageUrl: ''});
  const commentSheetRef = useRef<any>(null);
  const post = data as Post;
  // Reel related state
  const [currentSheetName, setCurrentSheetName] = useState<
    'share' | 'comment' | '' | 'action' | 'report'
  >('');
  const [isScreenFocused, setIsScreenFocused] = useState<boolean>(true); // Add this state
  const [blockUser] = useBlockUserMutation();

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const fullName = `${post?.user?.firstName} ${post?.user?.lastName}`;
  const uppercasetype = type?.charAt(0)?.toUpperCase() + type?.slice(1);
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const handleCommentPress = useCallback((postId: string, comments: any[]) => {
    setCurrentSheetName('comment');
    if (commentSheetRef.current) {
      commentSheetRef.current.open(postId, comments || []);
    }
  }, []);

  async function handleReportPost() {
    // First close the action sheet
    setCurrentSheetName('');

    // Then open the report modal after a short delay
    setTimeout(() => {
      setCurrentSheetName('report');
    }, 100); // Small delay to ensure action sheet closes first
  }

  async function handleUserBlock() {
    if (!post?.userId) {
      showToast('User is already blocked');
      return;
    }
    setCurrentSheetName('');
    await blockUser({userId: post.userId}).unwrap();
    showToast('User blocked successfully');
    refetch();
  }

  const actionSheetData = useMemo(() => {
    return [
      {
        id: '1',
        label: 'Block the user',
        icon: <BlockUser height={24} width={24} fill={colors.primaryColor} />,
        onPress: handleUserBlock,
      },
      {
        id: '2',
        label: 'Report the post',
        icon: <ReportSVG height={24} width={24} fill={colors.primaryColor} />,
        onPress: handleReportPost,
      },
    ];
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <CustomHeader title={uppercasetype} onBackPress={navigateBack} />
        <View style={{flex: 1, marginVertical: 50}}>
          <Text
            style={{
              fontSize: fontSize.f18,
              textAlign: 'center',
              fontWeight: 'condensedBold',
              color: colors.primaryColor,
            }}>
            Failed to load post! Try later
          </Text>
        </View>
      </View>
    );
  }

  if (!post && !isLoading) {
    return <Text>${type} not found.</Text>;
  }

  return (
    <View style={styles.container}>
      {type === 'post' ? (
        <CustomHeader title={uppercasetype} onBackPress={navigateBack} />
      ) : null}
      {type.trim().includes('post') ? (
        <View style={{flex: 1, marginVertical: 16}}>
          {isLoading ? (
            <PostCardLoader />
          ) : post ? (
            <PostCard
              username={fullName}
              handle={post?.user?.username || 'user'}
              content={post.caption}
              userAvatar={post.user?.profilePicture}
              image={post.imageUrl}
              likes={post.likes.length}
              comments={post.comments.length}
              _id={post._id}
              userId={post.userId}
              Liked={post.isLiked || false}
              showMoreBT={profile._id === post.userId ? false : true}
              onComment={() => handleCommentPress(post._id, post.comments)}
              onShare={() => {
                setCurrentSheetName('share');
                postDetailsRef.current = {
                  caption: post.caption,
                  imageUrl: post.imageUrl,
                };
              }}
              createdAt={post.createdAt}
              onMore={() => setCurrentSheetName('action')}
            />
          ) : (
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                margin: 'auto',
              }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: colors.primaryColor,
                }}>
                Post not found
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View>
          {isLoading ? (
            <ReelSkeleton onBackPress={navigateBack} />
          ) : post ? (
            <ShortReelComponent
              onMorePress={() => {
                setCurrentSheetName('action');
              }}
              item={post as any}
              onBackPress={navigateBack}
              index={1}
              isFocused={true}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              isPaused={isPaused || !isScreenFocused} // Pause if screen is not focused
              setIsPaused={setIsPaused}
              onPressComment={() => {
                setCurrentSheetName('comment');
                // Delay opening to ensure smooth transition
                InteractionManager.runAfterInteractions(() => {
                  commentSheetRef.current?.open(post._id);
                });
              }}
              onSharePress={() => {
                setCurrentSheetName('share');
              }}
              height={Dimensions.get('window').height}
            />
          ) : (
            <View
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                margin: 'auto',
              }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: 'bold',
                  color: colors.primaryColor,
                }}>
                Reel not found
              </Text>
            </View>
          )}
        </View>
      )}

      {currentSheetName === 'comment' && (
        <CommentSheet
          commentSheetRef={commentSheetRef}
          postId={postId}
          setIsCommentSheetOpen={(value: boolean) => {
            if (value) {
              setCurrentSheetName('comment');
            } else {
              setCurrentSheetName('');
            }
          }}
          profile={profile}
        />
      )}

      {currentSheetName === 'share' && (
        <SendPost
          postId={postId}
          postCaption={postDetailsRef.current.caption}
          postImage={postDetailsRef.current.imageUrl}
          type={type === 'post' ? 'post' : 'reel'}
          isOpen={currentSheetName === 'share'}
          setIsOpen={(value: boolean) => {
            if (value) {
              setCurrentSheetName('share');
            } else {
              setCurrentSheetName('');
            }
          }}
        />
      )}

      {currentSheetName === 'action' && (
        <ActionSheet
          data={actionSheetData}
          isVisible={currentSheetName === 'action'}
          onClose={() => setCurrentSheetName('')}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        visible={currentSheetName === 'report'}
        onClose={() => setCurrentSheetName('')}
        reportType={type === 'post' ? ReportType.POST : ReportType.REEL}
        id={postId}
      />
    </View>
  );
};

export default PostScreen;

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
  });
