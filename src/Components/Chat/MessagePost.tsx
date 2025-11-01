import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {navigate} from '../../Utils/navigation';
import {ReelsSVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import {useTheme} from '../../Theme/ThemeContext';
import {LockSVG} from '../../Assets/Images/SVGs/SettingsSVG';

const MessagePost = ({message}: {message: IUIMessage}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const postHeight = message.type === 'post' ? 200 : 300;
  const isPrivate = message.isPostPrivate || false;
  if (!message.post || !message.post?.imageUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText]}>
          {message.type === 'post' ? 'Post' : 'Reel'} no longer available
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      disabled={isPrivate}
      style={styles.container}
      onPress={() => {
        navigate('PostScreen', {
          postId: message.post._id,
          type: message.type,
        });
      }}>
      <View style={styles.postContainer}>
        <View
          style={{
            position: 'relative',
            width: 200,
            height: postHeight,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isPrivate ? (
            <View style={styles.privateOverlay}>
              <LockSVG width={48} height={48} color={'white'} fill={'white'} />
              <Text style={styles.privateText}>
                This post belongs to private account
              </Text>
            </View>
          ) : (
            <FastImage
              source={{uri: message.post.imageUrl}}
              style={{width: '100%', height: '100%'}}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}

          {/* Reels icon */}
          {message.type !== 'post' && (
            <View style={styles.videoIconWrapper}>
              <ReelsSVG width={24} height={24} color={'white'} fill={'white'} />
            </View>
          )}
        </View>

        {/* Caption (only if not private) */}
        {!isPrivate && message.post.caption && (
          <Text
            style={[
              styles.caption,
              {
                color:
                  message.sender === 'me'
                    ? colors.senderMessageTextColor
                    : colors.receiverMessageTextColor,
              },
            ]}>
            {message.post.caption}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 4,
      maxWidth: '80%',
    },
    postContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    postImage: {
      width: '100%',
      height: 200,
      backgroundColor: '#f0f0f0',
    },
    caption: {
      padding: 12,
      fontSize: 14,
    },
    sharedIndicator: {
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    sharedText: {
      fontSize: 12,
      fontStyle: 'italic',
    },
    errorContainer: {
      padding: 12,
      borderRadius: 16,
      backgroundColor: '#f8f8f8',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    errorText: {
      fontSize: 14,
      color: 'black',
    },
    videoIconWrapper: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 4,
      borderRadius: 12,
    },
    privateOverlay: {
      position: 'absolute',
      top: 4,
      left: 4,
      backgroundColor: '#d3d3d3',
      opacity: 0.5,
      padding: 4,
      borderRadius: 12,
      flex: 1,
      gap: 5,
      flexDirection: 'column',
      justifyContent: 'center',
      alignContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
    },
    privateText: {
      position: 'relative',
      fontSize: 15,
      fontWeight: 'bold',
      marginTop: 8,
      textAlign: 'center',
      paddingHorizontal: 10,
      color: 'black',
    },
  });

export default MessagePost;
