import { browserLocalPersistence, initializeAuth } from 'firebase/auth';
import { firebaseApp } from './app';

/**
 * Web: a sessão do Firebase Auth é persistida no armazenamento local do
 * navegador. (No Android/iOS é usado auth.native.ts com AsyncStorage.)
 */
export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: browserLocalPersistence,
});
