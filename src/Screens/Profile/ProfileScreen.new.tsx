import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/Store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';

type Props = NativeStackScreenProps<ParamListBase & {
  ProfileScreen: {
    userId?: string;
    username?: string;
  };
}, 'ProfileScreen'>;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

function ProfileScreen({route}: Props) {
  const {colors} = useTheme();
  const {userId, username} = route.params;
  const {profile} = useSelector((state: RootState) => state.AuthManager);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [friendShipStatus, setFriendShipStatus] = useState('none');
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);

  return (
    <View style={[styles.container, {backgroundColor: colors.backgroundColor}]}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    </View>
  );
}

export default ProfileScreen;