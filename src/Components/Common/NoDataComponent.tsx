import {StyleSheet, Text} from 'react-native';
import {ColorThemeInterface} from '../../utils/colors';
import {useTheme} from '../../Theme/ThemeContext';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';

export default function NoDataComponent({
  title = 'No Data Found',
  subtitle = 'Please try again later',
}: {
  title?: string;
  subtitle?: string;
}) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const emptyStateScale = useSharedValue(0.8);
  const animatedEmptyStyle = useAnimatedStyle(() => ({
    transform: [{scale: emptyStateScale.value}],
  }));
  return (
    <Animated.View style={[styles.emptyContainer, animatedEmptyStyle]}>
      <Animated.View
        entering={FadeInUp.delay(300).duration(800)}
        style={styles.emptyIconContainer}>
        <SearchSVG fill={colors.primaryColor} width={22} height={22} />
      </Animated.View>
      <Text>
        <Animated.Text
          entering={FadeInUp.delay(500).duration(800)}
          style={styles.emptyTitle}>
          {title}
        </Animated.Text>
      </Text>
      <Text>
        <Animated.Text
          entering={FadeInUp.delay(700).duration(800)}
          style={styles.emptySubtitle}>
          {subtitle}
        </Animated.Text>
      </Text>
    </Animated.View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.grey,
      textAlign: 'center',
      lineHeight: 24,
      opacity: 0.8,
    },
  });
