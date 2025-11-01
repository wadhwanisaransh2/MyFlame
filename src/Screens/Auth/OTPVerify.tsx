import React, {useEffect, useState, useRef} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {CustomButton} from '../../Components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {navigate} from '../../Utils/navigation';
import OTPTextView from 'react-native-otp-textinput';
import {useTheme} from '../../Theme/ThemeContext';
import {setAsyncStorage, showToast} from '../../Utils/general';
import {ASYNC_KEYS} from '../../Utils/constant';
import {useDispatch} from 'react-redux';
import {setAuth} from '../../redux/Store/AuthSlice';
import {
  useForgotPasswordMutation,
  useResendOtpMutation,
  useResetPasswordVerifyOtpMutation,
  useVerifyOtpMutation,
} from '../../redux/api/auth';
import {useAnimatedTopContainer} from '../../Hooks/useAnimatedTopContainer';
import {t} from 'i18next';

export default function OTPVerify({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const {colors} = useTheme();
  const {animateContainer, animatedTopContainer} = useAnimatedTopContainer();
  const [verifyOtp, {error, isLoading}] = useVerifyOtpMutation();
  const [
    resetPasswordVerifyOtp,
    {error: resetPasswordError, isLoading: resetPasswordLoading},
  ] = useResetPasswordVerifyOtpMutation();
  const [resendOtp, {error: resendError, isLoading: resendLoading}] =
    useResendOtpMutation();
  const [forgotPassword] = useForgotPasswordMutation();

  const [counter, setCounter] = useState(30);
  const {type, phone} = route.params;
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prevState => prevState - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const resendOTP = async () => {
    if (type === 'forgot_password') {
      setCounter(30);
      await forgotPassword({username: phone}).unwrap();
      
    } else if (type === 'user-verify') {
       setCounter(30);
      await resendOtp({username: phone}).unwrap();
     
    }
    showToast("OTP resent successfully");
  };

  // Trigger animation when the component mounts
  useEffect(() => {
    animateContainer('40%');
  }, [animateContainer]);

  const handleOTPEntered = async (text: string) => {
    try {
      setOtp(text);
      if (text.length === 6) {
        if (type === 'user-verify') {
          const res = await verifyOtp({
            username: phone,
            otp: text,
          }).unwrap();
          await setAsyncStorage(ASYNC_KEYS.ACCESS_TOKEN, res?.access_token);
          dispatch(setAuth(res));
          navigation.reset({
            index: 0,
            routes: [{name: 'MainStack'}],
          });
        } else if (type === 'forgot_password') {
          const res = await resetPasswordVerifyOtp({
            username: phone,
            otp: text,
          }).unwrap();
          navigate('ChangePassword', {token: res?.reset_token});
        }
      }
    } catch (error: any) {
      showToast(error?.message || 'Something went wrong');
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <StatusBar backgroundColor={Colors.primaryColor} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={40}>
        {/* Animated Top Container */}
        <Animated.View style={[styles.topContainer, animatedTopContainer]}>
          <Text style={styles.title}>My Flama</Text>
          <Text style={styles.title}>OTP Verification</Text>
          <Text style={styles.subtitle}>
            Enter the verification code we just sent on your email address.
          </Text>
        </Animated.View>

        {/* Static Second Container */}
        <View
          style={[
            styles.secondContainer,
            {backgroundColor: colors.backgroundColor},
          ]}>
          {/* <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <CustomInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Phone Number*"
                error={errors.phone?.message}
                keyboardType="number-pad"
                maxLength={10}
              />
            )}
            name="phone"
            rules={{
              required: 'This phone number is required',
              minLength: {
                value: 10,
                message: 'Phone number must be 10 digits',
              },
              maxLength: {
                value: 10,
                message: 'Phone number must be 10 digits',
              },
            }}
          /> */}

          <OTPTextView
            handleTextChange={handleOTPEntered}
            inputCount={6}
            tintColor={colors.primaryColor}
            containerStyle={{marginTop: 20}}
            textInputStyle={{
              borderWidth: 1,
              borderColor: colors.primaryColor,
              borderRadius: 10,
            }}
            ref={inputRef}
            keyboardType="number-pad"
          />
          {(error as any)?.message &&
            typeof (error as any)?.message === 'string' && (
              <Text style={{color: 'red', marginLeft: 24}}>
                {(error as any)?.message}
              </Text>
            )}

          {(resendError as any)?.message &&
            typeof (resendError as any)?.message === 'string' && (
              <Text style={{color: 'red', marginLeft: 24}}>
                {(resendError as any)?.message}
              </Text>
            )}

          <Text
            disabled={counter > 0}
            onPress={resendOTP}
            style={[styles.resendText, {color: colors.black}]}>
            {counter > 0 ? `Resend OTP in ${counter}` : 'Resend OTP'}
          </Text>

          <CustomButton
            title={'Verify'}
            onPress={() => handleOTPEntered(otp)}
            containerStyle={{marginTop: 20}}
            isLoading={isLoading || resetPasswordLoading}
            isDisabled={isLoading || resetPasswordLoading}
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

  resendText: {
    color: Colors.black,
    fontFamily: fontFamily.boldfont,
    fontSize: fontSize.f18,
    textAlign: 'center',
    marginTop: 10,
  },
});
