import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import React, {useCallback, useState, useEffect, useRef, useMemo} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInDown,
} from 'react-native-reanimated';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {UserCard, UserCardLoader} from '../../Components/UserCard';
import {navigate, navigateBack} from '../../Utils/navigation';
import {IMAGES} from '../../Assets';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {useLazySearchUsersQuery} from '../../redux/api/profile';
import DataNotFound from '../../Components/Layout/DataNotFound';
import { hp } from '../../Utils/responsive';

export default function SearchScreen() {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [searchText, setSearchText] = useState('');
  const [searchList, setSearchList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchUsersApi] = useLazySearchUsersQuery();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Only keep necessary animated values
  const listOpacity = useSharedValue(0);

  // Simplified search function
  const searchUsers = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setSearchList([]);
        listOpacity.value = withTiming(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response: any = await searchUsersApi({username: text});
        if (response?.data) {
          setSearchList(response.data);
        } else {
          setSearchList([]);
        }
        listOpacity.value = withTiming(1);
      } catch (err) {
        setSearchList([]);
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [searchUsersApi, listOpacity]
  );

  // Optimized debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchText.trim()) {
      setSearchList([]);
      listOpacity.value = withTiming(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(searchText);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText, searchUsers]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleUserPress = useCallback((item: any) => {
    navigate('ProfileScreen', {
      userId: item?._id,
      username: item?.username,
    });
  }, []);

  const handleRefresh = useCallback(() => {
    if (searchText.trim()) {
      searchUsers(searchText);
    }
  }, [searchText, searchUsers]);

  // Only keep necessary animated styles
  const animatedListStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  // Simplified empty list component
  const renderEmptyList = useMemo(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <SearchSVG fill={colors.primaryColor} width={22} height={22} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchText.trim() ? 'No users found' : 'Discover People'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText.trim()
          ? 'Try searching with a different username'
          : 'Search for friends and discover new connections'}
      </Text>
    </View>
  ), [colors.primaryColor, searchText, styles]);

  // Optimized renderUserItem
  const renderUserItem = useCallback(({item}: any) => (
    <View style={styles.userItemContainer}>
      <UserCard
        fullName={item?.fullName}
        username={item?.username}
        avatar={item?.profilePicture}
        showBT={false}
        onPress={() => handleUserPress(item)}
        userId={item?._id}
        onFollowToggle={() => {}}
      />
    </View>
  ), [handleUserPress, styles.userItemContainer]);

  // Optimized loading item renderer
  const renderLoadingItem = useCallback((index: number) => (
    <View key={`loading-${index}`}>
      <UserCardLoader />
    </View>
  ), []);

  // Memoized loading items
  const loadingItems = useMemo(() => 
    Array.from({length: 5}).map((_, index) => renderLoadingItem(index))
  , [renderLoadingItem]);

  const keyExtractor = useCallback((item: any) => item._id?.toString() || item.username, []);

  const ItemSeparator = useMemo(() => () => <View style={styles.separator} />, [styles.separator]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryColor}
      />

      {/* Header */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={navigateBack}
            activeOpacity={0.7}>
            <Image
              source={IMAGES.BackArrow}
              style={[styles.backArrow, {tintColor: colors.white}]}
            />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <View style={styles.searchIconContainer}>
                <SearchSVG fill={colors.primaryColor} width={22} height={22} />
              </View>
              <TextInput
                style={styles.searchInputStyle}
                placeholder="Search username"
                placeholderTextColor={colors.grey}
                value={searchText}
                onChangeText={handleSearchChange}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Content Area */}
      <View style={styles.contentContainer}>

    { searchText.trim().length === 0 && <DataNotFound  title="Discover People"  subtitle="Search for friends and discover new connections" />}


        {error && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </Animated.View>
        )}

        <Animated.View style={[styles.listContainer, animatedListStyle]}>
          {loading ? (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {loadingItems}
            </ScrollView>
          ) : (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={searchList}
              renderItem={renderUserItem}
              keyExtractor={keyExtractor}
              ListEmptyComponent={renderEmptyList}
              refreshing={loading}
              onRefresh={handleRefresh}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={ItemSeparator}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={6}
              getItemLayout={(data, index) => ({
                length: 80,
                offset: 80 * index,
                index,
              })}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerGradient: {
      paddingBottom: 20,
      elevation: 4,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
      backgroundColor: colors.primaryColor,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    backArrow: {
      height: 20,
      width: 12,
    },
    searchContainer: {
      flex: 1,
    },
    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 25,
      paddingHorizontal: 15,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    searchIconContainer: {
      marginRight: 10,
    },
    searchInputStyle: {
      fontSize: 16,
      color: colors.black,
      fontWeight: '500',
      width: '100%',
      height: 40,
    },
    contentContainer: {
      flex: 1,
      marginTop: -15,
      backgroundColor: colors.backgroundColor,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      paddingTop: 20,
    },
    listContainer: {
      marginTop: -15,
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 20,
      flexGrow: 1,
      paddingBottom: 20,
    
    },
    userItemContainer: {},
    separator: {
      height: 12,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.grey,
      textAlign: 'center',
      lineHeight: 24,
      opacity: 0.8,
    },
    errorContainer: {
      backgroundColor: '#ffebee',
      marginHorizontal: 20,
      marginVertical: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#f44336',
    },
    errorText: {
      color: '#d32f2f',
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
  });
