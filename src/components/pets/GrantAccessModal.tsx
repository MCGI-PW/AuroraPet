import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShieldCheck, X } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSpecialists } from '../../hooks/useClinic';
import { useGrantAuthorization } from '../../hooks/useAuthorizations';
import { AUTHORIZATION_DURATIONS } from '../../domain/authorizationRules';
import { AuthorizationDuration } from '../../types/authorization';
import { Pet } from '../../types/pet';
import { Avatar } from '../common/Avatar';

interface GrantAccessModalProps {
  pet: Pet;
  visible: boolean;
  onClose: () => void;
  onGranted: (veterinarianName: string) => void;
}

/** Tutor concede a um veterinário acesso ao prontuário do pet, com prazo. */
export const GrantAccessModal: React.FC<GrantAccessModalProps> = ({ pet, visible, onClose, onGranted }) => {
  const { colors } = useTheme();
  const { data: specialists = [], isLoading } = useSpecialists();
  const grant = useGrantAuthorization();
  const [veterinarianId, setVeterinarianId] = useState('');
  const [duration, setDuration] = useState<AuthorizationDuration>(365);

  const handleGrant = () => {
    const vet = specialists.find((s) => s.id === veterinarianId);
    if (!vet) return;
    grant.mutate(
      { petId: pet.id, veterinarianId, durationDays: duration },
      {
        onSuccess: () => {
          setVeterinarianId('');
          onGranted(vet.name);
        },
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Conceder acesso ao prontuário</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Fechar">
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            O veterinário poderá consultar os dados de {pet.name} até a data escolhida ou até você revogar.
          </Text>

          <Text style={[styles.label, { color: colors.text }]}>Veterinário</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <ScrollView style={styles.vetList}>
              {specialists.filter((s) => s.active !== false).map((vet) => {
                const selected = vet.id === veterinarianId;
                return (
                  <TouchableOpacity
                    key={vet.id}
                    onPress={() => setVeterinarianId(vet.id)}
                    style={[
                      styles.vetItem,
                      { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle },
                    ]}
                  >
                    <Avatar name={vet.name} photoUrl={vet.photoUrl} size={36} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.vetName, { color: colors.text }]}>{vet.name}</Text>
                      <Text style={[styles.vetMeta, { color: colors.textSecondary }]}>
                        {vet.specialty} • {vet.crmv}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <Text style={[styles.label, { color: colors.text }]}>Prazo do acesso</Text>
          <View style={styles.durationRow}>
            {AUTHORIZATION_DURATIONS.map((option) => {
              const selected = option.value === duration;
              return (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => setDuration(option.value)}
                  style={[
                    styles.durationChip,
                    { borderColor: selected ? colors.accent : colors.border, backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle },
                  ]}
                >
                  <Text style={[styles.durationText, { color: selected ? colors.accent : colors.text }]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {grant.error && <Text style={styles.error}>{grant.error.message}</Text>}

          <TouchableOpacity
            onPress={handleGrant}
            disabled={!veterinarianId || grant.isPending}
            style={[styles.submit, (!veterinarianId || grant.isPending) && styles.submitDisabled]}
          >
            {grant.isPending ? <ActivityIndicator color="#ffffff" /> : <ShieldCheck size={16} color="#ffffff" />}
            <Text style={styles.submitText}>Autorizar acesso</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', flex: 1 },
  subtitle: { fontSize: 13, marginTop: 6, marginBottom: 12, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '700', marginTop: 8, marginBottom: 8 },
  vetList: { maxHeight: 220 },
  vetItem: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  vetName: { fontSize: 14, fontWeight: '700' },
  vetMeta: { fontSize: 12 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  durationChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  durationText: { fontSize: 13, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 12, marginTop: 10 },
  submit: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064e3b',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});
