import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
  Dimensions,
  Clipboard,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {BackArrow} from '../../Assets/Images/SVGs/CommonSVG';
import {navigateBack} from '../../Utils/navigation';
import CustomHeader from '../../Components/Header/CustomHeader';
import {useGetRefferDataQuery} from '../../redux/api/coins';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import {showToast} from '../../Utils/general';

const {width} = Dimensions.get('window');

// Loading Component
const RefferScreenLoader = ({
  colors,
  isDark,
}: {
  colors: ColorThemeInterface;
  isDark: boolean;
}) => {
  const styles = useMemo(() => CreateStyles(colors), [colors]);
  const shimmerColors = isDark
    ? ['#181920', colors.grey]
    : [colors.lightGrey, colors.lightGrey2];

  return (
    <View style={styles.container}>
      <CustomHeader title="Reffer" onBackPress={() => navigateBack()} />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Welcome Section Loading */}
        <View style={styles.welcomeSection}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{
              width: width * 0.7,
              height: 32,
              borderRadius: 16,
              marginBottom: 12,
            }}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: width * 0.6, height: 20, borderRadius: 10}}
            LinearGradient={LinearGradient}
          />
        </View>

        {/* Referral Card Loading */}
        <View style={styles.referralCard}>
          <View style={styles.codeContainer}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{
                width: 140,
                height: 20,
                borderRadius: 10,
                marginBottom: 12,
              }}
              LinearGradient={LinearGradient}
            />
            <View style={styles.codeBox}>
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={{width: 120, height: 24, borderRadius: 12}}
                LinearGradient={LinearGradient}
              />
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={{width: 60, height: 32, borderRadius: 8}}
                LinearGradient={LinearGradient}
              />
            </View>
          </View>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: '100%', height: 48, borderRadius: 12}}
            LinearGradient={LinearGradient}
          />
        </View>

        {/* Stats Loading */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{width: 50, height: 32, borderRadius: 16, marginBottom: 8}}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{width: 80, height: 16, borderRadius: 8}}
              LinearGradient={LinearGradient}
            />
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{width: 50, height: 32, borderRadius: 16, marginBottom: 8}}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              shimmerColors={shimmerColors}
              style={{width: 80, height: 16, borderRadius: 8}}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>

        {/* How it Works Loading */}
        <View style={styles.howItWorksContainer}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 150, height: 26, borderRadius: 13, marginBottom: 16}}
            LinearGradient={LinearGradient}
          />
          <View style={styles.stepContainer}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.step}>
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    marginRight: 16,
                  }}
                  LinearGradient={LinearGradient}
                />
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={{flex: 1, height: 20, borderRadius: 10}}
                  LinearGradient={LinearGradient}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Benefits Loading */}
        <View style={styles.benefitsContainer}>
          <ShimmerPlaceholder
            shimmerColors={shimmerColors}
            style={{width: 180, height: 26, borderRadius: 13, marginBottom: 16}}
            LinearGradient={LinearGradient}
          />
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.benefitItem}>
              <ShimmerPlaceholder
                shimmerColors={shimmerColors}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  marginRight: 16,
                }}
                LinearGradient={LinearGradient}
              />
              <View style={styles.benefitContent}>
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={{
                    width: '70%',
                    height: 20,
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                  LinearGradient={LinearGradient}
                />
                <ShimmerPlaceholder
                  shimmerColors={shimmerColors}
                  style={{width: '90%', height: 16, borderRadius: 8}}
                  LinearGradient={LinearGradient}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function RefferScreen() {
  const {colors, isDark} = useTheme();
  const styles = useMemo(() => CreateStyles(colors), [colors]);
  const {profile} = useSelector((state: RootState) => state.AuthManager);

  const [referralCode] = useState(profile?.referralCode);

  const {data: refferData, isLoading} = useGetRefferDataQuery({});

  const goBack = () => {
    navigateBack();
  };

  const copyReferralCode = () => {
    Clipboard.setString(referralCode);
    showToast('Referral code copied to clipboard');
  };

  const shareReferralCode = async () => {
    try {
      await Share.share({
        message: `Join me on Flama and earn rewards! Use my referral code: ${referralCode}. Download now and get bonus coins! https://myflama.com`,
        title: 'Join Flama App',
      });
    } catch (error) {
      }
  };

  const benefits = [
    {
      icon: '💰',
      title: 'Referral Reward',
      description: `${refferData?.referralCoinsValue || 0} coins per referral`,
    },
    {
      icon: '🏆',
      title: 'Level Up Bonus',
      description: 'Extra rewards as you grow',
    },
    {
      icon: '⭐',
      title: 'Premium Access',
      description: 'Unlock exclusive features',
    },
  ];

  // Show loading state
  if (isLoading) {
    return <RefferScreenLoader colors={colors} isDark={isDark || false} />;
  }

  return (
    <View style={styles.container}>
      {/* Improved Header with Back Icon */}
      <CustomHeader
        title="Share & Earn"
        onBackPress={goBack}
        // onPress={() =>n}
      />

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>🚀 Share & Earn Together!</Text>
          <Text style={styles.welcomeSubtitle}>
            Invite friends and both get amazing rewards
          </Text>
        </View>

        {/* Referral Code Card */}
        <View style={styles.referralCard}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyReferralCode}>
                <Text style={styles.copyButtonText}>📋 Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareReferralCode}>
            <Text style={styles.shareButtonText}>🚀 Share Now</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {refferData?.referralCount || 0}
            </Text>
            <Text style={styles.statLabel}>Friends Invited</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {refferData?.totalReferralEarnings || 0}
            </Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.sectionTitle}>How it Works</Text>
          <View style={styles.stepContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Share your referral code</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Friend signs up using your code
              </Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Earn bonus coins!</Text>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Rewards & Benefits</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Terms & Conditions apply. Rewards may take 24-48 hours to reflect.
            Valid for new users only.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const CreateStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 0,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: colors.backgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: colors.lightGrey2,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.lightGrey,
    },
    backIcon: {
      fontSize: 20,
      color: colors.darkText,
      fontWeight: 'bold',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.darkText,
      textAlign: 'center',
    },
    placeholder: {
      width: 40,
    },
    scrollContent: {
      flex: 1,
    },
    welcomeSection: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.darkText,
      marginBottom: 8,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 16,
      color: colors.lightText,
      textAlign: 'center',
    },
    referralCard: {
      marginHorizontal: 20,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 20,
      elevation: 12,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 8,
      marginBottom: 20,
    },
    codeContainer: {
      marginBottom: 20,
    },
    codeLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 12,
    },
    codeBox: {
      flexDirection: 'row',
      backgroundColor: colors.backgroundColor,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: colors.primaryColor,
      borderStyle: 'dashed',
    },
    codeText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.primaryColor,
      letterSpacing: 2,
    },
    copyButton: {
      backgroundColor: colors.primaryColor,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    copyButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 12,
    },
    shareButton: {
      backgroundColor: colors.primaryColor,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    shareButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    statsContainer: {
      flexDirection: 'row',
      marginHorizontal: 20,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 20,
      elevation: 10,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 4,
      marginBottom: 20,
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primaryColor,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: colors.darkText,
      opacity: 0.7,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.darkText,
      opacity: 0.2,
      marginHorizontal: 20,
    },
    howItWorksContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.darkText,
      marginBottom: 16,
    },
    stepContainer: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      padding: 20,
      elevation: 10,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    stepNumberText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
    stepText: {
      flex: 1,
      fontSize: 16,
      color: colors.darkText,
    },
    benefitsContainer: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    benefitItem: {
      flexDirection: 'row',
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 10,
      shadowColor: colors.primaryColor,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.03,
      shadowRadius: 2,
    },
    benefitIcon: {
      fontSize: 24,
      marginRight: 16,
      width: 32,
      textAlign: 'center',
    },
    benefitContent: {
      flex: 1,
    },
    benefitTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.darkText,
      marginBottom: 4,
    },
    benefitDescription: {
      fontSize: 14,
      color: colors.darkText,
      opacity: 0.7,
    },
    termsContainer: {
      marginHorizontal: 20,
      marginBottom: 30,
      padding: 16,
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primaryColor,
    },
    termsText: {
      fontSize: 12,
      color: colors.darkText,
      opacity: 0.6,
      lineHeight: 18,
    },
  });
