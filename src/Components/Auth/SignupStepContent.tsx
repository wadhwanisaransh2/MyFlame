import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  FadeInRight,
  FadeOutLeft,
} from 'react-native-reanimated';
import { Control, FieldErrors } from 'react-hook-form';
import { SignupStepData, SignupFormData } from '../../Interfaces/auth.types';
import { Colors } from '../../Utils/colors';
import { fontFamily, fontSize } from '../../Utils/fontIcon';
import { wp } from '../../Utils/responsive';
import { useTheme } from '../../Theme/ThemeContext';
import AnimatedFormField from './AnimatedFormField';
import { SIGNUP_ANIMATIONS } from '../../Constants/signupSteps';

interface SignupStepContentProps {
  stepData: SignupStepData;
  control: Control<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  getValidationRules: (fieldName: keyof SignupFormData) => any;
}

const SignupStepContent: React.FC<SignupStepContentProps> = ({
  stepData,
  control,
  errors,
  getValidationRules,
}) => {
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInRight.duration(SIGNUP_ANIMATIONS.STEP_TRANSITION_DURATION)}
      exiting={FadeOutLeft.duration(SIGNUP_ANIMATIONS.STEP_TRANSITION_DURATION)}
      style={styles.container}
    >
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.black }]}>
          {stepData.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.grey }]}>
          {stepData.subtitle}
        </Text>
      </View>

      <View style={styles.fieldsContainer}>
        {stepData.fields.map((field, index) => (
          <AnimatedFormField
            key={field.name}
            field={field}
            control={control}
            errors={errors}
            animationDelay={index * SIGNUP_ANIMATIONS.FIELD_ANIMATION_DELAY}
            getValidationRules={getValidationRules}
          />
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontFamily: fontFamily.boldfont,
    fontSize: fontSize.f24,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.f16,
    textAlign: 'center',
    color: Colors.grey,
  },
  fieldsContainer: {
    flex: 1,
  },
});

export default SignupStepContent; 