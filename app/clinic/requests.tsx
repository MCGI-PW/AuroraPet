import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, Clock, MessageSquare, XCircle } from 'lucide-react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAdministrativeRequests } from '../../src/hooks/useRequests';
import { ScreenScroll } from '../../src/components/common/ScreenScroll';
import { ChoiceChips } from '../../src/components/forms/ChoiceChips';
import { RequestDecisionModal } from '../../src/components/clinic/RequestDecisionModal';
import { isPendingRequest, PRIORITY_COLORS, PRIORITY_LABELS, REQUEST_STATUS } from '../../src/domain/requestRules';
import { formatDate } from '../../src/domain/appointmentRules';
import { AdministrativeRequest, RequestStatus } from '../../src/types/administrativeRequest';

type Filter = 'ALL' | 'PENDING' | 'RESOLVED';

/** Administração analisa e responde as solicitações enviadas pelos veterinários. */
export default function ClinicRequestsPage() {
  const { colors } = useTheme();
  const { data: requests = [], isLoading, isError, error } = useAdministrativeRequests();
  const [filter, setFilter] = useState<Filter>('PENDING');
  const [decision, setDecision] = useState<{ request: AdministrativeRequest; status: RequestStatus } | null>(null);

  const pending = requests.filter((r) => isPendingRequest(r.status));
  const filtered =
    filter === 'ALL' ? requests : filter === 'PENDING' ? pending : requests.filter((r) => !isPendingRequest(r.status));

  return (
    <ScreenScroll>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <MessageSquare size={13} color={colors.accent} />
          <Text style={[styles.badgeText, { color: colors.accent }]}>Comunicação administrativa da equipe</Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Solicitações dos veterinários</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Pedidos de escala, materiais e comunicados internos enviados pelo corpo clínico.
        </Text>
      </View>

      <ChoiceChips
        options={[
          { value: 'PENDING', label: `Pendentes (${pending.length})` },
          { value: 'RESOLVED', label: `Respondidas (${requests.length - pending.length})` },
          { value: 'ALL', label: `Todas (${requests.length})` },
        ]}
        value={filter}
        onChange={(v) => setFilter(v as Filter)}
      />

      {isLoading && <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 32 }} />}
      {isError && <Text style={styles.error}>{(error as Error).message}</Text>}
      {!isLoading && filtered.length === 0 && (
        <Text style={[styles.empty, { color: colors.textSecondary, borderColor: colors.border }]}>
          Nenhuma solicitação neste filtro.
        </Text>
      )}

      {filtered.map((request) => {
        const status = REQUEST_STATUS[request.status];
        return (
          <View key={request.id} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <Text style={[styles.priority, { color: PRIORITY_COLORS[request.priority] }]}>
                ● Prioridade {PRIORITY_LABELS[request.priority]}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
            <Text style={[styles.requestTitle, { color: colors.text }]}>{request.title}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {request.veterinarianName} • {request.crmv} • {formatDate(request.createdAt.slice(0, 10))}
            </Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{request.description}</Text>

            {!!request.adminFeedback && (
              <Text style={[styles.feedback, { color: colors.text, backgroundColor: colors.surfaceSubtle }]}>
                Parecer: {request.adminFeedback}
                {request.resolvedByAdminName ? ` — ${request.resolvedByAdminName}` : ''}
              </Text>
            )}

            {isPendingRequest(request.status) && (
              <View style={styles.actions}>
                <ActionButton label="Aprovar" color="#059669" icon={<CheckCircle2 size={14} color="#ffffff" />} onPress={() => setDecision({ request, status: 'APPROVED' })} />
                {request.status === 'OPEN' && (
                  <ActionButton label="Em análise" color="#d97706" icon={<Clock size={14} color="#ffffff" />} onPress={() => setDecision({ request, status: 'IN_REVIEW' })} />
                )}
                <ActionButton label="Recusar" color="#dc2626" icon={<XCircle size={14} color="#ffffff" />} onPress={() => setDecision({ request, status: 'REJECTED' })} />
              </View>
            )}
          </View>
        );
      })}

      <RequestDecisionModal
        request={decision?.request ?? null}
        targetStatus={decision?.status ?? 'APPROVED'}
        onClose={() => setDecision(null)}
      />
    </ScreenScroll>
  );
}

const ActionButton: React.FC<{ label: string; color: string; icon: React.ReactNode; onPress: () => void }> = ({ label, color, icon, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.actionBtn, { backgroundColor: color }]}>
    {icon}
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  header: { marginBottom: 16, gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  error: { color: '#dc2626', fontSize: 13, marginTop: 16 },
  empty: { fontSize: 13, textAlign: 'center', padding: 24, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, marginTop: 16 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, gap: 6 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priority: { fontSize: 12, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  requestTitle: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12 },
  description: { fontSize: 13, lineHeight: 19 },
  feedback: { fontSize: 12, padding: 10, borderRadius: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  actionText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
});
