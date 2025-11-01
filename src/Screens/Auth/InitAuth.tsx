import {
  Text,
  StyleSheet,
  View,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {Colors} from '../../Utils/colors';
import {IMAGES} from '../../Assets';
import {fontSize} from '../../Utils/fontIcon';
import {CustomButton} from '../../Components';
import {navigate} from '../../Utils/navigation';
import {useTheme} from '../../Theme/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';
import { hp, wp } from '../../Utils/responsive';

const {width, height} = Dimensions.get('window');

export default function InitAuth() {
  const {colors} = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.elastic(1.2),
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[Colors.primaryColor, Colors.tertiaryColor, Colors.primaryColor]}
        style={styles.gradientBackground}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      {/* Main Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              transform: [
                {scale: scaleAnim},
                {rotate: logoRotate},
              ],
            },
          ]}>
          <View style={styles.logoContainer}>
            <View style={styles.logoInnerCircle}>
              <Image
                source={IMAGES.logo}
                style={styles.logoImage}
              />
            </View>
          </View>
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <Text style={styles.appTitle}>My Flama</Text>
          <Text style={styles.appSubtitle}>Connect • Share • Inspire</Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <CustomButton
            title={'Get Started'}
            onPress={() => navigate('Login')}
            containerStyle={styles.primaryButton}
            titleStyle={styles.primaryButtonText}
          />
          
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <CustomButton
            title={'Create Account'}
            onPress={() => navigate('Signup')}
            containerStyle={styles.secondaryButton}
            titleStyle={styles.secondaryButtonText}
          />
        </Animated.View>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}>
          <Text style={styles.footerText}>
            By continuing, you agree to our <Text style={styles.footerTextLink} onPress={() => navigate('TermPrivacyPolicy')}>Terms & Privacy Policy</Text>
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryColor,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 100,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: height * 0.3,
    right: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logoSection: {
    marginBottom: 40,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    //elevation: 15,
  },
  logoInnerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: hp('5%'),
  },
  appTitle: {
    fontSize: fontSize.f32 + 8,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: hp('1%'),
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: fontSize.f16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: wp('2%'),
  },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: hp('2%'),
    borderRadius: 25,
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    //elevation: 8,
  },
  primaryButtonText: {
    color: Colors.primaryColor,
    fontSize: fontSize.f18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('2%'),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: wp('2%'),
    fontSize: fontSize.f14,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.white,
    paddingVertical: hp('2%'),
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: fontSize.f18,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: hp('5%'),
    paddingHorizontal: wp('10%'),
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSize.f12,
    textAlign: 'center',
    lineHeight: hp('2%'),
  },
  footerTextLink: {
    color: Colors.white,
    fontSize: fontSize.f12,
    textAlign: 'center',
    lineHeight: hp('2%'),
  },
});
