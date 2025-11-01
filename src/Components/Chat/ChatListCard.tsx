import {Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import {StrikeSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {useTheme} from '../../Theme/ThemeContext';
import {IMAGES} from '../../Assets';
import {formatTime} from '../../Utils/general';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import HourGlassSVG from '../../Assets/Images/SVGs/HourGlassSVG';
import {useRecoverStreakMutation} from '../../redux/api/chat';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {makeChatlistCardStyles} from './messageStyle';

export default function ChatListCard({
  item,
  onPress,
  refetchChatList,
}: {
  item: IConversation;
  onPress: () => void;
  refetchChatList: any;
}) {
  const {online_users} = useSelector((state: RootState) => state.ChatManager);
  const isOnline = online_users?.some(id => id === item.participant?._id);
  const [recoverStreak, {isLoading}] = useRecoverStreakMutation();
  const {colors} = useTheme();
  const styles = makeChatlistCardStyles(colors);

  return (
    <TouchableOpacity
      activeOpacity={0.2}
      style={styles.chatList}
      onPress={onPress}>
      <View style={{flexDirection: 'row', gap: 10}}>
        <FastImage
          source={
            item?.participant?.profilePicture
              ? {uri: item?.participant?.profilePicture}
              : IMAGES.userImage
          }
          style={styles.avatar}
        />
        <View>
          <Text style={styles.name}>{item?.participant?.username}</Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 5,
              alignItems: 'center',
              marginTop: 5,
            }}>
            {isOnline && <View style={styles.dot} />}
            {item?.unreadCount > 0 ? (
              <Text style={styles.message}>{item.unreadCount} new message</Text>
            ) : item.lastMessage ? (
              <View>
                {item?.lastMessage?.type === 'text' ? (
                  <Text numberOfLines={1} style={styles.message}>
                    {item?.lastMessage?.content}
                  </Text>
                ) : (
                  <Text style={styles.message}>
                    Shared a {item?.lastMessage?.type || 'message'}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <View>
        {item?.lastMessage?.createdAt ? (
          <Text style={styles.time}>
            {formatTime(new Date(item?.lastMessage?.createdAt))}
          </Text>
        ) : null}

        {item?.streakData?.currentCount &&
        item?.streakData?.currentCount > 0 ? (
          <View style={styles.strike}>
            <Text style={styles.strikeText}>
              {item.streakData.currentCount}
            </Text>

            {item?.streakData?.isDanger && (
              <HourGlassSVG width={20} height={20} fill={colors.primaryColor} />
            )}
            {item?.streakData?.isActive && (
              <StrikeSVG width={18} height={18} fill={colors.primaryColor} />
            )}
          </View>
        ) : null}

        {item?.streakData?.canRecover &&
        item.streakData.lastStreakCount &&
        item.streakData.lastStreakCount > 0 ? (
          <TouchableOpacity
            style={{
              backgroundColor: colors.primaryColor,
              paddingVertical: 2,
              paddingHorizontal: 6,
              borderRadius: 6,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              opacity: isLoading ? 0.5 : 1,
            }}
            disabled={isLoading}
            onPress={async () => {
              if (item.conversationId) {
                await recoverStreak(item.conversationId);
                await refetchChatList();
              }
            }}>
            <View style={{display: 'flex', gap: 1, flexDirection: 'row'}}>
              {/* <Text style={styles.strikeText}>
                {item.streakData.lastStreakCount}
              </Text> */}
              <Text
                style={{
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 'bold',
                  marginRight: 4,
                }}>
                Restore
              </Text>
              <StrikeSVG width={20} height={20} fill={colors.primaryColor} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export const ChatListCardLoader = () => {
  const {colors, isDark} = useTheme();
  const styles = makeChatlistCardStyles(colors);
  const shimmerColors = isDark
    ? ['#181920', colors.grey]
    : [colors.lightGrey, colors.lightGrey2, colors.lightGrey];

  return (
    <View style={styles.chatList}>
      <View style={{flexDirection: 'row', gap: 10}}>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.avatar}
          LinearGradient={LinearGradient}
        />
        <View>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 120, height: 18, borderRadius: 4, marginBottom: 8}}
            LinearGradient={LinearGradient}
          />
          <View style={{flexDirection: 'row', gap: 5, alignItems: 'center'}}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{width: 8, height: 8, borderRadius: 4}}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{width: 150, height: 14, borderRadius: 4}}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>
      </View>
      <View>
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={{
            width: 40,
            height: 12,
            borderRadius: 4,
            marginBottom: 8,
            alignSelf: 'flex-end',
          }}
          LinearGradient={LinearGradient}
        />
        <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={{width: 50, height: 30, borderRadius: 10}}
          LinearGradient={LinearGradient}
        />
      </View>
    </View>
  );
};
