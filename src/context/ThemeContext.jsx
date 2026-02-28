import { createContext, useContext, useState } from 'react';
import { COLORS } from '../utils/constants';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [accentColor, setAccentColor] = useState(COLORS.primary);

  const moduleColor = (moduleName) => COLORS[moduleName] || COLORS.primary;

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor, moduleColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export default ThemeContext;
