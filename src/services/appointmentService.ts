import { apiDelete, apiGet, apiPost, apiPut } from './api';
import {
  Appointment,
  ConsultationReport,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types/appointment';

/** CRUD de consultas e emissão do laudo clínico na API. */
export const appointmentService = {
  list: () => apiGet<Appointment[]>('/appointments'),
  getById: (id: string) => apiGet<Appointment>(`/appointments/${encodeURIComponent(id)}`),
  create: (input: CreateAppointmentInput) => apiPost<Appointment>('/appointments', input),
  update: (id: string, input: UpdateAppointmentInput) =>
    apiPut<Appointment>(`/appointments/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiDelete<{ message: string; id: string }>(`/appointments/${encodeURIComponent(id)}`),
  submitReport: (id: string, report: Partial<ConsultationReport>) =>
    apiPost<Appointment>(`/appointments/${encodeURIComponent(id)}/report`, report),
};
