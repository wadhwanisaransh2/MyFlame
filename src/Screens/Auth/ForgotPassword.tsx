import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {Controller, useForm} from 'react-hook-form';
import {CustomButton, CustomInput} from '../../Components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {navigate} from '../../Utils/navigation';
import {useTheme} from '../../Theme/ThemeContext';
import {useForgotPasswordMutation} from '../../redux/api/auth';
import {useAnimatedTopContainer} from '../../Hooks/useAnimatedTopContainer';

export default function ForgotPassword() {
  const {colors} = useTheme();
  const {animateContainer, animatedTopContainer} = useAnimatedTopContainer();
  const [forgotPassword, {error, isLoading}] = useForgotPasswordMutation();
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const onSubmit = async (data: any) => {
    await forgotPassword(data).unwrap();
    navigate('OTPVerify', {type: 'forgot_password', phone: data.username});
  };

  // Trigger animation when the component mounts
  useEffect(() => {
    animateContainer('40%');
  }, [animateContainer]);

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={40}  
      >
        {/* Animated Top Container */}
        <Animated.View style={[styles.topContainer, animatedTopContainer]}>
          <Text style={styles.title}>My Flama</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! It occurs. Please enter the username linked with your
            account.
          </Text>
        </Animated.View>

        {/* Static Second Container */}
        <View
          style={[
            styles.secondContainer,
            {backgroundColor: colors.backgroundColor},
          ]}>
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <CustomInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Username*"
                error={errors.username?.message}
                // autoCapitalize="none"
              />
            )}
            name="username"
            rules={{
              required: 'This username is required',
            }}
          />

          {(error as any)?.message &&
            typeof (error as any)?.message === 'string' && (
              <Text style={{color: 'red', marginLeft: 24}}>
                {(error as any)?.message}
              </Text>
            )}

          <CustomButton
            title="Send Code"
            onPress={handleSubmit(onSubmit)}
            containerStyle={{marginTop: 20}}
            isLoading={isLoading}
            isDisabled={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },

  title: {
    color: Colors.white,
    fontFamily: fontFamily.lightfont,
    fontSize: fontSize.f32,
    width: wp('80%'),
    fontStyle: 'italic',
  },

  subtitle: {
    color: Colors.white,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.f18,
    marginTop: 10,
    width: wp('90%'),
  },

  topContainer: {
    width: wp('100%'),
    backgroundColor: Colors.primaryColor,
    padding: 20,
    paddingTop: 50,
  },

  secondContainer: {
    flex: 1,
    width: wp('100%'),
    backgroundColor: Colors.backgroundColor,
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    marginTop: -30,
    padding: 10,
    paddingTop: 20,
  },
});
