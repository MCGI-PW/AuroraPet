import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { showMessage } from '../../src/utils/confirm';
import { useAdministrativeRequests, useUpdateRequestStatus } from '../../src/hooks/useRequests';
import {
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Sparkles,
  X,
  Send,
} from 'lucide-react-native';
import {
  AdministrativeRequest,
  RequestPriority,
  RequestStatus,
} from '../../src/types/administrativeRequest';

export default function ClinicRequestsPage() {
  const { colors, isDark } = useTheme();

  const { data: requests = [], isLoading } = useAdministrativeRequests();
  const updateStatusMutation = useUpdateRequestStatus();

  const [selectedReq, setSelectedReq] = useState<AdministrativeRequest | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [targetStatus, setTargetStatus] = useState<RequestStatus>('APPROVED');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('ALL');

  const handleOpenActionModal = (req: AdministrativeRequest, status: RequestStatus) => {
    setSelectedReq(req);
    setTargetStatus(status);
    setFeedbackInput(req.adminFeedback || '');
  };

  // O nome do administrador que responde é registrado pela API a partir do token.
  const handleConfirmAction = () => {
    if (!selectedReq) return;
    updateStatusMutation.mutate(
      { requestId: selectedReq.id, status: targetStatus, feedback: feedbackInput.trim() || undefined },
      {
        onSuccess: () => {
          setSelectedReq(null);
          setFeedbackInput('');
        },
        onError: (err) => showMessage('Não foi possível atualizar', err.message),
      }
    );
  };

  const getPriorityColor = (priority: RequestPriority) => {
    switch (priority) {
      case 'URGENT':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'NORMAL':
        return '#0284c7';
      case 'LOW':
      default:
        return '#64748b';
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'APPROVED':
        return { label: 'Aprovada', bg: '#ecfdf5', text: '#065f46', icon: CheckCircle2 };
      case 'REJECTED':
        return { label: 'Recusada', bg: '#fef2f2', text: '#991b1b', icon: XCircle };
      case 'IN_REVIEW':
        return { label: 'Em Análise', bg: '#fffbeb', text: '#92400e', icon: Clock };
      case 'OPEN':
      default:
        return { label: 'Aberta', bg: '#eff6ff', text: '#1e40af', icon: AlertTriangle };
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'PENDING') return r.status === 'OPEN' || r.status === 'IN_REVIEW';
    if (filter === 'RESOLVED') return r.status === 'APPROVED' || r.status === 'REJECTED';
    return true;
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando solicitações administrativas...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primaryLight,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
              },
            ]}
          >
            <Sparkles size={13} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              Comunicação administrativa da equipe
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Solicitações dos Veterinários
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Analise pedidos de escala, aquisição de materiais e comunicados internos enviados pelo
          corpo clínico.
        </Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filterRow}>
        {(['ALL', 'PENDING', 'RESOLVED'] as const).map((key) => {
          const isSelected = filter === key;
          const label =
            key === 'ALL'
              ? `Todas (${requests.length})`
              : key === 'PENDING'
              ? 'Pendentes'
              : 'Concluídas';
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(key)}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  { color: isSelected ? '#ffffff' : colors.textSecondary },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LISTA DE SOLICITAÇÕES */}
      <View style={styles.list}>
        {filteredRequests.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface }]}>
            <FileText size={32} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhuma solicitação encontrada
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              As solicitações enviadas pelos veterinários vinculados à clínica aparecerão aqui.
            </Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const priorityColor = getPriorityColor(req.priority);
            const statusConfig = getStatusBadge(req.status);
            const StatusIcon = statusConfig.icon;

            return (
              <View
                key={req.id}
                style={[
                  styles.card,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.priorityPill,
                          { borderColor: priorityColor, backgroundColor: `${priorityColor}15` },
                        ]}
                      >
                        <Text style={[styles.priorityText, { color: priorityColor }]}>
                          Prioridade {req.priority}
                        </Text>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: statusConfig.bg }]}>
                        <StatusIcon size={12} color={statusConfig.text} />
                        <Text style={[styles.statusText, { color: statusConfig.text }]}>
                          {statusConfig.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.reqTitle, { color: colors.text }]}>{req.title}</Text>
                    <Text style={[styles.vetAuthor, { color: colors.textSecondary }]}>
                      Enviado por{' '}
                      <Text style={{ fontWeight: '700', color: colors.text }}>
                        {req.veterinarianName}
                      </Text>{' '}
                      ({req.crmv}) • {req.createdAt}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.reqDesc, { color: colors.textSecondary }]}>
                  {req.description}
                </Text>

                {!!req.adminFeedback && (
                  <View
                    style={[
                      styles.feedbackPreview,
                      { backgroundColor: colors.surfaceSubtle },
                    ]}
                  >
                    <MessageSquare size={14} color={colors.accent} />
                    <Text style={[styles.feedbackPreviewText, { color: colors.textSecondary }]}>
                      <Text style={{ fontWeight: '700' }}>Parecer da Clínica:</Text>{' '}
                      {req.adminFeedback}
                    </Text>
                  </View>
                )}

                {/* BOTÕES DE AÇÃO DO ADMINISTRADOR */}
                {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      onPress={() => handleOpenActionModal(req, 'APPROVED')}
                      style={[styles.btnAction, { backgroundColor: '#065f46' }]}
                    >
                      <CheckCircle2 size={15} color="#ffffff" />
                      <Text style={styles.btnActionText}>Aprovar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenActionModal(req, 'IN_REVIEW')}
                      style={[
                        styles.btnAction,
                        { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                      ]}
                    >
                      <Clock size={15} color={colors.text} />
                      <Text style={[styles.btnActionText, { color: colors.text }]}>
                        Marcar em Análise
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleOpenActionModal(req, 'REJECTED')}
                      style={[styles.btnAction, { backgroundColor: '#991b1b' }]}
                    >
                      <XCircle size={15} color="#ffffff" />
                      <Text style={styles.btnActionText}>Recusar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* MODAL DE PARECER / AVALIAÇÃO */}
      <Modal visible={!!selectedReq} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setSelectedReq(null)}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {targetStatus === 'APPROVED'
                  ? 'Aprovar Solicitação'
                  : targetStatus === 'REJECTED'
                  ? 'Recusar Solicitação'
                  : 'Colocar em Análise'}
              </Text>
              <TouchableOpacity onPress={() => setSelectedReq(null)}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              "{selectedReq?.title}" — {selectedReq?.veterinarianName}
            </Text>

            <View style={{ marginTop: 14, marginBottom: 18 }}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Parecer / Mensagem para o Médico Veterinário:
              </Text>
              <TextInput
                placeholder="Insira observações, instruções ou justificativa..."
                placeholderTextColor={colors.textMuted}
                value={feedbackInput}
                onChangeText={setFeedbackInput}
                multiline
                numberOfLines={3}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setSelectedReq(null)}
                style={[styles.modalBtnCancel, { backgroundColor: colors.surfaceSubtle }]}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmAction}
                style={[
                  styles.modalBtnConfirm,
                  {
                    backgroundColor:
                      targetStatus === 'APPROVED'
                        ? '#065f46'
                        : targetStatus === 'REJECTED'
                        ? '#991b1b'
                        : '#0284c7',
                  },
                ]}
              >
                <Send size={15} color="#ffffff" />
                <Text style={styles.modalBtnConfirmText}>Salvar e Notificar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reqTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },
  vetAuthor: {
    fontSize: 12,
  },
  reqDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  feedbackPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  feedbackPreviewText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  btnAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 14,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 400,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textArea: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnConfirmText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
