import { apiGet, apiPut } from './api';
import { UpdateProfileInput, UserProfile } from '../types/auth';

/** Perfil do usuário autenticado na API. */
export const userService = {
  getMe(): Promise<UserProfile> {
    return apiGet<UserProfile>('/users/me');
  },

  updateMe(input: UpdateProfileInput): Promise<UserProfile> {
    return apiPut<UserProfile>('/users/me', input);
  },
};
