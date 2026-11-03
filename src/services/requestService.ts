import { apiGet, apiPost, apiPut } from './api';
import {
  AdministrativeRequest,
  CreateAdministrativeRequestInput,
  RequestStatus,
} from '../types/administrativeRequest';

/**
 * Solicitações administrativas. A API retorna todas para a administração e
 * apenas as próprias para o veterinário.
 */
export const requestService = {
  list: () => apiGet<AdministrativeRequest[]>('/requests'),
  create: (input: CreateAdministrativeRequestInput) => apiPost<AdministrativeRequest>('/requests', input),
  updateStatus: (id: string, status: RequestStatus, adminFeedback?: string) =>
    apiPut<AdministrativeRequest>(`/requests/${encodeURIComponent(id)}`, { status, adminFeedback }),
};
