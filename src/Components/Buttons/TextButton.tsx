import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';

interface ITextButtonProps {
  title: string;
  onPress: () => void;
  titleStyle?: object;
  isLoading?: boolean;
  isDisabled?: boolean;
  loaderColor?: string;
}

const TextButton = (props: ITextButtonProps) => {
  const {title, onPress, titleStyle, isLoading, isDisabled, loaderColor} =
    props;

  const handlePress = () => {
    if (!isDisabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, {opacity: isDisabled ? 0.5 : 1}]}
      disabled={isDisabled}>
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={loaderColor ? loaderColor : Colors.primaryColor}
        />
      ) : (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  title: {
    color: Colors.primaryColor,
    fontSize: fontSize.f18,
    textAlign: 'center',
  },
});

export default TextButton;
