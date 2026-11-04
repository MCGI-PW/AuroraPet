import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  Auth,
} from 'firebase/auth';
import { firebaseAuth } from './firebase/auth';

/** Traduz os códigos de erro do Firebase Authentication para português. */
export function formatAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'O formato do e-mail é inválido.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Faça login ou recupere a senha.';
    case 'auth/weak-password':
      return 'A senha deve conter no mínimo 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada.';
    default:
      return (error as Error)?.message || 'Não foi possível concluir a autenticação.';
  }
}

async function withAuthErrors<T>(action: () => Promise<T>): Promise<T> {
  try {
    return await action();
  } catch (error) {
    throw new Error(formatAuthError(error));
  }
}

export const AUTH_UNAVAILABLE_MESSAGE =
  'Autenticação indisponível: a configuração do Firebase não foi informada neste build.';

/** Instância do Firebase Auth ou erro amigável se o projeto não estiver configurado. */
function requireAuth(): Auth {
  if (!firebaseAuth) throw new Error(AUTH_UNAVAILABLE_MESSAGE);
  return firebaseAuth;
}

/** Acesso ao Firebase Authentication (sessão, login, cadastro e senha). */
export const authService = {
  isAvailable: Boolean(firebaseAuth),

  signIn(email: string, password: string): Promise<User> {
    return withAuthErrors(async () => {
      const credential = await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
      return credential.user;
    });
  },

  createAccount(name: string, email: string, password: string): Promise<User> {
    return withAuthErrors(async () => {
      const credential = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      // força um novo token já com o nome do usuário
      await credential.user.getIdToken(true);
      return credential.user;
    });
  },

  /** Usuário da sessão atual do Firebase (ou null). */
  currentUser(): User | null {
    return firebaseAuth?.currentUser ?? null;
  },

  async signOut(): Promise<void> {
    if (firebaseAuth) await signOut(firebaseAuth);
  },

  sendPasswordReset(email: string): Promise<void> {
    return withAuthErrors(() => sendPasswordResetEmail(requireAuth(), email.trim()));
  },

  onSessionChange(callback: (user: User | null) => void) {
    if (!firebaseAuth) {
      callback(null);
      return () => undefined;
    }
    return onAuthStateChanged(firebaseAuth, callback);
  },
};
