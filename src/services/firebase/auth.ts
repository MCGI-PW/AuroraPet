import { Auth, browserLocalPersistence, initializeAuth } from 'firebase/auth';
import { connectAuthEmulatorIfConfigured, firebaseApp } from './app';

/**
 * Web: a sessão do Firebase Auth é persistida no armazenamento local do
 * navegador. (No Android/iOS é usado auth.native.ts com AsyncStorage.)
 */
export const firebaseAuth: Auth | null = firebaseApp
  ? connectAuthEmulatorIfConfigured(
      initializeAuth(firebaseApp, {
        persistence: browserLocalPersistence,
      })
    )
  : null;
