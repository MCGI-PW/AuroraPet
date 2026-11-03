import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertCircle, Save } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { CreateSpecialistInput } from '../../types/specialist';

export const WEEK_DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const CLINIC_HOURS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '17:00'];

export const EMPTY_SPECIALIST: CreateSpecialistInput = {
  name: '',
  crmv: '',
  specialty: '',
  bio: '',
  photoUrl: '',
  email: '',
  phone: '',
  availableDays: ['Segunda', 'Quarta', 'Sexta'],
  availableHours: ['09:00', '10:00', '14:00', '15:00'],
  active: true,
};

interface SpecialistFormProps {
  initialValues?: CreateSpecialistInput;
  submitLabel: string;
  submitting: boolean;
  serverError?: string | null;
  onSubmit: (values: CreateSpecialistInput) => void;
}

function validate(values: CreateSpecialistInput): string | null {
  if (!values.name.trim() || !values.crmv.trim() || !values.specialty.trim()) {
    return 'Preencha nome, CRMV e especialidade.';
  }
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) return 'E-mail inválido.';
  if (!values.availableDays.length || !values.availableHours?.length) return 'Selecione ao menos um dia e um horário de atendimento.';
  return null;
}

/** Cadastro/edição de um veterinário do corpo clínico e da sua agenda de atendimento. */
export const SpecialistForm: React.FC<SpecialistFormProps> = ({
  initialValues = EMPTY_SPECIALIST,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
}) => {
  const { colors } = useTheme();
  const [values, setValues] = useState<CreateSpecialistInput>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setValues(initialValues), [initialValues]);

  const set = <K extends keyof CreateSpecialistInput>(key: K, value: CreateSpecialistInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const toggle = (key: 'availableDays' | 'availableHours', item: string) => {
    const list = values[key] ?? [];
    set(key, list.includes(item) ? list.filter((x) => x !== item) : [...list, item].sort());
  };

  const handleSubmit = () => {
    const validationError = validate(values);
    setError(validationError);
    if (!validationError) {
      onSubmit({
        ...values,
        name: values.name.trim(),
        crmv: values.crmv.trim(),
        specialty: values.specialty.trim(),
        email: values.email?.trim(),
        availableDays: WEEK_DAYS.filter((d) => values.availableDays.includes(d)),
      });
    }
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSubtle }];
  const chipStyle = (selected: boolean) => [
    styles.chip,
    { backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle, borderColor: selected ? colors.accent : colors.border },
  ];
  const message = error || serverError;

  const field = (label: string, key: 'name' | 'crmv' | 'specialty' | 'email' | 'phone' | 'photoUrl', placeholder: string, extra = {}) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={(values[key] as string) ?? ''}
        onChangeText={(v) => set(key, v)}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={inputStyle}
        {...extra}
      />
    </View>
  );

  return (
    <View>
      {message ? (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#b91c1c" />
          <Text style={styles.errorText}>{message}</Text>
        </View>
      ) : null}

      {field('Nome completo *', 'name', 'Ex.: Dra. Ana Souza')}
      {field('CRMV *', 'crmv', 'Ex.: CRMV-SP 12.345', { autoCapitalize: 'characters' })}
      {field('Especialidade *', 'specialty', 'Ex.: Dermatologia')}
      {field('E-mail (vincula a conta do veterinário)', 'email', 'veterinario@email.com', { autoCapitalize: 'none', keyboardType: 'email-address' })}
      {field('Telefone', 'phone', '(11) 99999-9999', { keyboardType: 'phone-pad' })}
      {field('URL da foto', 'photoUrl', 'https://...', { autoCapitalize: 'none' })}

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Apresentação</Text>
        <TextInput
          value={values.bio}
          onChangeText={(v) => set('bio', v)}
          multiline
          placeholder="Formação e experiência"
          placeholderTextColor={colors.textMuted}
          style={[inputStyle, styles.textArea]}
        />
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Dias de atendimento</Text>
      <View style={styles.chips}>
        {WEEK_DAYS.map((day) => (
          <TouchableOpacity key={day} onPress={() => toggle('availableDays', day)} style={chipStyle(values.availableDays.includes(day))}>
            <Text style={[styles.chipText, { color: values.availableDays.includes(day) ? colors.accent : colors.text }]}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Horários de atendimento</Text>
      <View style={styles.chips}>
        {CLINIC_HOURS.map((hour) => {
          const selected = values.availableHours?.includes(hour) ?? false;
          return (
            <TouchableOpacity key={hour} onPress={() => toggle('availableHours', hour)} style={chipStyle(selected)}>
              <Text style={[styles.chipText, { color: selected ? colors.accent : colors.text }]}>{hour}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.switchRow}>
        <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Disponível para agendamentos</Text>
        <Switch value={values.active !== false} onValueChange={(v) => set('active', v)} trackColor={{ true: '#10b981' }} />
      </View>

      <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.submit}>
        {submitting ? <ActivityIndicator color="#ffffff" /> : <Save size={16} color="#ffffff" />}
        <Text style={styles.submitText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: '600' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  errorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 12, borderRadius: 10, marginBottom: 14 },
  errorText: { color: '#b91c1c', fontSize: 12, flex: 1 },
  submit: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#064e3b', paddingVertical: 13, borderRadius: 12, marginTop: 18 },
  submitText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
