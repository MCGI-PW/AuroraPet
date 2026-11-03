import { AppNotification } from '../types/notification';

/** Janela em que uma notificação ainda não exibida é considerada "nova". */
export const ALERT_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * Seleciona as notificações da API que devem virar notificação no aparelho:
 * não lidas, recentes e que ainda não foram exibidas neste dispositivo.
 */
export function selectNotificationsToAlert(
  notifications: AppNotification[],
  alreadyAlertedIds: Set<string>,
  now = Date.now()
): AppNotification[] {
  return notifications.filter(
    (n) =>
      !n.read &&
      !alreadyAlertedIds.has(n.id) &&
      now - new Date(n.createdAt).getTime() <= ALERT_WINDOW_MS
  );
}
