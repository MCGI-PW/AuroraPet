import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface IconTextFieldProps extends TextInputProps {
  label: string;
  icon: ReactNode;
  /** Conteúdo exibido à direita do rótulo (ex.: link "Esqueceu a senha?"). */
  labelAccessory?: ReactNode;
}

/** Campo de texto com rótulo e ícone, usado nos formulários de autenticação. */
export const IconTextField: React.FC<IconTextFieldProps> = ({ label, icon, labelAccessory, style, ...inputProps }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {labelAccessory}
      </View>
      <View style={[styles.inputRow, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
        {icon}
        <TextInput
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          style={[styles.input, { color: colors.text }, style]}
          {...inputProps}
        />
      </View>
    </View>
  );
};

/** Caixa de erro padrão dos formulários. */
export const FormError: React.FC<{ message: string | null; icon?: ReactNode }> = ({ message, icon }) =>
  message ? (
    <View style={styles.errorBox} accessibilityRole="alert">
      {icon}
      <Text style={styles.errorText}>{message}</Text>
    </View>
  ) : null;

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  errorText: { color: '#b91c1c', fontSize: 12, flex: 1 },
});
