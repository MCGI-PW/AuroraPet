import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '../../src/contexts/ThemeContext';
import { usePlans, useClinicSubscription, useChangePlan } from '../../src/hooks/useClinic';
import {
  ShieldCheck,
  Zap,
  Check,
  Users,
  Building,
  PawPrint,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react-native';
import { Plan } from '../../src/types/plan';

export default function SubscriptionPage() {
  const { colors, isDark } = useTheme();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: subscription, isLoading: subLoading } = useClinicSubscription();
  const upgradeMutation = useChangePlan();

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleUpgrade = async (plan: Plan) => {
    const confirmMsg = `Deseja migrar a clínica para o plano "${plan.name}" por R$ ${plan.monthlyPrice}/mês?`;

    const proceed = () => {
      upgradeMutation.mutate(plan.id, {
        onSuccess: () => {
          setFeedback(`Plano atualizado com sucesso para ${plan.name}! Limites expandidos.`);
          setTimeout(() => setFeedback(null), 4000);
        },
        onError: (err: any) => {
          Alert.alert('Erro', err?.message || 'Falha ao atualizar plano.');
        },
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) proceed();
    } else {
      Alert.alert('Confirmação de Plano', confirmMsg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: proceed },
      ]);
    }
  };

  if (plansLoading || subLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Carregando planos e cotas da clínica...
        </Text>
      </View>
    );
  }

  const limits = subscription?.limits || {
    maxVeterinarians: 10,
    usedVeterinarians: 3,
    maxAdmins: 3,
    usedAdmins: 1,
    maxPatients: 5000,
    usedPatients: 148,
  };

  const vetUsagePercent = Math.min(
    100,
    Math.round((limits.usedVeterinarians / limits.maxVeterinarians) * 100)
  );
  const adminUsagePercent = Math.min(
    100,
    Math.round((limits.usedAdmins / limits.maxAdmins) * 100)
  );
  const patientUsagePercent = Math.min(
    100,
    Math.round((limits.usedPatients / limits.maxPatients) * 100)
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.primaryLight,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
              },
            ]}
          >
            <Sparkles size={13} color={colors.accent} />
            <Text style={[styles.badgeText, { color: colors.accent }]}>
              Assinatura da clínica e uso das cotas
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Planos & Limites da Clínica</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Acompanhe o consumo de vagas da sua equipe médica e faça upgrades conforme a sua clínica
          cresce.
        </Text>
      </View>

      {feedback && (
        <View style={styles.feedbackBox}>
          <ShieldCheck size={18} color="#10b981" />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* CARD DO PLANO ATUAL & CONSUMO DE COTAS */}
      <View
        style={[
          styles.currentPlanCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.currentPlanHeader}>
          <View>
            <Text style={[styles.labelCurrent, { color: colors.textSecondary }]}>
              Assinatura Ativa
            </Text>
            <Text style={[styles.planNameCurrent, { color: colors.text }]}>
              {subscription?.planName}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.activeDot} />
            <Text style={styles.statusPillText}>Ativo & Regular</Text>
          </View>
        </View>

        {/* MÉTRICAS DE USO DAS COTAS */}
        <View style={styles.quotasGrid}>
          {/* VETERINÁRIOS */}
          <View style={[styles.quotaBox, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.quotaHeader}>
              <Users size={16} color="#0284c7" />
              <Text style={[styles.quotaLabel, { color: colors.textSecondary }]}>
                Veterinários
              </Text>
            </View>
            <Text style={[styles.quotaNumbers, { color: colors.text }]}>
              {limits.usedVeterinarians}{' '}
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                / {limits.maxVeterinarians} vagas
              </Text>
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${vetUsagePercent}%`,
                    backgroundColor: vetUsagePercent > 80 ? '#f59e0b' : '#0284c7',
                  },
                ]}
              />
            </View>
            <Text style={[styles.quotaPercent, { color: colors.textMuted }]}>
              {vetUsagePercent}% utilizado
            </Text>
          </View>

          {/* ADMINISTRADORES */}
          <View style={[styles.quotaBox, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.quotaHeader}>
              <Building size={16} color="#7c3aed" />
              <Text style={[styles.quotaLabel, { color: colors.textSecondary }]}>
                Administradores
              </Text>
            </View>
            <Text style={[styles.quotaNumbers, { color: colors.text }]}>
              {limits.usedAdmins}{' '}
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                / {limits.maxAdmins} vagas
              </Text>
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${adminUsagePercent}%`, backgroundColor: '#7c3aed' },
                ]}
              />
            </View>
            <Text style={[styles.quotaPercent, { color: colors.textMuted }]}>
              {adminUsagePercent}% utilizado
            </Text>
          </View>

          {/* PACIENTES / TUTORES */}
          <View style={[styles.quotaBox, { backgroundColor: colors.surfaceSubtle }]}>
            <View style={styles.quotaHeader}>
              <PawPrint size={16} color="#10b981" />
              <Text style={[styles.quotaLabel, { color: colors.textSecondary }]}>
                Pacientes Ativos
              </Text>
            </View>
            <Text style={[styles.quotaNumbers, { color: colors.text }]}>
              {limits.usedPatients}{' '}
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                / {limits.maxPatients}
              </Text>
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${patientUsagePercent}%`, backgroundColor: '#10b981' },
                ]}
              />
            </View>
            <Text style={[styles.quotaPercent, { color: colors.textMuted }]}>
              {patientUsagePercent}% utilizado
            </Text>
          </View>
        </View>
      </View>

      {/* VITRINE DE PLANOS CLYVOVET */}
      <View style={styles.plansSectionHeader}>
        <TrendingUp size={18} color={colors.accent} />
        <Text style={[styles.plansSectionTitle, { color: colors.text }]}>
          Planos Disponíveis da Plataforma
        </Text>
      </View>

      <View style={styles.plansGrid}>
        {plans.map((p) => {
          const isCurrent = subscription?.planId === p.id;
          return (
            <View
              key={p.id}
              style={[
                styles.planCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: p.recommended ? '#10b981' : colors.border,
                },
              ]}
            >
              {p.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>MAIS POPULAR</Text>
                </View>
              )}

              <Text style={[styles.planTitle, { color: colors.text }]}>{p.name}</Text>
              <Text style={[styles.planDesc, { color: colors.textSecondary }]}>
                {p.description}
              </Text>

              <View style={styles.priceRow}>
                <Text style={[styles.currency, { color: colors.textSecondary }]}>R$</Text>
                <Text style={[styles.priceValue, { color: colors.text }]}>
                  {p.monthlyPrice}
                </Text>
                <Text style={[styles.period, { color: colors.textMuted }]}>/mês</Text>
              </View>

              {/* RECURSOS */}
              <View style={styles.featuresList}>
                {p.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Check size={15} color="#10b981" />
                    <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                      {feat}
                    </Text>
                  </View>
                ))}
              </View>

              {/* BOTÃO */}
              <TouchableOpacity
                onPress={() => handleUpgrade(p)}
                disabled={isCurrent || upgradeMutation.isPending}
                style={[
                  styles.planActionBtn,
                  {
                    backgroundColor: isCurrent
                      ? colors.surfaceSubtle
                      : p.recommended
                      ? '#064e3b'
                      : colors.primary,
                  },
                ]}
                activeOpacity={0.85}
              >
                {upgradeMutation.isPending ? (
                  <ActivityIndicator color="#ffffff" />
                ) : isCurrent ? (
                  <Text style={[styles.planActionBtnText, { color: colors.textMuted }]}>
                    Plano Atual
                  </Text>
                ) : (
                  <>
                    <Text style={styles.planActionBtnText}>Migrar para {p.name}</Text>
                    <ArrowUpRight size={16} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 80,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  header: {
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  feedbackText: {
    color: '#065f46',
    fontSize: 13,
    fontWeight: '600',
  },
  currentPlanCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 28,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  labelCurrent: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planNameCurrent: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  statusPillText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '700',
  },
  quotasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quotaBox: {
    flex: 1,
    minWidth: 180,
    padding: 14,
    borderRadius: 12,
  },
  quotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quotaLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quotaNumbers: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(150,150,150,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  quotaPercent: {
    fontSize: 11,
  },
  plansSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  plansSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  planCard: {
    flex: 1,
    minWidth: 260,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    position: 'relative',
    justifyContent: 'space-between',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  recommendedText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  planDesc: {
    fontSize: 12,
    marginTop: 4,
    minHeight: 34,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginVertical: 14,
  },
  currency: {
    fontSize: 14,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  period: {
    fontSize: 12,
  },
  featuresList: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  planActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  planActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
