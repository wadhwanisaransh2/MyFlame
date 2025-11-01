import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React, {forwardRef} from 'react';
import CustomBottomSheetNew from './CustomBottomSheetNew';
import {useTheme} from '../../Theme/ThemeContext';
import {fontSize} from '../../Utils/fontIcon';
import {hp, wp} from '../../Utils/responsive';

interface ActionSheetItem {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
}

interface ActionSheetProps {
  data: ActionSheetItem[];
  isVisible: boolean;
  onClose: () => void;
}

const ActionSheet = forwardRef<any, ActionSheetProps>(
  ({data, isVisible, onClose}, ref) => {
    const {colors} = useTheme();
    const styles = makeStyles(colors);

    const renderMenuItem = (item: ActionSheetItem) => {
      return (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => {
            item.onPress?.();
            onClose();
          }}>
          {item.icon && <View style={styles.iconContainer}>{item.icon}</View>}
          <Text style={styles.menuText}>{item.label}</Text>
        </TouchableOpacity>
      );
    };

    const renderContent = () => {
      return (
        <View style={styles.contentContainer}>
          {data.map(item => renderMenuItem(item))}
        </View>
      );
    };

    return (
      <CustomBottomSheetNew
        label={'More Options'}
        ref={ref}
        cuttomSnapPoints={['20%']}
        index={1}
        //   RenderFooter={() => renderContent()}
        renderView={renderContent}
        onClose={onClose}
      />
    );
  },
);

const makeStyles = (colors: any) =>
  StyleSheet.create({
    contentContainer: {
      paddingVertical: hp('1%'),
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: hp('1.5%'),
      paddingHorizontal: wp('4%'),
    },
    iconContainer: {
      marginRight: wp('3%'),
    },
    menuText: {
      fontSize: fontSize.f14,
      color: colors.black,
    },
    bottomSheetBackground: {
      backgroundColor: colors.white,
    },
  });

export default ActionSheet;
