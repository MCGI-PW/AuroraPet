import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { localNotifications } from '../services/localNotificationService';
import { LoginInput, RegisterInput, UpdateProfileInput, UserProfile } from '../types/auth';
import { queryKeys } from './queryKeys';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Estado de autenticação da aplicação: sessão do Firebase + perfil da API.
 * Usado pelos layouts protegidos para decidir entre exibir a tela ou
 * redirecionar para o login.
 */
export function useAuth() {
  const { firebaseUser, initializing } = useSession();

  const profileQuery = useQuery({
    queryKey: queryKeys.me(firebaseUser?.uid),
    queryFn: () => userService.getMe(),
    enabled: Boolean(firebaseUser),
    staleTime: 1000 * 60 * 5,
  });

  let status: AuthStatus;
  if (initializing || (firebaseUser && profileQuery.isPending)) status = 'loading';
  else if (!firebaseUser) status = 'unauthenticated';
  else if (profileQuery.data) status = 'authenticated';
  else status = 'error';

  return {
    status,
    user: firebaseUser ? (profileQuery.data ?? null) : null,
    profileError: profileQuery.error as Error | null,
    retryProfile: profileQuery.refetch,
  };
}

/**
 * Login no Firebase Authentication seguido do carregamento do perfil na API.
 * O layout de autenticação redireciona para a área do usuário em seguida.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: LoginInput): Promise<UserProfile> => {
      const firebaseUser = await authService.signIn(email, password);
      let profile = await userService.getMe();
      if (!profile.profileCompleted) profile = await userService.updateMe({});
      queryClient.setQueryData(queryKeys.me(firebaseUser.uid), profile);
      return profile;
    },
  });
}

/**
 * Cadastro: cria a conta no Firebase Authentication e conclui o perfil na
 * API com o tipo de conta escolhido (tutor, veterinário ou clínica).
 */
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput): Promise<UserProfile> => {
      // se a conta já foi criada numa tentativa anterior (ex.: CRMV recusado), só conclui o perfil
      const current = authService.currentUser();
      const firebaseUser =
        current && current.email === input.email.trim().toLowerCase()
          ? current
          : await authService.createAccount(input.name, input.email, input.password);
      const profile = await userService.updateMe({
        displayName: input.name,
        role: input.role,
        crmv: input.crmv,
        specialty: input.specialty,
      });
      queryClient.setQueryData(queryKeys.me(firebaseUser.uid), profile);
      return profile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => userService.updateMe(input),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.me(profile.uid), profile),
  });
}

/** Encerra a sessão, limpa o cache e cancela os lembretes agendados no aparelho. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authService.signOut();
      await localNotifications.cancelAllReminders();
    },
    onSuccess: () => queryClient.clear(),
  });
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authService.sendPasswordReset(email),
  });
}
