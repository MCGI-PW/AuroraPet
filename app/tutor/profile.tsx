import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { Calendar, Info, LogOut, Mail, Phone, Save, ShieldCheck, User } from 'lucide-react-native';
import { useAuth, useLogout, useUpdateProfile } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ScreenScroll } from '../../src/components/common/ScreenScroll';
import { ROUTES } from '../../src/navigation/routes';
import { ROLE_LABELS } from '../../src/types/auth';
import { formatDate } from '../../src/domain/appointmentRules';

/** Perfil do tutor: dados da conta (editáveis), acesso ao "Sobre o App" e logout. */
export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const { colors, isDark } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setDisplayName(user?.displayName ?? '');
    setPhoneNumber(user?.phoneNumber ?? '');
  }, [user?.displayName, user?.phoneNumber]);

  if (!user) return null;

  const handleSave = () => {
    setFeedback(null);
    updateProfile.mutate(
      { displayName, phoneNumber },
      {
        onSuccess: () => setFeedback({ type: 'success', message: 'Dados atualizados com sucesso.' }),
        onError: (err) => setFeedback({ type: 'error', message: err.message }),
      }
    );
  };

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.replace(ROUTES.auth.login as Href);
  };

  const inputStyle = [styles.input, { color: colors.text, backgroundColor: colors.surfaceSubtle, borderColor: colors.border }];

  return (
    <ScreenScroll>
      <View style={styles.headerBlock}>
        <Text style={[styles.title, { color: colors.text }]}>Meu Perfil</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Seus dados de contato e sessão</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarLetter}>{user.displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.text }]}>{user.displayName}</Text>
            <View style={styles.infoLine}>
              <Mail size={13} color={colors.textSecondary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>{user.email}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Nome completo</Text>
        <View style={styles.inputRow}>
          <User size={16} color={colors.textMuted} />
          <TextInput value={displayName} onChangeText={setDisplayName} style={inputStyle} placeholderTextColor={colors.textMuted} />
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Telefone / WhatsApp</Text>
        <View style={styles.inputRow}>
          <Phone size={16} color={colors.textMuted} />
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="(11) 99999-9999"
            placeholderTextColor={colors.textMuted}
            style={inputStyle}
          />
        </View>

        {feedback && (
          <Text style={[styles.feedback, { color: feedback.type === 'success' ? '#059669' : '#dc2626' }]}>
            {feedback.message}
          </Text>
        )}

        <TouchableOpacity onPress={handleSave} disabled={updateProfile.isPending} style={styles.saveBtn}>
          {updateProfile.isPending ? <ActivityIndicator color="#ffffff" /> : <Save size={16} color="#ffffff" />}
          <Text style={styles.saveBtnText}>Salvar alterações</Text>
        </TouchableOpacity>

        <View style={[styles.details, { borderTopColor: colors.border }]}>
          <DetailRow icon={<ShieldCheck size={16} color={colors.accent} />} label="Tipo de conta" value={ROLE_LABELS[user.role]} />
          <DetailRow icon={<Calendar size={16} color={colors.accent} />} label="Cliente desde" value={formatDate(user.createdAt.slice(0, 10))} />
          <DetailRow icon={<ShieldCheck size={16} color={colors.accent} />} label="Autenticação" value="Firebase Authentication" />
        </View>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.about as Href)}
          style={[styles.outlineBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}
        >
          <Info size={16} color={colors.textSecondary} />
          <Text style={[styles.outlineBtnText, { color: colors.text }]}>Sobre o App (versão e commit)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogout}
          disabled={logout.isPending}
          style={[
            styles.outlineBtn,
            {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fee2e2',
            },
          ]}
        >
          <LogOut size={16} color="#ef4444" />
          <Text style={[styles.outlineBtnText, { color: '#ef4444' }]}>Encerrar sessão</Text>
        </TouchableOpacity>
      </View>
    </ScreenScroll>
  );
}

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIconRow}>
        {icon}
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBlock: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 4 },
  card: { borderRadius: 22, borderWidth: 1, padding: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 19, fontWeight: '800' },
  infoLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  infoText: { fontSize: 13 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6, marginTop: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  feedback: { fontSize: 12, fontWeight: '600', marginTop: 10 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  saveBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  details: { borderTopWidth: 1, marginTop: 20, paddingTop: 16, gap: 14, marginBottom: 16 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: '700' },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
  },
  outlineBtnText: { fontWeight: '700', fontSize: 14 },
});
