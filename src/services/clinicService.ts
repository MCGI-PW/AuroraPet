import { apiDelete, apiGet, apiPost, apiPut } from './api';
import {
  ClinicProfile,
  ClinicService,
  CreateSpecialistInput,
  Specialist,
  UpdateSpecialistInput,
} from '../types/specialist';
import { ClinicSubscription, Plan } from '../types/plan';

/** Dados da clínica, corpo clínico, serviços e planos na API. */
export const clinicService = {
  getProfile: () => apiGet<ClinicProfile>('/clinic'),
  updateProfile: (input: Partial<ClinicProfile>) => apiPut<ClinicProfile>('/clinic', input),

  listSpecialists: () => apiGet<Specialist[]>('/specialists'),
  getSpecialist: (id: string) => apiGet<Specialist>(`/specialists/${encodeURIComponent(id)}`),
  createSpecialist: (input: CreateSpecialistInput) => apiPost<Specialist>('/specialists', input),
  updateSpecialist: (id: string, input: UpdateSpecialistInput) =>
    apiPut<Specialist>(`/specialists/${encodeURIComponent(id)}`, input),
  removeSpecialist: (id: string) =>
    apiDelete<{ message: string; id: string }>(`/specialists/${encodeURIComponent(id)}`),

  /** Horários já reservados do veterinário na data (para montar a agenda livre). */
  busySlots: (specialistId: string, date: string) =>
    apiGet<string[]>(`/specialists/${encodeURIComponent(specialistId)}/busy-slots?date=${date}`),

  listServices: () => apiGet<ClinicService[]>('/services'),

  listPlans: () => apiGet<Plan[]>('/plans'),
  getSubscription: () => apiGet<ClinicSubscription>('/clinic/subscription'),
  changePlan: (planId: string) => apiPut<ClinicSubscription>('/clinic/subscription', { planId }),
};
