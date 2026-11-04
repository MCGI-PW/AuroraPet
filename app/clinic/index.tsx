import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { formatDate } from '../../src/domain/appointmentRules';
import { ROUTES } from '../../src/navigation/routes';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useClinicProfile, useSpecialists } from '../../src/hooks/useClinic';
import { useAppointments } from '../../src/hooks/useAppointments';
import {
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  FileText,
  Plus,
} from 'lucide-react-native';
import { ScreenScroll } from '../../src/components/common/ScreenScroll';

export default function ClinicDashboardPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: clinic, isLoading: loadingClinic } = useClinicProfile();
  const { data: specialists = [], isLoading: loadingSpecs } = useSpecialists();
  const { data: appointments = [], isLoading: loadingApps } = useAppointments();

  const scheduledApps = appointments.filter((a) => a.status === 'scheduled');
  const completedApps = appointments.filter((a) => a.status === 'completed');

  const isLoading = loadingClinic || loadingSpecs || loadingApps;

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando indicadores da clínica...
        </Text>
      </View>
    );
  }

  return (
    <ScreenScroll>
      {/* BANNER INSTITUCIONAL DA CLÍNICA */}
      <View
        style={[
          styles.clinicBanner,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.bannerInfo}>
          <View style={[styles.clinicIconBox, { backgroundColor: colors.primaryLight }]}>
            <Building2 size={28} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.clinicTitleRow}>
              <Text style={[styles.clinicName, { color: colors.text }]}>
                {clinic?.name}
              </Text>
              <View
                style={[
                  styles.modeBadge,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                    borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0',
                  },
                ]}
              >
                <ShieldCheck size={12} color="#10b981" />
                <Text style={styles.modeBadgeText}>
                  {clinic?.mode === 'solo_vet' ? 'Consultório Autônomo' : 'Clínica Multidisciplinar'}
                </Text>
              </View>
            </View>

            <Text style={[styles.clinicDesc, { color: colors.textSecondary }]}>
              {clinic?.description || 'Gestão integrada de consultas, corpo clínico veterinário e emissão de prontuários digitais.'}
            </Text>

            <Text style={[styles.clinicAddress, { color: colors.textMuted }]}>
              📍 {clinic?.address} • 📞 {clinic?.phone}
            </Text>
          </View>
        </View>
      </View>

      {/* CARDS DE MÉTRICAS */}
      <View style={styles.metricsGrid}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Clock size={20} color="#2563eb" />
          </View>
          <Text style={[styles.metricNumber, { color: colors.text }]}>
            {scheduledApps.length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Consultas em Aberto
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <CheckCircle2 size={20} color="#10b981" />
          </View>
          <Text style={[styles.metricNumber, { color: colors.text }]}>
            {completedApps.length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Atendimentos Concluídos
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
            <Users size={20} color="#7c3aed" />
          </View>
          <Text style={[styles.metricNumber, { color: colors.text }]}>
            {specialists.length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Veterinários Ativos
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.metricIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <FileText size={20} color="#f59e0b" />
          </View>
          <Text style={[styles.metricNumber, { color: colors.text }]}>
            {completedApps.filter((a) => a.report).length}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
            Prontuários Emitidos
          </Text>
        </View>
      </View>

      {/* AÇÕES RÁPIDAS */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          onPress={() => router.push(ROUTES.clinic.agenda as Href)}
          style={[styles.quickBtnPrimary, { backgroundColor: colors.accent }]}
          activeOpacity={0.8}
        >
          <Stethoscope size={18} color="#ffffff" />
          <Text style={styles.quickBtnPrimaryText}>Abrir Fila de Atendimento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.clinic.newVet as Href)}
          style={[
            styles.quickBtnSecondary,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
        >
          <UserPlus size={18} color={colors.text} />
          <Text style={[styles.quickBtnSecondaryText, { color: colors.text }]}>
            + Novo Veterinário
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRÓXIMAS CONSULTAS PARA ATENDIMENTO */}
      <View
        style={[
          styles.sectionBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Fila de Atendimento do Dia
            </Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              Selecione uma consulta para iniciar o atendimento clínico e emitir o prontuário
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push(ROUTES.clinic.agenda as Href)}
            style={styles.seeAllBtn}
          >
            <Text style={[styles.seeAllText, { color: colors.accent }]}>Ver todas</Text>
            <ArrowRight size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {scheduledApps.length === 0 ? (
          <View style={styles.emptyBox}>
            <CheckCircle2 size={36} color="#10b981" />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Fila zerada no momento!
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Não há pacientes aguardando atendimento agora. Todas as consultas marcadas já foram concluídas.
            </Text>
          </View>
        ) : (
          scheduledApps.slice(0, 4).map((item) => (
            <View
              key={item.id}
              style={[
                styles.appointmentRow,
                { borderBottomColor: colors.border },
              ]}
            >
              <View style={styles.appRowLeft}>
                <View style={[styles.petInitialBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.petInitialText, { color: colors.accent }]}>
                    {item.petName ? item.petName.charAt(0).toUpperCase() : 'P'}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.appName, { color: colors.text }]}>
                    Paciente: {item.petName}
                  </Text>
                  <Text style={[styles.appMeta, { color: colors.textSecondary }]}>
                    {item.serviceName} • {item.specialistName}
                  </Text>
                  <Text style={[styles.appDate, { color: colors.textMuted }]}>
                    Data: {formatDate(item.date)} às {item.time}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push(ROUTES.clinic.attendance(item.id) as Href)}
                style={[styles.attendBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.8}
              >
                <Stethoscope size={14} color="#ffffff" />
                <Text style={styles.attendBtnText}>Atender Paciente</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  centerBox: {
    padding: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  clinicBanner: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  bannerInfo: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  clinicIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  clinicName: {
    fontSize: 20,
    fontWeight: '800',
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10b981',
  },
  clinicDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  clinicAddress: {
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  metricIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickBtnPrimary: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  quickBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  quickBtnSecondary: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionBox: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  appointmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  appRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 260,
  },
  petInitialBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInitialText: {
    fontSize: 18,
    fontWeight: '800',
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
  },
  appMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  appDate: {
    fontSize: 11,
    marginTop: 2,
  },
  attendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  attendBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
