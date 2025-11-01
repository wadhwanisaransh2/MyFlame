import React, {useEffect, useRef, useState, useCallback} from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import CustomHeader from '../../Components/Header/CustomHeader';
import {
  navigate,
  navigateAndSimpleReset,
  navigateBack,
} from '../../Utils/navigation';
import {fontSize} from '../../Utils/fontIcon';
import {
  ChangePasswordSVG,
  FeedbackSVG,
  HelpSVG,
  LogOutSVG,
  ReportSVG,
  TermsSVG,
} from '../../Assets/Images/SVGs/SettingsSVG';
import {RootState} from '../../redux/Store';
import {useDispatch, useSelector} from 'react-redux';
import {CustomBottomSheet} from '../../Components/BottomSheet/CustomBottomSheet';
import {setAsyncStorage, showToast} from '../../Utils/general';
import {ASYNC_KEYS} from '../../Utils/constant';
import {resetUser, setSettings} from '../../redux/Store/AuthSlice';
import {_makeAxiosPatchRequest} from '../../Service';
import {useUpdateSettingMutation} from '../../redux/api/profile';
import FeedbackModal from '../../Components/Feedback/FeedbackModal';
import SupportModal from '../../Components/Support/SupportModal';
import {RestoreSVG} from '../../Assets/Images/SVGs/PostSVG';
import {getFcmToken} from '../../Utils/NotificationService';
import {useLogoutMutation} from '../../redux/api/auth';
import {authApi} from '../../redux/api/auth';
import {chatApi} from '../../redux/api/chat';
import {profileApi} from '../../redux/api/profile';
import {postApi} from '../../redux/api/post';
import {coinsApi} from '../../redux/api/coins';

const {width} = Dimensions.get('window');

// Define interfaces for better type safety
interface HourItem {
  id: number;
  name: string;
  value: number;
}

interface SettingsData {
  privacySettings?: {
    showLocation?: boolean;
    showSavingsGoals?: boolean;
    profileVisibility?: string;
    defaultPostPrivacy?: string;
    messageExpiration?: number;
    messagesDisappear?: boolean;
  };
  notificationsEnabled?: boolean;
}

// Animated Section Card Component
const AnimatedSectionCard = React.memo(
  ({
    title,
    children,
    index,
  }: {
    title: string;
    children: React.ReactNode;
    index: number;
  }) => {
    const {colors} = useTheme();
    const style = makeStyles(colors);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay: index * 150,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim, index]);

    return (
      <Animated.View
        style={[
          style.sectionCard,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={style.sectionHeader}>
          <View style={style.sectionTitleContainer}>
            <Text style={style.sectionTitle}>{title}</Text>
            <View style={style.sectionTitleUnderline} />
          </View>
        </View>
        <View style={style.sectionContent}>{children}</View>
      </Animated.View>
    );
  },
);

// Custom Switch Component
const CustomSwitch = React.memo(
  ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => {
    const {colors} = useTheme();
    const style = makeStyles(colors);

    return (
      <View style={style.customSwitchContainer}>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{
            false: colors.lightGrey,
            true: colors.primaryColor || '#007AFF',
          }}
          thumbColor={value ? '#FFFFFF' : colors.iconGrey}
          ios_backgroundColor={colors.inputBackground}
        />
      </View>
    );
  },
);

// Settings Item Component
const SettingsItem = React.memo(
  ({
    icon,
    title,
    subtitle,
    rightComponent,
    onPress,
    showChevron = false,
  }: {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
    showChevron?: boolean;
  }) => {
    const {colors} = useTheme();
    const style = makeStyles(colors);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <Pressable
          style={style.settingsItem}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <View style={style.settingsItemLeft}>
            {icon && <View style={style.iconContainer}>{icon}</View>}
            <View style={style.textContainer}>
              <Text style={style.settingsItemTitle}>{title}</Text>
              {subtitle && (
                <Text style={style.settingsItemSubtitle}>{subtitle}</Text>
              )}
            </View>
          </View>
          <View style={style.settingsItemRight}>
            {rightComponent}
            {showChevron && <Text style={style.chevron}>›</Text>}
          </View>
        </Pressable>
      </Animated.View>
    );
  },
);

// Hours data as a constant outside the component
const HOURS_DATA: HourItem[] = [
  {id: 1, name: '1 hour', value: 1},
  {id: 2, name: '6 hours', value: 6},
  {id: 3, name: '12 hours', value: 12},
  {id: 4, name: '1 day', value: 24},
  {id: 5, name: '1 week', value: 168},
  {id: 6, name: '1 month', value: 720},
];

