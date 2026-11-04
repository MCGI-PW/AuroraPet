import { Auth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectAuthEmulatorIfConfigured, firebaseApp } from './app';

/**
 * Android/iOS: a sessão do Firebase Auth é persistida no AsyncStorage,
 * mantendo o usuário logado ao fechar e reabrir o aplicativo.
 */
export const firebaseAuth: Auth | null = firebaseApp
  ? connectAuthEmulatorIfConfigured(
      initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      })
    )
  : null;
