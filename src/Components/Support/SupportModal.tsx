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
import {useSubmitSupportRequestMutation} from '../../redux/api/chat';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail: string;
}

const SupportModal: React.FC<SupportModalProps> = ({
  visible,
  onClose,
  userEmail,
}) => {
  const [submitSupportRequest, {isLoading}] = useSubmitSupportRequestMutation();
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [content, setContent] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  const resetForm = () => {
    setContent('');
    setReference('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      showToast('Please describe your query');
      return;
    }

    try {
      const payload = {
        query: content.trim(),
        reference: reference.trim() || '',
      };
      const data = await submitSupportRequest(payload).unwrap();
      if (data) {
        showToast('Support query submitted successfully');
        handleClose();
      } else {
        showToast('Failed to submit support query');
      }
    } catch (error) {
      showToast('Failed to submit support query');
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
              <Text style={styles.title}>Help & Support</Text>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Email Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Email</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={userEmail}
                editable={false}
                placeholderTextColor={colors.inputBackground}
              />
            </View>

            {/* Content Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Describe your query <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Please describe your issue or question in detail..."
                placeholderTextColor={colors.inputBackground}
                multiline
                numberOfLines={6}
                value={content}
                onChangeText={setContent}
                textAlignVertical="top"
              />
            </View>

            {/* Reference Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reference (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Add any relevant links, order numbers, or references..."
                placeholderTextColor={colors.inputBackground}
                multiline
                numberOfLines={1}
                value={reference}
                onChangeText={setReference}
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
                <Text style={styles.submitButtonText}>Submit Query</Text>
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
      maxHeight: '85%',
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
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: fontSize.f16,
      fontWeight: '600',
      color: colors.black,
      marginBottom: 8,
    },
    required: {
      color: '#FF0000',
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.black,
      borderRadius: 10,
      padding: 15,
      fontSize: fontSize.f16,
      color: colors.black,
      backgroundColor: colors.inputBackground,
    },
    disabledInput: {
      backgroundColor: colors.lightGrey,
      color: colors.grey,
    },
    submitButton: {
      backgroundColor: colors.primaryColor,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 15,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: 'white',
      fontSize: fontSize.f16,
      fontWeight: '600',
    },
    infoText: {
      textAlign: 'center',
      fontSize: fontSize.f14,
      color: colors.grey,
      fontStyle: 'italic',
    },
  });

export default SupportModal;
