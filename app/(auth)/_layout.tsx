import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Href, Redirect, Slot, useRouter } from 'expo-router';
import { HeaderBrand } from '../../src/components/common/HeaderBrand';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
import { homeRouteFor, ROUTES } from '../../src/navigation/routes';
import { ArrowLeft, Sun, Moon } from 'lucide-react-native';

/** Telas públicas de autenticação. Usuário já logado vai direto para sua área. */
export default function AuthLayout() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { status, user } = useAuth();

  if (status === 'authenticated' && user?.profileCompleted) {
    return <Redirect href={homeRouteFor(user.role) as Href} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.push(ROUTES.landing as Href)}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <ArrowLeft size={16} color={colors.textSecondary} />
          <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#64748b" />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.authCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.brandCenter}>
            <HeaderBrand size="lg" />
          </View>

          <Slot />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
  },
  brandCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
});
