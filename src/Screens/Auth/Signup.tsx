import React, {useEffect, useState} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors, ColorThemeInterface} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useTheme} from '../../Theme/ThemeContext';
import {useAnimatedTopContainer} from '../../Hooks/useAnimatedTopContainer';
import {useSignupForm} from '../../Hooks/useSignupForm';
import {
  ProgressIndicator,
  SignupStepContent,
  SignupNavigation,
} from '../../Components';

export default function Signup() {
  const {colors} = useTheme();

  const {animateContainer, animatedTopContainer} = useAnimatedTopContainer();
  const [isChecked, setIsChecked] = useState(false);

  const {
    control,
    errors,
    currentStep,
    currentStepData,
    isFirstStep,
    isLastStep,
    isLoading,
    error,
    progress,
    handleFormSubmit,
    prevStep,
    getFieldValidationRules,
  } = useSignupForm();

  // Trigger animation when the component mounts
  useEffect(() => {
    animateContainer('25%');
  }, [animateContainer]);

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primaryColor} />

      <KeyboardAwareScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        extraScrollHeight={20}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        >
        {/* Animated Top Container */}
        <Animated.View style={[styles.topContainer, animatedTopContainer]}>
          <Text style={styles.appTitle}>My Flama</Text>
          <Text style={styles.welcomeTitle}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join our community today</Text>

          {/* Progress Indicator */}
          {/* <ProgressIndicator
            currentStep={currentStep}
            totalSteps={currentStepData.totalSteps}
            progress={progress}
          /> */}
        </Animated.View>

        {/* Form Container */}
        <View
          style={[
            styles.formContainer,
            {backgroundColor: colors.backgroundColor},
          ]}>
          {/* Step Content */}
          <SignupStepContent
            stepData={currentStepData}
            control={control}
            errors={errors}
            getValidationRules={getFieldValidationRules}
          />

          {/* Navigation */}
          <SignupNavigation
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isLoading={isLoading}
            isChecked={isChecked}
            setIsChecked={setIsChecked}
            onNext={handleFormSubmit}
            onPrevious={prevStep}
            error={error}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  scrollView: {
    flex: 1,
    backgroundColor : colors.backgroundColor,
  },
  topContainer: {
    width: wp('100%'),
    backgroundColor: colors.primaryColor,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  appTitle: {
    color: Colors.white,
    fontFamily: fontFamily.lightfont,
    fontSize: fontSize.f32,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeTitle: {
    color: Colors.white,
    fontFamily: fontFamily.boldfont,
    fontSize: fontSize.f24,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    color: Colors.white,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.f16,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    marginTop: -30,
    paddingTop: 10,
    minHeight: wp('120%'), // Ensure enough height for content
  },
});
