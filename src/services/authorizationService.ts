import { apiGet, apiPost, apiPut } from './api';
import { GrantAuthorizationInput, PetAccessAuthorization } from '../types/authorization';

/**
 * Autorizações de acesso ao prontuário. A API filtra pelo perfil logado:
 * o tutor recebe as dos seus pets e o veterinário as concedidas a ele.
 */
export const authorizationService = {
  list: (petId?: string) =>
    apiGet<PetAccessAuthorization[]>(`/authorizations${petId ? `?petId=${encodeURIComponent(petId)}` : ''}`),
  grant: (input: GrantAuthorizationInput) => apiPost<PetAccessAuthorization>('/authorizations', input),
  revoke: (id: string, reason?: string) =>
    apiPut<PetAccessAuthorization>(`/authorizations/${encodeURIComponent(id)}/revoke`, { reason }),
};
