import {StyleSheet, Text, View, Animated, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../Theme/ThemeContext';
import {fontSize} from '../../Utils/fontIcon';
import LottieView from 'lottie-react-native';
import {ANIMATION} from '../../Assets';
import CustomButton from '../Buttons/CustomButton';

interface DataNotFoundProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconContainerStyle?: StyleProp<ViewStyle>;
  OnRefresh?: () => void;
}

export default function DataNotFound({
  title = 'No Data Found',
  subtitle = 'No data available at the moment.',
  icon,
  iconContainerStyle,
  OnRefresh,
}: DataNotFoundProps) {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <View style={[styles.iconContainer , iconContainerStyle]}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.iconGradient}>
          {icon ? (
            icon
          ) : (
            <LottieView
              source={ANIMATION.Splash}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
          )}
        </LinearGradient>
      </View>
      <Text style={[styles.title, {color: colors.black}]}>{title}</Text>
      <Text style={[styles.subtitle, {color: colors.grey}]}>{subtitle}</Text>

      {OnRefresh && (
         <CustomButton title="Refresh" onPress={OnRefresh} />
      )}


    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
    borderRadius: 75,
    padding: 3,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
  iconGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: fontSize.f20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.f14,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
 
});