import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import {Colors} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';
import {ViewStyle} from 'react-native';
import {useState} from 'react';
import {EyeCloseSVG, EyeOpenSVG} from '../../Assets/Images/SVGs/AuthSVG';
import {useTheme} from '../../Theme/ThemeContext';

interface ICustomInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  error: any;
  onFocus?: () => void;
  onBlur?: () => void;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  textContentType?: TextInputProps['textContentType'];
  containerStyle?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
  textAlignVertical?: string;
  disabled?: boolean;
}

const CustomInput = (props: ICustomInputProps) => {
  const [inputValue, setInputValue] = useState(props.value);
  const [isSecure, setIsSecure] = useState(props.secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const {colors, isDark} = useTheme();

  const handleChange = (text: string) => {
    if (props.keyboardType === 'number-pad' && text.length > 10) {
      return;
    }
    setInputValue(text);
    props.onChangeText(text);
  };

  const handleShowPassword = () => {
    setIsSecure(!isSecure);
  };

  const handleFocus = () => {
    if (props.onFocus) {
      props.onFocus();
    }
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (props.onBlur) {
      props.onBlur();
    }
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, props.style]}>
      <Text
        style={[styles.title, {color: isDark ? Colors.white : Colors.grey}]}>
        {props.placeholder}
      </Text>
 
      <TextInput
        value={inputValue}
        onChangeText={handleChange}
        autoCapitalize="none"
        placeholder={props.placeholder}
        placeholderTextColor={colors.lightGrey}
        secureTextEntry={isSecure}
        style={[
          styles.input,
          {backgroundColor: colors.inputBackground, borderColor: isFocused ? colors.primaryColor : colors.lightGrey2 , color: colors.black},
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={props.keyboardType || 'default'}
        maxLength={props.maxLength}
        textContentType={props.textContentType || 'none'}
        editable={!props.disabled}
      />
   
      <Text style={styles.error}>
        {props.error?.length > 0 ? props.error : ''}
      </Text>
      {props.secureTextEntry && (
        <TouchableOpacity onPress={handleShowPassword} style={styles.eye}>
          {isSecure ? (
            <EyeCloseSVG width={25} height={25} stroke={Colors.grey} />
          ) : (
            <EyeOpenSVG width={25} height={25} fill={Colors.grey} />
          )}
        </TouchableOpacity>
      )}
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
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    borderRadius: 10,
    height: 50,
    marginVertical: 2,
    width: '100%',
    alignSelf: 'center',
    borderColor: Colors.lightGrey2,
    borderWidth: 1,
    color: Colors.black,
  },
  error: {
    color: 'red',
    fontSize: fontSize.f12,
  },
  eye: {
    position: 'absolute',
    right: 10,
    top: 35,
  },
});

export default CustomInput;
