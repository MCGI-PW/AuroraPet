import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PawPrint } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useClinicProfile } from '../../hooks/useClinic';

interface HeaderBrandProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const HeaderBrand: React.FC<HeaderBrandProps> = ({ size = 'md', showSubtitle = true }) => {
  const { colors, isDark } = useTheme();
  const { data: clinic } = useClinicProfile();

  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 48 : 40;
  const lucideIconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;
  const titleSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBox,
          {
            width: iconSize,
            height: iconSize,
            backgroundColor: '#10b981',
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.4 : 0.25,
            shadowRadius: 8,
            elevation: 4,
          },
        ]}
      >
        <PawPrint size={lucideIconSize} color="#ffffff" />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              {
                fontSize: titleSize,
                color: colors.text,
              },
            ]}
          >
            AuroraPet
          </Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primaryLight,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.accent }]}>VET</Text>
          </View>
        </View>

        {showSubtitle && (
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {clinic?.name ?? 'Cuidado veterinário'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  textContainer: {
    flexDirection: 'column',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
