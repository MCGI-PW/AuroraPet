import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stethoscope, HeartPulse, CalendarDays } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const BENEFITS = [
  {
    icon: Stethoscope,
    title: 'Atendimento veterinário',
    description: 'Informações importantes organizadas para auxiliar o acompanhamento do paciente.',
  },
  {
    icon: HeartPulse,
    title: 'Histórico do pet',
    description: 'Registros que ajudam a manter o acompanhamento da saúde do animal.',
  },
  {
    icon: CalendarDays,
    title: 'Organização',
    description: 'Uma experiência criada para simplificar consultas e informações veterinárias.',
  },
];

export const Benefits: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.section,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {BENEFITS.map(({ icon: Icon, title, description }) => (
        <View key={title} style={styles.item}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            <Icon size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: 20,
  },
  item: {
    flexDirection: 'row',
    gap: 14,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
  },
});
