import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Theme can be 'light' or 'dark' only
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage with validation
    const stored = localStorage.getItem('theme');
    // Validate and handle old 'system' values by defaulting to 'light'
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'light'; // Default to light mode
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply theme to DOM
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
