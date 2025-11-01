import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useMemo, useState, useEffect } from 'react'
import { useTheme } from '../Theme/ThemeContext';
import { ColorThemeInterface } from '../Utils/colors';
import CustomHeader from '../Components/Header/CustomHeader';
import { navigateBack } from '../Utils/navigation';
import { useGetCoinConfigQuery } from '../redux/api/coins';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/Store';

interface BonusItem {
  id: string;
  title: string;
  description: string;
  coins: number;
  icon: string;
  claimed: boolean;
  available: boolean;
}

export default function DailyBounsScreen() {
  const {colors} = useTheme()
  const styles = useMemo(() => CreateStyles(colors), [colors]);
  
  const {coinConfig} = useSelector((state: RootState) => state.AuthManager)

  // // Check if today is user's birthday (example: set to today for demo)
  const isUserBirthday = () => {
    const today = new Date();
    const birthday = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Set to today for demo
    return today.toDateString() === birthday.toDateString();
  };

  const [bonusItems] = useState<BonusItem[]>([
    {id: 'ad',
      title: 'Watch Ad',
      description: 'Watch an ad to earn coins',
      coins: 100,
      icon: '📺',
      claimed: false,
      available: true
    },
    {
      id: 'post',
      title: 'Create a Post',
      description: 'Share your thoughts and earn coins',
      coins: 100,
      icon: '📝',
      claimed: false,
      available: true
    },
    {
      id: 'post',
      title: 'Create a Clip',
      description: 'Share your thoughts and ear n coins',
      coins: 100,
      icon: '🎥',
      claimed: false,
      available: true
    },
    
    {
      id: 'birthday',
      title: 'Birthday Bonus',
      description: 'Special birthday reward',
      coins: 1000,
      icon: '🎂',
      claimed: false,
      available: isUserBirthday()
    },
    {
      id: 'refer_and_earn',
      title: 'Refer and Earn',
      description: 'Refer a friend and earn coins',
      coins: 1000,
      icon: '👥',
      claimed: false,
      available: isUserBirthday()
    }
  ]);

  const renderBonusCard = (item: BonusItem) => (
    <View key={item.id} style={[
      styles.bonusCard, 
      !item.available && styles.unavailableCard
    ]}>
      <View style={styles.bonusIcon}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      
      <View style={styles.bonusContent}>
        <Text style={styles.bonusTitle}>{item.title}</Text>
        <Text style={styles.bonusDescription}>{item.description}</Text>
        
        <View style={styles.coinRow}>
          <Text style={styles.coinAmount}>+{coinConfig?.[item?.id]}</Text>
          <Text style={styles.coinText}>coins</Text>
        </View>
      </View>
    </View>
  );

  return (
<View style={styles.container}>
    <CustomHeader title='Daily Bonuses' onBackPress={() => {navigateBack()}} />
    <ScrollView style={styles.container}>
      {/* Header */}
      
      {/* Bonus Cards */}
      <View style={styles.bonusSection}>
        <Text style={styles.sectionTitle}>Available Bonuses</Text>
        {bonusItems.map(renderBonusCard)}
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>💡 Tips to Earn More</Text>
        <Text style={styles.tipText}>• Post regularly to earn coins</Text>
        <Text style={styles.tipText}>• Engage with other users' content</Text>
        {/* <Text style={styles.tipText}>• Share interesting posts with friends</Text> */}
        <Text style={styles.tipText}>• Don't forget to claim your birthday bonus!</Text>
      </View>
    </ScrollView>
    </View>
  )
}

const CreateStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    header: {
      padding: 20,
      paddingTop: 60,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.darkText,
    },
    bonusSection: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.darkText,
      marginBottom: 15,
    },
    bonusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      padding: 15,
      borderRadius: 15,
      marginBottom: 10,
    },
    unavailableCard: {
      opacity: 0.5,
    },
    bonusIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
    },
    iconText: {
      fontSize: 24,
    },
    bonusContent: {
      flex: 1,
    },
    bonusTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.darkText,
      marginBottom: 5,
    },
    bonusDescription: {
      fontSize: 14,
      color: colors.darkText,
      opacity: 0.7,
      marginBottom: 8,
    },
    coinRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    coinAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primaryColor,
      marginRight: 5,
    },
    coinText: {
      fontSize: 14,
      color: colors.darkText,
      opacity: 0.7,
    },
    tipsSection: {
      margin: 20,
      padding: 15,
      backgroundColor: colors.inputBackground,
      borderRadius: 15,
    },
    tipText: {
      fontSize: 14,
      color: colors.darkText,
      opacity: 0.8,
      marginBottom: 5,
    },
  });