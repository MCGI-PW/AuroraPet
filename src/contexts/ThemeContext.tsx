import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;
  accent: string;
  secondary: string;
  cardShadow: string;
}

export const lightColors: ThemeColors = {
  mode: 'light',
  background: '#f8faf9',
  surface: '#ffffff',
  surfaceSubtle: '#f1f5f9',
  surfaceHover: '#ecfdf5',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textSecondary: '#475467',
  textMuted: '#94a3b8',
  primary: '#064e3b',
  primaryHover: '#087c5d',
  primaryLight: '#ecfdf5',
  primaryText: '#ffffff',
  accent: '#10b981',
  secondary: '#7c3aed',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
};

export const darkColors: ThemeColors = {
  mode: 'dark',
  background: '#090d0c',
  surface: '#121a17',
  surfaceSubtle: '#182420',
  surfaceHover: '#1f2e29',
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.16)',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  primary: '#10b981',
  primaryHover: '#059669',
  primaryLight: 'rgba(16, 185, 129, 0.14)',
  primaryText: '#064e3b',
  accent: '#34d399',
  secondary: '#a78bfa',
  cardShadow: '0 4px 25px rgba(0, 0, 0, 0.4)',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@aurorapet/theme-preference';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Começa pelo tema do sistema; a escolha manual do usuário é persistida.
  const [theme, setTheme] = useState<ThemeMode>(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    async function loadTheme() {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          setTheme(stored);
        }
      } catch (err) {
        // Fallback para light
      }
    }
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (err) {
      console.warn('Erro ao salvar tema:', err);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
