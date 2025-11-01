import React, {useEffect, useState} from 'react';
import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {Controller, useForm} from 'react-hook-form';
import {CustomButton, CustomDivider, CustomInput} from '../../Components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {FacebookSVG, GoogleSVG} from '../../Assets/Images/SVGs/AuthSVG';
import {navigate} from '../../Utils/navigation';
import {useTheme} from '../../Theme/ThemeContext';
import {useDispatch} from 'react-redux';
import {setAsyncStorage, showToast, decodeJWT} from '../../Utils/general';
import {useGoogleLoginMutation, useLoginMutation} from '../../redux/api/auth';
import {setAuth} from '../../redux/Store/AuthSlice';
import {useAnimatedTopContainer} from '../../Hooks/useAnimatedTopContainer';
import {getFcmToken} from '../../Utils/NotificationService';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import ReferralCodeModal from '../../Components/Auth/ReferralCodeModal';

// Interface for Google JWT token payload
interface GoogleJwtPayload {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  sub: string; // Google's user identifier
  iss: string;
  aud: string;
  exp: number;
  iat: number;
}

export default function Login({navigation}: {navigation: any}) {
  const {colors} = useTheme();
  const [login, {isLoading, error}] = useLoginMutation();
  const [googleLogin, {isLoading: googleLoading}] = useGoogleLoginMutation();
  const {animatedTopContainer, animateContainer} = useAnimatedTopContainer();
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '828630247533-pan8832qd9l6t2s5j48dosl96isbufrf.apps.googleusercontent.com', // Web Client ID
      offlineAccess: true, // If you need offline access
      forceCodeForRefreshToken: true, // Force getting refresh token
    });
  }, []);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const fcmToken = await getFcmToken();
      const res = await login({
        username: data.username,
        password: data.password,
        deviceId: fcmToken || 'ftyuuyhbuyhgj',
      }).unwrap();
      if (res.requiresVerification === true) {
        navigate('OTPVerify', {type: 'user-verify', phone: data.username});
      } else {
        await setAsyncStorage('ACCESS_TOKEN', res.access_token);
        dispatch(setAuth(res));
        navigation.reset({index: 0, routes: [{name: 'MainStack'}]});
      }
    } catch (e: any) {
      console.error(e || 'Failed to login! Try again');
      showToast(e.message || 'Failed to login! Try again');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      // Check if user is already signed in
      await GoogleSignin.hasPlayServices();
      // Sign in
      const userInfo = await GoogleSignin.signIn();

      try {
        // Get tokens directly
        const tokens = await GoogleSignin.getTokens();

        if (tokens.idToken) {
          const fcmToken = await getFcmToken();
          console.log('idToken--------->', tokens.idToken, fcmToken);
          const res = await googleLogin({
            token: tokens.idToken,
            deviceId: fcmToken,
          });

          await setAsyncStorage('ACCESS_TOKEN', res?.data.access_token);
          dispatch(setAuth(res?.data));
          if (res?.data?.isNewUser) {
            setIsModalVisible(true);
          } else {
            navigation.reset({index: 0, routes: [{name: 'MainStack'}]});
          }

          // console.log(res);
        }
      } catch (error: any) {
        console.error('Google auth backend error:', error);
        showToast('Something went wrong with Google Sign-In');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
        return; // Return early when user cancels
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Operation is in progress already');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showToast('Google Play services not available or outdated');
      } else {
        console.log('Google Sign-In Error:', error);
        showToast('Something went wrong with Google Sign-In');
      }
    }
  };

  // Trigger animation when the component mounts
  useEffect(() => {
    animateContainer('40%');
  }, [animateContainer]);

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <StatusBar backgroundColor={colors.primaryColor} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        extraScrollHeight={40}>
        {/* Animated Top Container */}
        <Animated.View
          style={[
            styles.topContainer,
            animatedTopContainer,
            {backgroundColor: colors.primaryColor},
          ]}>
          <Text style={[styles.title, {color: Colors.white}]}>My Flama</Text>
          <Text style={[styles.title, {color: Colors.white}]}>
            Welcome back! Glad to see you, Again!
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
                placeholder="Username"
                error={errors.username && errors.username}
              />
            )}
            name="username"
            rules={{required: 'This username is required'}}
          />
          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <CustomInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Password"
                secureTextEntry
                error={errors.password?.message}
                keyboardType="default"
              />
            )}
            name="password"
            rules={{
              required: 'This password is required',
            }}
          />

          {/* {(error as any)?.message &&
            typeof (error as any)?.message === 'string' && (
              <Text style={{color: 'red', marginLeft: 24}}>
                {(error as any)?.message}
              </Text>
            )} */}

          <View
            style={[
              styles.forgotPasswordView,
              // {backgroundColor: colors.backgroundColor},
            ]}>
            <Text
              onPress={() => {
                navigate('Signup');
              }}
              style={[styles.forgotPassword, {color: colors.primaryColor}]}>
              Don't have an account?{' '}
            </Text>
            <Text
              onPress={() => {
                navigate('ForgotPassword');
              }}
              style={[styles.forgotPassword, {color: colors.primaryColor}]}>
              Forgot Password?
            </Text>
          </View>

          <CustomButton
            title="Login"
            onPress={handleSubmit(onSubmit)}
            containerStyle={{marginTop: 20}}
            isLoading={isLoading}
            isDisabled={isLoading}
          />
          {Platform.OS === 'android' && (
            <>
              <CustomDivider text="Or" deviderStyle={{marginHorizontal: 15}} />

              <CustomButton
                title="Login with Google"
                onPress={handleGoogleSignup}
                containerStyle={{marginTop: 20, backgroundColor: 'transparent'}}
                titleStyle={{color: colors.black, fontSize: fontSize.f16}}
                iconName={
                  !googleLoading ? <GoogleSVG width={20} height={20} /> : <></>
                }
                isLoading={googleLoading}
                loaderColor={colors.primaryColor}
              />
            </>
          )}
          {/* <CustomButton
            title="Login with Facebook"
            onPress={() => console.log('facebook')}
            containerStyle={{marginTop: 20, backgroundColor: 'transparent'}}
            titleStyle={{color: colors.black, fontSize: fontSize.f16}}
            iconName={<FacebookSVG width={23} height={23} />}
          /> */}
        </View>

        <ReferralCodeModal
          isModalVisible={isModalVisible}
          setIsModalVisible={setIsModalVisible}
          navigation={navigation}
        />
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
  forgotPassword: {
    color: Colors.black,
    fontFamily: fontFamily.boldfont,
    fontSize: fontSize.f14,
    textAlign: 'right',
    marginTop: 10,
  },
  forgotPasswordView: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
});
