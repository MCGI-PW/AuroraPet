import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { CalendarClock, ChevronRight, FileText, PawPrint, Plus, ShieldCheck, Stethoscope } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppointments } from '../../src/hooks/useAppointments';
import { useMyAuthorizations } from '../../src/hooks/useAuthorizations';
import { useAdministrativeRequests } from '../../src/hooks/useRequests';
import { ScreenScroll } from '../../src/components/common/ScreenScroll';
import { NewRequestModal } from '../../src/components/clinic/NewRequestModal';
import { PetRecordModal } from '../../src/components/clinic/PetRecordModal';
import { formatDate, isUpcoming } from '../../src/domain/appointmentRules';
import { PRIORITY_COLORS, PRIORITY_LABELS, REQUEST_STATUS } from '../../src/domain/requestRules';
import { ROUTES } from '../../src/navigation/routes';

/**
 * Portal do Veterinário: agenda própria, pacientes que autorizaram o acesso
 * ao prontuário e solicitações enviadas à administração.
 */
export default function VetPortalPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();

  const { data: appointments = [], isLoading: loadingAgenda } = useAppointments();
  const { data: authorizations = [], isLoading: loadingAuthorizations } = useMyAuthorizations();
  const { data: requests = [], isLoading: loadingRequests } = useAdministrativeRequests();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [recordPetId, setRecordPetId] = useState<string | null>(null);

  const myAgenda = appointments.filter((a) => a.specialistId === user?.specialistId && isUpcoming(a));
  const activeAuthorizations = authorizations.filter((a) => a.status === 'ACTIVE');

  return (
    <ScreenScroll>
      <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.avatar}>
          <Stethoscope size={24} color="#ffffff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.vetName, { color: colors.text }]}>{user?.displayName}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {user?.specialty || 'Clínica Geral'} • {user?.crmv}
          </Text>
        </View>
      </View>

      <Section title="Minha agenda" subtitle="Próximas consultas atribuídas a você" icon={<CalendarClock size={18} color={colors.accent} />}>
        {loadingAgenda && <ActivityIndicator color={colors.accent} />}
        {!loadingAgenda && myAgenda.length === 0 && <Empty text="Nenhuma consulta agendada para você." />}
        {myAgenda.map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() => router.push(ROUTES.clinic.attendance(a.id) as Href)}
            style={[styles.item, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>
                {formatDate(a.date)} às {a.time} • {a.petName}
              </Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {a.serviceName} • Tutor: {a.tutorName ?? '—'}
              </Text>
            </View>
            <Text style={[styles.link, { color: colors.accent }]}>Atender</Text>
            <ChevronRight size={16} color={colors.accent} />
          </TouchableOpacity>
        ))}
      </Section>

      <Section
        title="Pacientes autorizados"
        subtitle="Prontuários que os tutores liberaram para você"
        icon={<ShieldCheck size={18} color={colors.accent} />}
      >
        {loadingAuthorizations && <ActivityIndicator color={colors.accent} />}
        {!loadingAuthorizations && activeAuthorizations.length === 0 && <Empty text="Nenhum tutor concedeu acesso ainda." />}
        {activeAuthorizations.map((a) => (
          <TouchableOpacity
            key={a.id}
            onPress={() => setRecordPetId(a.petId)}
            style={[styles.item, { borderColor: colors.border, backgroundColor: colors.surface }]}
          >
            <PawPrint size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{a.petName}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                Tutor: {a.tutorName ?? '—'} • {a.expiresAt ? `até ${formatDate(a.expiresAt)}` : 'sem prazo'}
              </Text>
            </View>
            <FileText size={16} color={colors.accent} />
          </TouchableOpacity>
        ))}
      </Section>

      <Section title="Minhas solicitações" subtitle="Pedidos enviados à administração" icon={<FileText size={18} color={colors.accent} />}>
        <TouchableOpacity onPress={() => setRequestModalOpen(true)} style={styles.newBtn}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.newBtnText}>Nova solicitação</Text>
        </TouchableOpacity>
        {loadingRequests && <ActivityIndicator color={colors.accent} />}
        {!loadingRequests && requests.length === 0 && <Empty text="Você ainda não enviou solicitações." />}
        {requests.map((r) => {
          const status = REQUEST_STATUS[r.status];
          return (
            <View key={r.id} style={[styles.requestCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={styles.requestHeader}>
                <Text style={[styles.itemTitle, { color: colors.text, flex: 1 }]}>{r.title}</Text>
                <View style={[styles.badge, { backgroundColor: status.background }]}>
                  <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>
              <Text style={[styles.meta, { color: PRIORITY_COLORS[r.priority] }]}>Prioridade {PRIORITY_LABELS[r.priority]}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{r.description}</Text>
              {!!r.adminFeedback && (
                <Text style={[styles.feedback, { color: colors.text, backgroundColor: colors.primaryLight }]}>
                  Parecer: {r.adminFeedback}
                </Text>
              )}
            </View>
          );
        })}
      </Section>

      <NewRequestModal visible={requestModalOpen} onClose={() => setRequestModalOpen(false)} />
      <PetRecordModal petId={recordPetId} onClose={() => setRecordPetId(null)} />
    </ScreenScroll>
  );
}

const Section: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
};

const Empty: React.FC<{ text: string }> = ({ text }) => {
  const { colors } = useTheme();
  return <Text style={[styles.empty, { color: colors.textSecondary, borderColor: colors.border }]}>{text}</Text>;
};

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1 },
  avatar: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#0284c7', justifyContent: 'center', alignItems: 'center' },
  vetName: { fontSize: 19, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 2 },
  section: { marginTop: 22, gap: 8 },
  sectionHeader: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700' },
  link: { fontSize: 13, fontWeight: '700' },
  empty: { fontSize: 13, textAlign: 'center', padding: 16, borderWidth: 1, borderStyle: 'dashed', borderRadius: 14 },
  newBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#064e3b', paddingVertical: 12, borderRadius: 12 },
  newBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  requestCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  feedback: { fontSize: 12, padding: 10, borderRadius: 10, marginTop: 6 },
});
