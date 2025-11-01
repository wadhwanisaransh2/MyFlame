import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View, TextInput, Pressable} from 'react-native';
import CustomHeader from '../../Components/Header/CustomHeader';
import {useTheme} from '../../Theme/ThemeContext';
import {navigateBack} from '../../Utils/navigation';
import {useRoute} from '@react-navigation/native';
import {useGetEventCategoryLeaderboardQuery} from '../../redux/api/chat';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {debounce} from '../../Utils/debounce';
import {fontSize} from '../../Utils/fontIcon';
import LeaderboardContent from '../../Components/Events/LeaderboardContent';
import SearchResults from '../../Components/Events/SearchResults';

const LeaderBoardScreen: React.FC = () => {
  const limit = 10;
  const route = useRoute();
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const {eventId, eventStatus, categoryName, prizeType} = route.params as {
    eventId: string;
    eventStatus: string;
    categoryName: string;
    prizeType: 'INR' | 'COIN';
  };

  // local State
  const [searchText, setSearchText] = useState('');
  const [cursor, setCursor] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [participantsData, setParticipantsData] = useState<any[]>([]);
  const isSearchActive = searchText.trim().length > 0;

  // Query
  const {data, isLoading} = useGetEventCategoryLeaderboardQuery({
    eventId,
    categoryName,
    cursor,
    limit,
    search: searchText,
  });

  useEffect(() => {
    if (!data || data?.winners?.length === 0) {
      setLoadingMore(false);
      return;
    }
    if (searchText.trim().length > 0) {
      // When searching, replace results
      setParticipantsData(data.winners);
    } else {
      // When not searching, append or set initial leaderboard
      if (cursor) {
        setParticipantsData(prev => [...prev, ...data.winners]);
      } else {
        setParticipantsData(data.winners);
      }
    }

    setLoadingMore(false); // Reset after handling
  }, [data?.winners]);

  // Load more conversations (scroll down)
  const loadMore = useCallback(() => {
    if (!data?.nextCursor) {
      setLoadingMore(false);
      return;
    }

    if (data?.nextCursor) {
      setLoadingMore(true);
      setCursor(data?.nextCursor);
    }
  }, [loadingMore, data?.nextCursor]);

  // Search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim().length > 0) {
        setSearchText(value.trim());
      } else {
        setSearchText('');
      }
    }, 400),
    [],
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <CustomHeader title="Leaderboard" onBackPress={navigateBack} />

      {/* Show search bar when there's data to search or when searching */}
      <Pressable style={[styles.searchContainer]}>
        <SearchSVG width={24} height={24} fill={colors.primaryColor} />
        <TextInput
          style={styles.input}
          placeholder="Search winner by name..."
          placeholderTextColor={colors.black}
          onChangeText={value => {
            if (value === '') {
              setSearchText('');
              setCursor('');
              setParticipantsData([]);
              return;
            }
            setSearchText(value); // Update immediately for UI
            debouncedSearch(value); // Debounced API call
          }}
          value={searchText}
        />
      </Pressable>

      {isSearchActive ? (
        <SearchResults
          data={participantsData}
          isLoading={isLoading}
          eventStatus={eventStatus}
          prizeType={prizeType}
          colors={colors}
          loadMore={loadMore}
          onClearSearch={() => {
            setSearchText('');
            setCursor('');
            setLoadingMore(false);
          }}
        />
      ) : (
        <LeaderboardContent
          data={participantsData}
          isLoading={isLoading}
          eventStatus={eventStatus}
          prizeType={prizeType}
          colors={colors}
          loadMore={loadMore}
          loadingMore={loadingMore}
          hasNextCursor={data?.nextCursor !== ''}
        />
      )}
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: 0,
    },
    // search style
    searchContainer: {
      marginHorizontal: 10,
      backgroundColor: colors.backgroundColor,
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      paddingLeft: 20,
      gap: 10,
    },
    input: {
      flex: 1,
      fontSize: fontSize.f16,
      color: colors.black,
    },
  });

export default LeaderBoardScreen;
