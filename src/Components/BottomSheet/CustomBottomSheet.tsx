import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../../Theme/ThemeContext';
import {ColorThemeInterface} from '../../Utils/colors';
import RBSheet from 'react-native-raw-bottom-sheet';
import {fontSize} from '../../Utils/fontIcon';
import CustomDivider from '../Divider/CustomDivider';

interface RBSheetRef {
  open: () => void;
  close: () => void;
}

interface CustomBottomSheetProps {
  onDismiss: () => void;
  children: React.ReactNode;
  title: string;
  height?: number;
  onOpen?: () => void;
}

export const CustomBottomSheet = forwardRef<RBSheetRef, CustomBottomSheetProps>((props, ref) => {
  const {colors} = useTheme();
  const styles = makeStyles(colors);

  const bottomSheetRef = useRef<RBSheetRef>(null);

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.open(),
    close: () => bottomSheetRef.current?.close(),
    onDismiss: () => props.onDismiss(),
  }));

  return (
    <RBSheet
      ref={bottomSheetRef}
      {...props}
      onOpen={props.onOpen}
      closeOnPressMask={true}
      closeOnPressBack={true}
      draggable={true}
      height={props.height}
      customStyles={{
        container: {
          backgroundColor: colors.inputBackground,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          
        },
      }}>
      <View style={styles.container}>
        {/* <View style={styles.line} /> */}
        <Text style={styles.title}>{props.title}</Text>
        <CustomDivider
          deviderStyle={{backgroundColor: colors.grey, width: '90%'}}
        />
        {props.children}
      </View>

    </RBSheet>
  );
});

const makeStyles = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,

      alignItems: 'center',
    },
    line: {
      width: '10%',
      height: 5,
      marginTop: 10,
      backgroundColor: colors.grey,
      borderRadius: 10,
    },
    title: {
      fontSize: fontSize.f18,
      marginBottom: 5,
      marginTop: 10,
      color: colors.black,
    },
  });
