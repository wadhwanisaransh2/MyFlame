import React, {useRef, useEffect, useState, useMemo, useCallback} from 'react';
import {
  Image,
  StyleSheet,
  View,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
  Keyboard,
  BackHandler,
} from 'react-native';
import {TabView, SceneMap} from 'react-native-tab-view';
import {ColorThemeInterface} from '../Utils/colors';
import {
  AddSVG,
  HomeSVG,
  KingSVG,
  LocationSVG,
  ReelsSVG,
} from '../Assets/Images/SVGs/BottomTabSVG';

// Import screens
import MapScreen from '../Screens/Map/MapScreen';
import RankScreen from '../Screens/Rank/EventScreen';
import {useTheme} from '../Theme/ThemeContext';
import HomeScreen from '../Screens/Home/HomeScreen';
import {IMAGES} from '../Assets';
import ShortsFeed from '../Screens/Reels/ShortsFeed';
import AddPostReelsScreen from '../Screens/Home/AddPostReelsScreen';
import {useFocusEffect} from '@react-navigation/native';

const initialLayout = {width: Dimensions.get('window').width};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    // backgroundColor: 'red',
  },
  activeIcon: {
    padding: 8,
    backgroundColor: 'white',
    marginTop: 5,
    elevation: 5,
    borderRadius: 100,
  },
  inactiveIcon: {
    padding: 10,
    borderRadius: 10,
  },
  addPost: {
    padding: 5,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    marginTop: 5,
  },
  tabBarContainer: {
    bottom: 10,
    left: 10,
    right: 10,
    height: 60,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // paddingTop: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 25,
    borderRadius: 30,

    zIndex: 1000,

    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
});

// Custom TabIcon component with animations
const AnimatedTabIcon = React.memo(
  ({
    color,
    size,
    focused,
    IconComponent,
  }: {
    color: string;
    size: number;
    focused: boolean;
    IconComponent: any;
  }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (focused) {
        // Animation when tab becomes active
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }).start();
        });
      } else {
        // Reset animations when tab becomes inactive
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [focused]);

    const animatedStyle = {
      transform: [{scale: scaleAnim}, {scaleX: focused ? -1 : 1}],
    };

    return (
      <Animated.View
        style={[
          focused ? styles.activeIcon : styles.inactiveIcon,
          animatedStyle,
        ]}>
        <IconComponent
          focused={focused}
          fill={color}
          width={size}
          height={size}
        />
      </Animated.View>
    );
  },
);

// Add Post Button with animation
const AnimatedAddButton = React.memo(({onPress}: {onPress: () => void}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ]),
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[styles.addPost, {transform: [{scale: pulseAnim}]}]}>
        <AddSVG width={25} height={25} fill="white" />
      </Animated.View>
    </TouchableOpacity>
  );
});

// Scene components

