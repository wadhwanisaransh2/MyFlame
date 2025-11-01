import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontFamily, fontSize} from '../../Utils/fontIcon';

interface ContentModerationProps {
  content: string;
  contentType: 'text' | 'image' | 'video';
  onModerationResult: (isApproved: boolean, reason?: string) => void;
}

const ContentModeration: React.FC<ContentModerationProps> = ({
  content,
  contentType,
  onModerationResult,
}) => {
  const {colors} = useTheme();
  const [isModerating, setIsModerating] = useState(false);
  const styles = makeStyles(colors);

  // Prohibited content patterns
  const prohibitedPatterns = [
    // Hate speech and harassment
    /\b(kill|murder|suicide|self-harm|die)\b/i,
    /\b(hate|hateful|racist|sexist|homophobic)\b/i,
    /\b(threat|threaten|violence|violent)\b/i,
    
    // Inappropriate sexual content
    /\b(sex|sexual|nude|naked|porn|pornography)\b/i,
    /\b(adult|explicit|mature|18\+)\b/i,
    
    // Drugs and illegal activities
    /\b(drug|drugs|cocaine|heroin|marijuana|cannabis)\b/i,
    /\b(illegal|crime|criminal|steal|theft)\b/i,
    
    // Spam and commercial content
    /\b(buy|sell|purchase|money|cash|bitcoin|crypto)\b/i,
    /\b(follow|subscribe|like|share|click)\b/i,
    
    // Personal information
    /\b(phone|email|address|social security|ssn)\b/i,
    /\b(password|pin|credit card|bank account)\b/i,
  ];

  const moderateContent = async () => {
    setIsModerating(true);
    
    try {
      // Simulate content moderation API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check for prohibited patterns
      const hasProhibitedContent = prohibitedPatterns.some(pattern => 
        pattern.test(content)
      );
      
      if (hasProhibitedContent) {
        onModerationResult(false, 'Content violates community guidelines');
        return;
      }
      
      // Additional checks based on content type
      if (contentType === 'text' && content.length > 1000) {
        onModerationResult(false, 'Content too long');
        return;
      }
      
      // Content approved
      onModerationResult(true);
      
    } catch (error) {
      onModerationResult(false, 'Moderation failed');
    } finally {
      setIsModerating(false);
    }
  };

  useEffect(() => {
    moderateContent();
  }, [content]);

  if (isModerating) {
    return (
      <View style={styles.moderationContainer}>
        <Text style={styles.moderationText}>Moderating content...</Text>
      </View>
    );
  }

  return null;
};

// Content Safety Guidelines Component
export const ContentSafetyGuidelines: React.FC = () => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const guidelines = [
    'No hate speech, harassment, or bullying',
    'No violent, graphic, or disturbing content',
    'No sexual or adult content',
    'No illegal activities or drug-related content',
    'No spam, scams, or misleading information',
    'No personal information sharing',
    'Respect others\' privacy and rights',
    'Report inappropriate content immediately',
  ];

  return (
    <View style={styles.guidelinesContainer}>
      <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
      {guidelines.map((guideline, index) => (
        <Text key={index} style={styles.guidelineItem}>
          • {guideline}
        </Text>
      ))}
    </View>
  );
};

// Age Verification Component
export const AgeVerification: React.FC<{
  onVerified: (isVerified: boolean) => void;
}> = ({onVerified}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const handleAgeVerification = (isOver18: boolean) => {
    if (!isOver18) {
      Alert.alert(
        'Age Restriction',
        'You must be 18 or older to use this app. Please verify your age with a parent or guardian.',
        [
          {text: 'OK', onPress: () => onVerified(false)},
        ]
      );
    } else {
      onVerified(true);
    }
  };

  return (
    <View style={styles.ageVerificationContainer}>
      <Text style={styles.ageVerificationTitle}>
        Age Verification Required
      </Text>
      <Text style={styles.ageVerificationText}>
        You must be 18 or older to use MyFlama. This app contains content that may not be suitable for minors.
      </Text>
      
      <TouchableOpacity
        style={styles.ageButton}
        onPress={() => handleAgeVerification(true)}
      >
        <Text style={styles.ageButtonText}>I am 18 or older</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.ageButton, styles.ageButtonSecondary]}
        onPress={() => handleAgeVerification(false)}
      >
        <Text style={styles.ageButtonSecondaryText}>I am under 18</Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    moderationContainer: {
      padding: 20,
      backgroundColor: colors.backgroundColor,
      alignItems: 'center',
    },
    moderationText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.regular,
      color: colors.black,
    },
    guidelinesContainer: {
      padding: 20,
      backgroundColor: colors.backgroundColor,
      margin: 10,
      borderRadius: 10,
    },
    guidelinesTitle: {
      fontSize: fontSize.f18,
      fontFamily: fontFamily.boldfont,
      color: colors.black,
      marginBottom: 15,
    },
    guidelineItem: {
      fontSize: fontSize.f14,
      fontFamily: fontFamily.regular,
      color: colors.black,
      marginBottom: 8,
      lineHeight: 20,
    },
    ageVerificationContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.backgroundColor,
    },
    ageVerificationTitle: {
      fontSize: fontSize.f20,
      fontFamily: fontFamily.boldfont,
      color: colors.black,
      marginBottom: 20,
      textAlign: 'center',
    },
    ageVerificationText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.regular,
      color: colors.black,
      marginBottom: 30,
      textAlign: 'center',
      lineHeight: 22,
    },
    ageButton: {
      backgroundColor: colors.primaryColor,
      paddingHorizontal: 30,
      paddingVertical: 15,
      borderRadius: 25,
      marginBottom: 15,
      minWidth: 200,
    },
    ageButtonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primaryColor,
    },
    ageButtonText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.white,
      textAlign: 'center',
    },
    ageButtonSecondaryText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.primaryColor,
      textAlign: 'center',
    },
  });

export default ContentModeration;
