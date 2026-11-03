import { useEffect } from 'react';
import { localNotifications } from '../services/localNotificationService';
import { useAuth } from './useAuth';
import { useBackendNotificationAlerts } from './useNotifications';
import { useNotificationNavigation } from './useNotificationNavigation';

/**
 * Serviços globais do app, ativados no layout raiz:
 *  - configura canais e exibição das notificações locais;
 *  - abre a tela certa ao tocar em uma notificação;
 *  - converte eventos da API em notificações no aparelho (usuário logado).
 */
export function useAppBootstrap() {
  const { status, user } = useAuth();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    localNotifications.configure();
  }, []);

  useNotificationNavigation(isAuthenticated);
  useBackendNotificationAlerts(isAuthenticated ? user?.uid : undefined);
}
