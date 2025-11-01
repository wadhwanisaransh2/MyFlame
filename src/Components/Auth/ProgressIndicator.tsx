import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Colors } from '../../Utils/colors';
import { fontFamily, fontSize } from '../../Utils/fontIcon';
import { wp } from '../../Utils/responsive';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  progress,
}) => {
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const renderStepIndicators = () => {
    return Array.from({ length: totalSteps }, (_, index) => {
      const isActive = index <= currentStep;
      const isCompleted = index < currentStep;

      const stepStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
          isActive ? 1 : 0,
          [0, 1],
          [Colors.lightGrey, Colors.primaryColor]
        );

        return {
          backgroundColor: withSpring(backgroundColor),
          transform: [
            {
              scale: withSpring(isActive ? 1.2 : 1, {
                damping: 15,
                stiffness: 200,
              }),
            },
          ],
        };
      });

      return (
        <Animated.View key={index} style={[styles.stepIndicator, stepStyle]}>
          <Text style={[styles.stepNumber, { color: isActive ? Colors.white : Colors.grey }]}>
            {isCompleted ? '✓' : index + 1}
          </Text>
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
      </View>
      
      <View style={styles.stepsContainer}>
        {renderStepIndicators()}
      </View>
      
      <Text style={styles.stepText}>
        Step {currentStep + 1} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  progressContainer: {
    width: wp('80%'),
    marginBottom: 15,
  },
  progressBackground: {
    height: 6,
    backgroundColor: Colors.lightGrey,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primaryColor,
    borderRadius: 3,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: wp('60%'),
    marginBottom: 10,
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGrey,
  },
  stepNumber: {
    fontFamily: fontFamily.boldfont,
    fontSize: fontSize.f12,
    color: Colors.grey,
  },
  stepText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.f14,
    color: Colors.grey,
    marginTop: 5,
  },
});

export default ProgressIndicator; 