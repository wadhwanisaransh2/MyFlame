import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useTheme} from '../../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../../Utils/colors';
import {fontSize} from '../../../Utils/fontIcon';

export default function PaymentActivity() {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Payment Activity</Text>
        <Text style={styles.status}>Completed</Text>
      </View>
      <Text style={styles.amount}>₹ 22.200</Text>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.inputBackground,
      height: 65,
      borderRadius: 15,
      paddingHorizontal: 16,
      marginBottom: 10,
    },

    title: {
      fontSize: fontSize.f18,
      fontWeight: 'bold',
      color: colors.black,
    },
    status: {
      fontSize: fontSize.f16,
      // fontWeight : 'bold',
      color: colors.green,
    },
    amount: {
      fontSize: fontSize.f18,
      fontWeight: 'bold',
      color: colors.black,
    },
  });
