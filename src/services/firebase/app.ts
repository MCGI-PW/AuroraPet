import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { appConfig } from '../../config/appConfig';

/** Instância única do Firebase App com a configuração do projeto. */
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(appConfig.firebase);
