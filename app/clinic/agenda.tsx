import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { ROUTES } from '../../src/navigation/routes';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAppointments } from '../../src/hooks/useAppointments';
import { useSpecialists } from '../../src/hooks/useClinic';
import { ConsultationReportModal } from '../../src/components/appointments/ConsultationReportModal';
import { Appointment, AppointmentStatus } from '../../src/types/appointment';
import { Specialist } from '../../src/types/specialist';
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
} from 'lucide-react-native';
import { ScreenScroll } from '../../src/components/common/ScreenScroll';

export default function ClinicAgendaPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: appointments = [], isLoading: loadingApps } = useAppointments();
  const { data: specialists = [], isLoading: loadingSpecs } = useSpecialists();

  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');
  const [selectedVetId, setSelectedVetId] = useState<string>('all');
  const [reportAppointment, setReportAppointment] = useState<Appointment | null>(null);

  const filtered = appointments.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesVet =
      selectedVetId === 'all' ||
      item.specialistId === selectedVetId ||
      item.specialistName?.toLowerCase().includes(
        (specialists.find((s: Specialist) => s.id === selectedVetId)?.name || '').toLowerCase()
      );
    return matchesStatus && matchesVet;
  });


  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled':
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#dcfce7' }]}>
            <Text style={[styles.badgeText, { color: '#15803d' }]}>Aguardando Atendimento</Text>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#e0f2fe' }]}>
            <Text style={[styles.badgeText, { color: '#0369a1' }]}>Atendido / Concluído</Text>
          </View>
        );
      case 'cancelled':
        return (
          <View style={[styles.badgeContainer, { backgroundColor: '#fee2e2' }]}>
            <Text style={[styles.badgeText, { color: '#b91c1c' }]}>Cancelada</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenScroll>
      {/* CABEÇALHO */}
      <View style={styles.headerBox}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Agenda & Fila Clínica
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Acompanhamento em tempo real de pacientes agendados, em atendimento e prontuários
          </Text>
        </View>
      </View>

      {/* FILTROS POR VETERINÁRIO */}
      <View style={styles.filterSection}>
        <Text style={[styles.filterSectionTitle, { color: colors.textSecondary }]}>
          FILTRAR POR VETERINÁRIO DA EQUIPE:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vetFilterRow}>
          <TouchableOpacity
            onPress={() => setSelectedVetId('all')}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedVetId === 'all' ? colors.primaryLight : colors.surface,
                borderColor: selectedVetId === 'all' ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                { color: selectedVetId === 'all' ? colors.accent : colors.textSecondary },
              ]}
            >
              Todos os Médicos ({appointments.length})
            </Text>
          </TouchableOpacity>

          {specialists.map((vet: Specialist) => {
            const count = appointments.filter(
              (a) => a.specialistId === vet.id || a.specialistName?.includes(vet.name)
            ).length;
            const isSelected = selectedVetId === vet.id;

            return (
              <TouchableOpacity
                key={vet.id}
                onPress={() => setSelectedVetId(vet.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? colors.accent : colors.textSecondary },
                  ]}
                >
                  {vet.name} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FILTROS POR STATUS */}
      <View style={styles.statusFilterRow}>
        {(['all', 'scheduled', 'completed', 'cancelled'] as const).map((st) => {
          const isSelected = statusFilter === st;
          const label =
            st === 'all'
              ? 'Todas as Consultas'
              : st === 'scheduled'
              ? 'Aguardando'
              : st === 'completed'
              ? 'Concluídas'
              : 'Canceladas';

          return (
            <TouchableOpacity
              key={st}
              onPress={() => setStatusFilter(st)}
              style={[
                styles.statusBtn,
                {
                  backgroundColor: isSelected ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe') : colors.surface,
                  borderColor: isSelected ? '#3b82f6' : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  {
                    color: isSelected ? '#2563eb' : colors.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LISTA DE CONSULTAS */}
      {loadingApps || loadingSpecs ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Carregando agenda clínica...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <CalendarDays size={40} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Nenhuma consulta encontrada com esses filtros
          </Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Tente selecionar outro veterinário ou alternar o status no filtro acima.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {filtered.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.petHeaderInfo}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                    <Stethoscope size={20} color={colors.accent} />
                  </View>
                  <View>
                    <Text style={[styles.petTitle, { color: colors.text }]}>
                      Paciente: {item.petName}
                    </Text>
                    <Text style={[styles.serviceTitle, { color: colors.textSecondary }]}>
                      Procedimento: {item.serviceName}
                    </Text>
                  </View>
                </View>
                {getStatusBadge(item.status)}
              </View>

              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

              <View style={styles.cardBody}>
                <View style={styles.bodyMetaRow}>
                  <View style={styles.metaItem}>
                    <User size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Médico: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.specialistName}</Text>
                    </Text>
                  </View>

                  <View style={styles.metaItem}>
                    <Clock size={14} color={colors.textSecondary} />
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Agendado para: <Text style={{ color: colors.text, fontWeight: '700' }}>{item.date} às {item.time}</Text>
                    </Text>
                  </View>
                </View>

                {item.notes ? (
                  <View
                    style={[
                      styles.notesBox,
                      { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
                      Queixa / Nota do Tutor:
                    </Text>
                    <Text style={[styles.notesText, { color: colors.text }]}>
                      {item.notes}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* AÇÕES DA CLÍNICA */}
              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                {item.status === 'scheduled' ? (
                  <TouchableOpacity
                    onPress={() => router.push(ROUTES.clinic.attendance(item.id) as Href)}
                    style={[styles.attendBtn, { backgroundColor: colors.accent }]}
                    activeOpacity={0.8}
                  >
                    <Stethoscope size={16} color="#ffffff" />
                    <Text style={styles.attendBtnText}>Iniciar Atendimento Clínico</Text>
                    <ArrowRight size={14} color="#ffffff" />
                  </TouchableOpacity>
                ) : item.status === 'completed' ? (
                  <TouchableOpacity
                    onPress={() => setReportAppointment(item)}
                    style={[
                      styles.viewReportBtn,
                      {
                        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0',
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <FileText size={16} color="#10b981" />
                    <Text style={[styles.viewReportBtnText, { color: '#10b981' }]}>
                      Ver Prontuário / Relatório Emitido
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.cancelledText, { color: colors.textMuted }]}>
                    Consulta cancelada pelo tutor
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* MODAL DE PRONTUÁRIO */}
      <ConsultationReportModal
        visible={Boolean(reportAppointment)}
        onClose={() => setReportAppointment(null)}
        appointment={reportAppointment}
      />
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 18,
  },
  headerBox: {
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  filterSection: {
    gap: 8,
  },
  filterSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  vetFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusFilterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusBtnText: {
    fontSize: 12,
  },
  loadingBox: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyBox: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
  },
  listContainer: {
    gap: 14,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  petHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  serviceTitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    width: '100%',
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  bodyMetaRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
  },
  notesBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  attendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  attendBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  viewReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  viewReportBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelledText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
