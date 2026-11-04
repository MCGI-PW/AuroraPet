import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { Activity, AlertCircle, ArrowLeft, CheckCircle2, FileText, Pill, ShieldCheck, Stethoscope } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppointment, useSubmitConsultationReport } from '../../../src/hooks/useAppointments';
import { useAuth } from '../../../src/hooks/useAuth';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { FullScreenLoader } from '../../../src/components/common/FullScreenLoader';
import { LabeledInput } from '../../../src/components/forms/LabeledInput';
import { PrescriptionEditor } from '../../../src/components/clinic/PrescriptionEditor';
import { AppointmentStatusBadge } from '../../../src/components/appointments/AppointmentStatusBadge';
import {
  buildConsultationReport,
  ConsultationFormValues,
  emptyConsultationForm,
  validateConsultationForm,
} from '../../../src/domain/consultationReport';
import { formatDate } from '../../../src/domain/appointmentRules';
import { ROUTES } from '../../../src/navigation/routes';

/**
 * Atendimento clínico: o veterinário registra anamnese, sinais vitais,
 * diagnóstico e prescrição. Ao emitir o laudo a consulta é concluída e o
 * tutor recebe uma notificação que abre o laudo no app.
 */
export default function ClinicalAttendancePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: appointment, isLoading, isError } = useAppointment(id);
  const submitReport = useSubmitConsultationReport();

  const [form, setForm] = useState<ConsultationFormValues>(emptyConsultationForm);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pré-preenche com o veterinário logado (ou o responsável pela consulta) e a queixa do tutor
  useEffect(() => {
    if (!appointment) return;
    const isAssignedVet = user?.role === 'veterinarian' && user.specialistId === appointment.specialistId;
    setForm((current) => ({
      ...current,
      veterinarianName: isAssignedVet ? user.displayName : appointment.specialistName,
      crmv: isAssignedVet ? user.crmv ?? '' : current.crmv,
      anamnesis: current.anamnesis || (appointment.notes ? `Queixa principal relatada pelo tutor: ${appointment.notes}` : ''),
    }));
  }, [appointment, user]);

  if (isLoading) return <FullScreenLoader message="Abrindo ficha de atendimento..." />;
  if (isError || !appointment) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <AlertCircle size={40} color="#ef4444" />
        <Text style={[styles.title, { color: colors.text }]}>Consulta não encontrada</Text>
        <TouchableOpacity onPress={() => router.replace(ROUTES.clinic.agenda as Href)} style={styles.submit}>
          <Text style={styles.submitText}>Voltar para a agenda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const set = <K extends keyof ConsultationFormValues>(key: K) => (value: ConsultationFormValues[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const alreadyClosed = appointment.status === 'completed' || appointment.status === 'cancelled';

  const handleSubmit = () => {
    const error = validateConsultationForm(form);
    if (error) return setFeedback({ type: 'error', message: error });
    setFeedback(null);
    submitReport.mutate(
      { appointmentId: appointment.id, report: buildConsultationReport(form) },
      {
        onSuccess: () => {
          setFeedback({ type: 'success', message: 'Laudo emitido e atendimento concluído. O tutor foi notificado no aplicativo.' });
          setTimeout(() => router.replace(ROUTES.clinic.agenda as Href), 2000);
        },
        onError: (err) => setFeedback({ type: 'error', message: err.message }),
      }
    );
  };

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <ArrowLeft size={18} color={colors.accent} />
        <Text style={[styles.backText, { color: colors.accent }]}>Voltar para a agenda</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.patientRow}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Stethoscope size={24} color={colors.accent} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.title, { color: colors.text }]}>Atendimento: {appointment.petName}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {appointment.serviceName} • {formatDate(appointment.date)} às {appointment.time}
              {appointment.tutorName ? ` • Tutor: ${appointment.tutorName}` : ''}
            </Text>
            <AppointmentStatusBadge status={appointment.status} />
          </View>
        </View>
      </View>

      {feedback && (
        <View style={[styles.feedback, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} color="#059669" /> : <AlertCircle size={18} color="#dc2626" />}
          <Text style={[styles.feedbackText, { color: feedback.type === 'success' ? '#065f46' : '#991b1b' }]}>{feedback.message}</Text>
        </View>
      )}

      {alreadyClosed ? (
        // logo após emitir o laudo, a mensagem de sucesso acima já informa o resultado
        feedback?.type !== 'success' && (
          <Text style={[styles.closedText, { color: colors.textSecondary, borderColor: colors.border }]}>
            Esta consulta já foi {appointment.status === 'completed' ? 'concluída e o laudo emitido' : 'cancelada'}.
          </Text>
        )
      ) : (
        <>
          <Section icon={<ShieldCheck size={18} color={colors.accent} />} title="Profissional responsável">
            <LabeledInput label="Veterinário(a)" placeholder="Nome do veterinário responsável" value={form.veterinarianName} onChangeText={set('veterinarianName')} />
            <LabeledInput label="CRMV" placeholder="Ex: CRMV-SP 42.109" value={form.crmv} onChangeText={set('crmv')} autoCapitalize="characters" />
          </Section>

          <Section icon={<Activity size={18} color={colors.accent} />} title="Sinais vitais">
            <View style={styles.row}>
              <LabeledInput containerStyle={styles.flex} label="Peso (kg)" placeholder="Ex: 31.5" keyboardType="decimal-pad" value={form.weight} onChangeText={set('weight')} />
              <LabeledInput containerStyle={styles.flex} label="Temperatura" placeholder="Ex: 38.5 °C" value={form.temperature} onChangeText={set('temperature')} />
            </View>
            <View style={styles.row}>
              <LabeledInput containerStyle={styles.flex} label="Freq. cardíaca" placeholder="Ex: 120 bpm" value={form.heartRate} onChangeText={set('heartRate')} />
              <LabeledInput containerStyle={styles.flex} label="Freq. respiratória" placeholder="Ex: 24 rpm" value={form.respiratoryRate} onChangeText={set('respiratoryRate')} />
            </View>
          </Section>

          <Section icon={<FileText size={18} color={colors.accent} />} title="Avaliação clínica">
            <LabeledInput
              label="Anamnese *"
              multiline
              placeholder="Descreva a queixa do tutor, histórico clínico, comportamento do animal e sintomas relatados..."
              value={form.anamnesis}
              onChangeText={set('anamnesis')}
            />
            <LabeledInput label="Exame físico" multiline placeholder="Mucosas, hidratação, palpação, ausculta..." value={form.physicalExam} onChangeText={set('physicalExam')} />
            <LabeledInput
              label="Diagnóstico *"
              multiline
              placeholder="Diagnóstico conclusivo ou hipóteses diagnósticas com conduta terapêutica..."
              value={form.diagnosis}
              onChangeText={set('diagnosis')}
            />
          </Section>

          <Section icon={<Pill size={18} color={colors.accent} />} title="Prescrição">
            <PrescriptionEditor items={form.prescriptions} onChange={set('prescriptions')} />
          </Section>

          <Section icon={<CheckCircle2 size={18} color={colors.accent} />} title="Orientações e retorno">
            <LabeledInput label="Orientações ao tutor" multiline placeholder="Repouso, dieta, banhos, sinais de alerta..." value={form.instructions} onChangeText={set('instructions')} />
            <LabeledInput label="Data de retorno" placeholder="Ex: 2026-12-15" value={form.followUpDate} onChangeText={set('followUpDate')} />
          </Section>

          <TouchableOpacity onPress={handleSubmit} disabled={submitReport.isPending} style={styles.submit}>
            {submitReport.isPending ? <ActivityIndicator color="#ffffff" /> : <FileText size={18} color="#ffffff" />}
            <Text style={styles.submitText}>Concluir Atendimento & Emitir Prontuário Digital</Text>
          </TouchableOpacity>
        </>
      )}
    </ScreenScroll>
  );
}

const Section: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  backText: { fontSize: 14, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14 },
  patientRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800' },
  meta: { fontSize: 13 },
  closedText: { fontSize: 14, textAlign: 'center', padding: 20, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  feedback: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  feedbackSuccess: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  feedbackError: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  feedbackText: { flex: 1, fontSize: 13, fontWeight: '600' },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  submitText: { color: '#ffffff', fontWeight: '800', fontSize: 14, textAlign: 'center', flexShrink: 1 },
});
