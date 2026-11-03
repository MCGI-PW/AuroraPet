import React from 'react';
import { Linking, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, GitCommit, Info, Server, Smartphone } from 'lucide-react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { appConfig } from '../src/config/appConfig';
import { API_BASE_URL } from '../src/config/apiBaseUrl';
import { ScreenScroll } from '../src/components/common/ScreenScroll';

const TEAM = [
  { name: 'Maicon Douglas', rm: 'RM561279' },
  { name: 'Gabriel Fachin', rm: 'RM561551' },
  { name: 'Charlles', rm: 'RM566482' },
  { name: 'Iago D. Ainette', rm: 'RM565708' },
];

/**
 * Tela "Sobre o App": identifica a versão publicada pelo hash do commit
 * usado no build, permitindo conferir que o app instalado corresponde ao
 * código do repositório.
 */
export default function AboutPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const shortHash = appConfig.commitHash.slice(0, 7);
  const commitUrl = `${appConfig.repositoryUrl}/commit/${appConfig.commitHash}`;
  const buildDate = appConfig.buildDate ? new Date(appConfig.buildDate).toLocaleString('pt-BR') : '—';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Voltar">
          <ArrowLeft size={18} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.text }]}>Sobre o App</Text>
      </View>

      <ScreenScroll>
        <View style={[styles.hero, { backgroundColor: colors.primaryLight }]}>
          <Info size={28} color={colors.accent} />
          <Text style={[styles.appName, { color: colors.text }]}>{appConfig.appName}</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Prontuário, agenda e comunicação entre tutores, veterinários e clínica.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Versão publicada</Text>
          <InfoRow icon={<Smartphone size={16} color={colors.accent} />} label="Versão" value={appConfig.version} />
          <InfoRow
            icon={<GitCommit size={16} color={colors.accent} />}
            label="Commit de referência"
            value={shortHash}
            mono
          />
          <Text selectable style={[styles.fullHash, { color: colors.textSecondary, backgroundColor: colors.surfaceSubtle }]}>
            {appConfig.commitHash}
          </Text>
          <InfoRow icon={<Info size={16} color={colors.accent} />} label="Data do build" value={buildDate} />
          <InfoRow icon={<Server size={16} color={colors.accent} />} label="API" value={API_BASE_URL} />
          <TouchableOpacity onPress={() => Linking.openURL(commitUrl)} style={styles.linkBtn} accessibilityRole="link">
            <ExternalLink size={16} color="#ffffff" />
            <Text style={styles.linkBtnText}>Ver este commit no GitHub</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Equipe</Text>
          {TEAM.map((member) => (
            <View key={member.rm} style={styles.memberRow}>
              <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
              <Text style={[styles.memberRm, { color: colors.textMuted }]}>{member.rm}</Text>
            </View>
          ))}
          <Text style={[styles.course, { color: colors.textMuted }]}>
            FIAP • Mobile Application Development • Sprint 4
          </Text>
        </View>
      </ScreenScroll>
    </SafeAreaView>
  );
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string; mono?: boolean }> = ({
  icon,
  label,
  value,
  mono,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.infoRow}>
      {icon}
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text
        selectable
        numberOfLines={1}
        style={[styles.infoValue, { color: colors.text }, mono && styles.mono]}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1 },
  backBtn: { padding: 6 },
  topTitle: { fontSize: 16, fontWeight: '800' },
  hero: { alignItems: 'center', padding: 20, borderRadius: 18, gap: 6, marginBottom: 16 },
  appName: { fontSize: 24, fontWeight: '800' },
  tagline: { fontSize: 13, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { fontSize: 13, flexShrink: 0 },
  infoValue: { fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 15 },
  fullHash: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 11,
    padding: 10,
    borderRadius: 10,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  linkBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between' },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberRm: { fontSize: 13 },
  course: { fontSize: 11, marginTop: 6 },
});
