import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Href, useRouter } from 'expo-router';
import { notificationService } from '../services/notificationService';

interface NotificationData {
  url?: string;
  notificationId?: string;
}

/**
 * Ao tocar em uma notificação (com o app aberto, em segundo plano ou
 * fechado), abre a tela indicada em data.url e marca a notificação da API
 * como lida. Só navega quando o usuário está autenticado; caso contrário a
 * rota fica pendente até o login.
 */
export function useNotificationNavigation(isAuthenticated: boolean) {
  const router = useRouter();
  const pending = useRef<NotificationData | null>(null);

  const open = (data: NotificationData) => {
    if (!data.url) return;
    if (!isAuthenticated) {
      pending.current = data;
      return;
    }
    router.push(data.url as Href);
    if (data.notificationId) notificationService.markAsRead(data.notificationId).catch(() => undefined);
  };

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // app aberto a partir de uma notificação (estava fechado)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) open(response.notification.request.content.data as NotificationData);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      open(response.notification.request.content.data as NotificationData);
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated && pending.current) {
      const data = pending.current;
      pending.current = null;
      open(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
}
