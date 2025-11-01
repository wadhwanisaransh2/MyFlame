import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {useAddReferMutation} from '../../redux/api/auth';
import {showToast} from '../../Utils/general';

export default function ReferralCodeModal({
  isModalVisible,
  setIsModalVisible,
  navigation,
}: any) {
  const [referralCode, setReferralCode] = useState('');
  const [addRefer, {isLoading}] = useAddReferMutation();
  const handleApply = async () => {
    try {
      if (referralCode.trim()) {
        await addRefer({referralCode: referralCode.trim()}).unwrap();
        showToast(`Referral code "${referralCode}" applied!`);
        setReferralCode('');
        setIsModalVisible(false);
        navigation.reset({index: 0, routes: [{name: 'MainStack'}]});
      } else {
        Alert.alert('Error', 'Please enter a valid referral code');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.data?.message || 'Failed to apply referral code',
      );
    }
  };

  const handleSkip = () => {
    setReferralCode('');
    setIsModalVisible(false);
    navigation.reset({index: 0, routes: [{name: 'MainStack'}]});
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleSkip}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Referral Code</Text>
            <Text style={styles.modalSubtitle}>
              Have a referral code? Enter it below to get exclusive benefits!
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter referral code"
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
              maxLength={10}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  skipButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  applyButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
