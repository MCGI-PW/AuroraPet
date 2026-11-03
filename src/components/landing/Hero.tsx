import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Sparkles, ArrowRight, Stethoscope, ShieldCheck, HeartPulse } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface HeroProps {
  onPrimaryAction: () => void;
  primaryLabel: string;
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1000&q=90';

export const Hero: React.FC<HeroProps> = ({ onPrimaryAction, primaryLabel }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <Sparkles size={14} color={colors.accent} />
        <Text style={[styles.badgeText, { color: colors.accent }]}>
          Cuidado veterinário com tecnologia
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>
        Cuidado que acompanha{' '}
        <Text style={{ color: colors.accent }}>cada fase da vida.</Text>
      </Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Uma experiência veterinária criada para aproximar tutores, animais e profissionais,
        facilitando o acompanhamento da saúde do seu pet.
      </Text>

      <TouchableOpacity
        onPress={onPrimaryAction}
        activeOpacity={0.85}
        style={styles.primaryBtn}
        accessibilityRole="button"
      >
        <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
        <ArrowRight size={18} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.imageCard}>
        <Image source={{ uri: HERO_IMAGE }} style={styles.image} resizeMode="cover" />
        <View style={styles.imageOverlay}>
          <View>
            <Text style={styles.overlayLabel}>Próximo cuidado</Text>
            <Text style={styles.overlayTitle}>Acompanhamento veterinário</Text>
          </View>
          <View style={styles.overlayPill}>
            <HeartPulse size={14} color="#10b981" />
            <Text style={styles.overlayPillText}>Saúde</Text>
          </View>
        </View>
      </View>

      <View style={styles.highlights}>
        <HighlightCard
          icon={<Stethoscope size={18} color={colors.accent} />}
          label="Atendimento"
          value="Cuidado contínuo"
        />
        <HighlightCard
          icon={<ShieldCheck size={18} color={colors.accent} />}
          label="Privacidade"
          value="Acesso autorizado"
        />
      </View>
    </View>
  );
};

interface HighlightCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const HighlightCard: React.FC<HighlightCardProps> = ({ icon, label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.highlightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.highlightIcon, { backgroundColor: colors.primaryLight }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.highlightLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.highlightValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingVertical: 15,
    borderRadius: 14,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  imageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 260,
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
  },
  overlayLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  overlayTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  overlayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  overlayPillText: {
    color: '#064e3b',
    fontSize: 12,
    fontWeight: '700',
  },
  highlights: {
    flexDirection: 'row',
    gap: 12,
  },
  highlightCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  highlightIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  highlightValue: {
    fontSize: 12,
    fontWeight: '700',
  },
});
