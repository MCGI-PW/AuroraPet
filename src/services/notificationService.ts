import { apiGet, apiPut } from './api';
import { AppNotification } from '../types/notification';

/** Caixa de notificações do usuário logado na API. */
export const notificationService = {
  list: () => apiGet<AppNotification[]>('/notifications'),
  markAsRead: (id: string) => apiPut<AppNotification>(`/notifications/${encodeURIComponent(id)}/read`),
  markAllAsRead: () => apiPut<{ success: boolean }>('/notifications/read-all'),
};
