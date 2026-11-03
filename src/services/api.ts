import { Platform } from 'react-native';
import { UserProfile } from '../types/auth';
import Constants from 'expo-constants';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function resolveApiBaseUrl(): string {
  // Se explicitamente definida no ambiente, usa-a
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Se estiver rodando em emulador Android nativo
  if (Platform.OS === 'android') {
    // Tenta detectar o IP do debugger da máquina host se disponível
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3001/api`;
      }
    }
    // 10.0.2.2 é o loopback do emulador Android para o localhost do PC
    return 'http://10.0.2.2:3001/api';
  }

  // Web e iOS Simulator
  return 'http://localhost:3001/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson?.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // Falha ao interpretar JSON de erro
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}
export async function apiLogin(email: string, password: string): Promise<UserProfile> {
  return apiFetch<UserProfile>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
