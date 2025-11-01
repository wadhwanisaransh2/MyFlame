import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {hp} from '../Utils/responsive';

// Custom Hook for Animation
export const useAnimatedTopContainer = () => {
  // Shared value for animated height
  const topContainerHeight = useSharedValue(hp('170%'));

  const animatedTopContainer = useAnimatedStyle(() => {
    'worklet';
    return {height: topContainerHeight.value};
  });

  const animateContainer = (hpPercent: string) => {
    topContainerHeight.value = withTiming(hp(hpPercent), {
      duration: 900,
      easing: Easing.out(Easing.ease),
    });
  };

  return {animatedTopContainer, animateContainer};
};
