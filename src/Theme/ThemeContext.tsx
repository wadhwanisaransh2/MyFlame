import React, {createContext, useContext, useState, useEffect} from 'react';
import {useColorScheme} from 'react-native';
import { ColorTheme, DarkColors, LightColors } from '../Utils/colors';
import { getTheme, setTheme } from '../Utils/general';

type ThemeContextType = {
  colors: ColorTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: LightColors,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    // Initial load of theme preference from storage
    getTheme().then(theme => {
      if (theme) {
        setIsDark(theme === 'dark');
      } else {
        // If no saved preference, use system default
        setIsDark(systemColorScheme === 'dark');
      }
    });
  }, []);

  useEffect(() => {
    // Only update based on system changes if no user preference saved
    getTheme().then(savedTheme => {
      if (!savedTheme) {
        setIsDark(systemColorScheme === 'dark');
      }
    });
  }, [systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    setTheme(newTheme ? 'dark' : 'light');
  };

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{colors, isDark, toggleTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
