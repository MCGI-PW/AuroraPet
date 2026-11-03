import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, Bell, CalendarPlus, PawPrint } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { usePets } from '../../../src/hooks/usePets';
import { useClinicServices, useSpecialists } from '../../../src/hooks/useClinic';
import { useCreateAppointment } from '../../../src/hooks/useAppointments';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { FullScreenLoader } from '../../../src/components/common/FullScreenLoader';
import { ChoiceChips } from '../../../src/components/forms/ChoiceChips';
import { SlotPicker } from '../../../src/components/appointments/SlotPicker';
import { ROUTES } from '../../../src/navigation/routes';

/**
 * Agendamento de consulta (POST /api/appointments). Ao confirmar, o app
 * exibe a confirmação e agenda lembretes locais 24h e 1h antes do horário.
 */
export default function NewAppointmentPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ petId?: string }>();

  const { data: pets = [], isLoading: loadingPets } = usePets();
  const { data: specialists = [], isLoading: loadingSpecialists } = useSpecialists();
  const { data: services = [], isLoading: loadingServices } = useClinicServices();
  const createAppointment = useCreateAppointment();

  const [petId, setPetId] = useState(params.petId ?? '');
  const [serviceId, setServiceId] = useState('');
  const [specialistId, setSpecialistId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeSpecialists = specialists.filter((s) => s.active !== false);
  const specialist = activeSpecialists.find((s) => s.id === specialistId);

  useEffect(() => {
    if (!petId && pets.length) setPetId(pets[0].id);
  }, [pets, petId]);
  useEffect(() => {
    if (!serviceId && services.length) setServiceId(services[0].id);
  }, [services, serviceId]);

  if (loadingPets || loadingSpecialists || loadingServices) return <FullScreenLoader message="Carregando agenda da clínica..." />;

  if (pets.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
        <PawPrint size={40} color={colors.accent} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Cadastre um pet primeiro</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>A consulta é sempre vinculada ao prontuário de um pet.</Text>
        <TouchableOpacity style={styles.submitBtn} onPress={() => router.replace(ROUTES.tutor.newPet as Href)}>
          <Text style={styles.submitText}>Cadastrar pet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = () => {
    if (!petId || !serviceId || !specialistId) return setError('Escolha o pet, o serviço e o veterinário.');
    if (!date || !time) return setError('Escolha a data e um horário disponível.');
    setError(null);
    createAppointment.mutate(
      { petId, serviceId, specialistId, date, time, notes: notes.trim() },
      {
        onSuccess: (appointment) => router.replace(ROUTES.tutor.appointment(appointment.id) as Href),
        onError: (err) => setError(err.message),
      }
    );
  };

  const sectionTitle = (text: string) => <Text style={[styles.label, { color: colors.text }]}>{text}</Text>;

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={[styles.backText, { color: colors.textSecondary }]}>Voltar</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Agendar consulta</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Somente horários livres do veterinário são exibidos.
        </Text>

        {sectionTitle('Pet *')}
        <ChoiceChips
          options={pets.map((p) => ({ value: p.id, label: p.name, description: p.breed }))}
          value={petId}
          onChange={setPetId}
        />

        {sectionTitle('Serviço *')}
        <ChoiceChips
          options={services.map((s) => ({
            value: s.id,
            label: s.name ?? s.title ?? 'Serviço',
            description: [s.duration, typeof s.price === 'number' ? `R$ ${s.price}` : s.price].filter(Boolean).join(' • '),
          }))}
          value={serviceId}
          onChange={setServiceId}
        />

        {sectionTitle('Veterinário *')}
        <ChoiceChips
          options={activeSpecialists.map((s) => ({ value: s.id, label: s.name, description: s.specialty }))}
          value={specialistId}
          onChange={(id) => {
            setSpecialistId(id);
            setTime('');
          }}
        />

        {sectionTitle('Data e horário *')}
        <SlotPicker specialist={specialist} date={date} time={time} onChangeDate={setDate} onChangeTime={setTime} />

        {sectionTitle('Sintomas ou observações')}
        <TextInput
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          placeholder="Ex.: está coçando a orelha há 3 dias"
          placeholderTextColor={colors.textMuted}
          style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
        />

        <View style={[styles.reminderInfo, { backgroundColor: colors.primaryLight }]}>
          <Bell size={16} color={colors.accent} />
          <Text style={[styles.reminderText, { color: colors.textSecondary }]}>
            Você receberá uma notificação de confirmação e lembretes 24h e 1h antes da consulta.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity onPress={handleSubmit} disabled={createAppointment.isPending} style={styles.submitBtn}>
          {createAppointment.isPending ? <ActivityIndicator color="#ffffff" /> : <CalendarPlus size={16} color="#ffffff" />}
          <Text style={styles.submitText}>Confirmar agendamento</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  backText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: 22, borderWidth: 1, padding: 18 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 14 },
  reminderInfo: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 12, marginTop: 16 },
  reminderText: { flex: 1, fontSize: 12, lineHeight: 18 },
  errorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 12, borderRadius: 10, marginTop: 14 },
  errorText: { color: '#b91c1c', fontSize: 12, flex: 1 },
  submitBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064e3b',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  submitText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
