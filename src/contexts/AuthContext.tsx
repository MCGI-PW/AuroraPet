import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '../services/authService';

/**
 * Sessão do Firebase Authentication.
 * O Firebase restaura a sessão persistida (AsyncStorage no celular) e
 * notifica onAuthStateChanged; enquanto isso "initializing" fica true.
 * O perfil (papel, CRMV etc.) é carregado da API pelo hook useAuth.
 */
interface SessionContextValue {
  firebaseUser: User | null;
  initializing: boolean;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onSessionChange((user) => {
      setFirebaseUser(user);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return (
    <SessionContext.Provider value={{ firebaseUser, initializing }}>
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession deve ser usado dentro de AuthProvider');
  return context;
}
