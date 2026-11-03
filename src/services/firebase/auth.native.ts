import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseApp } from './app';

/**
 * Android/iOS: a sessão do Firebase Auth é persistida no AsyncStorage,
 * mantendo o usuário logado ao fechar e reabrir o aplicativo.
 */
export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage),
});
