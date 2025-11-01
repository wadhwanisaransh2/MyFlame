import {
  CommonActions,
  createNavigationContainerRef,
  NavigationState,
  PartialState,
} from '@react-navigation/native';
import {TRootStack} from '../Interfaces/Navigation.type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {showToast} from './general';

export const navigationRef = createNavigationContainerRef<TRootStack>();

export const navigate = <T>(name: keyof T, params?: T[keyof T]) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as keyof TRootStack, params as any);
  }
};

export const navigateBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};
export const navigateAndReset = (routes = [], index = 0) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      }),
    );
  }
};

export const navigateAndSimpleReset = <T>(
  name: keyof T,
  params?: T[keyof T],
  index = 0,
) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes: [{name: name as string, params: params as any}],
      }),
    );
  }
};

// Recursively find top-level route name
const getTopLevelRouteName = (
  state: NavigationState | PartialState<NavigationState> | undefined,
): string | undefined => {
  if (!state || !state.routes || state.routes.length === 0) return undefined;

  const route = state.routes[state.index || 0];

  if ('state' in route && route.state) {
    return getTopLevelRouteName(route.state as NavigationState);
  }

  return route.name;
};

// List of screens considered part of Auth flow
const AUTH_SCREENS = [
  'Login',
  'Signup',
  'InitAuth',
  'ForgotPassword',
  'OTPVerify',
  'ChangePassword',
  'TermPrivacyPolicy',
];

export const handleSessionExpired = async () => {
  const currentRoute = navigationRef.getCurrentRoute();
  const currentScreen = currentRoute?.name;

  // Proceed only if user is NOT on an auth screen
  if (!AUTH_SCREENS.includes(currentScreen || '')) {
    showToast('Your session has expired! Login again');

    await AsyncStorage.clear();

    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'AuthStack',
            params: {screen: 'Login'},
          },
        ],
      }),
    );
  } else {
    }
};
