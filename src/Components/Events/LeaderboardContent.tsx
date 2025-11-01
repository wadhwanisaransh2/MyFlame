import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {PlayerRow, PlayerRowShimmer} from '../../Components/Events/RankList';
import {
  TopPlayerCard,
  TopPlayerCardShimmer,
} from '../../Components/Events/TopPlayerCard';
import {FlatList} from 'react-native-gesture-handler';
import {useEvent} from '../../Hooks/useEvent';

const TopPlayersSection = ({
  data,
  eventStatus,
  prizeType,
  colors,
  getPositionStyle,
}: any) => {
  const {getTwoWinnerPositionStyle} = useEvent();
  const topPlayers = [
    data?.find((player: IWinner) => player.rank === 2),
    data?.find((player: IWinner) => player.rank === 1),
    data?.find((player: IWinner) => player.rank === 3),
  ];

  const validTopPlayers = topPlayers.filter(Boolean); // filters out undefined/null
  if (validTopPlayers.length === 2) {
    // Two winners - use centered layout
    const winner1 = data?.find((player: IWinner) => player.rank === 1);
    const winner2 = data?.find((player: IWinner) => player.rank === 2);

    if (!winner1 || !winner2) return null;

    return (
      <View
        style={[
          styles.topPlayersContainer,
          styles.twoWinnersContainer,
          eventStatus === 'Completed' ? {marginTop: 110} : {marginTop: 80},
          {marginBottom: 10, zIndex: 10},
        ]}>
        <TopPlayerCard
          key={winner2.user._id}
          player={winner2}
          style={getTwoWinnerPositionStyle(2, colors)}
          eventStatus={eventStatus}
          prizeType={prizeType}
        />
        <TopPlayerCard
          key={winner1.user._id}
          player={winner1}
          style={getTwoWinnerPositionStyle(1, colors)}
          eventStatus={eventStatus}
          prizeType={prizeType}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.topPlayersContainer,
        eventStatus === 'Completed' ? {marginTop: 110} : {marginTop: 80},
        // Add extra bottom margin to account for negative positioning
        {marginBottom: 10, zIndex: 10},
      ]}>
      {topPlayers
        .filter((player): player is IWinner => player !== undefined)
        .map(player => {
          const style = getPositionStyle(player.rank, colors);
          if (!player) return;
          return (
            <TopPlayerCard
              key={player.user._id}
              player={player}
              style={style}
              eventStatus={eventStatus}
              prizeType={prizeType}
            />
          );
        })}
    </View>
  );
};

const OtherPlayersSection = ({
  data,
  eventStatus,
  prizeType,
  colors,
  loadMore,
  loadingMore,
  hasNextCursor,
}: any) => {
  const otherPlayers: IWinner[] = data?.slice(3) || [];
  if (otherPlayers?.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={{color: colors.primaryColor, fontSize: 18}}>
          No Eligible candidate found for other ranks
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.otherPlayersContainer]}>
      <FlatList
        data={otherPlayers}
        keyExtractor={item => item.user._id}
        contentContainerStyle={styles.otherPlayersGradient}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({item}) => (
          <PlayerRow
            player={item}
            prizeType={prizeType}
            eventStatus={eventStatus}
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={() => {
          {
            if (loadingMore) {
              return (
                <View style={styles.footerContainer}>
                  <ActivityIndicator size="small" color={colors.primaryColor} />
                  <Text
                    style={[styles.footerText, {color: colors.primaryColor}]}>
                    Loading more data...
                  </Text>
                </View>
              );
            }

            if (!hasNextCursor) {
              return (
                <View style={styles.footerContainer}>
                  <Text style={[styles.footerText, {color: colors.grey}]}>
                    No more data
                  </Text>
                </View>
              );
            }

            return null;
          }
        }}
      />
    </View>
  );
};

const LeaderboardContent = ({
  data,
  isLoading,
  eventStatus,
  prizeType,
  colors,
  loadMore,
  loadingMore,
  hasNextCursor,
}: any) => {
  const {getPositionStyle} = useEvent();
  if (isLoading) {
    return (
      <View style={{paddingHorizontal: 16}}>
        <View
          style={[
            styles.topPlayersContainer,
            eventStatus === 'Completed' ? {marginTop: 130} : {marginTop: 90},
          ]}>
          {[1, 2, 3].map(position => (
            <TopPlayerCardShimmer
              key={position}
              style={getPositionStyle(position, colors)}
              height={position === 2 ? 200 : 140}
            />
          ))}
        </View>
        {[...Array(5)].map((_, index) => (
          <PlayerRowShimmer key={index} />
        ))}
      </View>
    );
  }

  if (data?.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={{color: colors.primaryColor, fontSize: 18}}>
          No Eligible candidate found for this category
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Players - Always visible */}
      <TopPlayersSection
        data={data}
        eventStatus={eventStatus}
        prizeType={prizeType}
        colors={colors}
        getPositionStyle={getPositionStyle}
      />

      {/* Other Players - Scrollable */}
      <OtherPlayersSection
        data={data}
        eventStatus={eventStatus}
        prizeType={prizeType}
        colors={colors}
        loadMore={loadMore}
        loadingMore={loadingMore}
        hasNextCursor={hasNextCursor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 0,
  },
  topPlayersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'flex-end',
    position: 'relative',
  },
  singleWinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoWinnersContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
  },
  otherPlayersContainer: {
    flex: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  otherPlayersGradient: {
    padding: 16,
    flexGrow: 1,
    paddingTop: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF20',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LeaderboardContent;
