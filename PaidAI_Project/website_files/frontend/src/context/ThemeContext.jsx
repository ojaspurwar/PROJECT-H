import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Hard-force dark mode to eliminate the "white crap" issue
  const [isDark] = useState(true);

  const [primaryColor, setPrimaryColor] = useState(() => {
    return localStorage.getItem('theme-primary') || '#6366f1';
  });

  const [textColor, setTextColor] = useState(() => {
    return localStorage.getItem('theme-text') || '#ffffff';
  });

  useEffect(() => {
    // Force data-theme to dark and clear any accidental light setting
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme-dark', 'true');
  }, []);

  useEffect(() => {
    // Update primary color CSS variable
    document.documentElement.style.setProperty('--primary', primaryColor);
    localStorage.setItem('theme-primary', primaryColor);
    
    // Auto-generate hover color
    document.documentElement.style.setProperty('--primary-hover', primaryColor + 'cc');
  }, [primaryColor]);

  useEffect(() => {
    // Update text color CSS variable
    document.documentElement.style.setProperty('--text-main', textColor);
    localStorage.setItem('theme-text', textColor);
  }, [textColor]);

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      primaryColor, setPrimaryColor,
      textColor, setTextColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
