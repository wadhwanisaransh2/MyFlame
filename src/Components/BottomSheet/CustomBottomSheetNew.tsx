import React, {useMemo, useCallback, forwardRef} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Keyboard,
  Pressable,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {useTheme} from '../../Theme/ThemeContext';
import {CloseSVG} from '../../Assets/Images/SVGs/CommonSVG';
import {hp} from '../../Utils/responsive';
import {ColorThemeInterface} from '../../Utils/colors';
import {fontSize} from '../../Utils/fontIcon';

interface CustomBottomSheetProps {
  index?: number;
  onClose?: () => void;
  renderView?: () => React.ReactNode;
  label?: string;
  submitLabel?: string;
  onSubmit?: () => void;
  paddingHorizontal?: number;
  RenderFooter?: React.ComponentType;
  forComments?: () => React.ReactNode;
  useBottomSheetCustomFooter?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  footerStyle?: StyleProp<ViewStyle>;
  backgroundStyle?: StyleProp<ViewStyle>;
  headerViewStyle?: StyleProp<ViewStyle>;
  customTitleStyle?: StyleProp<TextStyle>;
  cuttomSnapPoints?: string[];
  withoutScrollView?: boolean;
}

const CustomBottomSheetNew = forwardRef<BottomSheet, CustomBottomSheetProps>(
  (
    {
      index = -1,
      onClose = () => {},
      renderView,
      label,
      submitLabel = 'Submit',
      onSubmit,
      paddingHorizontal = 10,
      RenderFooter,
      forComments,
      useBottomSheetCustomFooter = false,
      containerStyle = {},
      footerStyle = {},
      backgroundStyle = {},
      headerViewStyle = {},
      customTitleStyle = {},
      cuttomSnapPoints,
      withoutScrollView = false,
    },
    ref,
  ) => {
    const {colors} = useTheme();

    const styles = MakeStyle(colors);

    const snapPoints = useMemo(
      () =>
        cuttomSnapPoints || ['30%', '40%', '55%', '60%', '70%', '80%', '80%'],
      [cuttomSnapPoints],
    );

    const handleSheetChanges = useCallback(
      (sheetIndex: number) => {
        if (sheetIndex === -1 && onClose) {
          onClose();
        }
      },
      [onClose],
    );

    const renderBackdrop = useCallback(
      (backdropProps: any) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={1}
          disappearsOnIndex={-1}
        />
      ),
      [],
    );

    // Render the content of the bottom sheet
    const renderContent = () => (
      <View style={{flex: 1}}>
        <View style={[styles.container, containerStyle]}>
          {label && (
            <View
              style={[
                styles.headerViewStyle,
                backgroundStyle,
                headerViewStyle,
              ]}>
              <Text style={[styles.titleStyle, customTitleStyle]}>{label}</Text>
              <TouchableOpacity onPress={onClose}>
                <CloseSVG
                  width={hp('3%')}
                  height={hp('3%')}
                  fill={colors.black}
                />
              </TouchableOpacity>
            </View>
          )}

          {withoutScrollView ? (
            renderView && renderView()
          ) : (
            <BottomSheetScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom: RenderFooter ? 80 : 15,
              }}
              showsVerticalScrollIndicator={false}
              style={{flex: 1}}
              nestedScrollEnabled={true}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              onScrollEndDrag={() => Keyboard.dismiss()}>
              <View
                style={[
                  styles.contentContainer,
                  {paddingHorizontal: paddingHorizontal},
                  backgroundStyle,
                ]}>
                {renderView && renderView()}
              </View>
            </BottomSheetScrollView>
          )}
        </View>
      </View>
    );

    const content = useMemo(
      () => renderContent(),
      [
        renderView,
        label,
        RenderFooter,
        paddingHorizontal,
        containerStyle,
        footerStyle,
      ],
    );

    return (
      <View
        style={{
          height: hp('100%'),
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 999,
        }}>
        <BottomSheet
          ref={ref}
          snapPoints={snapPoints}
          index={index}
          enablePanDownToClose={true}
          onClose={onClose}
          backdropComponent={renderBackdrop}
          handleComponent={() => <></>}
          backgroundStyle={{backgroundColor: colors.inputBackground}}
          style={{
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            zIndex: 999,
            elevation: 10, // Add elevation for Android
          }}
          onChange={handleSheetChanges}>
          {content}
        </BottomSheet>
        {RenderFooter && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.footerContainer, footerStyle]}>
            <RenderFooter />
          </KeyboardAvoidingView>
        )}
      </View>
    );
  },
);

const MakeStyle = (colors: ColorThemeInterface) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.inputBackground,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      zIndex: 999,
      elevation: 10, // Add elevation for Android
    },
    headerViewStyle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.grey,
      width: '100%',
      paddingHorizontal: 10,
      paddingVertical: 14,
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
      backgroundColor: colors.inputBackground,
    },
    titleStyle: {
      fontSize: fontSize.f16,
      // fontFamily: fonts['Gantari-Medium'],
      color: colors.black,
      paddingLeft: 12,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 10,
      backgroundColor: colors.inputBackground,
    },

    TransperentView: {
      width: '100%',
      height: 50,
      backgroundColor: 'transparent',
    },
    footerContainer: {
      backgroundColor: colors.inputBackground,
      borderTopWidth: 1,
      borderTopColor: colors.grey,
      paddingHorizontal: 10,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 1000,
    },
  });

export default CustomBottomSheetNew;
