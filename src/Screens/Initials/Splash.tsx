import {
  Image,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState, useRef, useMemo} from 'react';
import {Colors} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {navigateAndSimpleReset} from '../../Utils/navigation';
import {TSplashStackProps} from '../../Interfaces/Navigation.type';
import {ANIMATION, IMAGES} from '../../Assets';
import {useTheme} from '../../Theme/ThemeContext';
import {handleFirstLaunchPermissions} from '../../Utils/permissionHandler';
import {getAsyncStorage} from '../../Utils/general';
import {ASYNC_KEYS} from '../../Utils/constant';
import LottieView from 'lottie-react-native';
import {hp, wp} from '../../Utils/responsive';

const {width, height} = Dimensions.get('window');

export default function Splash({navigation}: TSplashStackProps) {
  const [token, setToken] = useState('');

  // Core animations - reduced from 20+ to 8 essential ones
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(30)).current; // Reduced from 100

  // Combined wave animation instead of 3 separate ones
  const waveScale = useRef(new Animated.Value(0)).current;
  const waveOpacity = useRef(new Animated.Value(0)).current;

  // Progress animation
  const progressValue = useRef(new Animated.Value(0)).current;

  // Single background rotation instead of multiple morphing animations
  const backgroundRotation = useRef(new Animated.Value(0)).current;

  const fetchToken = async () => {
    try {
      await handleFirstLaunchPermissions();
      const tokenValue = await getAsyncStorage(ASYNC_KEYS.ACCESS_TOKEN);
      setToken(tokenValue);

      setTimeout(() => {
        if (tokenValue) {
          navigateAndSimpleReset('MainStack');
         
        } else {
          navigateAndSimpleReset('AuthStack');
          navigation.reset({
            index: 0,
            routes: [{name: 'AuthStack'}],
          });
        }
      }, 3500); // Reduced from 5000ms
    } catch (error) {
      }
  };

  useEffect(() => {
    if (!token) {
      fetchToken();
    }
    startOptimizedAnimations();
  }, [token]);

  const startOptimizedAnimations = () => {
    // Start background rotation immediately - single smooth animation
    Animated.loop(
      Animated.timing(backgroundRotation, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      }),
    ).start();

    // Logo entrance - simplified spring animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Single wave animation instead of multiple waves
    setTimeout(() => {
      Animated.timing(waveOpacity, {
        toValue: 0.4,
        duration: 400,
        useNativeDriver: true,
      }).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(waveScale, {
            toValue: 1.5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(waveScale, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 800);

    // Text animation - simplified
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1200);

    // Progress bar - simplified
    setTimeout(() => {
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }).start();
    }, 1600);
  };

  const {colors} = useTheme();

  // Memoized interpolations to prevent recalculation
  const backgroundRotationInterpolation = useMemo(
    () =>
      backgroundRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [backgroundRotation],
  );

  // Simplified particle system - reduced from 25 to 8 particles
  const generateOptimizedParticles = useMemo(() => {
    const particles = [];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 120 + Math.random() * 50;
      const size = 4 + Math.random() * 3;

      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              width: size,
              height: size,
              left: width / 2 + Math.cos(angle) * radius - size / 2,
              top: height / 2 + Math.sin(angle) * radius - size / 2,
              opacity: logoOpacity,
              transform: [
                {
                  scale: logoScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.8 + Math.random() * 0.4],
                  }),
                },
              ],
            },
          ]}
        />,
      );
    }
    return particles;
  }, [logoOpacity, logoScale]);

  return (
    <View style={[styles.container, {backgroundColor: '#4A5AE5'}]}>
      {/* Simplified rotating background */}
      <Animated.View
        style={[
          styles.rotatingBackground,
          {
            transform: [{rotate: backgroundRotationInterpolation}],
            opacity: waveOpacity,
          },
        ]}
      />

      {/* Static background shapes instead of morphing ones */}
      <View style={styles.staticShape1} />
      <View style={styles.staticShape2} />

      {/* Optimized particle system */}
      {generateOptimizedParticles}

      {/* Single energy wave */}
      <Animated.View
        style={[
          styles.energyWave,
          {
            opacity: waveOpacity,
            transform: [{scale: waveScale}],
          },
        ]}
      />

      {/* Simplified logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{scale: logoScale}],
          },
        ]}>
        <Image source={IMAGES.logo} style={styles.logo} />
        {/* Single glow ring instead of three */}
        <Animated.View style={[styles.glowRing, {opacity: logoOpacity}]} />
      </Animated.View>

      {/* Simplified text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{translateY: textTranslateY}],
          },
        ]}>
        <Text style={[styles.welcomeText, {color: '#00FFFF'}]}>WELCOME</Text>
        <Text style={[styles.subText, {color: '#FFFFFF', opacity: 0.8}]}>
          Loading experience...
        </Text>
      </Animated.View>

      {/* Simplified progress bar */}
      <Animated.View style={[styles.progressContainer, {opacity: textOpacity}]}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                transform: [{scaleX: progressValue}],
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  rotatingBackground: {
    position: 'absolute',
    width: width * 1.2,
    height: height * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(58, 134, 255, 0.08)',
    opacity: 0.6,
  },
  staticShape1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(58, 134, 255, 0.05)',
    top: height * 0.15,
    left: -50,
  },
  staticShape2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 0, 110, 0.05)',
    bottom: height * 0.15,
    right: -30,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    position: 'relative',
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1.5,
    borderColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 15,
    // elevation: 10,
  },
  energyWave: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#00FFFF',
    // top: hp("35%"),
    alignSelf: 'center',

    marginTop: -hp("18.5%"),

    shadowColor: '#00FFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 10,
    // elevation: 8,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#00FFFF',
    borderRadius: 3,
    shadowColor: '#00FFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 4,
    // elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 40,
    position: 'relative',
    zIndex: 10,
  },
  welcomeText: {
    fontSize: fontSize.f28 || 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 2,
    textShadowColor: '#00FFFF',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 8,
  },
  subText: {
    fontSize: fontSize.f13 || 13,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
    textShadowColor: '#FFFFFF',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 4,
  },
  progressContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  progressTrack: {
    width: width * 0.5,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.25,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    width: '100%',
    height: 2.5,
    backgroundColor: '#00FFFF',
    borderRadius: 1.25,
    shadowColor: '#00FFFF',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    // elevation: 8,
    transformOrigin: 'left',
  },
});
