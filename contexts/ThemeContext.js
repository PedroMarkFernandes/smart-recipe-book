import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1); // 1 = Normal, 1.2 = Large, 1.4 = Extra Large

  // Load saved settings on startup
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('isDarkMode');
      const storedFont = await AsyncStorage.getItem('fontSize');
      if (storedTheme) setIsDarkMode(JSON.parse(storedTheme));
      if (storedFont) setFontSizeMultiplier(parseFloat(storedFont));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = async () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    await AsyncStorage.setItem('isDarkMode', JSON.stringify(newVal));
  };

  const changeFontSize = async (size) => {
    setFontSizeMultiplier(size);
    await AsyncStorage.setItem('fontSize', size.toString());
  };

  // Define colors based on mode
  const colors = {
    background: isDarkMode ? '#121212' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#333333',
    card: isDarkMode ? '#1e1e1e' : '#ffffff',
    tint: '#ff6347', // Tomato color stays same
    subText: isDarkMode ? '#aaaaaa' : '#666666',
    border: isDarkMode ? '#333333' : '#eeeeee',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, fontSizeMultiplier, changeFontSize, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};