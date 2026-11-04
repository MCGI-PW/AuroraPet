import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ban, ShieldCheck, UserPlus } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { usePetAuthorizations, useRevokeAuthorization } from '../../hooks/useAuthorizations';
import { AUTHORIZATION_STATUS } from '../../domain/authorizationRules';
import { formatDate } from '../../domain/appointmentRules';
import { PetAccessAuthorization } from '../../types/authorization';
import { Pet } from '../../types/pet';
import { confirmAction, showMessage } from '../../utils/confirm';
import { GrantAccessModal } from './GrantAccessModal';

interface PetAuthorizationsPanelProps {
  pet: Pet;
  onFeedback: (message: string) => void;
}

/** Controle LGPD: quem pode consultar o prontuário do pet e até quando. */
export const PetAuthorizationsPanel: React.FC<PetAuthorizationsPanelProps> = ({ pet, onFeedback }) => {
  const { colors } = useTheme();
  const { data: authorizations = [], isLoading, isError, error } = usePetAuthorizations(pet.id);
  const revoke = useRevokeAuthorization();
  const [grantOpen, setGrantOpen] = useState(false);

  const handleRevoke = async (authorization: PetAccessAuthorization) => {
    const confirmed = await confirmAction({
      title: 'Revogar acesso',
      message: `${authorization.veterinarianName} deixará de acessar o prontuário de ${pet.name} imediatamente.`,
      confirmLabel: 'Revogar',
      destructive: true,
    });
    if (!confirmed) return;
    revoke.mutate(
      { id: authorization.id, reason: 'Acesso revogado pelo tutor no aplicativo.' },
      {
        onSuccess: () => onFeedback(`Acesso de ${authorization.veterinarianName} revogado.`),
        onError: (err) => showMessage('Erro', err.message),
      }
    );
  };

  return (
    <View>
      <View style={[styles.info, { backgroundColor: colors.primaryLight }]}>
        <ShieldCheck size={18} color={colors.accent} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Somente veterinários autorizados por você podem consultar o prontuário de {pet.name}.
        </Text>
      </View>

      <TouchableOpacity onPress={() => setGrantOpen(true)} style={styles.grantBtn}>
        <UserPlus size={16} color="#ffffff" />
        <Text style={styles.grantText}>Conceder acesso a um veterinário</Text>
      </TouchableOpacity>

      {isLoading && <ActivityIndicator color={colors.accent} style={{ marginTop: 16 }} />}
      {isError && <Text style={styles.error}>{(error as Error).message}</Text>}
      {!isLoading && authorizations.length === 0 && (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>Nenhum acesso concedido até agora.</Text>
      )}

      {authorizations.map((authorization) => {
        const status = AUTHORIZATION_STATUS[authorization.status];
        return (
          <View key={authorization.id} style={[styles.item, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.itemHeader}>
              <Text style={[styles.vetName, { color: colors.text }]}>{authorization.veterinarianName}</Text>
              <View style={[styles.badge, { backgroundColor: status.background }]}>
                <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {authorization.crmv} • desde {formatDate(authorization.authorizedAt)}
              {authorization.expiresAt ? ` • até ${formatDate(authorization.expiresAt)}` : ' • sem prazo'}
            </Text>
            {!!authorization.revocationReason && (
              <Text style={[styles.meta, { color: colors.textMuted }]}>Motivo: {authorization.revocationReason}</Text>
            )}
            {authorization.status === 'ACTIVE' && (
              <TouchableOpacity onPress={() => handleRevoke(authorization)} disabled={revoke.isPending} style={styles.revokeBtn}>
                <Ban size={14} color="#dc2626" />
                <Text style={styles.revokeText}>Revogar acesso</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      <GrantAccessModal
        pet={pet}
        visible={grantOpen}
        onClose={() => setGrantOpen(false)}
        onGranted={(name) => {
          setGrantOpen(false);
          onFeedback(`Acesso concedido para ${name}.`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  info: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  grantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 12,
    borderRadius: 12,
    marginVertical: 14,
  },
  grantText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  error: { color: '#dc2626', fontSize: 13 },
  empty: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  item: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, gap: 4 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  vetName: { fontSize: 15, fontWeight: '700', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 12 },
  revokeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, alignSelf: 'flex-start' },
  revokeText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
});
