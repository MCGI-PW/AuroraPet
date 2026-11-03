import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PawPrint, Stethoscope, HeartPulse, ShieldCheck } from 'lucide-react-native';
import { useClinicServices } from '../../hooks/useClinic';
import { useTheme } from '../../contexts/ThemeContext';

export const Services: React.FC = () => {
  const { data: services = [] } = useClinicServices();
  const { colors, isDark } = useTheme();

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'heart-pulse':
        return <HeartPulse size={24} color={isDark ? '#34d399' : '#087b5a'} />;
      case 'shield-check':
        return <ShieldCheck size={24} color={isDark ? '#a78bfa' : '#7c3aed'} />;
      default:
        return <Stethoscope size={24} color={isDark ? '#34d399' : '#087b5a'} />;
    }
  };

  return (
    <View
      nativeID="servicos"
      style={[
        styles.section,
        {
          backgroundColor: isDark ? '#090d0c' : '#f8faf9',
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.headerArea}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primaryLight,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
              },
            ]}
          >
            <PawPrint size={14} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              Nossos serviços
            </Text>
          </View>

          <Text style={[styles.heading, { color: colors.text }]}>
            Cuidado em diferentes{'\n'}
            <Text style={{ color: colors.accent }}>momentos da vida.</Text>
          </Text>

          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Uma clínica veterinária reúne diferentes formas de acompanhamento para
            facilitar o cuidado diário com cada animal.
          </Text>
        </View>

        <View style={styles.grid}>
          {services.map((service) => (
            <View
              key={service.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: '#000000',
                  shadowOpacity: isDark ? 0.35 : 0.04,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.serviceCode, { color: colors.textMuted }]}>
                  {service.category ?? service.code}
                </Text>
                {getIcon(service.iconName)}
              </View>

              <Text style={[styles.serviceTitle, { color: colors.text }]}>
                {service.name ?? service.title}
              </Text>

              <Text style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                {service.description}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingVertical: 70,
    paddingHorizontal: 20,
    width: '100%',
  },
  container: {
    width: '100%',
    maxWidth: 1180,
    marginHorizontal: 'auto',
  },
  headerArea: {
    maxWidth: 720,
    marginBottom: 44,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subheading: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  card: {
    flex: 1,
    minWidth: 280,
    padding: 26,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 44,
  },
  serviceCode: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
});
