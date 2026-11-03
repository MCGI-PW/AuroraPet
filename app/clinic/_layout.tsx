import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, Stack, usePathname, useRouter } from 'expo-router';
import {
  CalendarDays,
  Info,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Moon,
  Settings,
  ShieldCheck,
  Stethoscope,
  Sun,
  Users,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth, useLogout } from '../../src/hooks/useAuth';
import { HeaderBrand } from '../../src/components/common/HeaderBrand';
import { NotificationCenter } from '../../src/components/common/NotificationCenter';
import { ProtectedArea } from '../../src/components/navigation/ProtectedArea';
import { AREA_ROLES, canAccessClinicScreen, ROUTES } from '../../src/navigation/routes';
import { ROLE_LABELS } from '../../src/types/auth';

const NAV_ITEMS = [
  { label: 'Portal do Vet', href: ROUTES.clinic.vetPortal, icon: Stethoscope },
  { label: 'Painel Geral', href: ROUTES.clinic.home, icon: LayoutDashboard },
  { label: 'Agenda & Fila', href: ROUTES.clinic.agenda, icon: CalendarDays },
  { label: 'Corpo Clínico', href: ROUTES.clinic.vets, icon: Users },
  { label: 'Solicitações', href: ROUTES.clinic.requests, icon: MessageSquareText },
  { label: 'Planos & Cotas', href: ROUTES.clinic.subscription, icon: Zap },
  { label: 'Configurações', href: ROUTES.clinic.settings, icon: Settings },
];

/**
 * Área da clínica: acessível para administração e veterinários. Telas de
 * gestão (corpo clínico, planos, configurações, solicitações) são exclusivas
 * da administração; o Portal do Vet é exclusivo do veterinário.
 */
export default function ClinicLayout() {
  return (
    <ProtectedArea allowedRoles={AREA_ROLES.clinic} canAccess={canAccessClinicScreen}>
      <ClinicShell />
    </ProtectedArea>
  );
}

function ClinicShell() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const logout = useLogout();

  const visibleItems = NAV_ITEMS.filter((item) => user && canAccessClinicScreen(item.href, user.role));
  const isActive = (href: string) => (href === ROUTES.clinic.home ? pathname === href : pathname.startsWith(href));

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace(ROUTES.auth.login as Href);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <HeaderBrand size="sm" showSubtitle={false} />
          <View style={styles.roleBadge}>
            <ShieldCheck size={12} color="#10b981" />
            <Text style={styles.roleBadgeText} numberOfLines={1}>
              {user ? ROLE_LABELS[user.role] : ''}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <NotificationCenter />
          <TouchableOpacity
            onPress={toggleTheme}
            accessibilityLabel="Alternar tema claro/escuro"
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
          >
            {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color={colors.textSecondary} />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.about as Href)}
            accessibilityLabel="Sobre o App"
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSubtle }]}
          >
            <Info size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={logout.isPending}
            accessibilityLabel="Sair da conta"
            style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2' }]}
          >
            <LogOut size={17} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.navBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {visibleItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href);
            return (
              <TouchableOpacity
                key={href}
                onPress={() => router.navigate(href as Href)}
                style={[
                  styles.navItem,
                  { backgroundColor: active ? colors.primaryLight : 'transparent', borderBottomColor: active ? colors.accent : 'transparent' },
                ]}
              >
                <Icon size={16} color={active ? colors.accent : colors.textSecondary} />
                <Text style={[styles.navText, { color: active ? colors.accent : colors.textSecondary, fontWeight: active ? '700' : '500' }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.body}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="vet-portal" />
          <Stack.Screen name="agenda" />
          <Stack.Screen name="attendance/[id]" />
          <Stack.Screen name="vets/index" />
          <Stack.Screen name="vets/new" />
          <Stack.Screen name="vets/[id]" />
          <Stack.Screen name="requests" />
          <Stack.Screen name="subscription" />
          <Stack.Screen name="settings" />
        </Stack>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerLeft: { flexShrink: 1, gap: 4 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: { color: '#065f46', fontSize: 10, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { padding: 8, borderRadius: 10 },
  navBar: { borderBottomWidth: 1 },
  navScroll: { flexDirection: 'row', paddingHorizontal: 12, gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  navText: { fontSize: 13 },
  body: { flex: 1 },
});
