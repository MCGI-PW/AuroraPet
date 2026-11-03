import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { localNotifications } from '../services/localNotificationService';
import { alertedNotificationsStore } from '../services/alertedNotificationsStore';
import { selectNotificationsToAlert } from '../domain/notificationRules';
import { AppNotification } from '../types/notification';
import { queryKeys } from './queryKeys';

/** Intervalo de sincronização da caixa de notificações com a API. */
const POLL_INTERVAL_MS = 15_000;

export const useNotifications = (uid?: string) =>
  useQuery({
    queryKey: queryKeys.notifications(uid),
    queryFn: notificationService.list,
    enabled: Boolean(uid),
    refetchInterval: POLL_INTERVAL_MS,
  });

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (updated) =>
      queryClient.setQueriesData<AppNotification[]>({ queryKey: queryKeys.notificationsAll }, (list) =>
        list?.map((n) => (n.id === updated.id ? updated : n))
      ),
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () =>
      queryClient.setQueriesData<AppNotification[]>({ queryKey: queryKeys.notificationsAll }, (list) =>
        list?.map((n) => ({ ...n, read: true }))
      ),
  });
};

/**
 * Converte eventos do backend em notificações do aparelho: sempre que a
 * sincronização traz uma notificação nova (ex.: laudo emitido pela clínica),
 * ela é exibida como notificação local com a rota da tela relacionada.
 * Também invalida os dados afetados para a interface refletir o evento.
 */
export function useBackendNotificationAlerts(uid?: string) {
  const queryClient = useQueryClient();
  const { data: notifications } = useNotifications(uid);
  const processing = useRef(false);

  useEffect(() => {
    if (!uid || !notifications?.length || processing.current) return;
    processing.current = true;

    (async () => {
      const alerted = await alertedNotificationsStore.load(uid);
      const fresh = selectNotificationsToAlert(notifications, alerted);
      if (fresh.length === 0) return;

      for (const notification of fresh) {
        alerted.add(notification.id);
        await localNotifications.presentNow(
          notification.title,
          notification.message,
          notification.actionUrl,
          notification.id
        );
      }
      await alertedNotificationsStore.save(uid, alerted);

      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.authorizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
    })().finally(() => {
      processing.current = false;
    });
  }, [uid, notifications, queryClient]);
}
