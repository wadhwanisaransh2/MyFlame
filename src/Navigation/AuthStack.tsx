import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TAuthStack} from '../Interfaces/Navigation.type';
import Signup from '../Screens/Auth/Signup';
import Login from '../Screens/Auth/Login';
import InitAuth from '../Screens/Auth/InitAuth';
import ForgotPassword from '../Screens/Auth/ForgotPassword';
import OTPVerify from '../Screens/Auth/OTPVerify';
import ChangePassword from '../Screens/Auth/ChangePassword';
import TermPrivacyPolicy from '../Screens/Auth/Term&PrivacyPolicy';

const AuthNavigator = createNativeStackNavigator<TAuthStack>();

const AuthStackNavigator = () => {
  return (
    <AuthNavigator.Navigator screenOptions={{headerShown: false}}>
      <AuthNavigator.Screen component={InitAuth} name="InitAuth" />
      <AuthNavigator.Screen component={Login} name="Login" />
      <AuthNavigator.Screen component={Signup} name="Signup" />
      <AuthNavigator.Screen component={ForgotPassword} name="ForgotPassword" />
      <AuthNavigator.Screen component={OTPVerify} name="OTPVerify" />
      <AuthNavigator.Screen component={ChangePassword} name="ChangePassword" />
      <AuthNavigator.Screen component={TermPrivacyPolicy} name="TermPrivacyPolicy" />
    </AuthNavigator.Navigator>
  );
};

export default AuthStackNavigator;
