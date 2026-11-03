import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ROUTES } from '../../../src/navigation/routes';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAppointment, useSubmitConsultationReport } from '../../../src/hooks/useAppointments';
import { useAuth } from '../../../src/hooks/useAuth';
import { PrescriptionItem } from '../../../src/types/appointment';
import {
  Stethoscope,
  ArrowLeft,
  Activity,
  Heart,
  Thermometer,
  Pill,
  Save,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';

/**
 * Atendimento clínico: o veterinário registra anamnese, sinais vitais,
 * diagnóstico e prescrição. Ao emitir o laudo a consulta é concluída e o
 * tutor recebe uma notificação que abre o laudo no app.
 */
export default function ClinicalAttendancePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();

  const { data: appointment, isLoading, isError } = useAppointment(id);
  const submitReportMutation = useSubmitConsultationReport();

  // Estado do formulário clínico
  const [vetName, setVetName] = useState('');
  const [crmv, setCrmv] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [anamnesis, setAnamnesis] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-' + Date.now(),
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    },
  ]);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Pré-preenche com o veterinário logado (ou o responsável pela consulta)
  useEffect(() => {
    if (!appointment) return;
    const isAssignedVet = user?.role === 'veterinarian' && user.specialistId === appointment.specialistId;
    setVetName(isAssignedVet ? user.displayName : appointment.specialistName);
    setCrmv(isAssignedVet ? user.crmv ?? '' : '');
    if (appointment.notes) {
      setAnamnesis((current) => current || `Queixa principal relatada pelo tutor: ${appointment.notes}`);
    }
  }, [appointment, user]);

  const handleAddPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        id: 'rx-' + Date.now(),
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const handleRemovePrescription = (rxId: string) => {
    setPrescriptions((prev) => prev.filter((p) => p.id !== rxId));
  };

  const handleUpdatePrescription = (rxId: string, field: keyof PrescriptionItem, value: string) => {
    setPrescriptions((prev) =>
      prev.map((item) => (item.id === rxId ? { ...item, [field]: value } : item))
    );
  };

  const handleConcludeAttendance = async () => {
    if (!id) return;
    if (!anamnesis.trim() || !diagnosis.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor, preencha ao menos a Anamnese e o Diagnóstico Clínico.',
      });
      return;
    }

    setFeedback(null);

    // Filtrar prescrições vazias
    const validPrescriptions = prescriptions.filter((p) => p.medication.trim().length > 0);

    try {
      await submitReportMutation.mutateAsync({
        appointmentId: id,
        report: {
          veterinarianName: vetName.trim(),
          crmv: crmv.trim(),
          anamnesis: anamnesis.trim(),
          physicalExam: physicalExam.trim(),
          vitalSigns: {
            weight: weight.trim() ? (weight.includes('kg') ? weight.trim() : `${weight.trim()} kg`) : undefined,
            temperature: temperature.trim(),
            heartRate: heartRate.trim(),
            respiratoryRate: respiratoryRate.trim(),
          },
          diagnosis: diagnosis.trim(),
          prescriptions: validPrescriptions,
          instructions: instructions.trim(),
          followUpDate: followUpDate.trim(),
        },
      });

      setFeedback({
        type: 'success',
        message: 'Laudo emitido e atendimento concluído. O tutor foi notificado no aplicativo.',
      });

      setTimeout(() => {
        router.replace(ROUTES.clinic.agenda as Href);
      }, 2000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Falha ao salvar atendimento no servidor.',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Abrindo ficha de atendimento...
        </Text>
      </View>
    );
  }

  if (isError || !appointment) {
    return (
      <View style={styles.centerBox}>
        <AlertCircle size={40} color="#ef4444" />
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Consulta não encontrada
        </Text>
        <TouchableOpacity
          onPress={() => router.replace(ROUTES.clinic.agenda as Href)}
          style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.backBtnText, { color: colors.text }]}>Voltar para a Agenda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenScroll>
      {/* NAVEGAÇÃO DE VOLTA */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.navBackRow}
        activeOpacity={0.7}
      >
        <ArrowLeft size={18} color={colors.accent} />
        <Text style={[styles.navBackText, { color: colors.accent }]}>
          Voltar para a Agenda
        </Text>
      </TouchableOpacity>

      {/* CABEÇALHO DO PACIENTE */}
      <View
        style={[
          styles.patientHeaderCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.patientMetaRow}>
          <View style={[styles.patientIconCircle, { backgroundColor: colors.primaryLight }]}>
            <Stethoscope size={26} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.patientTitleGroup}>
              <Text style={[styles.patientName, { color: colors.text }]}>
                Atendimento Clínico: {appointment.petName}
              </Text>
              <View style={[styles.activeTag, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={styles.activeTagText}>Em Atendimento</Text>
              </View>
            </View>
            <Text style={[styles.patientSub, { color: colors.textSecondary }]}>
              Procedimento: <Text style={{ fontWeight: '700', color: colors.text }}>{appointment.serviceName}</Text> • Agendado para {appointment.date} às {appointment.time}
            </Text>
          </View>
        </View>
      </View>

      {/* FEEDBACK DE SUCESSO OU ERRO */}
      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            {
              backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
              borderColor: feedback.type === 'success' ? '#a7f3d0' : '#fecaca',
            },
          ]}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={20} color="#059669" />
          ) : (
            <AlertCircle size={20} color="#dc2626" />
          )}
          <Text
            style={[
              styles.feedbackText,
              { color: feedback.type === 'success' ? '#065f46' : '#991b1b' },
            ]}
          >
            {feedback.message}
          </Text>
        </View>
      )}

      {/* FORMULÁRIO CLÍNICO */}
      <View
        style={[
          styles.formCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* IDENTIFICAÇÃO DO PROFISSIONAL */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          1. Identificação do Médico Responsável
        </Text>
        <View style={styles.fieldsGrid}>
          <View style={styles.fieldCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Nome do Médico Veterinário
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={vetName}
              onChangeText={setVetName}
              placeholder="Nome do veterinário responsável"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Registro CRMV
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={crmv}
              onChangeText={setCrmv}
              placeholder="Ex: CRMV-SP 42.109"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* SINAIS VITAIS */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          2. Sinais Vitais & Biometria do Paciente
        </Text>
        <View style={styles.vitalsGrid}>
          <View style={styles.vitalCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Peso Aferido (kg)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={weight}
              onChangeText={setWeight}
              placeholder="Ex: 31.5"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.vitalCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Temperatura (°C)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={temperature}
              onChangeText={setTemperature}
              placeholder="Ex: 38.5 °C"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.vitalCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Freq. Cardíaca (bpm)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={heartRate}
              onChangeText={setHeartRate}
              placeholder="Ex: 120 bpm"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.vitalCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Freq. Respiratória (rpm)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={respiratoryRate}
              onChangeText={setRespiratoryRate}
              placeholder="Ex: 24 rpm"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* ANAMNESE & EXAME FÍSICO */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          3. Anamnese & Queixa Clínica
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={anamnesis}
          onChangeText={setAnamnesis}
          placeholder="Descreva a queixa do tutor, histórico clínico, comportamento do animal e sintomas relatados..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
        />

        {/* DIAGNÓSTICO MÉDICO */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          4. Diagnóstico Clínico & Avaliação
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={diagnosis}
          onChangeText={setDiagnosis}
          placeholder="Diagnóstico conclusivo ou hipóteses diagnósticas com conduta terapêutica..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />

        {/* PRESCRIÇÃO E MEDICAMENTOS */}
        <View style={styles.rxHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            5. Prescrição de Medicamentos & Receituário
          </Text>
          <TouchableOpacity
            onPress={handleAddPrescription}
            style={[styles.addRxBtn, { backgroundColor: colors.primaryLight, borderColor: colors.accent }]}
            activeOpacity={0.7}
          >
            <Plus size={14} color={colors.accent} />
            <Text style={[styles.addRxBtnText, { color: colors.accent }]}>
              + Medicamento
            </Text>
          </TouchableOpacity>
        </View>

        {prescriptions.map((rx, index) => (
          <View
            key={rx.id}
            style={[
              styles.rxCard,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            <View style={styles.rxTopRow}>
              <Text style={[styles.rxCardTitle, { color: colors.text }]}>
                Medicamento #{index + 1}
              </Text>
              {prescriptions.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemovePrescription(rx.id)}
                  style={styles.rxRemoveBtn}
                >
                  <Trash2 size={15} color="#ef4444" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldsGrid}>
              <View style={styles.fieldCol}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Nome do Medicamento
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                  ]}
                  value={rx.medication}
                  onChangeText={(v) => handleUpdatePrescription(rx.id, 'medication', v)}
                  placeholder="Ex: Cefalexina 500mg"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Dosagem
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                  ]}
                  value={rx.dosage}
                  onChangeText={(v) => handleUpdatePrescription(rx.id, 'dosage', v)}
                  placeholder="Ex: 1 comprimido"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Frequência / Posologia
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                  ]}
                  value={rx.frequency}
                  onChangeText={(v) => handleUpdatePrescription(rx.id, 'frequency', v)}
                  placeholder="Ex: A cada 12 horas"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.fieldCol}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Duração do Tratamento
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
                  ]}
                  value={rx.duration}
                  onChangeText={(v) => handleUpdatePrescription(rx.id, 'duration', v)}
                  placeholder="Ex: 7 dias contínuos"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        ))}

        {/* ORIENTAÇÕES GERAIS E RETORNO */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
          6. Orientações Gerais ao Tutor & Previsão de Retorno
        </Text>
        <View style={styles.fieldsGrid}>
          <View style={{ width: '100%' }}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Recomendações e Cuidados
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={instructions}
              onChangeText={setInstructions}
              placeholder="Instruções de repouso, dieta recomendada, banhos, monitoramento de sintomas..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.fieldCol}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Data Recomendada para Retorno (Opcional)
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={followUpDate}
              onChangeText={setFollowUpDate}
              placeholder="Ex: 2026-10-15"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* BOTÃO CONCLUIR ATENDIMENTO */}
        <View style={[styles.submitRow, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleConcludeAttendance}
            disabled={submitReportMutation.isPending}
            style={[styles.submitBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
          >
            {submitReportMutation.isPending ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <CheckCircle2 size={18} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  Concluir Atendimento & Emitir Prontuário Digital
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  centerBox: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  navBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  navBackText: {
    fontSize: 13,
    fontWeight: '700',
  },
  patientHeaderCard: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  patientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  patientIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '800',
  },
  activeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  patientSub: {
    fontSize: 12,
    marginTop: 4,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  feedbackText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  fieldCol: {
    flex: 1,
    minWidth: 240,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
  },
  textArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCol: {
    flex: 1,
    minWidth: 140,
  },
  rxHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  addRxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  addRxBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  rxCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  rxTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rxCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  rxRemoveBtn: {
    padding: 4,
  },
  submitRow: {
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
