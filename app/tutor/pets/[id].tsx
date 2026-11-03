import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, Calendar, CheckCircle2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useDeletePet, usePet, useUpdatePet } from '../../../src/hooks/usePets';
import { useAppointments } from '../../../src/hooks/useAppointments';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { FullScreenLoader } from '../../../src/components/common/FullScreenLoader';
import { PetAvatar } from '../../../src/components/pets/PetAvatar';
import { PetForm } from '../../../src/components/pets/PetForm';
import { PetAuthorizationsPanel } from '../../../src/components/pets/PetAuthorizationsPanel';
import { AppointmentStatusBadge } from '../../../src/components/appointments/AppointmentStatusBadge';
import { PetFormValues, speciesLabel, toPetPayload, weightToInput } from '../../../src/domain/petRules';
import { formatDate } from '../../../src/domain/appointmentRules';
import { ROUTES } from '../../../src/navigation/routes';
import { confirmAction, showMessage } from '../../../src/utils/confirm';

type Tab = 'record' | 'access' | 'history';

const TABS: { key: Tab; label: string }[] = [
  { key: 'record', label: 'Prontuário' },
  { key: 'access', label: 'Acessos' },
  { key: 'history', label: 'Consultas' },
];

/** Prontuário do pet: edição dos dados, autorizações de acesso e histórico de consultas. */
export default function PetDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: pet, isLoading, isError, error } = usePet(id);
  const { data: appointments = [] } = useAppointments();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const [tab, setTab] = useState<Tab>('record');
  const [feedback, setFeedback] = useState<string | null>(null);

  const formValues = useMemo<PetFormValues | undefined>(
    () =>
      pet && {
        name: pet.name,
        species: pet.species,
        breed: pet.breed ?? '',
        age: pet.age ?? '',
        weight: weightToInput(pet.weight),
        notes: pet.notes ?? '',
      },
    [pet]
  );

  const petAppointments = appointments.filter((a) => a.petId === id);

  if (isLoading) return <FullScreenLoader message="Carregando prontuário do pet..." />;

  if (isError || !pet || !formValues) {
    return (
      <View style={[styles.errorState, { backgroundColor: colors.background }]}>
        <AlertCircle size={40} color="#dc2626" />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Pet não encontrado</Text>
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
          {(error as Error)?.message || 'O pet não existe ou foi removido.'}
        </Text>
        <TouchableOpacity onPress={() => router.replace(ROUTES.tutor.pets as Href)} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Voltar para Meus Pets</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showFeedback = (message: string) => {
    setFeedback(message);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleUpdate = (values: PetFormValues) => {
    updatePet.mutate(
      { id: pet.id, data: toPetPayload(values) },
      { onSuccess: () => showFeedback('Prontuário atualizado com sucesso.') }
    );
  };

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: 'Excluir pet',
      message: `Excluir "${pet.name}" definitivamente? Consultas futuras serão canceladas.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!confirmed) return;
    deletePet.mutate(pet.id, {
      onSuccess: () => router.replace(ROUTES.tutor.pets as Href),
      onError: (err) => showMessage('Erro', err.message),
    });
  };

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.navigate(ROUTES.tutor.pets as Href)} style={styles.backBtn}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={[styles.backText, { color: colors.textSecondary }]}>Meus Pets</Text>
      </TouchableOpacity>

      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <PetAvatar pet={pet} size={72} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
          <Text style={[styles.petMeta, { color: colors.textSecondary }]}>
            {speciesLabel(pet.species)} • {pet.breed} • {pet.age}
          </Text>
          {pet.weight && <Text style={[styles.petMeta, { color: colors.textMuted }]}>Peso: {pet.weight}</Text>}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => router.push(ROUTES.tutor.newAppointmentForPet(pet.id) as Href)}
          style={[styles.actionBtn, { backgroundColor: '#064e3b' }]}
        >
          <Calendar size={16} color="#ffffff" />
          <Text style={styles.actionTextLight}>Agendar consulta</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          disabled={deletePet.isPending}
          style={[styles.actionBtn, styles.deleteBtn]}
          accessibilityLabel="Excluir pet"
        >
          <Trash2 size={16} color="#dc2626" />
          <Text style={styles.deleteText}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {feedback && (
        <View style={styles.feedback}>
          <CheckCircle2 size={16} color="#047857" />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <View style={[styles.tabs, { backgroundColor: colors.surfaceSubtle }]}>
        {TABS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && { backgroundColor: colors.surface }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === key }}
          >
            <Text style={[styles.tabText, { color: tab === key ? colors.accent : colors.textSecondary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {tab === 'record' && (
          <PetForm
            initialValues={formValues}
            submitLabel="Salvar alterações"
            submitting={updatePet.isPending}
            serverError={updatePet.error?.message}
            onSubmit={handleUpdate}
          />
        )}

        {tab === 'access' && <PetAuthorizationsPanel pet={pet} onFeedback={showFeedback} />}

        {tab === 'history' && (
          <View style={{ gap: 10 }}>
            {petAppointments.length === 0 && (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>Nenhuma consulta registrada para {pet.name}.</Text>
            )}
            {petAppointments.map((appointment) => (
              <TouchableOpacity
                key={appointment.id}
                onPress={() => router.push(ROUTES.tutor.appointment(appointment.id) as Href)}
                style={[styles.historyItem, { borderColor: colors.border }]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.historyTitle, { color: colors.text }]}>{appointment.serviceName}</Text>
                  <Text style={[styles.petMeta, { color: colors.textSecondary }]}>
                    {formatDate(appointment.date)} às {appointment.time} • {appointment.specialistName}
                  </Text>
                </View>
                <AppointmentStatusBadge status={appointment.status} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  backText: { fontSize: 14, fontWeight: '600' },
  headerCard: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, borderRadius: 20, borderWidth: 1 },
  petName: { fontSize: 22, fontWeight: '800' },
  petMeta: { fontSize: 13, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, flex: 1 },
  actionTextLight: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  deleteBtn: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', flex: 0, paddingHorizontal: 16 },
  deleteText: { color: '#dc2626', fontWeight: '700', fontSize: 14 },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#d1fae5', padding: 12, borderRadius: 12, marginTop: 12 },
  feedbackText: { color: '#047857', fontWeight: '600', fontSize: 13, flex: 1 },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 14, marginTop: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  tabText: { fontSize: 13, fontWeight: '700' },
  panel: { marginTop: 12, padding: 16, borderRadius: 20, borderWidth: 1 },
  empty: { fontSize: 13, textAlign: 'center' },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  historyTitle: { fontSize: 14, fontWeight: '700' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: '800' },
  primaryBtn: { backgroundColor: '#064e3b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  primaryBtnText: { color: '#ffffff', fontWeight: '700' },
});
