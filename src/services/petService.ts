import { apiDelete, apiGet, apiPost, apiPut } from './api';
import { CreatePetInput, Pet, UpdatePetInput } from '../types/pet';

/** CRUD de pets na API (o tutor é identificado pelo token). */
export const petService = {
  list: () => apiGet<Pet[]>('/pets'),
  getById: (id: string) => apiGet<Pet>(`/pets/${encodeURIComponent(id)}`),
  create: (input: CreatePetInput) => apiPost<Pet>('/pets', input),
  update: (id: string, input: UpdatePetInput) => apiPut<Pet>(`/pets/${encodeURIComponent(id)}`, input),
  remove: (id: string) => apiDelete<{ message: string; id: string }>(`/pets/${encodeURIComponent(id)}`),
};
