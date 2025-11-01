export interface ColorThemeInterface {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  darkText: string;
  lightText: string;
  black: string;
  white: string;
  red: string;
  greenColor: string;
  lightBlue: string;
  grey: string;
  lightGrey: string;
  lightGrey2: string;
  lightGreen: string;
  pink1: string;
  brown: string;
  green: string;
  inputBackground: string;
  messageBackground: string;
  myMessageBackground: string;
  iconGrey: string;
  profileColor: string;
}

export const LightColors = {
  backgroundColor: '#FFFFFF',
  primaryColor: '#4A5AE5',
  secondaryColor: '#E7E0A9',
  tertiaryColor: '#2F9EFB',
  darkText: '#363636',
  lightText: '#7B7B7B',
  black: '#000000',
  white: '#FFFFFF',
  red: 'red',
  greenColor: '#03A63D',
  lightBlue: '#D9E8F5',
  grey: '#6C7278',
  lightGrey: '#D2D2D2',
  lightGrey2: '#E3E3E3',
  lightGreen: '#CFF8BA',
  pink1: '#E50059',
  brown: '#713E02',
  green: '#5CF145',
  inputBackground: '#F5F5F5',
  messageBackground: '#E8E8E8',
  myMessageBackground: '#58B5DA',
  iconGrey: '#999999',
  profileColor: '#E6F8FF',
  senderMessageTextColor: 'white',
  receiverMessageTextColor: 'black',
  eventCardbg: '#F8FAFF',
  darkGreen: '#006400',
};

export const DarkColors = {
  backgroundColor: '#000000',
  primaryColor: '#4A5AE5',
  secondaryColor: '#E7E0A9',
  tertiaryColor: '#2F9EFB',
  darkText: '#FFFFFF',
  lightText: '#E0E0E0',
  black: '#FFFFFF',
  white: '#000000',
  red: '#FF453A',
  greenColor: '#32D74B',
  lightBlue: '#0A84FF',
  grey: '#8E8E93',
  lightGrey: '#48484A',
  lightGrey2: '#636366',
  lightGreen: '#30D158',
  pink1: '#FF375F',
  brown: '#996D3D',
  green: '#5CF145',
  inputBackground: '#2C2C2E',
  messageBackground: '#1C1C1E',
  myMessageBackground: '#0A84FF',
  iconGrey: '#8E8E93',
  profileColor: '#121E2A',
  senderMessageTextColor: 'white',
  receiverMessageTextColor: 'black',
  eventCardbg: '#2C2C2E',
  darkGreen: '#006400',
};

export const Colors = LightColors;

export type ColorTheme = typeof LightColors;
