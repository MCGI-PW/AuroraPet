import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clinicService } from '../services/clinicService';
import { ClinicProfile, CreateSpecialistInput, UpdateSpecialistInput } from '../types/specialist';
import { queryKeys } from './queryKeys';

const CATALOG_STALE_TIME = 1000 * 60 * 5;

// ---------- Dados da clínica ----------
export const useClinicProfile = () =>
  useQuery({
    queryKey: queryKeys.clinic.profile,
    queryFn: clinicService.getProfile,
    staleTime: CATALOG_STALE_TIME,
  });

export const useUpdateClinicProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ClinicProfile>) => clinicService.updateProfile(input),
    onSuccess: (clinic) => queryClient.setQueryData(queryKeys.clinic.profile, clinic),
  });
};

// ---------- Corpo clínico ----------
export const useSpecialists = () =>
  useQuery({
    queryKey: queryKeys.clinic.specialists,
    queryFn: clinicService.listSpecialists,
    staleTime: CATALOG_STALE_TIME,
  });

export const useSpecialist = (id?: string) =>
  useQuery({
    queryKey: queryKeys.clinic.specialist(id),
    queryFn: () => clinicService.getSpecialist(id as string),
    enabled: Boolean(id),
  });

function useInvalidateTeam() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clinic.specialists });
    queryClient.invalidateQueries({ queryKey: queryKeys.clinic.subscription });
  };
}

export const useCreateSpecialist = () => {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: (input: CreateSpecialistInput) => clinicService.createSpecialist(input),
    onSuccess: invalidate,
  });
};

export const useUpdateSpecialist = () => {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSpecialistInput }) => clinicService.updateSpecialist(id, data),
    onSuccess: invalidate,
  });
};

export const useDeleteSpecialist = () => {
  const invalidate = useInvalidateTeam();
  return useMutation({
    mutationFn: (id: string) => clinicService.removeSpecialist(id),
    onSuccess: invalidate,
  });
};

/** Horários ocupados do veterinário na data escolhida. */
export const useBusySlots = (specialistId?: string, date?: string) =>
  useQuery({
    queryKey: queryKeys.clinic.busySlots(specialistId, date),
    queryFn: () => clinicService.busySlots(specialistId as string, date as string),
    enabled: Boolean(specialistId && date),
  });

// ---------- Serviços, planos e assinatura ----------
export const useClinicServices = () =>
  useQuery({
    queryKey: queryKeys.clinic.services,
    queryFn: clinicService.listServices,
    staleTime: CATALOG_STALE_TIME,
  });

export const usePlans = () =>
  useQuery({
    queryKey: queryKeys.clinic.plans,
    queryFn: clinicService.listPlans,
    staleTime: CATALOG_STALE_TIME,
  });

export const useClinicSubscription = () =>
  useQuery({
    queryKey: queryKeys.clinic.subscription,
    queryFn: clinicService.getSubscription,
  });

export const useChangePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => clinicService.changePlan(planId),
    onSuccess: (subscription) => queryClient.setQueryData(queryKeys.clinic.subscription, subscription),
  });
};
