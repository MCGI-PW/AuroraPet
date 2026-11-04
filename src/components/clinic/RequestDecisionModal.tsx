import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useUpdateRequestStatus } from '../../hooks/useRequests';
import { AdministrativeRequest, RequestStatus } from '../../types/administrativeRequest';
import { REQUEST_STATUS } from '../../domain/requestRules';

interface RequestDecisionModalProps {
  request: AdministrativeRequest | null;
  targetStatus: RequestStatus;
  onClose: () => void;
}

/** Administração responde a uma solicitação com o novo status e um parecer. */
export const RequestDecisionModal: React.FC<RequestDecisionModalProps> = ({ request, targetStatus, onClose }) => {
  const { colors } = useTheme();
  const updateStatus = useUpdateRequestStatus();
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setFeedback(request?.adminFeedback ?? '');
    updateStatus.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  if (!request) return null;
  const status = REQUEST_STATUS[targetStatus];

  const handleConfirm = () =>
    updateStatus.mutate(
      { requestId: request.id, status: targetStatus, feedback: feedback.trim() || undefined },
      { onSuccess: onClose }
    );

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Marcar como “{status.label}”</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar">
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {request.title} — {request.veterinarianName}
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>
            Parecer da clínica{targetStatus === 'REJECTED' ? ' *' : ''}
          </Text>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            multiline
            placeholder="Explique a decisão para o veterinário"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
          />

          {updateStatus.error && <Text style={styles.error}>{updateStatus.error.message}</Text>}

          <TouchableOpacity onPress={handleConfirm} disabled={updateStatus.isPending} style={[styles.confirm, { backgroundColor: status.color }]}>
            {updateStatus.isPending && <ActivityIndicator color="#ffffff" />}
            <Text style={styles.confirmText}>Confirmar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', flex: 1 },
  subtitle: { fontSize: 13, marginTop: 6 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, minHeight: 90, textAlignVertical: 'top', fontSize: 14 },
  error: { color: '#dc2626', fontSize: 12, marginTop: 10 },
  confirm: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 12, marginTop: 16 },
  confirmText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