export default function SettingScreen() {
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  const [activeModal, setActiveModal] = useState<'' | 'support' | 'feedback'>(
    '',
  );
  const {colors, isDark, toggleTheme} = useTheme();
  const style = makeStyles(colors);
  const [updateSetting] = useUpdateSettingMutation();
  const [logout] = useLogoutMutation();

  const dispatch = useDispatch();
  const {settings} = useSelector((state: RootState) => state.AuthManager);

  const [settingsData, setSettingsData] = useState<SettingsData>(
    settings || {},
  );
  const hoursSheetRef = useRef<any>(null);

  // Memoized update settings function
  const updateSettings = useCallback(async () => {
    try {
      const payload = {
        showLocation: settingsData?.privacySettings?.showLocation,
        showSavingsGoals: settingsData?.privacySettings?.showSavingsGoals,
        profileVisibility: settingsData?.privacySettings?.profileVisibility,
        defaultPostPrivacy: settingsData?.privacySettings?.defaultPostPrivacy,
        messageExpiration: settingsData?.privacySettings?.messageExpiration,
        messagesDisappear: settingsData?.privacySettings?.messagesDisappear,
        notificationsEnabled: settingsData?.notificationsEnabled,
      };
      const response: any = await updateSetting(payload).unwrap();
      if (response) {
        dispatch(setSettings(response));
        // showToast('Settings updated successfully');
      }
    } catch (error) {
      showToast('Failed to update settings');
    }
  }, [settingsData, dispatch, updateSetting]);

  // Use effect with dependency on settingsData
  useEffect(() => {
    updateSettings();
  }, [updateSettings]);

  // Logout handler
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        onPress: async () => {
          try {
            const deviceId = await getFcmToken();

            if (deviceId) {
              await logout({deviceId: deviceId}).unwrap();
            }

            await setAsyncStorage(ASYNC_KEYS.ACCESS_TOKEN, '');
            // Clear all RTK Query caches
            dispatch(authApi.util.resetApiState());
            dispatch(chatApi.util.resetApiState());
            dispatch(profileApi.util.resetApiState());
            dispatch(postApi.util.resetApiState());
            dispatch(coinsApi.util.resetApiState());

            dispatch(resetUser());
            await navigateAndSimpleReset('AuthStack');
          } catch (error) {
            showToast('Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  // Update privacy settings helper with proper typing
  const updatePrivacySettings = (key: string, value: any) => {
    setSettingsData((prev: SettingsData) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [key]: value,
      },
    }));
  };

  // Get formatted hours text
  const getHoursText = (hours: number) => {
    const item = HOURS_DATA.find(h => h.value === hours);
    return item ? item.name : `${hours} hours`;
  };

  // Render hours bottom sheet item with proper typing
  const renderHoursItem = ({item}: {item: HourItem}) => (
    <Pressable
      style={style.hoursItem}
      onPress={() => {
        updatePrivacySettings('messageExpiration', item.value);
        if (hoursSheetRef.current) {
          hoursSheetRef.current?.close();
        }
      }}>
      <Text style={style.hoursItemText}>Chat Delete after {item.name}</Text>
      <View style={style.hoursItemCheck}>
        {settingsData?.privacySettings?.messageExpiration === item.value && (
          <Text style={style.checkMark}>✓</Text>
        )}
      </View>
    </Pressable>
  );

  // Handle modal close
  const closeModal = () => {
    setActiveModal('');
  };

  return (
    <View style={style.container}>
      <View style={style.headerGradient}>
        <CustomHeader title="Settings" onBackPress={navigateBack} />
      </View>

      <ScrollView
        contentContainerStyle={style.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <AnimatedSectionCard title="Privacy & Account" index={0}>
          <SettingsItem
            title="Show Live Location"
            subtitle="Share your location with friends"
            rightComponent={
              <CustomSwitch
                value={settingsData?.privacySettings?.showLocation || false}
                onValueChange={value =>
                  updatePrivacySettings('showLocation', value)
                }
              />
            }
          />
          {/* <SettingsItem
            title="Show Savings Goals"
            subtitle="Display your financial targets"
            rightComponent={
              <CustomSwitch
                value={settingsData?.privacySettings?.showSavingsGoals || false}
                onValueChange={value =>
                  updatePrivacySettings('showSavingsGoals', value)
                }
              />
            }
          /> */}
          <SettingsItem
            title="Private Profile"
            subtitle="Make your profile visible to friends only"
            rightComponent={
              <CustomSwitch
                value={
                  settingsData?.privacySettings?.profileVisibility === 'private'
                }
                onValueChange={value =>
                  updatePrivacySettings(
                    'profileVisibility',
                    value ? 'private' : 'public',
                  )
                }
              />
            }
          />
        </AnimatedSectionCard>

        {/* Notifications Section */}
        <AnimatedSectionCard title="Notifications" index={1}>
          {/* <SettingsItem
            title="Auto-Delete Messages"
            subtitle={`Messages delete after ${getHoursText(settingsData?.privacySettings?.messageExpiration || 24)}`}
            onPress={() => hoursSheetRef.current?.open()}
            showChevron={true}
          />
          <SettingsItem
            title="Delete After Reading"
            subtitle="Messages disappear once seen"
            rightComponent={
              <CustomSwitch
                value={settingsData?.privacySettings?.messagesDisappear || false}
                onValueChange={value => updatePrivacySettings('messagesDisappear', value)}
              />
            }
          /> */}
          <SettingsItem
            title="Receive notifications"
            subtitle="Turn off to stop in-app alerts"
            rightComponent={
              <CustomSwitch
                value={settingsData?.notificationsEnabled || false}
                onValueChange={value =>
                  setSettingsData((prev: SettingsData) => ({
                    ...prev,
                    notificationsEnabled: value,
                  }))
                }
              />
            }
          />
        </AnimatedSectionCard>

        {/* Appearance Section */}
        <AnimatedSectionCard title="Appearance" index={2}>
          <SettingsItem
            title="Dark Mode"
            subtitle={isDark ? 'Dark theme enabled' : 'Light theme enabled'}
            rightComponent={
              <CustomSwitch value={isDark} onValueChange={toggleTheme} />
            }
          />
        </AnimatedSectionCard>

        {/* Support & About Section */}
        <AnimatedSectionCard title="Support & About" index={3}>
          <SettingsItem
            icon={<HelpSVG fill={colors.primaryColor || colors.black} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            showChevron={true}
            onPress={() => setActiveModal('support')}
          />
          <SettingsItem
            icon={<TermsSVG stroke={colors.primaryColor || colors.black} />}
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            showChevron={true}
            onPress={() => navigate('AuthStack', {screen: 'TermPrivacyPolicy'})}
          />
          <SettingsItem
            icon={<FeedbackSVG fill={colors.primaryColor || colors.black} />}
            title="Send Feedback"
            subtitle="Help us improve the app"
            showChevron={true}
            onPress={() => setActiveModal('feedback')}
          />
        </AnimatedSectionCard>

        {/* Actions Section */}
        <AnimatedSectionCard title="Actions" index={4}>
          <SettingsItem
            icon={<ChangePasswordSVG width={24} height={24} fill={'red'} />}
            title="Change Password"
            subtitle="Change Password using Old Password"
            onPress={() => navigate('ChangePasswordUsingOld')}
            showChevron={true}
          />
          <SettingsItem
            icon={<LogOutSVG fill={'#FF3B30'} />}
            title="Sign Out"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            showChevron={true}
          />
        </AnimatedSectionCard>

        <View style={style.bottomSpacing} />
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={activeModal === 'feedback'}
        onClose={closeModal}
      />

      {/* Support Modal */}
      <SupportModal
        visible={activeModal === 'support'}
        onClose={closeModal}
        userEmail={profile?.email || ''}
      />

      <CustomBottomSheet
        height={400}
        onDismiss={() => {}}
        title="Auto-Delete Timer"
        ref={hoursSheetRef}>
        <View style={style.bottomSheetContent}>
          <Text style={style.bottomSheetDescription}>
            Choose when your messages should automatically delete
          </Text>
          <FlatList
            data={HOURS_DATA}
            renderItem={renderHoursItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </CustomBottomSheet>
    </View>
  );
}

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    headerGradient: {
      backgroundColor: colors.backgroundColor,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scrollContent: {
      paddingTop: 20,
      paddingBottom: 100,
    },
    sectionCard: {
      marginHorizontal: 20,
      marginBottom: 24,
      backgroundColor: colors.white || colors.inputBackground,
      borderRadius: 16,
      shadowColor: colors.primaryColor,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 12,
      overflow: 'hidden',
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    sectionTitleContainer: {
      alignItems: 'flex-start',
    },
    sectionTitle: {
      fontSize: fontSize.f18,
      fontWeight: '600',
      color: colors.black,
      marginBottom: 4,
    },
    sectionTitleUnderline: {
      width: 30,
      height: 3,
      backgroundColor: colors.primaryColor || '#007AFF',
      borderRadius: 2,
    },
    sectionContent: {
      paddingBottom: 12,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    settingsItemTitle: {
      fontSize: fontSize.f16,
      fontWeight: '500',
      color: colors.black,
      marginBottom: 2,
    },
    settingsItemSubtitle: {
      fontSize: fontSize.f14,
      color: colors.grey || '#8E8E93',
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chevron: {
      fontSize: 20,
      color: colors.grey || '#C7C7CC',
      marginLeft: 8,
      fontWeight: '300',
    },
    customSwitchContainer: {
      padding: 2,
    },
    bottomSpacing: {
      height: 40,
    },
    // Bottom Sheet Styles
    bottomSheetContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    bottomSheetDescription: {
      fontSize: fontSize.f16,
      color: colors.grey || '#8E8E93',
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 22,
    },
    hoursItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 4,
      borderBottomWidth: 0.5,
      borderBottomColor: '#E5E5E5',
    },
    hoursItemText: {
      fontSize: fontSize.f16,
      color: colors.black,
      fontWeight: '500',
    },
    hoursItemCheck: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkMark: {
      fontSize: 16,
      color: colors.primaryColor || '#007AFF',
      fontWeight: 'bold',
    },
  });
