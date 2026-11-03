import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from '../types/appointment';
import { planAppointmentReminders } from '../domain/appointmentRules';

/**
 * Notificações locais do aparelho (expo-notifications).
 *  - lembretes de consulta agendados para 24h e 1h antes do horário;
 *  - exibição imediata de eventos vindos da API (laudo emitido, acesso
 *    concedido, solicitação respondida...).
 * Toda notificação carrega em data.url a rota que deve ser aberta ao tocar.
 * No navegador (web) as notificações do sistema não são suportadas.
 */
const REMINDERS_KEY = '@aurorapet/appointment-reminders';
const isSupported = Platform.OS !== 'web';

export const NOTIFICATION_CHANNELS = {
  reminders: 'appointment-reminders',
  updates: 'clinic-updates',
} as const;

type ReminderIndex = Record<string, string[]>;

async function readReminderIndex(): Promise<ReminderIndex> {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  return raw ? (JSON.parse(raw) as ReminderIndex) : {};
}

const writeReminderIndex = (index: ReminderIndex) =>
  AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(index));

export const localNotifications = {
  isSupported,

  /** Exibe as notificações também com o app aberto e cria os canais Android. */
  async configure(): Promise<void> {
    if (!isSupported) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.reminders, {
        name: 'Lembretes de consultas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10b981',
      });
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.updates, {
        name: 'Atualizações da clínica',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#10b981',
      });
    }
  },

  /** Solicita a permissão de notificações (Android 13+ / iOS). */
  async ensurePermission(): Promise<boolean> {
    if (!isSupported) return false;
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  },

  /** Exibe uma notificação imediatamente. */
  async presentNow(title: string, body: string, url?: string, notificationId?: string): Promise<void> {
    if (!(await this.ensurePermission())) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { url, notificationId }, sound: true },
      trigger: Platform.OS === 'android' ? { channelId: NOTIFICATION_CHANNELS.updates } : null,
    });
  },

  /** Agenda (ou reagenda) os lembretes de uma consulta. */
  async scheduleAppointmentReminders(appointment: Appointment): Promise<number> {
    if (!isSupported) return 0;
    await this.cancelAppointmentReminders(appointment.id);
    if (!(await this.ensurePermission())) return 0;

    const url = `/tutor/appointments/${appointment.id}`;
    const ids: string[] = [];
    for (const plan of planAppointmentReminders(appointment)) {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: plan.title, body: plan.body, data: { url }, sound: true },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: plan.triggerAt,
          channelId: NOTIFICATION_CHANNELS.reminders,
        },
      });
      ids.push(id);
    }

    const index = await readReminderIndex();
    index[appointment.id] = ids;
    await writeReminderIndex(index);
    return ids.length;
  },

  /** Cancela os lembretes de uma consulta cancelada, remarcada ou excluída. */
  async cancelAppointmentReminders(appointmentId: string): Promise<void> {
    if (!isSupported) return;
    const index = await readReminderIndex();
    const ids = index[appointmentId] ?? [];
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
    delete index[appointmentId];
    await writeReminderIndex(index);
  },

  /** Usado no logout: nenhum lembrete do usuário anterior permanece no aparelho. */
  async cancelAllReminders(): Promise<void> {
    if (!isSupported) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(REMINDERS_KEY);
  },
};
