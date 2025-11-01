import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {Colors} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';
import {wp} from '../../Utils/responsive';
import {Controller, useForm} from 'react-hook-form';
import {CustomButton, CustomInput} from '../../Components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useTheme} from '../../Theme/ThemeContext';
import {useAnimatedTopContainer} from '../../Hooks/useAnimatedTopContainer';
import {
  useChnagePasswordMutation,
  useResetPasswordMutation,
} from '../../redux/api/auth';
import {showToast} from '../../Utils/general';
import {navigateAndSimpleReset, navigateBack} from '../../Utils/navigation';
import TextButton from '../../Components/Buttons/TextButton';

export default function ChangePasswordUsingOld({route}: {route: any}) {
  const {colors} = useTheme();
  const {animateContainer, animatedTopContainer} = useAnimatedTopContainer();
  const [resetPassword] = useResetPasswordMutation();

  const [
    ChangePassword,
    {error: resetPasswordError, isLoading: resetPasswordLoading},
  ] = useChnagePasswordMutation();

  const {
    control,
    handleSubmit,
    formState: {errors},
    getValues,
  } = useForm();
  const onSubmit = async (data: any) => {
    ChangePassword({
      oldpassword: data.password,
      newpassword: data.confirmPassword,
    })
      .unwrap()
      .then(() => {
        showToast('Password Change successfully');
        navigateBack();
      })
      .catch((error: any) => {
        showToast(error?.message || 'Something went wrong');
      });
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
        extraScrollHeight={40}>
        {/* Animated Top Container */}
        <Animated.View style={[styles.topContainer, animatedTopContainer]}>
          <Text style={styles.title}>My Flama</Text>
          <Text style={styles.title}>Create new password</Text>
          <Text style={styles.subtitle}>
            Your new password must be unique from those previously used.
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
                placeholder="Old Password"
                secureTextEntry
                error={errors.password?.message}
              />
            )}
            name="password"
            rules={{required: 'This Old password is required'}}
          />

          <Controller
            control={control}
            render={({field: {onChange, onBlur, value}}) => (
              <CustomInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="New Password"
                secureTextEntry
                error={errors.confirmPassword?.message}
              />
            )}
            name="confirmPassword"
            rules={{
              required: 'This New password is required',
            }}
          />

          <CustomButton
            title="Change Password"
            onPress={handleSubmit(onSubmit)}
            containerStyle={{marginTop: 20}}
            isLoading={resetPasswordLoading}
            isDisabled={resetPasswordLoading}
          />

          <TextButton title="Cancel" onPress={navigateBack} />
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
