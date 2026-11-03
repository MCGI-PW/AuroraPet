import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guarda, por usuário, quais notificações da API já foram exibidas neste
 * aparelho, para que a mesma notificação não apareça duas vezes.
 */
const MAX_STORED_IDS = 200;
const storageKey = (uid: string) => `@aurorapet/alerted-notifications/${uid}`;

export const alertedNotificationsStore = {
  async load(uid: string): Promise<Set<string>> {
    const raw = await AsyncStorage.getItem(storageKey(uid));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  },

  async save(uid: string, ids: Set<string>): Promise<void> {
    const recent = Array.from(ids).slice(-MAX_STORED_IDS);
    await AsyncStorage.setItem(storageKey(uid), JSON.stringify(recent));
  },
};
