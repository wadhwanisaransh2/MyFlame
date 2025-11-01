import {Dimensions, Platform} from 'react-native';
import {RFPercentage} from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as WP,
  heightPercentageToDP as HP,
} from 'react-native-responsive-screen';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const {width, height} = Dimensions.get('screen');

export const fSize = (size: number) => {
  return RFPercentage(size);
};

export const hp = (val: string) => {
  return HP(val);
};

export const wp = (val: string) => {
  return WP(val);
};

export const isIosDevice = () => {
  if (Platform.OS == 'ios') {
    return true;
  } else {
    false;
  }
};

export const getVideoHeight = ( isTopOnly = false) => {
  const insets = useSafeAreaInsets();
  const insetsHeight = insets?.top ;

  if (isIosDevice()) {
    return height - insetsHeight - hp('7%');
  } else {
    return height - insetsHeight - hp('7%');
  }};
