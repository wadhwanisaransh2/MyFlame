import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {FlashList} from '@shopify/flash-list';
import {PlayerRow, PlayerRowShimmer} from '../../Components/Events/RankList';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';

const SearchResultShimmer = () => (
  <View style={styles.searchShimmerContainer}>
    <View style={styles.searchShimmerHeader}>
      <ShimmerPlaceholder style={styles.searchShimmerTitle} />
      <ShimmerPlaceholder style={styles.searchShimmerSubtitle} />
    </View>
    <View style={styles.searchShimmerList}>
      {[...Array(6)].map((_, index) => (
        <PlayerRowShimmer key={index} />
      ))}
    </View>
  </View>
);

const SearchResults = ({
  data,
  isLoading,
  eventStatus,
  prizeType,
  colors,
  loadMore,
  onClearSearch,
}: any) => {
  if (isLoading) {
    return <SearchResultShimmer />;
  }

  return (
    <View style={styles.container}>
      {/* Search Results Header */}
      <View style={styles.searchHeader}>
        <Text style={[styles.searchTitle, {color: colors.primaryColor}]}>
          Search Results ({data.length})
        </Text>
        <TouchableOpacity onPress={onClearSearch} style={styles.clearButton}>
          <Text style={[styles.clearButtonText, {color: colors.primaryColor}]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results List */}
      {data.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsText, {color: colors.primaryColor}]}>
            No results found
          </Text>
          <Text style={[styles.noResultsSubText, {color: colors.grey}]}>
            Try searching with a different name
          </Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <FlashList
            data={data}
            keyExtractor={(item: any) => item.user._id}
            contentContainerStyle={styles.resultsGradient}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            renderItem={({item}) => (
              <PlayerRow
                player={item}
                prizeType={prizeType}
                eventStatus={eventStatus}
              />
            )}
            estimatedItemSize={80}
            onEndReached={loadMore}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginTop: 10,
  },
  resultsGradient: {
    padding: 16,
    flexGrow: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF20',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubText: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Shimmer styles
  searchShimmerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  searchShimmerHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF20',
    marginBottom: 20,
  },
  searchShimmerTitle: {
    width: 150,
    height: 18,
    borderRadius: 4,
    marginBottom: 8,
  },
  searchShimmerSubtitle: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  searchShimmerList: {
    flex: 1,
  },
});

export default SearchResults;
