import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {showToast} from '../../Utils/general';
import {_makeAxiosPostRequest} from '../../Service';
import {useReportMutation} from '../../redux/api/chat';
import {ReportType} from '../../Enum/enum';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportType: ReportType;
  id: string;
  submissionAction?: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  id,
  reportType,
  submissionAction,
}) => {
  const [report, {isLoading}] = useReportMutation();
  const {colors} = useTheme();
  const styles = makeStyles(colors);
  const [content, setContent] = useState<string>('');

  const resetForm = () => {
    setContent('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showToast(`Please provide your reason to report this ${reportType}`);
      return;
    }

    try {
      const payload = {
        contentId: id,
        contentType: reportType,
        reason: content,
      };
      const result = await report(payload).unwrap();
      if (result) {
        showToast(result.message || 'Report submitted successfully');
        if (submissionAction) {
          submissionAction();
        }
        handleClose();
      } else {
        showToast('Failed to submit report');
      }
    } catch (error) {
      showToast('Failed to submit report');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Report</Text>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Content Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason</Text>
              <TextInput
                style={styles.textInput}
                placeholder={`Tell us the reason to report this ${reportType}...`}
                placeholderTextColor={colors.lightText}
                multiline
                numberOfLines={5}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <Pressable
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: colors.backgroundColor,
      borderRadius: 15,
      width: '100%',
      maxHeight: '80%',
      paddingHorizontal: 20,
      paddingVertical: 25,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: fontSize.f20,
      fontWeight: 'bold',
      color: colors.black,
    },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.lightGrey,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: fontSize.f18,
      color: colors.black,
      fontWeight: 'bold',
    },
    section: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: fontSize.f16,
      fontWeight: '600',
      color: colors.black,
      marginBottom: 10,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 10,
    },
    starButton: {
      paddingHorizontal: 5,
    },
    star: {
      fontSize: 35,
      color: colors.lightGrey,
    },
    activeStar: {
      color: '#FFD700',
    },
    ratingText: {
      textAlign: 'center',
      fontSize: fontSize.f14,
      color: colors.grey,
      marginTop: 5,
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.black,
      borderRadius: 10,
      padding: 15,
      fontSize: fontSize.f16,
      color: colors.black,
      backgroundColor: colors.inputBackground,
      minHeight: 120,
    },
    submitButton: {
      backgroundColor: colors.primaryColor,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: colors.white,
      fontSize: fontSize.f16,
      fontWeight: '600',
    },
  });

export default ReportModal;
