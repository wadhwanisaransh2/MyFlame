import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFValue } from 'react-native-responsive-fontsize';
import { Colors } from '../../Utils/colors';
import { fontFamily } from '../../Utils/fontIcon';
import { CustomText } from '../Common/CustomText.js';
import { LikeIconSvg } from '../../Assets/Images/SVGs/SocialSVG.js';

interface InteractionButtonProps {
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onLongPressLike: () => void;
  isLiked: boolean;
}

const InteractionButtons: React.FC<InteractionButtonProps> = ({
  isLiked,
  onComment,
  onLike,
  onLongPressLike,
  onShare,
  comments,
  likes,
}) => {
  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={onLike}
        onLongPress={onLongPressLike}>
        <LikeIconSvg width={RFValue(22)} height={RFValue(22)} fill={isLiked ? Colors.red : Colors.white} />
        <CustomText variant="body2" style={{ color: Colors.white, fontFamily: fontFamily.semifont }}>
          {likes}
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onComment}>
        <Icon name={'comment-text'} size={RFValue(22)} color={Colors.white} />
        <CustomText variant="body2" style={{ color: Colors.white, fontFamily: fontFamily.semifont }}>
          {comments}
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={onShare}>
        <Icon name={'share'} size={RFValue(22)} color={Colors.white} />
        <CustomText variant="body2" style={{ color: Colors.white, fontFamily: fontFamily.semifont }}>
          Share
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InteractionButtons;
