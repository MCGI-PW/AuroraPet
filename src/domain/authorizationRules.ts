import { AuthorizationDuration, AuthorizationStatus } from '../types/authorization';

/** Prazos de acesso ao prontuário oferecidos ao tutor. */
export const AUTHORIZATION_DURATIONS: { value: AuthorizationDuration; label: string }[] = [
  { value: 30, label: '30 dias' },
  { value: 90, label: '90 dias' },
  { value: 365, label: '1 ano' },
  { value: null, label: 'Até revogar' },
];

export const AUTHORIZATION_STATUS: Record<AuthorizationStatus, { label: string; color: string; background: string }> = {
  ACTIVE: { label: 'Ativo', color: '#047857', background: '#d1fae5' },
  PENDING: { label: 'Pendente', color: '#92400e', background: '#fef3c7' },
  REVOKED: { label: 'Revogado', color: '#991b1b', background: '#fee2e2' },
  EXPIRED: { label: 'Expirado', color: '#475569', background: '#e2e8f0' },
};
