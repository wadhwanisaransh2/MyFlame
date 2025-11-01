import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import {IMAGES} from '../../Assets';
import {navigate} from '../../Utils/navigation';
import {EVENT_DEFAULT_PRIZE_TYPE} from '../../Constants';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useTheme} from '../../Theme/ThemeContext';
import {useEvent} from '../../Hooks/useEvent';

export const PlayerRow = ({
  player,
  prizeType = EVENT_DEFAULT_PRIZE_TYPE,
  eventStatus,
}: {
  player: IWinner;
  prizeType: 'INR' | 'COIN';
  eventStatus: string;
}) => {
  const {colors} = useTheme();
  const {formatPrize} = useEvent();
  const styles = makeStyles(colors);
  const fullName = `${player.user.firstName} ${player.user.lastName}`;
  return (
    <View key={player.user._id} style={styles.playerRow}>
      <View style={styles.playerInfo}>
        <View style={styles.positionCircle}>
          <Text style={styles.positionNumber}>{player.rank}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            navigate('ProfileScreen', {
              userId: player.user._id,
              username: player.user.username,
            });
          }}>
          <Image
            source={
              player.user.profilePicture
                ? {uri: player.user?.profilePicture}
                : IMAGES.userImage
            }
            style={styles.rowAvatar}
          />
        </TouchableOpacity>
        <View style={styles.nameContainer}>
          <Text style={styles.rowPlayerName} numberOfLines={1}>
            {fullName?.length > 30 ? `${fullName?.slice(0, 30)}...` : fullName}
          </Text>
          <Text style={styles.rowUsername}>@{player.user.username}</Text>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.rowPlayerScore}>
          {prizeType === 'INR' ? '₹' : ''}
          {formatPrize(player.prize)}
          {prizeType === 'INR' ? '' : ' Coins'}
        </Text>
        {eventStatus !== 'Upcoming' && player.user.trend === 'up' && (
          <View style={[styles.trendIndicator]}>
            <Text style={[styles.trendArrow, {color: 'green'}]}>▲</Text>
          </View>
        )}
        {eventStatus !== 'Upcoming' && player.user.trend === 'down' && (
          <View style={[styles.trendIndicator]}>
            <Text style={[styles.trendArrow, {color: 'darkred'}]}>▼</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export const PlayerRowShimmer = () => (
  <View style={{flexDirection: 'row', alignItems: 'center', padding: 16}}>
    <ShimmerPlaceholder
      style={{width: 28, height: 28, borderRadius: 10, marginRight: 12}}
    />
    <ShimmerPlaceholder
      style={{width: 60, height: 60, borderRadius: 50, marginRight: 12}}
    />
    <View style={{flex: 1}}>
      <ShimmerPlaceholder style={{width: '70%', height: 14, marginBottom: 4}} />
      <ShimmerPlaceholder style={{width: '50%', height: 12}} />
    </View>
    <ShimmerPlaceholder style={{width: 30, height: 16, marginLeft: 8}} />
  </View>
);

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    playerScore: {
      fontSize: 16,
      fontWeight: 'bold',
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: {width: 0, height: 1},
      textShadowRadius: 2,
    },
    username: {
      fontSize: 12,
      marginTop: 4,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderColor: colors.lightGrey,
      borderBottomWidth: 1,
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    positionCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.transparent,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    positionNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.grey,
    },
    rowAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 12,
      borderWidth: 2,
      borderColor: colors.grey,
    },
    nameContainer: {
      justifyContent: 'center',
    },
    rowPlayerName: {
      color: colors.grey,
      fontSize: 16,
      fontWeight: 'bold',
    },
    rowUsername: {
      color: colors.grey,
      fontSize: 12,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowPlayerScore: {
      color: colors.grey,
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 8,
    },
    trendContainer: {
      padding: 6,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    trendUpBg: {
      backgroundColor: '#4CAF5020',
    },
    trendDownBg: {
      backgroundColor: '#F4433620',
    },
    trend: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    trendUp: {
      color: '#4CAF50',
    },
    trendDown: {
      color: '#F44336',
    },
    trendIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4,
    },
    trendArrow: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
