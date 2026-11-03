import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Send, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useCreateRequest } from '../../hooks/useRequests';
import { RequestPriority } from '../../types/administrativeRequest';
import { ChoiceChips } from '../forms/ChoiceChips';
import { PRIORITY_LABELS } from '../../domain/requestRules';

interface NewRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Veterinário envia uma solicitação administrativa (férias, insumos, escala...). */
export const NewRequestModal: React.FC<NewRequestModalProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const createRequest = useCreateRequest();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('NORMAL');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (title.trim().length < 4 || description.trim().length < 10) {
      return setError('Informe um título (mín. 4 caracteres) e uma descrição (mín. 10).');
    }
    setError(null);
    createRequest.mutate(
      { title: title.trim(), description: description.trim(), priority },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setPriority('NORMAL');
          onClose();
        },
        onError: (err) => setError(err.message),
      }
    );
  };

  const inputStyle = [styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSubtle }];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Nova solicitação à clínica</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar">
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Título</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Reposição de vacinas V10" placeholderTextColor={colors.textMuted} style={inputStyle} />

          <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholder="Detalhe o pedido para a administração"
            placeholderTextColor={colors.textMuted}
            style={[inputStyle, styles.textArea]}
          />

          <Text style={[styles.label, { color: colors.text }]}>Prioridade</Text>
          <ChoiceChips
            options={(Object.keys(PRIORITY_LABELS) as RequestPriority[]).map((p) => ({ value: p, label: PRIORITY_LABELS[p] }))}
            value={priority}
            onChange={(v) => setPriority(v as RequestPriority)}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity onPress={handleSubmit} disabled={createRequest.isPending} style={styles.submit}>
            {createRequest.isPending ? <ActivityIndicator color="#ffffff" /> : <Send size={16} color="#ffffff" />}
            <Text style={styles.submitText}>Enviar solicitação</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '800', flex: 1 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  error: { color: '#dc2626', fontSize: 12, marginTop: 10 },
  submit: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#064e3b', paddingVertical: 13, borderRadius: 12, marginTop: 16 },
  submitText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
