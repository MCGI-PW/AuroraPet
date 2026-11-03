import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

/**
 * Cliente do TanStack Query: não repete requisições que falharam por
 * autenticação/permissão/inexistência (401, 403, 404).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && [401, 403, 404].includes(error.status)) && failureCount < 2,
    },
  },
});
