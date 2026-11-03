import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authorizationService } from '../services/authorizationService';
import { GrantAuthorizationInput } from '../types/authorization';
import { queryKeys } from './queryKeys';

/** Autorizações de acesso ao prontuário de um pet (visão do tutor). */
export const usePetAuthorizations = (petId?: string) =>
  useQuery({
    queryKey: queryKeys.authorizations.byPet(petId),
    queryFn: () => authorizationService.list(petId),
    enabled: Boolean(petId),
  });

/** Autorizações concedidas ao veterinário logado (Portal do Vet). */
export const useMyAuthorizations = () =>
  useQuery({
    queryKey: queryKeys.authorizations.mine,
    queryFn: () => authorizationService.list(),
  });

export const useGrantAuthorization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GrantAuthorizationInput) => authorizationService.grant(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.authorizations.all }),
  });
};

export const useRevokeAuthorization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => authorizationService.revoke(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.authorizations.all }),
  });
};
