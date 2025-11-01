import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView 
} from 'react-native'
import React, { useMemo } from 'react'
import { useTheme } from '../../Theme/ThemeContext'
import { ColorThemeInterface } from '../../Utils/colors';
import { BackArrow, CloseSVG } from '../../Assets/Images/SVGs/CommonSVG';
import CheckSVG from '../../Assets/Images/SVGs/CheckSVG';
import { fontFamily, fontSize } from '../../Utils/fontIcon';
import { navigateBack } from '../../Utils/navigation';

export default function TermPrivacyPolicy() {
    const {colors} = useTheme()
    const styles = useMemo(() => CreateStyles(colors), [colors]);

    const handleAgree = () => {
        // Handle agree action
        navigateBack();
    };

    const handleDisagree = () => {
        // Handle disagree action
        navigateBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar 
                barStyle="dark-content" 
                backgroundColor={colors.backgroundColor} 
            />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={navigateBack}
                >
                    <BackArrow 
                        width={24} 
                        height={24} 
                        fill={colors.primaryColor} 
                    />
                </TouchableOpacity>
            </View>

            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Greeting Section */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText}>Welcome to MyFlama! 🔒</Text>
                    <Text style={styles.subtitleText}>
                        Please read our Privacy Policy carefully. We believe privacy is a fundamental right and are committed to protecting your data.
                    </Text>
                </View>

                {/* Privacy Policy Content */}
                <View style={styles.termsContainer}>
                    <Text style={styles.termsTitle}>Privacy Policy</Text>
                    <Text style={styles.lastUpdated}>Last updated: June 29, 2025</Text>
                    
                    <Text style={styles.termsContent}>
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services. We are committed to protecting your privacy and being transparent about our data practices.
                    </Text>

                    <Text style={styles.sectionTitle}>🔒 Our Privacy Commitment</Text>
                    <Text style={styles.termsContent}>
                        We believe privacy is a fundamental right. We design our services with privacy in mind, collect only necessary information, and give you control over your data. By using MyFlama, you agree to the collection and use of information in accordance with this policy.
                    </Text>

                    <Text style={styles.sectionTitle}>1. Information We Collect</Text>
                    <Text style={styles.subsectionTitle}>Information You Provide:</Text>
                    <Text style={styles.termsContent}>
                        • Account Information: Username, email address, phone number, profile picture, and bio
                        {'\n'}• Content: Photos, videos, stories, messages, comments, and captions you create or share
                        {'\n'}• Communications: Messages you send to other users, customer support interactions
                        {'\n'}• Contacts: Contact lists (with your permission) to help you find friends
                        {'\n'}• Payment Information: Credit card details for premium features (processed securely by third parties)
                    </Text>

                    <Text style={styles.subsectionTitle}>Information We Collect Automatically:</Text>
                    <Text style={styles.termsContent}>
                        • Device Information: Device type, operating system, unique device identifiers, mobile network information
                        {'\n'}• Usage Data: Features used, time spent, frequency of use, interactions with content
                        {'\n'}• Location Data: Precise or approximate location (with your permission)
                        {'\n'}• Camera & Microphone: Access for photo/video creation and AR features (with permission)
                        {'\n'}• Log Data: IP addresses, browser type, pages visited, crash reports
                    </Text>

                    <Text style={styles.importantNote}>📱 Camera & Microphone Access</Text>
                    <Text style={styles.termsContent}>
                        We only access your camera and microphone when you're actively using features that require them, such as taking photos, recording videos, or using AR filters. We never record or access these without your knowledge.
                    </Text>

                    <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                    <Text style={styles.termsContent}>
                        • Service Provision: Enable core app functionality, account management, content delivery
                        {'\n'}• Personalization: Customize your feed, recommend content and friends
                        {'\n'}• Communication: Send notifications, updates, and respond to your inquiries
                        {'\n'}• Safety & Security: Detect fraud, abuse, and protect user safety
                        {'\n'}• Analytics: Understand app usage patterns to improve our services
                        {'\n'}• Content Processing: Analyze photos and videos for content moderation and safety
                        {'\n'}• Advertising & Marketing: Show relevant advertisements based on your interests
                    </Text>

                    <Text style={styles.importantNote}>⚠️ Content Moderation</Text>
                    <Text style={styles.termsContent}>
                        We use automated systems and human reviewers to detect harmful content. This may involve analyzing your photos, videos, and messages to ensure platform safety.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Information Sharing</Text>
                    <Text style={styles.subsectionTitle}>With Other Users:</Text>
                    <Text style={styles.termsContent}>
                        • Public posts, stories, and profile information
                        {'\n'}• Direct messages with recipients
                        {'\n'}• Activity status and online presence (if enabled)
                        {'\n'}• Mutual connections and interactions
                    </Text>

                    <Text style={styles.subsectionTitle}>With Third Parties:</Text>
                    <Text style={styles.termsContent}>
                        • Service Providers: Cloud storage, analytics, customer support, payment processing
                        {'\n'}• Advertising Partners: Anonymous, aggregated data for ad targeting
                        {'\n'}• Business Partners: Integrated features and third-party apps (with your consent)
                        {'\n'}• Legal Requirements: Government requests, court orders, law enforcement
                    </Text>

                    <Text style={styles.importantNote}>🔐 Data Sharing Principles</Text>
                    <Text style={styles.termsContent}>
                        We never sell your personal information. We only share data when necessary for service provision, legal compliance, or with your explicit consent.
                    </Text>

                    <Text style={styles.sectionTitle}>4. Data Storage & Security</Text>
                    <Text style={styles.termsContent}>
                        • End-to-end encryption for direct messages
                        {'\n'}• Data encryption in transit and at rest
                        {'\n'}• Regular security audits and penetration testing
                        {'\n'}• Multi-factor authentication for accounts
                        {'\n'}• Secure cloud infrastructure with leading providers
                    </Text>

                    <Text style={styles.subsectionTitle}>Data Retention:</Text>
                    <Text style={styles.termsContent}>
                        • Account Data: Retained while your account is active
                        {'\n'}• Messages: Stored for 30 days after deletion
                        {'\n'}• Stories: Automatically deleted after 24 hours
                        {'\n'}• Backup Data: Retained for 90 days for recovery purposes
                        {'\n'}• Log Data: Retained for 12 months for security analysis
                    </Text>

                    <Text style={styles.sectionTitle}>5. Your Rights & Choices</Text>
                    <Text style={styles.subsectionTitle}>Account Controls:</Text>
                    <Text style={styles.termsContent}>
                        • Profile Settings: Edit personal information, privacy settings
                        {'\n'}• Content Management: Delete posts, stories, and messages
                        {'\n'}• Blocking & Reporting: Block users, report inappropriate content
                        {'\n'}• Data Download: Export your data in machine-readable format
                        {'\n'}• Account Deletion: Permanently delete your account and data
                    </Text>

                    <Text style={styles.subsectionTitle}>Privacy Controls:</Text>
                    <Text style={styles.termsContent}>
                        • Make your account private or public
                        {'\n'}• Control who can message you
                        {'\n'}• Manage story visibility settings
                        {'\n'}• Opt out of data collection for advertising
                        {'\n'}• Disable location sharing
                    </Text>

                    <Text style={styles.importantNote}>📧 Exercise Your Rights</Text>
                    <Text style={styles.termsContent}>
                        To exercise any of these rights, contact us at privacy@MyFlama.com. We'll respond within 30 days and verify your identity before processing requests.
                    </Text>

                    <Text style={styles.sectionTitle}>6. Children's Privacy</Text>
                    <Text style={styles.termsContent}>
                        MyFlama is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. Users between 13-17 require parental consent and must be supervised by a parent or guardian.
                    </Text>

                    <Text style={styles.importantNote}>🚨 Age Verification Required</Text>
                    <Text style={styles.termsContent}>
                        All users must verify their age during registration. Users under 18 will have restricted access to certain features and content. We use age verification systems to ensure compliance with child protection laws.
                    </Text>

                    <Text style={styles.sectionTitle}>7. International Transfers</Text>
                    <Text style={styles.termsContent}>
                        MyFlama operates globally. Your information may be transferred to and processed in countries other than your own, including the United States, where our primary servers are located. We ensure appropriate safeguards including EU-US Privacy Shield compliance and Standard Contractual Clauses (SCCs).
                    </Text>

                    <Text style={styles.sectionTitle}>8. Policy Updates</Text>
                    <Text style={styles.termsContent}>
                        We may update this Privacy Policy periodically. When we make changes, we will update the "Last Updated" date, send in-app notifications for significant changes, and email registered users about material changes with 30-day notice for major policy changes.
                    </Text>

                    <Text style={styles.sectionTitle}>9. Contact Us</Text>
                    <Text style={styles.termsContent}>
                        If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
                        {'\n\n'}📧 Email: privacy@MyFlama.com
                        {'\n'}Response time: 24-48 hours
                        {'\n\n'}Your privacy matters to us. Don't hesitate to reach out with any questions or concerns about how we handle your data.
                    </Text>
                </View>
            </ScrollView>

            {/* Action Buttons */}
         
        </SafeAreaView>
    )
}

const CreateStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: colors.backgroundColor,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    helpButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
    },
    helpText: {
      fontSize: fontSize.f16,
      color: colors.primaryColor,
      fontFamily: fontFamily.regular,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100, // Space for action buttons
    },
    greetingContainer: {
      backgroundColor: colors.profileColor,
      marginHorizontal: 20,
      marginVertical: 10,
      padding: 20,
      borderRadius: 15,
    },
    greetingText: {
      fontSize: fontSize.f20,
      fontFamily: fontFamily.boldfont,
      color: colors.black,
      marginBottom: 10,
    },
    subtitleText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.regular,
      color: colors.black,
      lineHeight: 22,
    },
    termsContainer: {
      paddingHorizontal: 20,
      marginTop: 10,
    },
    termsTitle: {
      fontSize: fontSize.f20,
      fontFamily: fontFamily.boldfont,
      color: colors.black,
      marginBottom: 5,
    },
    lastUpdated: {
      fontSize: fontSize.f14,
      fontFamily: fontFamily.regular,
      color: colors.black,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.black,
      marginTop: 20,
      marginBottom: 10,
    },
    subsectionTitle: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.black,
      marginTop: 15,
      marginBottom: 8,
    },
    termsContent: {
      fontSize: fontSize.f14,
      fontFamily: fontFamily.regular,
      color: colors.black,
      lineHeight: 20,
      marginBottom: 15,
    },
    importantNote: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.primaryColor,
      marginTop: 15,
      marginBottom: 8,
    },
    actionButtonsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingVertical: 20,
      backgroundColor: colors.backgroundColor,
      borderTopWidth: 1,
      borderTopColor: colors.lightGrey2,
      gap: 15,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      borderRadius: 25,
      gap: 8,
    },
    agreeButton: {
      backgroundColor: colors.primaryColor,
    },
    disagreeButton: {
      backgroundColor: '#FF6B9D',
    },
    agreeButtonText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.white,
    },
    disagreeButtonText: {
      fontSize: fontSize.f16,
      fontFamily: fontFamily.boldfont,
      color: colors.white,
    },
  });
