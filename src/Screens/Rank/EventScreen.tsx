import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  Pressable,
  RefreshControl,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {EventCategoryCard} from '../../Components';
import {useGetEventDataQuery} from '../../redux/api/chat';
import EventCard from '../../Components/Events/EventCard';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {setSearchResults, setSelectedEvent} from '../../redux/Store/ChatSlice';
import {TextInput} from 'react-native-gesture-handler';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {fontSize} from '../../Utils/fontIcon';
import HomeHeader from '../../Components/Header/HomeHeader';
import {EVENT_DEFAULT_PRIZE_TYPE} from '../../Constants';
import {debounce} from '../../Utils/debounce';

const categoryColors = {
  categoryColor1: '#62b8da',
  categoryColor2: '#eece24',
  categoryColor3: '#bcbcbe',
  categoryColor4: '#cd7f32',
};

const EventScreen = ({navigation}: any) => {
  const {colors} = useTheme();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = React.useState('');
  const [refreshing, setRefreshing] = useState(false);
  const eventState = useSelector((state: RootState) => state.ChatManager);
  const {searchResults, selectedEvent} = eventState;
  const [filter, setFilter] = useState({
    search: '',
    mode: 'latest',
    limit: 1,
  });
  const {
    data: res,
    isLoading,
    refetch,
  } = useGetEventDataQuery({
    mode: filter.mode,
    search: filter.search,
    limit: filter.limit,
  });

  const onBackPress = () => {
    navigation.navigate('Home');
    return true;
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  // Handle back button press

  useEffect(() => {
    if (!res || !res.data) return;
    if (filter.mode === 'latest' && res?.data?.length === 1) {
      const categories = formatEvent(res.data[0]);
      dispatch(
        setSelectedEvent({
          name: res.data[0].eventName,
          categories,
          _id: res.data[0]._id,
          status: res.data[0].status,
          eventDate: res.data[0].eventDate,
          progress: res.data[0].progress || 0, // Add progress field
          prizeType: res.data[0].prizeType || EVENT_DEFAULT_PRIZE_TYPE,
        }),
      );
      dispatch(setSearchResults([]));
    } else {
      dispatch(setSearchResults(res?.data));
    }
  }, [res]);

  useEffect(() => {
    refetch(); // refetch whenever filter changes
  }, [filter]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      if (value.trim().length > 0) {
        setFilter({search: value.trim(), mode: '', limit: 10});
        setSearchText(value.trim());
        dispatch(setSelectedEvent(null));
      } else {
        setFilter({search: '', mode: 'latest', limit: 1});
        setSearchText('');
      }
    }, 400),
    [],
  );

  function formatEvent(event: IEvent) {
    const formattedCategories = event.categories.map(
      (category: ICategory, index: number) => {
        const totalPrize = category.prizes.reduce(
          (sum, prize) => Number(sum) + Number(prize.prize),
          0,
        );

        return {
          _id: category._id,
          title: category.name,
          color: categoryColors[
            category.color as keyof typeof categoryColors
          ] as any,
          rank: index + 1,
          prize: totalPrize,
        };
      },
    );
    return formattedCategories;
  }

  const renderEventCategory = ({item}: {item: IEventCategoryUIData}) => (
    <EventCategoryCard
      prizeType={selectedEvent?.prizeType || 'INR'}
      eventCategory={item}
      status={selectedEvent?.status || 'Upcoming'}
      eventId={selectedEvent?._id || ''}
    />
  );

  const getFormattedDate = (dateString: string): string => {
    const date = new Date(dateString);

    const localDate = new Date(date.getTime()); // Local time

    const day = localDate.getDate().toString().padStart(2, '0');
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const month = monthNames[localDate.getMonth()];
    const year = localDate.getFullYear();

    let hours = localDate.getHours();
    const minutes = localDate.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours;
    const hourStr = hours.toString().padStart(2, '0');

    return `${day} ${month}, ${year} at ${hourStr}:${minutes} ${ampm}`;
  };

  // Progress Bar Component
  const ProgressBar = ({progress}: {progress: number}) => {
    const progressPercentage = Math.min(Math.max(progress || 0, 0), 100);

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: colors.primaryColor,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, {color: colors.black}]}>
          {progressPercentage}%
        </Text>
      </View>
    );
  };

  const renderSearchItem = ({item}: {item: IEvent}) => (
    <EventCard
      event={item}
      onSelect={() => {
        setSearchText('');
        const categories = formatEvent(item);
        dispatch(
          setSelectedEvent({
            name: item.eventName,
            categories,
            _id: item._id,
            status: item.status,
            eventDate: item.eventDate,
            progress: item.progress || 0, // Add progress field
            prizeType: item.prizeType || EVENT_DEFAULT_PRIZE_TYPE,
          }),
        );
        dispatch(setSearchResults([]));
      }}
      getFormattedDate={getFormattedDate}
    />
  );

  const styles = makeStyles(colors);
  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <HomeHeader title="Leaderboard" />

      <Pressable style={[styles.searchContainer]}>
        <SearchSVG width={24} height={24} fill={colors.primaryColor} />
        <TextInput
          style={styles.input}
          placeholder="Search event by name..."
          placeholderTextColor={colors.black}
          onChangeText={value => {
            setSearchText(value); // Update immediately for UI
            debouncedSearch(value); // Debounced API call
          }}
          value={searchText}
        />
      </Pressable>
      {res?.data?.length === 0 && !selectedEvent && (
        <Text
          style={{
            paddingLeft: 20,
            marginVertical: 'auto',
            color: colors.grey,
            fontWeight: 'semibold',
            textAlign: 'center',
            fontSize: 24,
            textTransform: 'capitalize',
          }}>
          No Event Found
        </Text>
      )}

      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderSearchItem}
          style={{marginTop: 20}}
          keyExtractor={(item, idx) => idx.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primaryColor]}
              tintColor={colors.primaryColor}
            />
          }
        />
      ) : (
        selectedEvent?.categories && (
          <FlatList
            ListHeaderComponent={
              <View style={{paddingLeft: 20, marginTop: 20}}>
                {selectedEvent.name && (
                  <Text
                    style={{
                      fontSize: 24,
                      color: colors.primaryColor,
                      fontWeight: 'semibold',
                      textTransform: 'capitalize',
                    }}>
                    {selectedEvent.name} Event
                  </Text>
                )}

                {/* Progress Bar - Added here after event name */}
                {selectedEvent.progress !== undefined && (
                  <ProgressBar progress={selectedEvent.progress} />
                )}

                {selectedEvent.eventDate && (
                  <Text
                    style={{
                      color: colors.black,
                      fontWeight: 'semibold',
                    }}>
                    {getFormattedDate(selectedEvent.eventDate)}
                  </Text>
                )}
              </View>
            }
            style={{flex: 1}}
            data={selectedEvent?.categories}
            renderItem={renderEventCategory}
            keyExtractor={(item, idx) => idx.toString()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primaryColor]}
                tintColor={colors.primaryColor}
              />
            }
          />
        )
      )}
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      marginHorizontal: 10,
      backgroundColor: colors.backgroundColor,
      height: 50,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.primaryColor,
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 30,
      paddingLeft: 20,
      gap: 10,
    },
    input: {
      flex: 1,
      fontSize: fontSize.f16,
      color: colors.black,
    },
    // Progress Bar Styles
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 15,
      paddingRight: 20,
    },
    progressBarBackground: {
      flex: 1,
      height: 8,
      backgroundColor: '#E0E0E0',
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 10,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 4,
      minWidth: 2, // Minimum width to show some progress even at 0%
    },
    progressText: {
      fontSize: 14,
      fontWeight: '600',
      minWidth: 35,
      textAlign: 'right',
    },
  });

export default EventScreen;
