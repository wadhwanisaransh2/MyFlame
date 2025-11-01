import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import InstagramShoePostScreen from './AddPostScreen';
import AddReelsScreen from './AddReelsScreen';
import {hp, wp} from '../../Utils/responsive';
import {GallerySVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {ReelsSVG} from '../../Assets/Images/SVGs/BottomTabSVG';
import {useFocusEffect} from '@react-navigation/native';
import {TabView, SceneMap} from 'react-native-tab-view';

const initialLayout = {width: Dimensions.get('window').width};

export default function AddPostReelsScreen({navigation}: any) {
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'post', title: 'Post'},
    {key: 'reels', title: 'Clips'},
  ]);

  // Animation values for tab indicators
  const tabAnimValue = useRef(new Animated.Value(0)).current;

  // Handle tab change with animation
  const handleTabChange = (newIndex: number) => {
    Animated.spring(tabAnimValue, {
      toValue: newIndex,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
    setIndex(newIndex);
  };

  // Handle back button press


  const renderScene = SceneMap({
    post: InstagramShoePostScreen,
    reels: AddReelsScreen,
  });

  const renderTabBar = (props: any) => {
    const inputRange = props.navigationState.routes.map((_: any, i: number) => i);
    const tabWidth = Dimensions.get('window').width / 2;
    
    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.header}>
          {props.navigationState.routes.map((route: any, i: number) => {
            const isActive = index === i;
            const opacity = tabAnimValue.interpolate({
              inputRange,
              outputRange: inputRange.map((inputIndex: number) =>
                inputIndex === i ? 1 : 0.7,
              ),
            });

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => handleTabChange(i)}
                style={[styles.headerButton]}>
                <Animated.View style={[styles.tabContent, {opacity}]}>
                  {route.key === 'post' ? (
                    <GallerySVG
                      fill={isActive ? colors.primaryColor : colors.darkText}
                      width={24}
                      height={24}
                    />
                  ) : (
                    <ReelsSVG
                      fill={isActive ? colors.primaryColor : colors.darkText}
                      width={24}
                      height={24}
                    />
                  )}
                  <Text
                    style={[
                      styles.headerButtonText,
                      {color: isActive ? colors.primaryColor : colors.darkText},
                    ]}>
                    {route.title}
                  </Text>
                </Animated.View>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Animated indicator */}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [
                {
                  translateX: tabAnimValue.interpolate({
                    inputRange,
                    outputRange: inputRange.map((i: number) => i * tabWidth),
                  }),
                },
              ],
              width: tabWidth,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleTabChange}
        initialLayout={initialLayout}
        swipeEnabled={true}
      />
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    tabBarContainer: {
      backgroundColor: colors.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
      position: 'relative',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: hp('1%'),
    },
    headerButton: {
      width: wp('50%'),
      height: hp('6%'),
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: wp('2%'),
    },
    activeIndicator: {
      position: 'absolute',
      bottom: -1,
      height: 3,
      width: '50%',
      backgroundColor: colors.primaryColor,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      height: 2,
      backgroundColor: colors.primaryColor,
    },
    headerButtonText: {
      fontWeight: '600',
      fontSize: hp('1.8%'),
    },
  });
