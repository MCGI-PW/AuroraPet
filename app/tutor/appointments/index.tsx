import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { AlertCircle, Ban, Calendar, ChevronRight, Clock, FileText, Plus, Stethoscope, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppointments, useCancelAppointment, useDeleteAppointment } from '../../../src/hooks/useAppointments';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { ChoiceChips } from '../../../src/components/forms/ChoiceChips';
import { AppointmentStatusBadge } from '../../../src/components/appointments/AppointmentStatusBadge';
import { ConsultationReportModal } from '../../../src/components/appointments/ConsultationReportModal';
import { formatDate, isUpcoming } from '../../../src/domain/appointmentRules';
import { ROUTES } from '../../../src/navigation/routes';
import { confirmAction, showMessage } from '../../../src/utils/confirm';
import { Appointment, AppointmentStatus } from '../../../src/types/appointment';

type Filter = 'all' | AppointmentStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'scheduled', label: 'Agendadas' },
  { value: 'completed', label: 'Realizadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

/** Consultas do tutor: filtro por status, cancelamento, exclusão e laudo. */
export default function AppointmentsListPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: appointments = [], isLoading, isError, error } = useAppointments();
  const cancelAppointment = useCancelAppointment();
  const deleteAppointment = useDeleteAppointment();
  const [filter, setFilter] = useState<Filter>('all');
  const [reportFor, setReportFor] = useState<Appointment | null>(null);

  const filtered = filter === 'all' ? appointments : appointments.filter((a) => a.status === filter);

  const handleCancel = async (appointment: Appointment) => {
    const confirmed = await confirmAction({
      title: 'Cancelar consulta',
      message: `Cancelar a consulta de ${appointment.petName} em ${formatDate(appointment.date)} às ${appointment.time}?`,
      confirmLabel: 'Cancelar consulta',
      destructive: true,
    });
    if (confirmed) cancelAppointment.mutate(appointment.id, { onError: (err) => showMessage('Erro', err.message) });
  };

  const handleDelete = async (appointment: Appointment) => {
    const confirmed = await confirmAction({
      title: 'Excluir registro',
      message: 'Excluir permanentemente este agendamento do seu histórico?',
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (confirmed) deleteAppointment.mutate(appointment.id, { onError: (err) => showMessage('Erro', err.message) });
  };

  return (
    <ScreenScroll>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Consultas</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Agenda e histórico de atendimentos</Text>
        </View>
        <TouchableOpacity onPress={() => router.push(ROUTES.tutor.newAppointment as Href)} style={styles.newBtn}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.newBtnText}>Agendar</Text>
        </TouchableOpacity>
      </View>

      <ChoiceChips
        options={FILTERS.map((f) => ({
          value: f.value,
          label: `${f.label} (${f.value === 'all' ? appointments.length : appointments.filter((a) => a.status === f.value).length})`,
        }))}
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
      />

      {isLoading && <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 32 }} />}
      {isError && (
        <View style={styles.errorBox}>
          <AlertCircle size={16} color="#b91c1c" />
          <Text style={styles.errorText}>{(error as Error).message}</Text>
        </View>
      )}
      {!isLoading && !isError && filtered.length === 0 && (
        <View style={[styles.empty, { borderColor: colors.border }]}>
          <Calendar size={36} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhuma consulta neste filtro.</Text>
        </View>
      )}

      {filtered.map((appointment) => (
        <TouchableOpacity
          key={appointment.id}
          activeOpacity={0.85}
          onPress={() => router.push(ROUTES.tutor.appointment(appointment.id) as Href)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={styles.cardTop}>
            <AppointmentStatusBadge status={appointment.status} />
            <ChevronRight size={18} color={colors.textMuted} />
          </View>
          <Text style={[styles.service, { color: colors.text }]}>{appointment.serviceName}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>Pet: {appointment.petName}</Text>
          <View style={styles.infoRow}>
            <Calendar size={14} color={colors.accent} />
            <Text style={[styles.meta, { color: colors.text }]}>{formatDate(appointment.date)}</Text>
            <Clock size={14} color={colors.accent} />
            <Text style={[styles.meta, { color: colors.text }]}>{appointment.time}</Text>
          </View>
          <View style={styles.infoRow}>
            <Stethoscope size={14} color={colors.accent} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{appointment.specialistName}</Text>
          </View>

          <View style={styles.actions}>
            {appointment.report && (
              <TouchableOpacity onPress={() => setReportFor(appointment)} style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}>
                <FileText size={14} color={colors.accent} />
                <Text style={[styles.actionText, { color: colors.accent }]}>Laudo</Text>
              </TouchableOpacity>
            )}
            {isUpcoming(appointment) && (
              <TouchableOpacity onPress={() => handleCancel(appointment)} style={[styles.actionBtn, styles.warnBtn]}>
                <Ban size={14} color="#b45309" />
                <Text style={[styles.actionText, { color: '#b45309' }]}>Cancelar</Text>
              </TouchableOpacity>
            )}
            {appointment.status !== 'scheduled' && (
              <TouchableOpacity onPress={() => handleDelete(appointment)} style={[styles.actionBtn, styles.dangerBtn]}>
                <Trash2 size={14} color="#dc2626" />
                <Text style={[styles.actionText, { color: '#dc2626' }]}>Excluir</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      ))}

      <ConsultationReportModal visible={Boolean(reportFor)} onClose={() => setReportFor(null)} appointment={reportFor} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#064e3b', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 12 },
  newBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  errorBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#fef2f2', padding: 12, borderRadius: 10, marginTop: 16 },
  errorText: { color: '#b91c1c', fontSize: 13, flex: 1 },
  empty: { alignItems: 'center', gap: 8, padding: 32, borderWidth: 1, borderStyle: 'dashed', borderRadius: 18, marginTop: 16 },
  emptyText: { fontSize: 13 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  service: { fontSize: 16, fontWeight: '800', marginTop: 4 },
  meta: { fontSize: 13 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionText: { fontWeight: '700', fontSize: 12 },
  warnBtn: { backgroundColor: '#fef3c7' },
  dangerBtn: { backgroundColor: '#fee2e2' },
});
