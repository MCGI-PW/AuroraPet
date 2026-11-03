import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { useAppBootstrap } from '../src/hooks/useAppBootstrap';
import { queryClient } from '../src/services/queryClient';

/**
 * Navegação raiz (Expo Router). Rotas declaradas:
 *  /            → apresentação (ou redireciona para a área do usuário logado)
 *  /about       → Sobre o App (versão e commit)
 *  (auth)       → /login, /register, /forgot-password
 *  tutor        → área protegida do tutor
 *  clinic       → área protegida da clínica (administração e veterinários)
 */
function RootNavigator() {
  const { colors, isDark } = useTheme();
  useAppBootstrap();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="about" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="tutor" />
        <Stack.Screen name="clinic" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
