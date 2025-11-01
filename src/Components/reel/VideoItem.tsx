import {View, Text, StyleSheet, Platform, Share} from 'react-native';
import React, {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {useIsFocused} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import Video from 'react-native-video';

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
// import DoubleTapAnim from '../../assets/animations/heart.json';
import ReelItem from './ReelItem';
import {getVideoHeight, height, width} from '../../Utils/responsive';
import {ANIMATION} from '../../Assets';
import {BackArrow} from '../../Assets/Images/SVGs/CommonSVG';

export interface ReelItem {
  _id: string;
  userId: string;
  user: {
    username: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
  };
  videoUrl: string;
  imageUrl: string;
  type: 'reel';
  privacy: 'private';
  isArchived: boolean;
  isLiked: boolean;
  likes: any[];
  comments: any[];
  tags: string[];
  createdAt: string;
  caption: string;
  likeCount: number;
}

interface VideoItemProps {
  item: ReelItem;
  isVisible: boolean;
  preload: boolean;
  onPressComment: () => void;
  onBackPress: () => void;
  onMorePress: () => void;
  onSharePress: () => void;
}

const VideoItem: FC<VideoItemProps> = ({
  item,
  isVisible,
  preload,
  onPressComment,
  onBackPress,
  onMorePress,
  onSharePress,
}) => {
  const [paused, setPaused] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [showLikeAnim, setShowLikeAnim] = useState<boolean>(false);
  const isFocused = useIsFocused();

  const reelMeta = useMemo(() => {
    return {
      isLiked: item?.isLiked,
      likesCount: item?.likeCount,
    };
  }, [item?._id]);

  const commentMeta = useMemo(() => {
    return item?.comments?.length;
  }, [item?._id]);

  const handleLikeReel = async () => {
    // await dispatch(
    //   toggleLikeReel(item._id, reelMeta?.likesCount, reelMeta?.isLiked),
    // );
  };

  const handleTogglePlay = useCallback(() => {
    let currentState = !paused ? 'paused' : 'play';
    setIsPaused(!isPaused);
    setPaused(currentState);
    setTimeout(() => {
      if (currentState === 'play') setPaused(null);
    }, 700);
  }, [paused, isPaused]);

  const handleDoubleTapLike = useCallback(() => {
    setShowLikeAnim(true);
    if (!reelMeta?.isLiked) {
      handleLikeReel();
    }
    setTimeout(() => {
      setShowLikeAnim(false);
    }, 1200);
  }, [reelMeta]);

  const singleTap = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      handleTogglePlay();
    })
    .runOnJS(true);

  const doubleTap = Gesture.Tap()
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      handleDoubleTapLike();
    })
    .runOnJS(true);

  useEffect(() => {
    setIsPaused(!isVisible);
    if (!isVisible) {
      setPaused(null);
      setVideoLoaded(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isFocused) {
      setIsPaused(true);
    }
    if (isFocused && isVisible) {
      setIsPaused(false);
    }
  }, [isFocused]);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
  };

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={{flex: 1}}>
        <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
          <View style={styles.videoContainer}>
            {!videoLoaded && (
              <FastImage
                source={{uri: item.imageUrl, priority: FastImage.priority.high}}
                style={styles.videoContainer}
                // defaultSource={Loader}
                resizeMode="cover"
              />
            )}

            {isVisible || preload ? (
              <Video
                poster={item.imageUrl}
                posterResizeMode="cover"
                source={isVisible || preload ? {uri: item.videoUrl} : undefined}
                bufferConfig={{
                  minBufferMs: 2500,
                  maxBufferMs: 3000,
                  bufferForPlaybackMs: 2500,
                  bufferForPlaybackAfterRebufferMs: 2500,
                }}
                ignoreSilentSwitch={'ignore'}
                playWhenInactive={false}
                playInBackground={false}
                useTextureView={false}
                controls={false}
                disableFocus={true}
                style={styles.videoContainer}
                paused={isPaused}
                repeat={true}
                hideShutterView
                minLoadRetryCount={5}
                resizeMode="cover"
                shutterColor="transparent"
                onReadyForDisplay={handleVideoLoad}
              />
            ) : null}
          </View>
        </GestureDetector>
      </GestureHandlerRootView>

      {showLikeAnim && (
        <View style={styles.lottieContainer}>
          <LottieView
            style={styles.lottie}
            source={ANIMATION.Play}
            autoPlay
            loop={false}
          />
        </View>
      )}

      {paused !== null && (
        <View style={styles.playPauseButton}>
          <View style={styles.shadow} pointerEvents="none">
            <BackArrow />
          </View>
        </View>
      )}

      {/* <ReelItem
        user={item?.user}
        description={item.caption}
        likes={reelMeta?.likesCount || 0}
        comments={0}
        onLike={() => {
          handleLikeReel();
        }}
        onComment={() => {
          onPressComment();
        }}
        onLongPressLike={() => {
          onMorePress();
        }}
        onShare={() => {
          onSharePress();
        }}
        isLiked={reelMeta?.isLiked}
      /> */}
    </View>
  );
};

const areEqual = (prevProps: VideoItemProps, nextProps: VideoItemProps) => {
  return (
    prevProps?.item?._id === nextProps?.item?._id &&
    prevProps?.isVisible === nextProps?.isVisible
  );
};

export default memo(VideoItem, areEqual);

const styles = StyleSheet.create({
  container: {
    height: height,
    width: width,
    flexGrow: 1,
    flex: 1,
  },
  playPauseButton: {
    position: 'absolute',
    top: '47%',
    bottom: 0,
    left: '44%',
    opacity: 0.7,
  },
  shadow: {
    zIndex: -1,
  },
  lottieContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: height,
    aspectRatio: 9 / 16,
    flex: 1,
    zIndex: -1,
  },
});
