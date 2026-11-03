export type UserRole = 'tutor' | 'veterinarian' | 'clinic_admin';

/** Perfil do usuário armazenado na API (vinculado ao uid do Firebase). */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: UserRole;
  profileCompleted: boolean;
  /** Veterinário: especialista do corpo clínico vinculado à conta. */
  specialistId?: string;
  crmv?: string;
  specialty?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  crmv?: string;
  specialty?: string;
}

export interface UpdateProfileInput {
  displayName?: string;
  phoneNumber?: string;
  role?: UserRole;
  crmv?: string;
  specialty?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  tutor: 'Tutor',
  veterinarian: 'Médico(a) Veterinário(a)',
  clinic_admin: 'Administração da Clínica',
};
