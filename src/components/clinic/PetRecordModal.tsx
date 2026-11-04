import React from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { usePet } from '../../hooks/usePets';
import { useAppointments } from '../../hooks/useAppointments';
import { speciesLabel } from '../../domain/petRules';
import { formatDate } from '../../domain/appointmentRules';
import { PetAvatar } from '../pets/PetAvatar';
import { AppointmentStatusBadge } from '../appointments/AppointmentStatusBadge';

interface PetRecordModalProps {
  petId: string | null;
  onClose: () => void;
}

/** Prontuário (somente leitura) de um pet que autorizou o acesso ao veterinário. */
export const PetRecordModal: React.FC<PetRecordModalProps> = ({ petId, onClose }) => {
  const { colors } = useTheme();
  const { data: pet, isLoading, error } = usePet(petId ?? undefined);
  const { data: appointments = [] } = useAppointments({ enabled: Boolean(petId) });
  const history = appointments.filter((a) => a.petId === petId);

  return (
    <Modal visible={Boolean(petId)} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Prontuário do paciente</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar">
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {isLoading && <ActivityIndicator color={colors.accent} />}
          {error && <Text style={styles.error}>{(error as Error).message}</Text>}

          {pet && (
            <ScrollView>
              <View style={styles.petRow}>
                <PetAvatar pet={pet} size={60} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>
                    {speciesLabel(pet.species)} • {pet.breed} • {pet.age}
                  </Text>
                  {!!pet.weight && <Text style={[styles.meta, { color: colors.textSecondary }]}>Peso: {pet.weight}</Text>}
                </View>
              </View>
              <Text style={[styles.section, { color: colors.text }]}>Histórico / alergias</Text>
              <Text style={[styles.notes, { color: colors.textSecondary, backgroundColor: colors.surfaceSubtle }]}>
                {pet.notes || 'Nenhuma observação registrada pelo tutor.'}
              </Text>

              <Text style={[styles.section, { color: colors.text }]}>Consultas</Text>
              {history.length === 0 && <Text style={[styles.meta, { color: colors.textSecondary }]}>Sem consultas registradas.</Text>}
              {history.map((a) => (
                <View key={a.id} style={[styles.historyItem, { borderColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.historyTitle, { color: colors.text }]}>{a.serviceName}</Text>
                    <Text style={[styles.meta, { color: colors.textSecondary }]}>
                      {formatDate(a.date)} • {a.specialistName}
                    </Text>
                    {a.report && <Text style={[styles.meta, { color: colors.text }]}>Diagnóstico: {a.report.diagnosis}</Text>}
                  </View>
                  <AppointmentStatusBadge status={a.status} />
                </View>
              ))}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, padding: 20, maxHeight: '85%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  title: { fontSize: 17, fontWeight: '800' },
  error: { color: '#dc2626', fontSize: 13 },
  petRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  petName: { fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 13, marginTop: 2 },
  section: { fontSize: 14, fontWeight: '800', marginTop: 18, marginBottom: 8 },
  notes: { fontSize: 13, padding: 12, borderRadius: 12, lineHeight: 19 },
  historyItem: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  historyTitle: { fontSize: 14, fontWeight: '700' },
});
