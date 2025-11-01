import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Colors } from '../../Utils/colors';
import { fontSize, fontFamily } from '../../Utils/fontIcon';
import { useTheme } from '../../Theme/ThemeContext';
import { width } from '../../Utils/responsive';

interface DatePickerInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  onBlur?: () => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChangeText,
  placeholder,
  error,
  onBlur,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { colors, isDark } = useTheme();

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // Handle platform-specific behavior
    if (Platform.OS === 'android') {
      setShowPicker(false);
      
      // Only update date if the user didn't cancel
      if (event.type === 'set' && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        onChangeText(formattedDate);
      }
    } else {
      // For iOS, continue with current behavior in modal
      if (selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        onChangeText(formattedDate);
      }
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleCancel = () => {
    setShowPicker(false);
    if (onBlur) {
      onBlur();
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return maxDate;
  };

  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, 0, 1);
    return minDate;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? Colors.white : Colors.grey }]}>
        {placeholder}
      </Text>
      
      <TouchableOpacity
        style={[
          styles.input,
          { backgroundColor: colors.inputBackground, borderColor: colors.lightGrey2 },
        ]}
        onPress={() => setShowPicker(true)}
      >
        <Text
          style={[
            styles.inputText,
            { color: value ? colors.black : Colors.grey },
          ]}
        >
          {value ? formatDisplayDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {/* Platform-specific date picker rendering */}
      {showPicker &&
        (Platform.OS === 'ios' ? (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showPicker}
            onRequestClose={handleCancel}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={value ? new Date(value) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={getMaxDate()}
                  minimumDate={getMinDate()}
                  style={styles.iosDatePicker}
                  themeVariant={isDark ? "dark" : "light"}
                />
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={styles.modalButton}
                  >
                    <Text style={[styles.modalButtonText, { color: Colors.grey }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirm}
                    style={[styles.modalButton, styles.confirmButton]}
                  >
                    <Text style={[styles.modalButtonText, { color: Colors.white }]}>
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          // Android uses native dialog
          <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={getMaxDate()}
            minimumDate={getMinDate()}
          />
        ))}

      <Text style={styles.error}>
        {error && error.length > 0 ? error : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    width: '90%',
    alignSelf: 'center',
  },
  title: {
    color: Colors.grey,
    fontSize: fontSize.f16,
    marginRight: 10,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    padding: 15,
    borderRadius: 10,
    height: 50,
    marginVertical: 2,
    width: '100%',
    alignSelf: 'center',
    // borderColor: Colors.primaryColor,
    borderWidth: 1,
    justifyContent: 'center',
  },
  inputText: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.regular,
  },
  error: {
    color: 'red',
    fontSize: fontSize.f12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  iosDatePicker: {
    height: 200,
    width: '100%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: Colors.primaryColor,
  },
  modalButtonText: {
    fontSize: fontSize.f16,
    fontFamily: fontFamily.regular,
  },
});

export default DatePickerInput; 