import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import {CustomButton} from '../index';
import {Colors} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {useTheme} from '../../Theme/ThemeContext';
import CheckSVG from '../../Assets/Images/SVGs/CheckSVG';
import { navigate } from '../../Utils/navigation';

interface SignupNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading: boolean;
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  error?: any;
}

const SignupNavigation: React.FC<SignupNavigationProps> = ({
  isFirstStep,
  isLastStep,
  isLoading,
  isChecked,
  setIsChecked,
  onNext,
  onPrevious,
  error,
}) => {
  const {colors} = useTheme();

  const backButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isFirstStep ? 0 : 1),
      transform: [
        {
          scale: withSpring(isFirstStep ? 0.8 : 1),
        },
      ],
    };
  });

  const nextButtonStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      isLoading ? 0 : 1,
      [0, 1],
      [Colors.lightGrey, Colors.primaryColor],
    );

    return {
      backgroundColor: withSpring(backgroundColor),
    };
  });

  return (
    <View style={styles.container}>
      {error?.message && typeof error.message === 'string' && (
        <Animated.View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message}</Text>
        </Animated.View>
      )}

     {isLastStep && <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setIsChecked(!isChecked)}>
          {isChecked && (
            <CheckSVG fill={colors.primaryColor}  width={20} height={20} />
          )}
        </TouchableOpacity>
        <Text style={styles.footerText}>
            By continuing, you agree to our <Text style={styles.footerTextLink} onPress={() => navigate('TermPrivacyPolicy')}>Terms & Privacy Policy</Text>
          </Text>
      </View>}

      {error?.message && Array.isArray(error.message) && (
        <Animated.View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error.message[0]}</Text>
        </Animated.View>
      )}

      <View style={styles.buttonContainer}>
        {!isFirstStep && (
          <Animated.View style={[styles.backButtonContainer, backButtonStyle]}>
            <TouchableOpacity
              style={[
                styles.backButton,
                {borderColor: colors.primaryColor, width: '100%'},
              ]}
              onPress={onPrevious}
              disabled={isLoading}>
              <Text
                style={[styles.backButtonText, {color: colors.primaryColor}]}>
                Back
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View
          style={[styles.nextButtonContainer, isFirstStep && styles.fullWidth]}>
          {/* <CustomButton
            title={isLastStep ? 'Sing Up' : 'Continue'}
            onPress={onNext}
            containerStyle={[styles.nextButton, nextButtonStyle]}
            isLoading={isLoading}
            isDisabled={isLoading}
          /> */}
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                borderColor: colors.primaryColor,
                backgroundColor: colors.primaryColor,
                width: '100%',
                paddingHorizontal: 0,
              },
            ]}
            onPress={onNext}
            disabled={isLoading || (isLastStep && !isChecked)}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={[styles.backButtonText, {color: colors.white}]}>
                {isLastStep ? 'Sign Up' : 'Continue'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#d32f2f',
    fontFamily: fontFamily.regular,
    fontSize: fontSize.f14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  backButtonContainer: {
    flex: 0.485,
  },
  backButton: {
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
  },
  backButtonText: {
    fontFamily: fontFamily.boldfont,
    fontSize: fontSize.f16,
    color: Colors.primaryColor,
  },
  nextButtonContainer: {
    flex: 0.5,
  },
  fullWidth: {
    flex: 1,
  },
  nextButton: {
    borderRadius: 25,
    paddingVertical: 15,
    backgroundColor: Colors.primaryColor,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: Colors.primaryColor,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.f14,
    color: Colors.grey,
    flexShrink: 1,
    marginLeft: 10,
  },
  footerTextLink: {
    fontFamily: fontFamily.boldfont,
    color: Colors.primaryColor,
  },
});

export default SignupNavigation;
