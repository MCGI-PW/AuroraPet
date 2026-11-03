import { API_BASE_URL } from '../config/apiBaseUrl';
import { firebaseAuth } from './firebase/auth';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}


/**
 * Cliente HTTP da aplicação. Envia o Firebase ID Token do usuário logado
 * em "Authorization: Bearer" e converte erros da API em ApiError.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = await firebaseAuth.currentUser?.getIdToken();

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua internet.', 0);
  }

  if (!response.ok) {
    let message = `Erro HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // resposta sem JSON
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiGet = <T>(endpoint: string) => apiFetch<T>(endpoint);
export const apiPost = <T>(endpoint: string, body?: unknown) =>
  apiFetch<T>(endpoint, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const apiPut = <T>(endpoint: string, body?: unknown) =>
  apiFetch<T>(endpoint, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) });
export const apiDelete = <T>(endpoint: string) => apiFetch<T>(endpoint, { method: 'DELETE' });
