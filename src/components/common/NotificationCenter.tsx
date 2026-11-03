import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../../hooks/useNotifications';
import { AppNotification } from '../../types/notification';
import {
  Bell,
  CheckCheck,
  X,
  ShieldCheck,
  FileText,
  Calendar,
  Info,
} from 'lucide-react-native';

/**
 * Sino de notificações do cabeçalho: lista a caixa de entrada do usuário
 * (sincronizada com a API) e abre a tela relacionada ao tocar no aviso.
 */
export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { data: notifications = [] } = useNotifications(user?.uid);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotification = (notification: AppNotification) => {
    if (!notification.read) markAsRead.mutate(notification.id);
    if (notification.actionUrl) {
      setIsOpen(false);
      router.push(notification.actionUrl as Href);
    }
  };

  const handleMarkAllAsRead = () => markAllAsRead.mutate();

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'ACCESS_GRANTED':
      case 'ACCESS_REVOKED':
        return <ShieldCheck size={16} color="#10b981" />;
      case 'REQUEST_UPDATE':
        return <FileText size={16} color="#0284c7" />;
      case 'APPOINTMENT':
        return <Calendar size={16} color="#7c3aed" />;
      default:
        return <Info size={16} color="#f59e0b" />;
    }
  };

  return (
    <>
      {/* BOTÃO DO SINO NO HEADER */}
      <TouchableOpacity
        style={[styles.bellBtn, { backgroundColor: colors.surfaceSubtle }]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Bell size={18} color={colors.text} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* MODAL DE NOTIFICAÇÕES */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* CABEÇALHO */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Notificações do Sistema
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {unreadCount} aviso{unreadCount === 1 ? '' : 's'} não lido{unreadCount === 1 ? '' : 's'}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    style={styles.markAllBtn}
                  >
                    <CheckCheck size={14} color="#10b981" />
                    <Text style={[styles.markAllText, { color: colors.accent }]}>
                      Ler todas
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  style={[styles.closeBtn, { backgroundColor: colors.surfaceSubtle }]}
                >
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* LISTA */}
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <Bell size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Nenhuma notificação por enquanto.
                  </Text>
                </View>
              ) : (
                notifications.map((n) => (
                  <TouchableOpacity
                    key={n.id}
                    onPress={() => handleOpenNotification(n)}
                    style={[
                      styles.notifItem,
                      {
                        backgroundColor: n.read
                          ? colors.surfaceSubtle
                          : isDark
                          ? 'rgba(16, 185, 129, 0.1)'
                          : '#f0fdf4',
                        borderColor: n.read ? colors.border : '#10b981',
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.notifIconWrap}>{renderIcon(n.type)}</View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.notifHeaderRow}>
                        <Text style={[styles.notifTitle, { color: colors.text }]}>
                          {n.title}
                        </Text>
                        {!n.read && <View style={styles.unreadDot} />}
                      </View>
                      <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
                        {n.message}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellBtn: {
    padding: 8,
    borderRadius: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 10000,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  scrollArea: {
    flexGrow: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  notifIconWrap: {
    marginTop: 2,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  notifMessage: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
});
