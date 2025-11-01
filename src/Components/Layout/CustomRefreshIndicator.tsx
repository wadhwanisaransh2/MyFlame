import LottieView from 'lottie-react-native';
import React, {useRef, useEffect} from 'react';
import {
  View,
  Animated,
  Easing,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ANIMATION } from '../../Assets';

interface GradientSpinnerLoaderProps {
  size?: number;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

const CustomRefreshIndicator: React.FC<GradientSpinnerLoaderProps> = ({
  size = 60,
  visible = true,
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  // Create a separate animated value for effects that can't use native driver
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Create smooth infinite rotation animation with native driver
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1800,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true, // This is fine for transform properties
        }),
      ).start();

      // Create pulsing effect animation - must be consistent with useNativeDriver: false
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: false, // Make sure this is always false for this animation
          }),
          Animated.timing(pulseValue, {
            toValue: 0,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: false, // Make sure this is always false for this animation
          }),
        ]),
      ).start();
    } else {
      // Reset animations
      spinValue.setValue(0);
      pulseValue.setValue(0);
    }

    // Clean up animations on unmount
    return () => {
      spinValue.stopAnimation();
      pulseValue.stopAnimation();
    };
  }, [visible]);

  // Map 0-1 animation value to 0-360 degrees
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <View style={[styles.container, style]}>
      {/* <LottieView
        source={ANIMATION.Refresh}
        style={{width: size, height: size}}
        autoPlay
        loop
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    position: 'relative',
    borderRadius: 100,
    backgroundColor: 'transparent',
    zIndex: 2, // Ensure spinner is above shadow
  },
  shadowElement: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'transparent',
    shadowColor: '#7F00FF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 1,
  },
  outerCircle1: {
    position: 'absolute',
    borderRadius: 100,
    borderColor: 'transparent',
    borderTopColor: '#9C27B0', // purple
    borderRightColor: '#E91E63', // pink
  },
  outerCircle2: {
    position: 'absolute',
    borderRadius: 100,
    borderColor: 'transparent',
    borderBottomColor: '#3F51B5', // blue
    borderLeftColor: '#673AB7', // indigo
  },
  innerCircle: {
    position: 'absolute',
    borderRadius: 100,
    borderColor: 'transparent',
    borderRightColor: '#F48FB1', // pink light
    borderTopColor: '#B39DDB', // purple light
  },
  centerDot: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'white',
  },
});

export default CustomRefreshIndicator;
