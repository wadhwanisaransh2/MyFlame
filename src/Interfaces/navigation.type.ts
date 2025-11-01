import {CompositeScreenProps} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';

export type TRootStack = {
  Splash: undefined;
  MainStack: undefined;
  AuthStack: undefined;
  NoInternet: {
    reason: string;
  };
};

export type TAuthStack = {
  InitAuth: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ChangePassword: undefined;
  OTPVerify: undefined;
  TermPrivacyPolicy: undefined;
};

export type TMainStack = {
  TabStack: undefined;
};

export type TRootStackProps = StackScreenProps<TRootStack, keyof TRootStack>;

export type TSplashStackProps = StackScreenProps<TRootStack, 'Splash'>;

/* ---------------------- Auth Stacks ------------------------------ */

export type TSignupStackProps = StackScreenProps<TAuthStack, 'Signup'>;
export type TLoginStackProps = StackScreenProps<TAuthStack, 'Login'>;

export type SigninProps = CompositeScreenProps<
  StackScreenProps<TAuthStack, 'Login'>,
  CompositeScreenProps<
    StackScreenProps<TRootStack, 'MainStack'>,
    StackScreenProps<TMainStack>
  >
>;
