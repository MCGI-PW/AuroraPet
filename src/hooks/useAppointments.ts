import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appointmentService } from '../services/appointmentService';
import { localNotifications } from '../services/localNotificationService';
import { formatDate } from '../domain/appointmentRules';
import {
  Appointment,
  ConsultationReport,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types/appointment';
import { queryKeys } from './queryKeys';

export const useAppointments = (options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: queryKeys.appointments.all,
    queryFn: appointmentService.list,
    enabled: options.enabled ?? true,
  });

export const useAppointment = (id?: string) =>
  useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => appointmentService.getById(id as string),
    enabled: Boolean(id),
  });

function useRefreshAppointments() {
  const queryClient = useQueryClient();
  return (appointment?: Appointment) => {
    if (appointment) queryClient.setQueryData(queryKeys.appointments.detail(appointment.id), appointment);
    queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.notificationsAll });
    queryClient.invalidateQueries({ queryKey: queryKeys.clinic.busySlotsAll });
  };
}

/**
 * Agenda a consulta na API. Em caso de sucesso, confirma com uma notificação
 * local e agenda os lembretes (24h e 1h antes) no aparelho do tutor.
 */
export const useCreateAppointment = () => {
  const refresh = useRefreshAppointments();
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => appointmentService.create(input),
    onSuccess: async (appointment) => {
      refresh(appointment);
      const reminders = await localNotifications.scheduleAppointmentReminders(appointment);
      await localNotifications.presentNow(
        'Consulta agendada ✅',
        `${appointment.petName} • ${appointment.serviceName} em ${formatDate(appointment.date)} às ${appointment.time}` +
          (reminders ? '. Vamos lembrar você antes do horário.' : '.'),
        `/tutor/appointments/${appointment.id}`
      );
    },
  });
};

/** Remarca/cancela a consulta e mantém os lembretes do aparelho coerentes. */
export const useUpdateAppointment = () => {
  const refresh = useRefreshAppointments();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentInput }) => appointmentService.update(id, data),
    onSuccess: async (appointment) => {
      refresh(appointment);
      if (appointment.status === 'scheduled') {
        await localNotifications.scheduleAppointmentReminders(appointment);
      } else {
        await localNotifications.cancelAppointmentReminders(appointment.id);
      }
    },
  });
};

export const useCancelAppointment = () => {
  const refresh = useRefreshAppointments();
  return useMutation({
    mutationFn: (id: string) => appointmentService.update(id, { status: 'cancelled' }),
    onSuccess: async (appointment) => {
      refresh(appointment);
      await localNotifications.cancelAppointmentReminders(appointment.id);
    },
  });
};

export const useDeleteAppointment = () => {
  const refresh = useRefreshAppointments();
  return useMutation({
    mutationFn: (id: string) => appointmentService.remove(id),
    onSuccess: async (_result, id) => {
      refresh();
      await localNotifications.cancelAppointmentReminders(id);
    },
  });
};

/** Emite o laudo da consulta (veterinário/clínica) e conclui o atendimento. */
export const useSubmitConsultationReport = () => {
  const refresh = useRefreshAppointments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ appointmentId, report }: { appointmentId: string; report: Partial<ConsultationReport> }) =>
      appointmentService.submitReport(appointmentId, report),
    onSuccess: (appointment) => {
      refresh(appointment);
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
};
