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

    // Function to apply theme to DOM
    const applyTheme = (newTheme) => {
      if (newTheme === 'dark') {
        root.classList.add('dark');
        setEffectiveTheme('dark');
      } else {
        root.classList.remove('dark');
        setEffectiveTheme('light');
      }
    };

    // Handle system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Apply initial system theme
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      // Listen for system theme changes
      const handleChange = (e) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);

      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    } else {
      // Apply explicit theme
      applyTheme(theme);
    }
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
