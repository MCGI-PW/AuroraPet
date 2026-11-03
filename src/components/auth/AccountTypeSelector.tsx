import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Building2, Stethoscope, UserCheck } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types/auth';

const OPTIONS: { role: UserRole; title: string; description: string; icon: typeof UserCheck }[] = [
  { role: 'tutor', title: 'Tutor', description: 'Cuido dos meus pets', icon: UserCheck },
  { role: 'veterinarian', title: 'Veterinário', description: 'Atendo na clínica', icon: Stethoscope },
  { role: 'clinic_admin', title: 'Clínica', description: 'Administro a clínica', icon: Building2 },
];

interface AccountTypeSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

/** Escolha do tipo de conta no cadastro. */
export const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({ value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.text }]}>Tipo de conta</Text>
      <View style={styles.row}>
        {OPTIONS.map(({ role, title, description, icon: Icon }) => {
          const selected = value === role;
          return (
            <TouchableOpacity
              key={role}
              onPress={() => onChange(role)}
              activeOpacity={0.85}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.option,
                {
                  backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}
            >
              <Icon size={18} color={selected ? colors.accent : colors.textSecondary} />
              <Text style={[styles.title, { color: selected ? colors.accent : colors.text }]}>{title}</Text>
              <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  option: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1 },
  title: { fontSize: 12, fontWeight: '800' },
  description: { fontSize: 10, textAlign: 'center' },
});
