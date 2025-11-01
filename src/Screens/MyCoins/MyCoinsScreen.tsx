import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import FlamaCoinSVG from '../../Assets/Images/SVGs/FlamaCoinSVG';
import {hp, wp} from '../../Utils/responsive';
import {fontSize} from '../../Utils/fontIcon';
import {PlaySVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import {
  CalendarSVG,
  CoinsSVG,
  GiftSVG,
  PeopleSVG,
} from '../../Assets/Images/SVGs/CommonSVG';
import {navigate, navigateBack} from '../../Utils/navigation';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {useGetUserCoinsTransactionsQuery} from '../../redux/api/coins';
import moment from 'moment';
import {ANIMATION} from '../../Assets';
import LottieView from 'lottie-react-native';
import DataNotFound from '../../Components/Layout/DataNotFound';
import {useGetUserCoinsQuery} from '../../redux/api/profile';
import {updateCoins} from '../../redux/Store/AuthSlice';

interface Transaction {
  _id: string;
  amount: number;
  createdAt: string;
  id: string;
  platform: string;
  status: string;
  type: string;
  updatedAt: string;
  user: string;
  sender?: {
    username?: string;
  };
  receiver?: {
    username?: string;
  };
}

export default function MyCoinsScreen() {
  const {colors} = useTheme();
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const [page, setPage] = useState(1);
  const [footerLoading, setFooterLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const {data, error, refetch, isFetching} = useGetUserCoinsTransactionsQuery(
    {
      page: page,
      limit: 5,
    },
    {
      pollingInterval: 0,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );

  const {data: coinConfigData, refetch: refetchCoinConfig} =
    useGetUserCoinsQuery(
      {},
      {
        pollingInterval: 0,
        refetchOnFocus: true,
        refetchOnMountOrArgChange: true,
      },
    );
  const dispatch = useDispatch();

  useEffect(() => {
    if (coinConfigData) {
      dispatch(updateCoins(coinConfigData));
    }
  }, [coinConfigData]);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setTransactions(data?.data);
      } else {
        setTransactions([...transactions, ...data?.data]);
      }

      setFooterLoading(false);
    }
  }, [data]);

  const handleLoadMore = () => {
    if (data?.pagination?.hasNext && !isFetching) {
      setFooterLoading(true);
      setPage(page + 1);
      // refetch();
    }
  };

  const handleRefetch = async () => {
    try {
      setPage(1);
      setRefreshing(true);
      await refetchCoinConfig();
      await refetch();
      setRefreshing(false);
    } catch (error) {
      } finally {
      setRefreshing(false);
    }
  };

  const styles = CreateStyles(colors);

  const ListHeaderComponent = () => (
    <>
      <View style={styles.coinContainer}>
        <LottieView
          source={ANIMATION.FlamaCoin}
          autoPlay
          loop
          style={{width: wp('25%'), height: wp('25%'), marginTop: 0}}
        />
        <View style={styles.coinTextContainer}>
          <Text style={styles.totalCoinsText}>Total Coins</Text>
          <Text style={styles.coinText}>{profile?.coins || 0}</Text>
        </View>
      </View>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigate('AdsPlayScreen');
          }}>
          <View
            style={[
              styles.actionIconContainer,
              {backgroundColor: '#69986A33'},
            ]}>
            <LottieView
              source={ANIMATION.Play}
              autoPlay
              loop
              style={{width: wp('18%'), height: wp('18%')}}
            />
          </View>
          <Text style={styles.actionText}>Watch Ads</Text>
          <Text style={styles.actionSubtext}>Watch Ads and earn Coins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigate('RefferScreen');
          }}>
          <View
            style={[
              styles.actionIconContainer,
              {backgroundColor: 'rgba(9, 30, 79, 0.14)'},
            ]}>
            <LottieView
              source={ANIMATION.Refer}
              autoPlay
              loop
              style={{width: wp('22%'), height: wp('22%')}}
            />
          </View>
          <Text style={styles.actionText}>Refer Friends</Text>
          <Text style={styles.actionSubtext}>Refer the app and earn coins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigate('ShareCoinScreen');
          }}>
          <View
            style={[
              styles.actionIconContainer,
              {backgroundColor: 'rgba(173, 99, 99, 0.34)'},
            ]}>
            <LottieView
              source={ANIMATION.Gift}
              autoPlay
              loop
              speed={0.5}
              style={{width: wp('22%'), height: wp('22%')}}
            />
          </View>
          <Text style={styles.actionText}>Share Coins</Text>
          <Text style={styles.actionSubtext}>Gift coins to friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            navigate('DailyBounsScreen');
          }}>
          <View
            style={[
              styles.actionIconContainer,
              {backgroundColor: 'rgba(35, 79, 17, 0.34)'},
            ]}>
            <LottieView
              source={ANIMATION.Bonus}
              autoPlay
              loop
              style={{width: wp('18%'), height: wp('18%')}}
            />
          </View>
          <Text style={styles.actionText}>Daily Bonus</Text>
          <Text style={styles.actionSubtext}>Get daily bonus coins</Text>
        </TouchableOpacity>

        <Text style={styles.transactionHistoryText}>Transaction History</Text>
      </View>
    </>
  );

  const renderTransaction = ({item}: {item: Transaction}) => (
    <View key={item?.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        {/* <Ionicons 
          name={item.icon as any} 
          size={24} 
          color={item.type === 'spent' ? '#FF6B6B' : '#4A5AE5'} 
        /> */}
        <CoinsSVG
          fill={item.type === 'send' ? '#FF6B6B' : '#4A5AE5'}
          width={24}
          height={24}
        />
      </View>
      <View style={styles.transactionDetails}>
        {item?.status === 'failed' ? (
          <Text style={styles.transactionDescription}>
            {'Transaction Failed'}
          </Text>
        ) : (
          <Text style={styles.transactionDescription}>{`${
            item.type === 'send'
              ? 'Sent to'
              : item.type === 'receive'
              ? 'Received from'
              : 'Earned by'
          } ${
            item.type === 'receive'
              ? item.sender?.username || 'Unknown'
              : item.type === 'send'
              ? item.receiver?.username || 'Unknown'
              : item.platform.toUpperCase()
          }`}</Text>
        )}
        <Text style={styles.transactionDate}>
          {moment(item.createdAt).format('DD/MM/YYYY hh:mm A')}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          {color: item.type === 'send' ? '#FF6B6B' : '#4CAF50'},
        ]}>
        {item.type === 'send' ? '-' : '+'}
        {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="My Coins" onBackPress={navigateBack} />

      <FlatList
        ListHeaderComponent={ListHeaderComponent}
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.transactionList}
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            {footerLoading && (
              <ActivityIndicator size="small" color={colors.primaryColor} />
            )}
          </View>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={
          <DataNotFound
            // iconContainerStyle={{marginTop: hp('15%'), paddingBottom: hp('10%')}}
            title="No Transaction Found"
            OnRefresh={handleRefetch}
            icon={
              <LottieView
                source={ANIMATION.FlamaCoin}
                autoPlay
                loop
                style={{width: wp('20%'), height: wp('20%')}}
              />
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefetch}
            colors={['#4CAF50']}
            tintColor={colors.primaryColor}
          />
        }
      />
    </View>
  );
}

