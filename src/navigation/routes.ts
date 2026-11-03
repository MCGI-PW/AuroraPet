import { Href } from 'expo-router';
import { UserRole } from '../types/auth';

/**
 * Rotas da aplicação (Expo Router). Toda navegação usa estas constantes,
 * que correspondem 1:1 aos arquivos da pasta app/.
 */
export const ROUTES = {
  landing: '/',
  about: '/about',
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
  },
  tutor: {
    home: '/tutor',
    pets: '/tutor/pets',
    newPet: '/tutor/pets/new',
    pet: (id: string) => `/tutor/pets/${id}`,
    appointments: '/tutor/appointments',
    newAppointment: '/tutor/appointments/new',
    newAppointmentForPet: (petId: string) => `/tutor/appointments/new?petId=${petId}`,
    appointment: (id: string) => `/tutor/appointments/${id}`,
    profile: '/tutor/profile',
  },
  clinic: {
    home: '/clinic',
    agenda: '/clinic/agenda',
    attendance: (appointmentId: string) => `/clinic/attendance/${appointmentId}`,
    vetPortal: '/clinic/vet-portal',
    requests: '/clinic/requests',
    vets: '/clinic/vets',
    newVet: '/clinic/vets/new',
    vet: (id: string) => `/clinic/vets/${id}`,
    subscription: '/clinic/subscription',
    settings: '/clinic/settings',
  },
} as const;

export const toHref = (path: string) => path as Href;

/** Tela inicial de cada tipo de conta após o login. */
export function homeRouteFor(role: UserRole): string {
  switch (role) {
    case 'veterinarian':
      return ROUTES.clinic.vetPortal;
    case 'clinic_admin':
      return ROUTES.clinic.home;
    default:
      return ROUTES.tutor.home;
  }
}

/**
 * Controle de acesso por área/tela. As áreas são protegidas no layout
 * (app/tutor/_layout.tsx e app/clinic/_layout.tsx); dentro da área da
 * clínica algumas telas são exclusivas da administração ou do veterinário.
 */
export const AREA_ROLES: Record<'tutor' | 'clinic', UserRole[]> = {
  tutor: ['tutor'],
  clinic: ['clinic_admin', 'veterinarian'],
};

const CLINIC_SCREEN_ROLES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: ROUTES.clinic.vetPortal, roles: ['veterinarian'] },
  { prefix: ROUTES.clinic.requests, roles: ['clinic_admin'] },
  { prefix: ROUTES.clinic.vets, roles: ['clinic_admin'] },
  { prefix: ROUTES.clinic.subscription, roles: ['clinic_admin'] },
  { prefix: ROUTES.clinic.settings, roles: ['clinic_admin'] },
];

export function canAccessClinicScreen(pathname: string, role: UserRole): boolean {
  const rule = CLINIC_SCREEN_ROLES.find((r) => pathname.startsWith(r.prefix));
  return rule ? rule.roles.includes(role) : AREA_ROLES.clinic.includes(role);
}
