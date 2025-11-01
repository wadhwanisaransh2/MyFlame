import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';

interface ICustomButtonProps {
  title: string;
  onPress: () => void;
  containerStyle?: object;
  titleStyle?: object;
  iconName?: React.ReactElement;
  isLoading?: boolean;
  isDisabled?: boolean;
  loaderColor? : string;
}

const CustomButton = (props: ICustomButtonProps) => {
  const {
    title,
    onPress,
    containerStyle,
    titleStyle,
    iconName,
    isLoading,
    isDisabled,
    loaderColor

  } = props;
  // const [loading, setLoading] = useState(isLoading);

  const handlePress = () => {
    if (!isDisabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        containerStyle,
        {opacity: isDisabled ? 0.5 : 1},
      ]}
      disabled={isDisabled}>
      {iconName && iconName}
      {isLoading ? (
        <ActivityIndicator size="small"  color={loaderColor ? loaderColor : Colors.white } />
      ) : (
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryColor,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
    borderColor: Colors.primaryColor,
    borderWidth: 1,
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    fontSize: fontSize.f22,
    marginLeft: 5,
  },
  icon: {
    marginRight: 5,
  },
});

export default CustomButton;
