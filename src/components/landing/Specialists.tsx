import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSpecialists } from '../../hooks/useClinic';
import { useTheme } from '../../contexts/ThemeContext';
import { Avatar } from '../common/Avatar';
import { Calendar } from 'lucide-react-native';

interface SpecialistsProps {
  onOpenBooking: () => void;
}

export const Specialists: React.FC<SpecialistsProps> = ({ onOpenBooking }) => {
  const { data: specialists = [] } = useSpecialists();
  const { colors, isDark } = useTheme();

  return (
    <View
      nativeID="especialistas"
      style={[
        styles.section,
        {
          backgroundColor: isDark ? '#090d0c' : '#f8faf9',
        },
      ]}
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleColumn}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Profissionais focados{' '}
              <Text style={{ color: colors.accent }}>em cada paciente.</Text>
            </Text>
          </View>

          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Equipe médica integrada à plataforma Clyvo, utilizando dados reais
            disponibilizados via TanStack Query.
          </Text>
        </View>

        <View style={styles.grid}>
          {specialists.map((specialist) => (
            <View
              key={specialist.id}
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
              <View style={styles.imageContainer}>
                <Avatar name={specialist.name} photoUrl={specialist.photoUrl} style={styles.specialistImage} />
              </View>

              <Text style={[styles.specialistName, { color: colors.text }]}>
                {specialist.name}
              </Text>

              <View style={styles.specialtyRow}>
                <Text style={[styles.specialtyText, { color: colors.accent }]}>
                  {specialist.specialty}
                </Text>
                <Text style={[styles.crmvText, { color: colors.textMuted }]}>
                  {specialist.crmv}
                </Text>
              </View>

              <Text style={[styles.bioText, { color: colors.textSecondary }]}>
                {specialist.bio}
              </Text>

              <TouchableOpacity
                onPress={onOpenBooking}
                activeOpacity={0.8}
                style={[
                  styles.bookButton,
                  {
                    backgroundColor: colors.primaryLight,
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                  },
                ]}
              >
                <Calendar size={14} color={colors.accent} />
                <Text style={[styles.bookButtonText, { color: colors.accent }]}>
                  Agendar com este especialista
                </Text>
              </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 40,
  },
  titleColumn: {
    maxWidth: 620,
  },
  heading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  headerSubtitle: {
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  card: {
    flex: 1,
    minWidth: 280,
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
  },
  imageContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#ecfdf5',
  },
  specialistImage: {
    width: '100%',
    height: '100%',
  },
  specialistName: {
    fontSize: 19,
    fontWeight: '800',
  },
  specialtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  crmvText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  bookButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
