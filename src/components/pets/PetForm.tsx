import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertCircle, Save } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { PetFormValues, SPECIES_OPTIONS, validatePetForm } from '../../domain/petRules';

export const EMPTY_PET_FORM: PetFormValues = { name: '', species: 'dog', breed: '', age: '', weight: '', notes: '' };

interface PetFormProps {
  initialValues?: PetFormValues;
  submitLabel: string;
  submitting: boolean;
  /** Erro vindo da API (ex.: validação do servidor). */
  serverError?: string | null;
  onSubmit: (values: PetFormValues) => void;
  onCancel?: () => void;
}

/** Formulário de dados do pet, usado no cadastro e na edição do prontuário. */
export const PetForm: React.FC<PetFormProps> = ({
  initialValues = EMPTY_PET_FORM,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}) => {
  const { colors } = useTheme();
  const [values, setValues] = useState<PetFormValues>(initialValues);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => setValues(initialValues), [initialValues]);

  const set = <K extends keyof PetFormValues>(key: K, value: PetFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = () => {
    const error = validatePetForm(values);
    setValidationError(error);
    if (!error) onSubmit(values);
  };

  const inputStyle = [styles.input, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border, color: colors.text }];
  const error = validationError || serverError;

  return (
    <View>
      {error ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#b91c1c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Field label="Nome do pet *">
        <TextInput
          placeholder="Ex.: Thor, Luna, Pipoca"
          placeholderTextColor={colors.textMuted}
          value={values.name}
          onChangeText={(v) => set('name', v)}
          style={inputStyle}
        />
      </Field>

      <Field label="Espécie *">
        <View style={styles.speciesRow}>
          {SPECIES_OPTIONS.map((option) => {
            const selected = values.species === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => set('species', option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[
                  styles.speciesBtn,
                  {
                    backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle,
                    borderColor: selected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text style={styles.speciesEmoji}>{option.icon}</Text>
                <Text style={[styles.speciesText, { color: selected ? colors.accent : colors.text }]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Field>

      <View style={styles.row}>
        <Field label="Raça" style={styles.flex}>
          <TextInput
            placeholder="Ex.: Golden, SRD"
            placeholderTextColor={colors.textMuted}
            value={values.breed}
            onChangeText={(v) => set('breed', v)}
            style={inputStyle}
          />
        </Field>
        <Field label="Idade" style={styles.flex}>
          <TextInput
            placeholder="Ex.: 2 anos"
            placeholderTextColor={colors.textMuted}
            value={values.age}
            onChangeText={(v) => set('age', v)}
            style={inputStyle}
          />
        </Field>
      </View>

      <Field label="Peso (kg)">
        <TextInput
          placeholder="Ex.: 12,5"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={values.weight}
          onChangeText={(v) => set('weight', v)}
          style={inputStyle}
        />
      </Field>

      <Field label="Histórico de saúde / alergias / observações">
        <TextInput
          multiline
          numberOfLines={3}
          placeholder="Ex.: alérgico a picada de pulga, castrado, usa medicação contínua..."
          placeholderTextColor={colors.textMuted}
          value={values.notes}
          onChangeText={(v) => set('notes', v)}
          style={[inputStyle, styles.textArea]}
        />
      </Field>

      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.cancelBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleSubmit} disabled={submitting} activeOpacity={0.85} style={styles.saveBtn}>
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Save size={16} color="#ffffff" />
              <Text style={styles.saveText}>{submitLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Field: React.FC<{ label: string; style?: object; children: React.ReactNode }> = ({ label, style, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  speciesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  speciesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  speciesEmoji: { fontSize: 16 },
  speciesText: { fontSize: 13, fontWeight: '600' },
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
  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  cancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  cancelText: { fontSize: 14, fontWeight: '700' },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 13,
    borderRadius: 12,
  },
  saveText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});
