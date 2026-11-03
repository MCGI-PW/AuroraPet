import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Redirect, usePathname } from 'expo-router';
import { useAuth, useLogout } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { FullScreenLoader } from '../common/FullScreenLoader';
import { homeRouteFor, ROUTES, toHref } from '../../navigation/routes';
import { UserRole } from '../../types/auth';

interface ProtectedAreaProps {
  allowedRoles: UserRole[];
  /** Regra adicional por tela (ex.: telas exclusivas da administração). */
  canAccess?: (pathname: string, role: UserRole) => boolean;
  children: ReactNode;
}

/**
 * Guarda de rotas integrada ao Expo Router. Nenhuma tela protegida é
 * renderizada sem sessão válida do Firebase e perfil carregado da API:
 *  - sem sessão → redireciona para o login;
 *  - perfil sem permissão → redireciona para a área do seu tipo de conta.
 */
export const ProtectedArea: React.FC<ProtectedAreaProps> = ({ allowedRoles, canAccess, children }) => {
  const { status, user, profileError, retryProfile } = useAuth();
  const pathname = usePathname();

  if (status === 'loading') return <FullScreenLoader message="Validando sua sessão..." />;
  if (status === 'unauthenticated') return <Redirect href={toHref(ROUTES.auth.login)} />;
  if (status === 'error' || !user) {
    return <ProfileErrorState message={profileError?.message} onRetry={() => retryProfile()} />;
  }

  const allowed = allowedRoles.includes(user.role) && (!canAccess || canAccess(pathname, user.role));
  if (!allowed) return <Redirect href={toHref(homeRouteFor(user.role))} />;

  return <>{children}</>;
};

const ProfileErrorState: React.FC<{ message?: string; onRetry: () => void }> = ({ message, onRetry }) => {
  const { colors } = useTheme();
  const logout = useLogout();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Não foi possível carregar seu perfil</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message || 'Verifique sua conexão com a internet.'}
      </Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={onRetry} activeOpacity={0.85}>
        <Text style={styles.primaryText}>Tentar novamente</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => logout.mutate()} activeOpacity={0.7}>
        <Text style={[styles.link, { color: colors.textSecondary }]}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#064e3b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  primaryText: { color: '#ffffff', fontWeight: '700' },
  link: { fontSize: 13, fontWeight: '600', marginTop: 4 },
});
