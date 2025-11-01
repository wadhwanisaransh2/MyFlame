import React, {useEffect, useMemo, useCallback} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {TRootStack} from '../Interfaces/Navigation.type';
import {NavigationContainer} from '@react-navigation/native';
import MainStackNavigator from './MainStack';
import AuthStackNavigator from './AuthStack';
import Splash from '../Screens/Initials/Splash';
import {navigationRef} from '../Utils/navigation';
import {SafeAreaView, Edge} from 'react-native-safe-area-context';
import {useTheme} from '../Theme/ThemeContext';
import {Platform, StatusBar} from 'react-native';

const RootNavigator = createNativeStackNavigator<TRootStack>();

const Application = () => {
  const {colors} = useTheme();
  const [background, setBackground] = React.useState(colors.primaryColor);
  const [currentRouteName, setCurrentRouteName] = React.useState('');

  // Optimized route-to-background mapping using useMemo
  const routeBackgroundMap = useMemo(
    () =>
      new Map([
        ['Splash', colors.primaryColor],
        ['AuthStack', colors.primaryColor],
        ['MainStack', colors.backgroundColor],
        ['InitAuth', colors.primaryColor],
        ['Signup', colors.primaryColor],
        ['Login', colors.primaryColor],
        ['reels', 'black'],
        ['SearchScreen', colors.primaryColor],
        ['', colors.primaryColor],
      ]),
    [colors.primaryColor, colors.backgroundColor],
  );

  // Helper function to get the current route name from navigation state
  const getCurrentRouteName = useCallback((state: any): string => {
    if (!state || !state.routes) return '';

    const route = state.routes[state.index];

    // If this route has nested state (like in stack navigators)
    if (route.state) {
      return getCurrentRouteName(route.state);
    }

    return route.name;
  }, []);

  // Handle navigation state change
  const onNavigationStateChange = useCallback(
    (state: any) => {
      const routeName = getCurrentRouteName(state);
      setCurrentRouteName(routeName);
      const backgroundColor =
        routeBackgroundMap.get(routeName) || colors.backgroundColor;
      setBackground(backgroundColor);
    },
    [getCurrentRouteName, routeBackgroundMap, colors.backgroundColor],
  );

  // Memoized safe area edges calculation with proper typing
  const safeAreaEdges = useMemo((): Edge[] => {
    const fullScreenRoutes = new Set(['reels', 'MapTab', ]);
    return fullScreenRoutes.has(currentRouteName)
      ? []
      : ['top', 'left', 'right'];
  }, [currentRouteName]);

  // Memoized status bar style
  const statusBarStyle = useMemo(
    () => (currentRouteName === 'reels' ? 'light-content' : 'dark-content'),
    [currentRouteName],
  );

  // Memoized navigation container
  const navigationContainer = useMemo(
    () => (
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}>
        <RootNavigator.Navigator screenOptions={{headerShown: false}}>
          <RootNavigator.Screen component={Splash} name="Splash" />
          <RootNavigator.Screen
            component={AuthStackNavigator}
            name="AuthStack"
          />
          <RootNavigator.Screen
            component={MainStackNavigator}
            name="MainStack"
          />
        </RootNavigator.Navigator>
      </NavigationContainer>
    ),
    [onNavigationStateChange],
  );

  // Memoized iOS SafeAreaView
  const iOSSafeAreaView = useMemo(
    () => (
      <SafeAreaView
        edges={safeAreaEdges}
        style={{flex: 1, backgroundColor: background}}>
        <StatusBar backgroundColor={background} barStyle={statusBarStyle} />
        {navigationContainer}
      </SafeAreaView>
    ),
    [safeAreaEdges, background, statusBarStyle, navigationContainer],
  );

  // Memoized Android SafeAreaView
  const androidSafeAreaView = useMemo(
    () => (
      <SafeAreaView style={{flex: 1, backgroundColor: background}}>
        {navigationContainer}
      </SafeAreaView>
    ),
    [background, navigationContainer],
  );

  return Platform.OS === 'ios' ? iOSSafeAreaView : androidSafeAreaView;
};

export default Application;
