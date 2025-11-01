import {StyleSheet, TextInput, TextInputProps, Pressable} from 'react-native';
import React from 'react';
import {useTheme} from '../../Theme/ThemeContext';
import {SearchSVG} from '../../Assets/Images/SVGs/ChatsSVG';
import {fontSize} from '../../Utils/fontIcon';

interface SearchInputProps extends Omit<TextInputProps, 'style'> {
  containerStyle?: object;
  inputStyle?: object;
  disabled?: boolean;
  onPress?: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  containerStyle,
  inputStyle,
  placeholder = 'Search',
  disabled = false,
  onPress,
  onChangeText,
  ...props
}) => {
  const {colors} = useTheme();

  return (
    <Pressable
      style={[styles.container(colors), containerStyle]}
      onPress={onPress}>
      <SearchSVG width={24} height={24} fill={colors.primaryColor} />
      <TextInput
        style={[styles.input(colors), inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={colors.black}
        onChangeText={onChangeText}
        editable={!disabled}
        {...props}
      />
    </Pressable>
  );
};

const styles = {
  container: (colors: any) =>
    StyleSheet.create({
      container: {
        marginHorizontal: 10,
        backgroundColor: colors.backgroundColor,
        height: 50,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: colors.primaryColor,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        paddingLeft: 20,
        gap: 10,
      },
    }).container,
  input: (colors: any) =>
    StyleSheet.create({
      input: {
        flex: 1,
        fontSize: fontSize.f16,
        color: colors.black,
      },
    }).input,
};

export default SearchInput;
