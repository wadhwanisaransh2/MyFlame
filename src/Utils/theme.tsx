import { Colors } from './colors';

export const lightTheme = {
  colors: {
    background: Colors.backgroundColor,
    primary: Colors.primaryColor,
    text: Colors.grey,
    searchBarBackground: Colors.backgroundColor,
  },
  spacing: {
    padding: {
      horizontal: 15,
    },
    gap: 10,
  },
  borderRadius: {
    large: 60,
    circle: 50,
  },
  typography: {
    regular: 20,
  },
  layout: {
    searchBarHeight: 60,
    searchBarWidth: '90%',
    headerHeight: '13%',
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    background: '#1a1a1a',
    primary: Colors.primaryColor,
    text: '#ffffff',
    searchBarBackground: '#2a2a2a',
  },
};

export type Theme = typeof lightTheme;
