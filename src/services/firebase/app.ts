import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, connectAuthEmulator } from 'firebase/auth';
import { appConfig } from '../../config/appConfig';

/**
 * Indica se a configuração do Firebase foi informada. Sem ela o app abre
 * normalmente, mas login/cadastro mostram que a autenticação está
 * indisponível (o SDK lançaria auth/invalid-api-key e derrubaria o app).
 */
export const isFirebaseConfigured = Boolean(appConfig.firebase?.apiKey);

/** Instância única do Firebase App com a configuração do projeto. */
export const firebaseApp: FirebaseApp | null = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(appConfig.firebase)
  : null;

/** Desenvolvimento/testes: conecta ao Firebase Auth Emulator quando configurado. */
export function connectAuthEmulatorIfConfigured(auth: Auth): Auth {
  if (appConfig.authEmulatorHost) {
    connectAuthEmulator(auth, `http://${appConfig.authEmulatorHost}`, { disableWarnings: true });
  }
  return auth;
}
