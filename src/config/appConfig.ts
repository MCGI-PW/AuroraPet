import Constants from 'expo-constants';

/**
 * Configuração de runtime lida do app.config.js (expo-constants).
 * Centraliza URL da API, credenciais públicas do Firebase e dados da versão.
 */
interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

interface AppExtra {
  commitHash: string;
  buildDate: string;
  repositoryUrl: string;
  apiUrl: string;
  authEmulatorHost: string;
  firebase: FirebaseWebConfig;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<AppExtra>;

export const appConfig = {
  appName: Constants.expoConfig?.name ?? 'AuroraPet',
  version: Constants.expoConfig?.version ?? '1.0.0',
  commitHash: extra.commitHash ?? 'desconhecido',
  buildDate: extra.buildDate ?? '',
  repositoryUrl: extra.repositoryUrl ?? 'https://github.com/MCGI-PW/AuroraPet',
  apiUrl: extra.apiUrl ?? 'http://localhost:3001/api',
  authEmulatorHost: extra.authEmulatorHost ?? '',
  firebase: extra.firebase as FirebaseWebConfig,
};
