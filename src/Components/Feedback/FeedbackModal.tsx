import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {showToast} from '../../Utils/general';
import {_makeAxiosPostRequest} from '../../Service';
import {useSubmitFeedbackMutation} from '../../redux/api/chat';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({visible, onClose}) => {
  const [submitFeedback, {isLoading}] = useSubmitFeedbackMutation();
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const [rating, setRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');

  const resetForm = () => {
    setRating(0);
    setContent('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      showToast('Please provide a rating');
      return;
    }

    if (!content.trim()) {
      showToast('Please provide your feedback');
      return;
    }

    try {
      const payload = {
        rating: rating,
        content: content.trim(),
      };
      const data = await submitFeedback(payload).unwrap();
      if (data) {
        showToast('Feedback submitted successfully');
        handleClose();
      } else {
        showToast('Failed to submit feedback');
      }
    } catch (error) {
      showToast('Failed to submit feedback');
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable
          key={i}
          style={styles.starButton}
          onPress={() => setRating(i)}>
          <Text style={[styles.star, rating >= i && styles.activeStar]}>★</Text>
        </Pressable>,
      );
    }
    return stars;
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
              <Text style={styles.title}>Feedback</Text>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rate your experience</Text>
              <View style={styles.starsContainer}>{renderStars()}</View>
              <Text style={styles.ratingText}>
                {rating > 0 ? `${rating} out of 5 stars` : 'Tap to rate'}
              </Text>
            </View>

            {/* Content Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Feedback</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Tell us about your experience..."
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
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
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

export default FeedbackModal;
