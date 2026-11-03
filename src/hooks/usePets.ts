import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { petService } from '../services/petService';
import { CreatePetInput, UpdatePetInput } from '../types/pet';
import { queryKeys } from './queryKeys';

export const usePets = () =>
  useQuery({
    queryKey: queryKeys.pets.all,
    queryFn: petService.list,
  });

export const usePet = (id?: string) =>
  useQuery({
    queryKey: queryKeys.pets.detail(id),
    queryFn: () => petService.getById(id as string),
    enabled: Boolean(id),
  });

export const useCreatePet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePetInput) => petService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pets.all }),
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePetInput }) => petService.update(id, data),
    onSuccess: (pet) => {
      queryClient.setQueryData(queryKeys.pets.detail(pet.id), pet);
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
};

export const useDeletePet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => petService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.authorizations.all });
    },
  });
};
