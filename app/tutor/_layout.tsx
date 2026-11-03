import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, Stack, usePathname, useRouter } from 'expo-router';
import { Calendar, LayoutDashboard, LogOut, Moon, PawPrint, Sun, User } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLogout } from '../../src/hooks/useAuth';
import { HeaderBrand } from '../../src/components/common/HeaderBrand';
import { NotificationCenter } from '../../src/components/common/NotificationCenter';
import { ProtectedArea } from '../../src/components/navigation/ProtectedArea';
import { AREA_ROLES, ROUTES } from '../../src/navigation/routes';

const NAV_ITEMS = [
  { label: 'Visão Geral', href: ROUTES.tutor.home, icon: LayoutDashboard },
  { label: 'Meus Pets', href: ROUTES.tutor.pets, icon: PawPrint },
  { label: 'Consultas', href: ROUTES.tutor.appointments, icon: Calendar },
  { label: 'Meu Perfil', href: ROUTES.tutor.profile, icon: User },
];

/** Área do tutor: acessível somente para contas do tipo "tutor". */
export default function TutorLayout() {
  return (
    <ProtectedArea allowedRoles={AREA_ROLES.tutor}>
      <TutorShell />
    </ProtectedArea>
  );
}

function TutorShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark, toggleTheme } = useTheme();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace(ROUTES.auth.login as Href);
  };

  const isActive = (href: string) =>
    href === ROUTES.tutor.home ? pathname === href : pathname.startsWith(href);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push(ROUTES.tutor.home as Href)}>
          <HeaderBrand size="sm" showSubtitle={false} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <NotificationCenter />
          <TouchableOpacity
            onPress={toggleTheme}
            accessibilityLabel="Alternar tema claro/escuro"
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
          >
            {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#64748b" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={logout.isPending}
            accessibilityLabel="Sair da conta"
            style={[styles.iconBtn, styles.logoutBtn, isDark && styles.logoutBtnDark]}
          >
            <LogOut size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="pets/index" />
          <Stack.Screen name="pets/new" />
          <Stack.Screen name="pets/[id]" />
          <Stack.Screen name="appointments/index" />
          <Stack.Screen name="appointments/new" />
          <Stack.Screen name="appointments/[id]" />
          <Stack.Screen name="profile" />
        </Stack>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <TouchableOpacity
              key={href}
              onPress={() => router.navigate(href as Href)}
              style={styles.tabItem}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={label}
            >
              <View style={[styles.tabIcon, active && { backgroundColor: colors.primaryLight }]}>
                <Icon size={20} color={active ? colors.accent : colors.textSecondary} />
              </View>
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.textSecondary }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
  logoutBtnDark: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 12 },
  tabLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
