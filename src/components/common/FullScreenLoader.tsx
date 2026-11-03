import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

/** Indicador de carregamento ocupando a tela inteira. */
export const FullScreenLoader: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  text: { fontSize: 14, textAlign: 'center' },
});
