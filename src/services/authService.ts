import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
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

/** Acesso ao Firebase Authentication (sessão, login, cadastro e senha). */
export const authService = {
  signIn(email: string, password: string): Promise<User> {
    return withAuthErrors(async () => {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      return credential.user;
    });
  },

  createAccount(name: string, email: string, password: string): Promise<User> {
    return withAuthErrors(async () => {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      // força um novo token já com o nome do usuário
      await credential.user.getIdToken(true);
      return credential.user;
    });
  },

  /** Usuário da sessão atual do Firebase (ou null). */
  currentUser(): User | null {
    return firebaseAuth.currentUser;
  },

  signOut(): Promise<void> {
    return signOut(firebaseAuth);
  },

  sendPasswordReset(email: string): Promise<void> {
    return withAuthErrors(() => sendPasswordResetEmail(firebaseAuth, email.trim()));
  },

  onSessionChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(firebaseAuth, callback);
  },
};
