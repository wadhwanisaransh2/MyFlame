import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useRef} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {navigate, navigateBack} from '../../Utils/navigation';
import {IMAGES} from '../../Assets';
import {height, wp} from '../../Utils/responsive';
import {fontSize} from '../../Utils/fontIcon';
import {CustomButton} from '../../Components';
import PaymentActivity from '../../Components/Layout/Saving/PaymentActivity';
import {CustomBottomSheet} from '../../Components/BottomSheet/CustomBottomSheet';

export default function MySaving() {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const fillerRef = useRef<any>(null);
  return (
    <View style={styles.container}>
      <CustomHeader title="My Saving" onBackPress={() => navigateBack()} />
      <View style={styles.content}>
        <ImageBackground
          imageStyle={styles.image}
          style={styles.imageContainer}
          source={IMAGES.Card}>
          <Text style={styles.title}>My Savings</Text>
          <Text style={styles.amount}>₹ 22.200</Text>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Add Money"
              containerStyle={styles.addMoneyButton}
              titleStyle={{color: colors.primaryColor, fontSize: fontSize.f16}}
              onPress={() => navigate('AddMoney')}
            />
            <CustomButton
              title="Withdraw Money"
              containerStyle={styles.addMoneyButton}
              titleStyle={{color: colors.primaryColor, fontSize: fontSize.f16}}
              onPress={() => navigate('WithdrawMoney')}
            />
          </View>
        </ImageBackground>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderTitle}>Payment Activity</Text>
          <Pressable
            onPress={() => fillerRef.current?.open()}
            style={styles.fliterBt}
          />
        </View>
        <FlatList
          data={[1, 2, 34, 5, 67, 57]}
          renderItem={() => <PaymentActivity />}
          keyExtractor={item => item.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      <CustomBottomSheet
        ref={fillerRef}
        onDismiss={() => {}}
        title="Custom Bottom Sheet">
        <Text>Custom Bottom Sheet</Text>
      </CustomBottomSheet>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    content: {
      flex: 1,
      //   alignItems: 'center',
      //   justifyContent: 'center'
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 10,
      marginLeft: wp('15%'),
    },
    image: {
      height: height * 0.4,
      width: '100%',
      resizeMode: 'contain',
    },
    imageContainer: {
      paddingTop: 100,
    },
    amount: {
      fontSize: fontSize.f30,
      fontWeight: 'bold',
      color: 'white',
      marginTop: 10,
      marginLeft: wp('15%'),
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
      marginLeft: wp('15%'),
      width: wp('65%'),
    },
    addMoneyButton: {
      width: wp('30%'),
      height: 40,
      backgroundColor: '#ffffff',
      borderRadius: 30,
    },

    listContainer: {
      marginTop: 10,
      paddingHorizontal: wp('5%'),
    },

    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: wp('5%'),
      marginTop: 20,
    },

    listHeaderTitle: {
      fontSize: fontSize.f18,
      fontWeight: 'bold',
      color: colors.black,
    },

    fliterBt: {
      width: 100,
      height: 30,
      backgroundColor: colors.primaryColor,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
