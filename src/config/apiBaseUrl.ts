import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { appConfig } from './appConfig';

/**
 * URL base da API. Em desenvolvimento com API local (localhost), o host é
 * trocado pelo IP da máquina do Metro para funcionar no emulador/celular.
 */
function resolveApiBaseUrl(): string {
  const url = appConfig.apiUrl;
  const isLocal = /\/\/(localhost|127\.0\.0\.1)/.test(url);
  if (!isLocal || Platform.OS === 'web') return url;

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost && devHost !== 'localhost') return url.replace(/localhost|127\.0\.0\.1/, devHost);
  return Platform.OS === 'android' ? url.replace(/localhost|127\.0\.0\.1/, '10.0.2.2') : url;
}

export const API_BASE_URL = resolveApiBaseUrl();
