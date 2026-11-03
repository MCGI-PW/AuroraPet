import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Moon, Sun, User } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { HeaderBrand } from '../common/HeaderBrand';

interface PublicHeaderProps {
  onLogin: () => void;
}

/** Cabeçalho da página inicial (visitante não autenticado). */
export const PublicHeader: React.FC<PublicHeaderProps> = ({ onLogin }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <HeaderBrand size="sm" />
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={toggleTheme}
          accessibilityLabel="Alternar tema claro/escuro"
          style={[styles.themeBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
        >
          {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#64748b" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLogin}
          style={[styles.loginBtn, { backgroundColor: colors.primaryLight }]}
          accessibilityRole="button"
        >
          <User size={15} color={colors.accent} />
          <Text style={[styles.loginText, { color: colors.accent }]}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  loginText: { fontSize: 13, fontWeight: '700' },
});
