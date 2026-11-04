import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator } from 'firebase/auth';
import { appConfig } from '../../config/appConfig';

/** Instância única do Firebase App com a configuração do projeto. */
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(appConfig.firebase);

/** Desenvolvimento/testes: conecta ao Firebase Auth Emulator quando configurado. */
export function connectAuthEmulatorIfConfigured(auth: Auth): Auth {
  if (appConfig.authEmulatorHost) {
    connectAuthEmulator(auth, `http://${appConfig.authEmulatorHost}`, { disableWarnings: true });
  }
  return auth;
}