const BottomTabNavigator = ({navigation}: {navigation: any}) => {
  const {colors} = useTheme();

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          onBackPress();
          return true;
        },
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  // Set up routes for TabView
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'home', title: 'Home'},
    {key: 'map', title: 'Map'},
    {key: 'addPost', title: 'Add'},
    {key: 'reels', title: 'Reels'},
    {key: 'rank', title: 'Rank'},
  ]);

  const HomeTab = React.memo(
    ({
      handleTabHide,
      keyboardVisible,
    }: {
      handleTabHide: (value: boolean) => void;
      keyboardVisible: boolean;
    }) => (
      <HomeScreen
        handleTabHide={handleTabHide}
        keyboardVisible={keyboardVisible}
      />
    ),
  );

  const onBackPress = useCallback(() => {
    setIndex(0);
  }, []);

  // State to track keyboard visibility
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const realsScreenRef = useRef<any>(null);

  useEffect(() => {
    if (index === 3) {
      realsScreenRef.current?.resume()
    } else {
      realsScreenRef.current?.pause();
    }
  }, [index]);

  const MapTab = React.memo(() => <MapScreen />);
  const AddPostTab = React.memo(() => (
    <AddPostReelsScreen onBackPress={onBackPress} />
  ));
  const ReelsTab = React.memo(() => (
    <ShortsFeed onBackPress={onBackPress} ref={realsScreenRef} />
  ));
  const RankTab = React.memo(() => <RankScreen onBackPress={onBackPress} />);

  // Animation for tab bar appearance
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Set up keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    // Clean up listeners
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleTabHide = (value: boolean) => {
    setKeyboardVisible(value);
  };

  // Memoize renderScene to prevent unnecessary re-renders
  const renderScene = useMemo(
    () =>
      SceneMap({
        home: () => (
          <HomeScreen
            handleTabHide={handleTabHide}
            keyboardVisible={isKeyboardVisible}
          />
        ),
        map: MapTab,
        addPost: AddPostTab,
        reels: ReelsTab,
        rank: RankTab,
      }),
    [],
  );

  // Optimize onIndexChange handler with useCallback
  const handleIndexChange = useCallback((newIndex: number) => {
    setIndex(newIndex);
  }, []);

  // Memoize tab press handler
  const handleTabPress = useCallback(
    (routeKey: string, i: number) => {
      if (index !== i) {
        setIndex(i);
      }
    },
    [index],
  );

  // Icons mapping - memoized to prevent recreations on re-render
  const getIcon = useCallback(
    (routeKey: string, isFocused: boolean) => {
      const color = isFocused ? colors.primaryColor : 'white';
      const size = 24;

      switch (routeKey) {
        case 'home':
          return (
            <AnimatedTabIcon
              color={color}
              size={size}
              focused={isFocused}
              IconComponent={HomeSVG}
            />
          );
        case 'map':
          return (
            <AnimatedTabIcon
              color={color}
              size={size}
              focused={isFocused}
              IconComponent={LocationSVG}
            />
          );
        case 'addPost':
          return (
            <AnimatedAddButton onPress={() => handleTabPress('addPost', 2)} />
          );
        case 'reels':
          return (
            <AnimatedTabIcon
              color={color}
              size={size}
              focused={isFocused}
              IconComponent={ReelsSVG}
            />
          );
        case 'rank':
          return (
            <AnimatedTabIcon
              color={color}
              size={size}
              focused={isFocused}
              IconComponent={KingSVG}
            />
          );
        default:
          return null;
      }
    },
    [colors.primaryColor],
  );

  // Memoize tab bar style to prevent recalculation
  const tabBarStyle = useMemo(
    () => ({
      ...styles.tabBarContainer,
      backgroundColor: colors.primaryColor,
      transform: [{translateY: slideUpAnim}],
      opacity: opacityAnim,
    }),
    [colors.primaryColor, slideUpAnim, opacityAnim],
  );

  // Custom tab bar component
  const renderCustomTabBar = useCallback(() => {
    return (
      <Animated.View style={tabBarStyle}>
        {routes.map((route, i) => {
          const isFocused = index === i;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => handleTabPress(route.key, i)}
              style={styles.tabButton}
              activeOpacity={0.7}>
              {getIcon(route.key, isFocused)}
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    );
  }, [routes, index, tabBarStyle, getIcon, handleTabPress]);

  return (
    <View style={styles.tabContainer}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={initialLayout}
        swipeEnabled={true}
        renderTabBar={() => null}
      />
      {index !== 3 && index !== 2 && !isKeyboardVisible && renderCustomTabBar()}
    </View>
  );
};

export default React.memo(BottomTabNavigator);

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    activeIcon: {
      padding: 10,
      backgroundColor: 'white',
      marginTop: 5,
      elevation: 5,
      borderRadius: 10,
    },
    inactiveIcon: {
      padding: 10,
      borderRadius: 10,
    },
    addPost: {
      padding: 2,
      borderRadius: 100,
      borderWidth: 2,
      borderColor: 'white',
      marginTop: 5,
    },
  });
