import type { Persistence } from 'firebase/auth';

/**
 * O build React Native do Firebase Auth exporta getReactNativePersistence,
 * mas os tipos públicos do pacote não o declaram.
 */
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
