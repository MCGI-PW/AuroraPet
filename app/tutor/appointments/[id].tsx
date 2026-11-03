import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, CalendarClock, FileText, Stethoscope, XCircle } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppointment, useCancelAppointment, useUpdateAppointment } from '../../../src/hooks/useAppointments';
import { useSpecialists } from '../../../src/hooks/useClinic';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { FullScreenLoader } from '../../../src/components/common/FullScreenLoader';
import { AppointmentStatusBadge } from '../../../src/components/appointments/AppointmentStatusBadge';
import { SlotPicker } from '../../../src/components/appointments/SlotPicker';
import { ConsultationReportModal } from '../../../src/components/appointments/ConsultationReportModal';
import { formatDate, isUpcoming } from '../../../src/domain/appointmentRules';
import { ROUTES } from '../../../src/navigation/routes';
import { confirmAction, showMessage } from '../../../src/utils/confirm';

/**
 * Detalhe da consulta. É a tela aberta pelas notificações (lembrete e laudo
 * emitido): mostra o status, permite remarcar/cancelar e exibe o laudo.
 */
export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: appointment, isLoading, isError, error } = useAppointment(id);
  const { data: specialists = [] } = useSpecialists();
  const updateAppointment = useUpdateAppointment();
  const cancelAppointment = useCancelAppointment();

  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  if (isLoading) return <FullScreenLoader message="Carregando consulta..." />;
  if (isError || !appointment) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AlertCircle size={40} color="#dc2626" />
        <Text style={[styles.title, { color: colors.text }]}>Consulta não encontrada</Text>
        <Text style={{ color: colors.textSecondary }}>{(error as Error)?.message}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace(ROUTES.tutor.appointments as Href)}>
          <Text style={styles.primaryText}>Ver minhas consultas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const specialist = specialists.find((s) => s.id === appointment.specialistId);
  const canChange = isUpcoming(appointment);

  const handleReschedule = () => {
    if (!newDate || !newTime) return showMessage('Remarcar', 'Escolha a nova data e um horário disponível.');
    updateAppointment.mutate(
      { id: appointment.id, data: { date: newDate, time: newTime } },
      {
        onSuccess: () => {
          setRescheduling(false);
          showMessage('Consulta remarcada', `Nova data: ${formatDate(newDate)} às ${newTime}. Os lembretes foram atualizados.`);
        },
        onError: (err) => showMessage('Não foi possível remarcar', err.message),
      }
    );
  };

  const handleCancel = async () => {
    const confirmed = await confirmAction({
      title: 'Cancelar consulta',
      message: `Cancelar a consulta de ${appointment.petName} em ${formatDate(appointment.date)} às ${appointment.time}?`,
      confirmLabel: 'Cancelar consulta',
      destructive: true,
    });
    if (confirmed) cancelAppointment.mutate(appointment.id, { onError: (err) => showMessage('Erro', err.message) });
  };

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.navigate(ROUTES.tutor.appointments as Href)} style={styles.backBtn}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={[styles.backText, { color: colors.textSecondary }]}>Minhas consultas</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppointmentStatusBadge status={appointment.status} />
        <Text style={[styles.title, { color: colors.text }]}>{appointment.serviceName}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>Pet: {appointment.petName}</Text>

        <View style={styles.infoRow}>
          <CalendarClock size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            {formatDate(appointment.date)} às {appointment.time}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Stethoscope size={16} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.text }]}>{appointment.specialistName}</Text>
        </View>
        {appointment.notes ? (
          <Text style={[styles.notes, { color: colors.textSecondary, backgroundColor: colors.surfaceSubtle }]}>
            “{appointment.notes}”
          </Text>
        ) : null}

        {appointment.report && (
          <TouchableOpacity onPress={() => setReportOpen(true)} style={styles.primaryBtn}>
            <FileText size={16} color="#ffffff" />
            <Text style={styles.primaryText}>Ver laudo e receita</Text>
          </TouchableOpacity>
        )}

        {canChange && !rescheduling && (
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => {
                setRescheduling(true);
                setNewDate(appointment.date);
                setNewTime('');
              }}
              style={[styles.outlineBtn, { borderColor: colors.border }]}
            >
              <CalendarClock size={16} color={colors.text} />
              <Text style={[styles.outlineText, { color: colors.text }]}>Remarcar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancel} disabled={cancelAppointment.isPending} style={[styles.outlineBtn, styles.cancelBtn]}>
              <XCircle size={16} color="#dc2626" />
              <Text style={[styles.outlineText, { color: '#dc2626' }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {rescheduling && (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha o novo horário</Text>
          <SlotPicker specialist={specialist} date={newDate} time={newTime} onChangeDate={setNewDate} onChangeTime={setNewTime} />
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => setRescheduling(false)} style={[styles.outlineBtn, { borderColor: colors.border }]}>
              <Text style={[styles.outlineText, { color: colors.text }]}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleReschedule} disabled={updateAppointment.isPending} style={[styles.primaryBtn, styles.flex]}>
              {updateAppointment.isPending && <ActivityIndicator color="#ffffff" />}
              <Text style={styles.primaryText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ConsultationReportModal visible={reportOpen} onClose={() => setReportOpen(false)} appointment={appointment} />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  backText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 8 },
  title: { fontSize: 21, fontWeight: '800' },
  meta: { fontSize: 13 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, fontWeight: '600' },
  notes: { fontSize: 13, fontStyle: 'italic', padding: 10, borderRadius: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  outlineBtn: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 12 },
  outlineText: { fontWeight: '700', fontSize: 14 },
  cancelBtn: { borderColor: '#fecaca', backgroundColor: '#fef2f2' },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064e3b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  flex: { flex: 1, marginTop: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
});