function CreateStyles(colors: ColorThemeInterface) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    coinContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      height: wp('30%'),
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      margin: 10,
      marginTop: 20,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    coinTextContainer: {
      alignItems: 'center',
    },
    totalCoinsText: {
      fontSize: fontSize.f14,
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: 10,
    },
    coinText: {
      fontSize: fontSize.f32,
      fontWeight: 'bold',
      color: colors.primaryColor,
    },

    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 0,
      marginTop: 30,
      justifyContent: 'space-between',
    },
    actionButton: {
      width: '48%',
      backgroundColor: colors.inputBackground,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: colors.primaryColor,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 12,
    },
    actionIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryColor,
      marginBottom: 5,
      textAlign: 'center',
    },
    actionSubtext: {
      fontSize: 12,
      color: colors.black,
      textAlign: 'center',
    },
    transactionList: {
      backgroundColor: colors.backgroundColor,
      borderRadius: 15,
      padding: 15,
      paddingHorizontal: 20,
      shadowColor: colors.primaryColor,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey,
    },
    transactionIcon: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      backgroundColor: '#F8F9FA',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    transactionDetails: {
      flex: 1,
    },
    transactionDescription: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.black,
      marginBottom: 3,
    },
    transactionDate: {
      fontSize: 12,
      color: colors.grey,
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: '600',
    },
    footerContainer: {
      padding: 10,
      alignItems: 'center',
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.grey,
    },

    transactionHistoryText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primaryColor,
      marginTop: 20,
      marginBottom: 10,
    },
  });
}
