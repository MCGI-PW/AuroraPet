import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useClinic } from '../../src/contexts/ClinicContext';
import { HeaderBrand } from '../../src/components/common/HeaderBrand';
import { RoleSwitcherModal } from '../../src/components/common/RoleSwitcherModal';
import { NotificationModal } from '../../src/components/common/NotificationModal';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  Sun,
  Moon,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  Zap,
  MessageSquareText,
  HeartHandshake,
} from 'lucide-react-native';

export default function ClinicLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, isDark, toggleTheme } = useTheme();
  const { clinic } = useClinic();

  const navItems = [
    { label: 'Painel Geral', href: '/(clinic)', icon: LayoutDashboard },
    { label: 'Planos & Cotas', href: '/(clinic)/subscription', icon: Zap },
    { label: 'Solicitações', href: '/(clinic)/requests', icon: MessageSquareText },
    { label: 'Portal do Vet', href: '/(clinic)/vet-portal', icon: Stethoscope },
    { label: 'Corpo Clínico', href: '/(clinic)/vets', icon: Users },
    { label: 'Agenda & Fila', href: '/(clinic)/agenda', icon: CalendarDays },
    { label: 'Configurações', href: '/(clinic)/settings', icon: Settings },
  ];
  const showRegister = !clinic?.id;
  if (showRegister) {
    navItems.push({ label: 'Registrar Clínica', href: '/(clinic)/register-clinic', icon: Users });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER SUPERIOR CLÍNICO */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(clinic)')}>
            <HeaderBrand size="sm" showSubtitle={false} />
          </TouchableOpacity>
          <View style={styles.headerBadge}>
            <ShieldCheck size={12} color="#10b981" />
            <Text style={styles.headerBadgeText}>{clinic?.name ?? 'Unregistered Clinic'}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* SINO DE NOTIFICAÇÕES */}
          <NotificationModal />

          {/* TOGGLE TEMA */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.actionBtn, { backgroundColor: colors.surfaceSubtle }]}
            activeOpacity={0.8}
          >
            {isDark ? (
              <Sun size={18} color="#f59e0b" />
            ) : (
              <Moon size={18} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {/* VOLTAR PARA O APP DO TUTOR */}
          <TouchableOpacity
            onPress={() => router.push('/(dashboard)')}
            style={[
              styles.tutorBtn,
              {
                backgroundColor: colors.primaryLight,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
              },
            ]}
            activeOpacity={0.85}
          >
            <Sparkles size={14} color={colors.accent} />
            <Text style={[styles.tutorBtnText, { color: colors.accent }]}>
              Área do Tutor
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* BARRA DE NAVEGAÇÃO DE MÓDULOS */}
      <View
        style={[
          styles.navBar,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navScroll}
        >
          {navItems.map((item) => {
            const isActive =
              item.href === '/(clinic)'
                ? pathname === '/(clinic)'
                : pathname.startsWith(item.href);

            const IconComponent = item.icon;

            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => router.push(item.href as any)}
                style={[
                  styles.navItem,
                  {
                    backgroundColor: isActive
                      ? colors.primaryLight
                      : 'transparent',
                    borderBottomColor: isActive ? colors.accent : 'transparent',
                  },
                ]}
                activeOpacity={0.8}
              >
                <IconComponent
                  size={16}
                  color={isActive ? colors.accent : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.navText,
                    {
                      color: isActive ? colors.accent : colors.textSecondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* CONTEÚDO PRINCIPAL DA ROTA */}
      <View style={styles.body}>
        <Slot />
      </View>

      {/* SWITCHER DE PAPEL FLUTUANTE PARA TESTES IMEDIATOS */}
      <RoleSwitcherModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headerBadgeText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 10,
  },
  tutorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  tutorBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  navBar: {
    borderBottomWidth: 1,
  },
  navScroll: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  navText: {
    fontSize: 13,
  },
  body: {
    flex: 1,
  },
});
