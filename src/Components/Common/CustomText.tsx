import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { fontFamily } from '../../Utils/fontIcon';

export interface CustomTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption';
}

export const CustomText: React.FC<CustomTextProps> = ({ 
  variant = 'body1',
  style,
  children,
  ...props
}) => {
  return (
    <Text style={[styles[variant], style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: RFValue(24),
  fontFamily: fontFamily.boldfont,
  },
  h2: {
    fontSize: RFValue(20),
  fontFamily: fontFamily.boldfont,
  },
  h3: {
    fontSize: RFValue(18),
    fontFamily: fontFamily.semifont,
  },
  h4: {
    fontSize: RFValue(16),
    fontFamily: fontFamily.semifont,
  },
  body1: {
    fontSize: RFValue(14),
    fontFamily: fontFamily.regular,
  },
  body2: {
    fontSize: RFValue(12),
    fontFamily: fontFamily.regular,
  },
  caption: {
    fontSize: RFValue(10),
    fontFamily: fontFamily.regular,
  },
});