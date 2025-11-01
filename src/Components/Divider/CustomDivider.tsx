import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../../Utils/colors';

interface CustomDividerProps {
  text?: string;
  deviderStyle?: any;
}

const CustomDivider: React.FC<CustomDividerProps> = ({text, deviderStyle}) => {
  return (
    <View style={[styles.container, deviderStyle]}>
      <View style={styles.line} />
      {text && <Text style={styles.text}>{text}</Text>}
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primaryColor,
  },
  text: {
    paddingHorizontal: 10,
    fontSize: 16,
    color: Colors.grey,
  },
});

export default CustomDivider;
