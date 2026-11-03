/**
 * Chaves do cache do TanStack Query em um único lugar, para que leituras e
 * invalidações usem sempre a mesma estrutura.
 */
export const queryKeys = {
  me: (uid?: string) => ['users', 'me', uid] as const,
  pets: {
    all: ['pets'] as const,
    detail: (id?: string) => ['pets', 'detail', id] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    detail: (id?: string) => ['appointments', 'detail', id] as const,
  },
  clinic: {
    profile: ['clinic', 'profile'] as const,
    specialists: ['clinic', 'specialists'] as const,
    specialist: (id?: string) => ['clinic', 'specialists', id] as const,
    services: ['clinic', 'services'] as const,
    busySlotsAll: ['clinic', 'busy-slots'] as const,
    busySlots: (specialistId?: string, date?: string) => ['clinic', 'busy-slots', specialistId, date] as const,
    plans: ['clinic', 'plans'] as const,
    subscription: ['clinic', 'subscription'] as const,
  },
  authorizations: {
    all: ['authorizations'] as const,
    byPet: (petId?: string) => ['authorizations', 'pet', petId] as const,
    mine: ['authorizations', 'mine'] as const,
  },
  requests: ['requests'] as const,
  notificationsAll: ['notifications'] as const,
  notifications: (uid?: string) => ['notifications', uid] as const,
};
