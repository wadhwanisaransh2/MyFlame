import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {navigate} from '../../Utils/navigation';
import {wp} from '../../Utils/responsive';

interface EventCategoryCardProps {
  prizeType: 'INR' | 'COIN';
  eventCategory: IEventCategoryUIData;
  eventId: string;
  status: string;
  showCrown?: boolean;
}

const formatPrize = (prize: number): string => {
  if (prize >= 1000) {
    const thousands = Math.floor(prize / 1000);
    const remainder = prize % 1000;

    if (remainder === 0) {
      return `${thousands}K`;
    } else {
      // For values like 1500 -> 1.5K, 1250 -> 1.25K
      const decimal = remainder / 1000;
      const formatted = thousands + decimal;

      // Remove trailing zeros after decimal
      return `${formatted.toString().replace(/\.?0+$/, '')}K`;
    }
  }

  return prize.toString();
};

const EventCategoryCard: React.FC<EventCategoryCardProps> = ({
  prizeType,
  eventCategory,
  eventId,
  status,
  showCrown = false,
}) => {
  const {rank, title, prize, color} = eventCategory;
  const styles = makeStyles(color);
  return (
    <>
      {showCrown ? (
        <Image
          source={require('../../Assets/Images/Crown.png')}
          style={styles.crownImage}
        />
      ) : (
        <View style={{marginVertical: 20}}></View>
      )}
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          navigate('LeaderBoardScreen', {
            eventId: eventId,
            eventStatus: status,
            categoryName: eventCategory.title,
            prizeType,
          });
        }}>
        <View style={styles.leftContent}>
          <View style={styles.rankCircle}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
          <Text style={styles.titleText}>{title}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.priceLabel}>Prize amount</Text>
          <Text style={styles.priceText}>
            {prizeType === 'INR' ? '₹' : ''}
            {formatPrize(prize)} {prizeType === 'INR' ? '' : 'Coins'}
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );
};

const makeStyles = (colors: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors,
      borderRadius: 30,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 16,
      position: 'relative',
      minHeight: 80,
      elevation: 10,
      shadowColor: colors,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.5,
      shadowRadius: 6,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    rightContent: {
      alignItems: 'flex-start',
      width: wp('28%'),
    },
    rankCircle: {
      width: 36,
      height: 36,
      borderRadius: 50,
      // backgroundColor: 'white',
      borderWidth: 1,
      borderColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rankText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    titleText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      textTransform: 'capitalize',
    },
    priceLabel: {
      fontSize: 14,
      color: 'white',
      opacity: 0.9,
    },
    priceText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    crownImage: {
      alignSelf: 'center',
      width: 130,
      height: 73,
      resizeMode: 'cover',
      marginTop: 30,
      tintColor: colors,
    },
  });

export default EventCategoryCard;
