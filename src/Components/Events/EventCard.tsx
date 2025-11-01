import type React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import CoinSVG from '../../Assets/Images/SVGs/Coin';

interface Props {
  event: IEvent;
  onSelect: (event: IEvent) => void;
  getFormattedDate: (date: string) => string;
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

const EventCard: React.FC<Props> = ({event, onSelect, getFormattedDate}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  return (
    <TouchableOpacity
      onPress={() => {
        onSelect(event);
      }}
      activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <View style={styles.avatarText}>
                <CoinSVG />
              </View>
            </View>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{event.eventName}</Text>
            <Text style={styles.eventDate}>
              {getFormattedDate(event.eventDate)}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={styles.prizeLabel}>Prize Pool</Text>
          <Text style={styles.prizeValue}>
            {event.prizeType === 'INR' ? '₹' : ''}
            {formatPrize(event.prizePool)}{' '}
            {event.prizeType === 'INR' ? '' : 'Coins'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.eventCardbg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
      borderRadius: 12,
      padding: 16,
      marginVertical: 6,
      marginHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarContainer: {
      marginRight: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 2,
      backgroundColor: colors.lightBlue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      height: 25,
      width: 25,
    },
    eventInfo: {
      flex: 1,
    },
    eventName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.black,
      marginBottom: 2,
    },
    eventDate: {
      fontSize: 14,
      color: colors.black,
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    prizeLabel: {
      fontSize: 12,
      color: colors.black,
      marginBottom: 2,
    },
    prizeValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primaryColor,
    },
  });

export default EventCard;
