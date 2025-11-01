import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {_makeAxiosPostRequest} from '../../Service';

interface Props {
  visible: boolean;
  handleClose: any;
  handleDeleteChat: any;
  handleProfileNavigation: any;
  handleBlock: any;
  handleMessageDeletionSettings: any;
  isBlocked: boolean;
  isSwitchOn: boolean;
  messagesDisappear: boolean;
}

const ChatOptionsModal: React.FC<Props> = ({
  visible,
  handleBlock,
  handleClose,
  handleDeleteChat,
  handleProfileNavigation,
  handleMessageDeletionSettings,
  isBlocked,
  isSwitchOn,
  messagesDisappear,
}) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={handleClose}>
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Actions</Text>
              <Pressable style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.dropdown}>
              <TouchableOpacity onPress={handleDeleteChat}>
                <Text style={styles.dropdownItem}>Delete Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProfileNavigation}>
                <Text style={styles.dropdownItem}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleBlock}>
                <Text style={styles.dropdownItem}>
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.dropdownItem}>
                <Text style={{color: colors.black}}>
                  Delete Messages after 24 hours
                </Text>
                <Switch
                  value={isSwitchOn}
                  onValueChange={handleMessageDeletionSettings}
                  trackColor={{false: '#767577', true: '#81b0ff'}}
                  thumbColor={
                    messagesDisappear ? colors.primaryColor : colors.lightGrey
                  }
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Pressable>
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
      paddingHorizontal: 80,
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
      fontSize: fontSize.f16,
      fontWeight: 'bold',
      color: colors.black,
    },
    closeButton: {
      width: 25,
      height: 25,
      borderRadius: 15,
      backgroundColor: colors.lightGrey,
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: fontSize.f14,
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
    dropdown: {
      width: '100%',
      padding: 8,
      borderRadius: 8,
      shadowColor: colors.white,
      shadowOpacity: 0.1,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 6,
      elevation: 5,
      marginRight: 0,
    },
    dropdownItem: {
      paddingVertical: 8,
      fontSize: 16,
      borderBottomColor: colors.darkText,
      borderBottomWidth: 0.2,
      color: colors.black,
    },
  });

export default ChatOptionsModal;
