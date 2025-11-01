import React from 'react';
import {View, StyleSheet} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {hp, wp} from '../../Utils/responsive';

const ProfileSkeleton = () => {
  const {colors, isDark} = useTheme();
  const styles = makeStyles(colors);

  const shimmerColors = isDark
    ? ['#181920', '#1f2027', '#181920']
    : [colors.lightGrey, colors.lightGrey2, colors.lightGrey];

  return (
    <View style={styles.container}>
      {/* Header Shimmer */}
      <View style={styles.headerContainer}>
        {/* <ShimmerPlaceholder
          shimmerColors={shimmerColors}
          style={styles.headerTitle}
          LinearGradient={LinearGradient}
        /> */}
      </View>

      {/* Profile Header Container */}
      <View style={styles.profileHeaderContainer}>
        <View style={styles.MainprofileImageContainer}>
          {/* Stats Container */}
          <View style={styles.statsContainer}>
            {/* Left Stat */}
            <View style={styles.statItem}>
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={styles.statValue}
                LinearGradient={LinearGradient}
              />
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={styles.statLabel}
                LinearGradient={LinearGradient}
              />
            </View>

            {/* Profile Image */}
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.profileImage}
              LinearGradient={LinearGradient}
            />

            {/* Right Stat */}
            <View style={styles.statItem}>
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={styles.statValue}
                LinearGradient={LinearGradient}
              />
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={styles.statLabel}
                LinearGradient={LinearGradient}
              />
            </View>
          </View>

          {/* Achievements Container */}
          <View style={styles.achievementsContainer}>
            {[1, 2, 3].map((item, index) => (
              <View key={index} style={styles.achievementItem}>
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={styles.achievementLabel}
                  LinearGradient={LinearGradient}
                />
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={styles.achievementIcon}
                  LinearGradient={LinearGradient}
                />
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={styles.achievementValue}
                  LinearGradient={LinearGradient}
                />
              </View>
            ))}
          </View>

          {/* User Info Container */}
          <View style={styles.userInfoContainer}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.username}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.bio}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.bioSecond}
              LinearGradient={LinearGradient}
            />
          </View>

          {/* Action Buttons Container */}
          <View style={styles.actionButtonsContainer}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.actionButton}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.actionButton}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={styles.moreButton}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>

        {/* Tab Container */}
        <View style={styles.tabContainer}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={styles.tabButton}
            LinearGradient={LinearGradient}
          />
        </View>
      </View>

      {/* Posts Grid Skeleton */}
      <View style={styles.postsGrid}>
        {Array.from({length: 9}).map((_, index) => (
          <ShimmerPlaceholder
            key={index}
            shimmerColors={shimmerColors}
            style={styles.postItem}
            LinearGradient={LinearGradient}
          />
        ))}
      </View>
    </View>
  );
};

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.backgroundColor,
      alignItems: 'center',
    },
    headerTitle: {
      width: 120,
      height: 20,
      borderRadius: 10,
    },
    profileHeaderContainer: {
      backgroundColor: colors.white,
      paddingBottom: 10,
    },
    MainprofileImageContainer: {
      backgroundColor: colors.profileColor,
      marginTop: hp('10%'),
      borderTopStartRadius: 60,
      borderTopEndRadius: 60,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingHorizontal: 30,
      borderRadius: 15,
      marginHorizontal: 20,
      paddingVertical: 5,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      width: 40,
      height: 20,
      borderRadius: 10,
      marginBottom: 5,
    },
    statLabel: {
      width: 50,
      height: 12,
      borderRadius: 6,
    },
    profileImage: {
      width: wp('30%'),
      height: wp('30%'),
      borderRadius: wp('15%'),
      position: 'relative',
      top: -hp('10%'),
      alignSelf: 'center',
      zIndex: 1,
    },
    achievementsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: -hp('5%'),
      paddingHorizontal: 30,
    },
    achievementItem: {
      alignItems: 'center',
      width: wp('25%'),
      marginVertical: 10,
    },
    achievementLabel: {
      width: 60,
      height: 12,
      borderRadius: 6,
      marginBottom: 8,
    },
    achievementIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginVertical: 5,
    },
    achievementValue: {
      width: 50,
      height: 14,
      borderRadius: 7,
    },
    userInfoContainer: {
      alignItems: 'center',
      marginTop: 15,
      paddingHorizontal: 20,
    },
    username: {
      width: 150,
      height: 20,
      borderRadius: 10,
      marginBottom: 10,
    },
    bio: {
      width: wp('80%'),
      height: 14,
      borderRadius: 7,
      marginBottom: 6,
    },
    bioSecond: {
      width: wp('60%'),
      height: 14,
      borderRadius: 7,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15,
      paddingHorizontal: 20,
      gap: 10,
    },
    actionButton: {
      height: 40,
      flex: 1,
      borderRadius: 20,
    },
    moreButton: {
      height: 40,
      width: 40,
      borderRadius: 20,
    },
    tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: 15,
      paddingBottom: 15,
      backgroundColor: colors.profileColor,
    },
    tabButton: {
      width: 60,
      height: 20,
      borderRadius: 10,
    },
    postsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 0,
    },
    postItem: {
      height: (wp('100%') - 6) / 3,
      width: (wp('100%') - 6) / 3,
      marginHorizontal: 1,
      marginVertical: 1,
    },
  });

export default ProfileSkeleton; 