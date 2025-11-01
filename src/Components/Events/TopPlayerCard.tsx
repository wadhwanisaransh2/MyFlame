import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {IMAGES} from '../../Assets';
import {navigate} from '../../Utils/navigation';
import {EVENT_DEFAULT_PRIZE_TYPE} from '../../Constants';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useTheme} from '../../Theme/ThemeContext';
import {useEvent} from '../../Hooks/useEvent';

export const TopPlayerCard = ({
  player,
  style,
  eventStatus,
  prizeType = EVENT_DEFAULT_PRIZE_TYPE,
}: {
  player: IWinner;
  style: any;
  eventStatus: string;
  prizeType: 'INR' | 'COIN';
}) => {
  const {formatPrize} = useEvent();
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const fullName = `${player.user.firstName} ${player.user.lastName}`;
  const isWinner = player.rank === 1;

  const handleProfilePress = () => {
    navigate('ProfileScreen', {
      userId: player.user._id,
      username: player.user.username,
    });
  };

  return (
    <View
      key={player.user._id}
      style={[
        style.borderStyle,
        isWinner ? styles.winnerCard : styles.runnerUpCard,
        {
          backgroundColor: style.bg,
          zIndex: style.zIndex || 1,
          elevation: style.zIndex || 1,
        },
      ]}>
      <View style={styles.cardGradient}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={styles.avatarWrapper}>
            <Image
              source={
                player.user.profilePicture
                  ? {uri: player.user?.profilePicture}
                  : IMAGES.userImage
              }
              resizeMode="cover"
              style={[
                styles.avatar,
                {
                  borderColor: style.color,
                },
              ]}
            />
            <View
              style={[
                styles.positionBadge,
                {
                  backgroundColor: style.color,
                },
              ]}>
              <Text style={styles.positionText}>{player.rank}</Text>
            </View>
            {eventStatus === 'Completed' && player.rank === 1 && (
              <Image source={IMAGES.Crown} style={styles.crown} />
            )}
          </TouchableOpacity>
        </View>
        <>
          <Text style={[styles.topPlayerName]}>
            {fullName?.length > 20 ? `${fullName?.slice(0, 20)}...` : fullName}
          </Text>
          <TouchableOpacity onPress={handleProfilePress}>
            <Text numberOfLines={1} style={styles.username}>@{player.user.username}</Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.playerScore,
              {
                color: style.color,
              },
            ]}>
            {prizeType === 'INR' ? '₹' : ''}
            {formatPrize(player.prize)} {prizeType === 'INR' ? '' : 'Coins'}
          </Text>
        </>
      </View>
    </View>
  );
};

export const TopPlayerCardShimmer = ({
  style,
  height = 140,
}: {
  style: any;
  height?: number;
}) => {
  return (
    <View
      style={[
        style.borderStyle,
        {
          flex: 1,
          height: height,
          borderRadius: 5,
          backgroundColor: style.bg || '#5C7B8D',
          paddingVertical: 15,
          paddingHorizontal: 10,
          alignItems: 'center',
          justifyContent: 'flex-start',
        },
      ]}>
      <View
        style={{
          alignItems: 'center',
          marginTop: -80,
          marginBottom: 8,
        }}>
        <ShimmerPlaceholder
          shimmerStyle={{
            width: 90,
            height: 90,
            borderRadius: 45,
            borderWidth: 4,
            borderColor: style.color,
          }}
        />
      </View>

      <ShimmerPlaceholder
        shimmerStyle={{
          width: 100,
          height: 16,
          borderRadius: 4,
          marginTop: 6,
        }}
      />
      <ShimmerPlaceholder
        shimmerStyle={{
          width: 80,
          height: 20,
          borderRadius: 4,
          marginTop: 8,
        }}
      />
      <ShimmerPlaceholder
        shimmerStyle={{
          width: 90,
          height: 14,
          borderRadius: 4,
          marginTop: 6,
        }}
      />
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    runnerUpCard: {
      flex: 1,
      height: 135,
      borderRadius: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    winnerCard: {
      flex: 1.1,
      height: 190,
      zIndex: 1,
      borderRadius: 20,
    },
    cardGradient: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 10,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 5,
      marginTop: -60,
    },
    avatarWrapper: {
      position: 'relative',
    },
    avatar: {
      width: 75,
      height: 75,
      borderRadius: 45,
      borderWidth: 4,
      borderColor: colors.white,
    },
    positionBadge: {
      position: 'absolute',
      bottom: -10,
      alignSelf: 'center',
      backgroundColor: colors.white,
      width: 25,
      height: 25,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    winnerBadge: {
      backgroundColor: '#FFD700',
      borderColor: '#FFA500',
    },
    positionText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffff',
    },
    crown: {
      position: 'absolute',
      top: -40,
      alignSelf: 'center',
      width: 40,
      height: 40,
      borderColor: colors.white,
      tintColor: '#FFD700',
    },
    topPlayerName: {
      color: 'white',
      fontWeight: 'bold',
      marginTop: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
      textAlign: 'center',
      fontSize: 14,
    },
    username: {
      fontSize: 12,
      marginVertical: 4,
      color: 'white',
    },
    playerScore: {
      fontSize: 16,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    nameContainer: {
      justifyContent: 'center',
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
