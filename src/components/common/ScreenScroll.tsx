import React, { ReactNode } from 'react';
import { ScrollView, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ScreenScrollProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Contêiner padrão das telas: rolagem vertical, fundo do tema e espaçamento. */
export const ScreenScroll: React.FC<ScreenScrollProps> = ({ children, style }) => {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
});
