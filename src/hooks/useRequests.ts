import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestService } from '../services/requestService';
import { CreateAdministrativeRequestInput, RequestStatus } from '../types/administrativeRequest';
import { queryKeys } from './queryKeys';

/** Solicitações administrativas (todas para a clínica, próprias para o vet). */
export const useAdministrativeRequests = () =>
  useQuery({
    queryKey: queryKeys.requests,
    queryFn: requestService.list,
  });

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAdministrativeRequestInput) => requestService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.requests }),
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, status, feedback }: { requestId: string; status: RequestStatus; feedback?: string }) =>
      requestService.updateStatus(requestId, status, feedback),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.requests }),
  });
};
