import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Share,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Appointment } from '../../types/appointment';
import { formatReportAsText } from '../../domain/reportFormatter';
import { useClinicProfile } from '../../hooks/useClinic';
import {
  FileText,
  X,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Pill,
  Calendar,
  Clock,
  Printer,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react-native';

interface ConsultationReportModalProps {
  visible: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export const ConsultationReportModal: React.FC<ConsultationReportModalProps> = ({
  visible,
  onClose,
  appointment,
}) => {
  const { colors, isDark } = useTheme();
  const { data: clinic } = useClinicProfile();

  if (!appointment) return null;
  const report = appointment.report;

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.print();
    } else {
      Share.share({ title: `Laudo de ${appointment.petName}`, message: formatReportAsText(appointment) });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* TOPO DO MODAL */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <FileText size={20} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Prontuário & Relatório Clínico
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Registro oficial emitido pelo corpo clínico veterinário
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* CONTEÚDO DO RELATÓRIO */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* CARIMBO CLÍNICO OFICIAL */}
            <View
              style={[
                styles.clinicalBadgeBox,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                },
              ]}
            >
              <View style={styles.badgeLeft}>
                <ShieldCheck size={24} color={colors.accent} />
                <View>
                  <Text style={[styles.clinicOfficialName, { color: colors.text }]}>
                    {clinic?.name?.toUpperCase() ?? 'PRONTUÁRIO VETERINÁRIO'}
                  </Text>
                  <Text style={[styles.clinicOfficialSub, { color: colors.textSecondary }]}>
                    Prontuário Médico Digital  Consulta #{appointment.id}
                  </Text>
                </View>
              </View>
              <View style={styles.dateStampBox}>
                <Text style={[styles.dateStampText, { color: colors.accent }]}>
                  {appointment.date}  {appointment.time}
                </Text>
              </View>
            </View>

            {/* DADOS DO PACIENTE & MÉDICO RESPONSÁVEL */}
            <View style={styles.metaGrid}>
              <View
                style={[
                  styles.metaCard,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.metaCardLabel, { color: colors.textSecondary }]}>
                  PACIENTE ATENDIDO
                </Text>
                <Text style={[styles.metaCardValue, { color: colors.text }]}>
                  {appointment.petName}
                </Text>
                <Text style={[styles.metaCardSub, { color: colors.textSecondary }]}>
                  Serviço: {appointment.serviceName}
                </Text>
              </View>

              <View
                style={[
                  styles.metaCard,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.metaCardLabel, { color: colors.textSecondary }]}>
                  MÉDICO VETERINÁRIO
                </Text>
                <Text style={[styles.metaCardValue, { color: colors.text }]}>
                  {report?.veterinarianName || appointment.specialistName}
                </Text>
                <Text style={[styles.metaCardSub, { color: colors.accent, fontWeight: '700' }]}>
                  {report?.crmv || 'CRMV Ativo'}  {report?.specialty || 'Clínica Geral'}
                </Text>
              </View>
            </View>

            {!report ? (
              <View
                style={[
                  styles.emptyReportBox,
                  { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                ]}
              >
                <AlertCircle size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyReportTitle, { color: colors.text }]}>
                  Relatório ainda não registrado
                </Text>
                <Text style={[styles.emptyReportDesc, { color: colors.textSecondary }]}>
                  O veterinário responsável ainda está processando os dados desta consulta ou o atendimento foi marcado como concluído sem preenchimento detalhado do laudo.
                </Text>
              </View>
            ) : (
              <>
                {/* SINAIS VITAIS */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Sinais Vitais & Biometria
                </Text>
                <View style={styles.vitalsRow}>
                  <View
                    style={[
                      styles.vitalItem,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Activity size={18} color="#10b981" />
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Peso</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>
                      {report.vitalSigns?.weight || 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.vitalItem,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Thermometer size={18} color="#f59e0b" />
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Temperatura</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>
                      {report.vitalSigns?.temperature || '38.5 °C'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.vitalItem,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Heart size={18} color="#ef4444" />
                    <Text style={[styles.vitalLabel, { color: colors.textSecondary }]}>Frequência Cardíaca</Text>
                    <Text style={[styles.vitalValue, { color: colors.text }]}>
                      {report.vitalSigns?.heartRate || '120 bpm'}
                    </Text>
                  </View>
                </View>

                {/* ANAMNESE E EXAME */}
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Anamnese & Queixa Principal
                  </Text>
                  <View
                    style={[
                      styles.textBox,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.bodyText, { color: colors.text }]}>
                      {report.anamnesis || 'Exame de rotina preventivo sem intercorrências prévias.'}
                    </Text>
                  </View>
                </View>

                {/* DIAGNÓSTICO CLÍNICO */}
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Diagnóstico Clínico & Avaliação Médica
                  </Text>
                  <View
                    style={[
                      styles.textBox,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#bbf7d0',
                      },
                    ]}
                  >
                    <Text style={[styles.bodyText, { color: colors.text, fontWeight: '500' }]}>
                      {report.diagnosis}
                    </Text>
                  </View>
                </View>

                {/* PRESCRIÇÃO E RECEITUÁRIO */}
                {report.prescriptions && report.prescriptions.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.sectionTitleRow}>
                      <Pill size={18} color={colors.accent} />
                      <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                        Prescrição de Medicamentos & Tratamento
                      </Text>
                    </View>

                    {report.prescriptions.map((rx, idx) => (
                      <View
                        key={rx.id || idx}
                        style={[
                          styles.prescriptionCard,
                          { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                        ]}
                      >
                        <View style={styles.rxHeader}>
                          <Text style={[styles.rxNumber, { color: colors.accent }]}>
                            #{idx + 1}
                          </Text>
                          <Text style={[styles.rxMedication, { color: colors.text }]}>
                            {rx.medication}
                          </Text>
                        </View>
                        <View style={styles.rxDetails}>
                          <Text style={[styles.rxDetailText, { color: colors.textSecondary }]}>
                             Dosagem: <Text style={{ color: colors.text, fontWeight: '700' }}>{rx.dosage}</Text>
                          </Text>
                          <Text style={[styles.rxDetailText, { color: colors.textSecondary }]}>
                             Frequência: <Text style={{ color: colors.text, fontWeight: '700' }}>{rx.frequency}</Text>
                          </Text>
                          <Text style={[styles.rxDetailText, { color: colors.textSecondary }]}>
                             Duração: <Text style={{ color: colors.text, fontWeight: '700' }}>{rx.duration}</Text>
                          </Text>
                        </View>
                        {!!rx.instructions && (
                          <Text style={[styles.rxNote, { color: colors.textMuted }]}>
                            Instrução: {rx.instructions}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* ORIENTAÇÕES GERAIS */}
                {report.instructions ? (
                  <View style={styles.sectionBlock}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Orientações Gerais & Cuidados Especiais
                    </Text>
                    <View
                      style={[
                        styles.textBox,
                        { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.bodyText, { color: colors.text }]}>
                        {report.instructions}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* RETORNO RECOMENDADO */}
                {report.followUpDate ? (
                  <View
                    style={[
                      styles.followUpBox,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Calendar size={18} color="#7c3aed" />
                    <Text style={[styles.followUpText, { color: colors.text }]}>
                      Data recomendada para retorno / reavaliação:{' '}
                      <Text style={{ fontWeight: '800', color: '#7c3aed' }}>
                        {report.followUpDate}
                      </Text>
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>

          {/* RODAPÉ COM AÇÕES */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={handlePrint}
              style={[
                styles.actionBtnSecondary,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Printer size={16} color={colors.text} />
              <Text style={[styles.actionBtnSecondaryText, { color: colors.text }]}>
                {Platform.OS === 'web' ? 'Imprimir laudo' : 'Compartilhar laudo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.actionBtnPrimary, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnPrimaryText}>Fechar Prontuário</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 760,
    maxHeight: '92%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  clinicalBadgeBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clinicOfficialName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  clinicOfficialSub: {
    fontSize: 11,
    marginTop: 2,
  },
  dateStampBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dateStampText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaCard: {
    flex: 1,
    minWidth: 240,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  metaCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaCardValue: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  metaCardSub: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionBlock: {
    marginTop: 4,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  vitalItem: {
    flex: 1,
    minWidth: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  vitalValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  textBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  prescriptionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  rxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rxNumber: {
    fontSize: 13,
    fontWeight: '800',
  },
  rxMedication: {
    fontSize: 15,
    fontWeight: '800',
  },
  rxDetails: {
    gap: 4,
    marginBottom: 6,
  },
  rxDetailText: {
    fontSize: 12,
  },
  rxNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  followUpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  followUpText: {
    fontSize: 13,
  },
  emptyReportBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  emptyReportTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyReportDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
