export type AuthorizationStatus = 'ACTIVE' | 'PENDING' | 'REVOKED' | 'EXPIRED';

export interface PetAccessAuthorization {
  id: string;
  petId: string;
  petName: string;
  tutorId: string;
  tutorName?: string;
  veterinarianId: string;
  veterinarianName: string;
  crmv: string;
  clinicId?: string;
  clinicName?: string;
  authorizedAt: string;
  expiresAt?: string;
  status: AuthorizationStatus;
  revocationReason?: string;
  revokedAt?: string;
}

export type AuthorizationDuration = 30 | 90 | 365 | null;

export interface GrantAuthorizationInput {
  petId: string;
  veterinarianId: string;
  /** Prazo em dias; null = sem data de expiração (até ser revogado). */
  durationDays: AuthorizationDuration;
}
