import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { usePets } from '../../src/hooks/usePets';
import { useAppointments, useCancelAppointment } from '../../src/hooks/useAppointments';
import { useTheme } from '../../src/contexts/ThemeContext';
import { ScreenScroll } from '../../src/components/common/ScreenScroll';
import { FullScreenLoader } from '../../src/components/common/FullScreenLoader';
import { PetAvatar } from '../../src/components/pets/PetAvatar';
import { formatDate, isUpcoming } from '../../src/domain/appointmentRules';
import { confirmAction } from '../../src/utils/confirm';
import {
  Calendar,
  Clock,
  PawPrint,
  Stethoscope,
  Plus,
  ArrowRight,
  Sparkles,
  HeartPulse,
} from 'lucide-react-native';
import { Href, useRouter } from 'expo-router';
import { ROUTES } from '../../src/navigation/routes';

/** Visão geral do tutor: resumo dos pets, próxima consulta e atalhos. */
export default function TutorHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { data: pets = [], isLoading: loadingPets } = usePets();
  const { data: appointments = [], isLoading: loadingAppointments } = useAppointments();
  const cancelMutation = useCancelAppointment();

  const upcoming = appointments.filter((a) => isUpcoming(a));
  const nextAppointment = upcoming[0];
  const scheduledCount = upcoming.length;
  const completedCount = appointments.filter((a) => a.status === 'completed').length;

  const handleCancelNext = async () => {
    if (!nextAppointment) return;
    const confirmed = await confirmAction({
      title: 'Cancelar consulta',
      message: `Cancelar a consulta de ${nextAppointment.petName} em ${formatDate(nextAppointment.date)} às ${nextAppointment.time}?`,
      confirmLabel: 'Cancelar consulta',
      destructive: true,
    });
    if (confirmed) cancelMutation.mutate(nextAppointment.id);
  };

  if (loadingPets || loadingAppointments) return <FullScreenLoader message="Carregando seu painel..." />;

  return (
    <ScreenScroll>
      {/* BOAS-VINDAS */}
      <View style={styles.welcomeRow}>
        <View>
          <View
            style={[
              styles.welcomeBadge,
              {
                backgroundColor: colors.primaryLight,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
              },
            ]}
          >
            <Sparkles size={13} color={colors.accent} />
            <Text style={[styles.welcomeBadgeText, { color: colors.accent }]}>
              Área do Tutor
            </Text>
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Olá, {user?.displayName || 'Tutor'} 👋
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
            Acompanhe a saúde e as consultas veterinárias dos seus animais.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.tutor.newAppointment as Href)}
          activeOpacity={0.85}
          style={styles.newApptBtn}
        >
          <Calendar size={16} color="#ffffff" />
          <Text style={styles.newApptBtnText}>Agendar Consulta</Text>
        </TouchableOpacity>
      </View>

      {/* CARDS DE RESUMO */}
      <View style={styles.statsGrid}>
        {/* CARD PETS */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Meus Pets</Text>
            <View style={[styles.statIconBox, { backgroundColor: colors.primaryLight }]}>
              <PawPrint size={18} color={colors.accent} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{pets.length}</Text>
          <Text style={[styles.statDesc, { color: colors.textMuted }]}>
            Cadastrados na sua conta
          </Text>
        </View>

        {/* CARD CONSULTAS */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Consultas Marcadas
            </Text>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(124, 58, 237, 0.12)' }]}>
              <Calendar size={18} color={isDark ? '#a78bfa' : '#7c3aed'} />
            </View>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{scheduledCount}</Text>
          <Text style={[styles.statDesc, { color: colors.textMuted }]}>Atendimentos futuros</Text>
        </View>

        {/* CARD HISTÓRICO */}
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.statHeader}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Atendimentos Realizados
            </Text>
            <View style={[styles.statIconBox, { backgroundColor: 'rgba(2, 132, 199, 0.12)' }]}>
              <HeartPulse size={18} color="#0284c7" />
            </View>
          </View>
          <Text style={[styles.statValue, { color: colors.text }]}>{completedCount}</Text>
          <Text style={[styles.statDesc, { color: colors.textMuted }]}>Histórico completo</Text>
        </View>
      </View>

      {/* PRÓXIMA CONSULTA */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Próximo Agendamento
          </Text>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.tutor.appointments as Href)}
            style={styles.viewAllBtn}
          >
            <Text style={[styles.viewAllText, { color: colors.accent }]}>Ver todos</Text>
            <ArrowRight size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {nextAppointment ? (
          <View
            style={[
              styles.nextApptCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : colors.border,
              },
            ]}
          >
            <View style={styles.nextApptInfo}>
              <View style={[styles.stethoscopeBox, { backgroundColor: colors.primaryLight }]}>
                <Stethoscope size={24} color={colors.accent} />
              </View>

              <View>
                <View style={styles.serviceRow}>
                  <Text style={[styles.serviceName, { color: colors.text }]}>
                    {nextAppointment.serviceName}
                  </Text>
                  <View style={[styles.confirmedBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.confirmedBadgeText, { color: colors.accent }]}>
                      Confirmado
                    </Text>
                  </View>
                </View>
                <Text style={[styles.apptDetails, { color: colors.textSecondary }]}>
                  Pet: {nextAppointment.petName} • Especialista: {nextAppointment.specialistName}
                </Text>
              </View>
            </View>

            <View style={styles.nextApptActions}>
              <View>
                <View style={styles.metaRow}>
                  <Calendar size={14} color="#10b981" />
                  <Text style={[styles.metaText, { color: colors.text }]}>
                    {formatDate(nextAppointment.date)}
                  </Text>
                </View>
                <View style={[styles.metaRow, { marginTop: 4 }]}>
                  <Clock size={14} color="#7c3aed" />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {nextAppointment.time}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCancelNext}
                disabled={cancelMutation.isPending}
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
                    borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                  },
                ]}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.emptyApptBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Calendar size={28} color={colors.textMuted} />
            <Text style={[styles.emptyApptText, { color: colors.textSecondary }]}>
              Você não possui nenhuma consulta futura agendada.
            </Text>
            <TouchableOpacity
              onPress={() => router.push(ROUTES.tutor.newAppointment as Href)}
              style={styles.emptyApptBtn}
            >
              <Text style={styles.emptyApptBtnText}>Agendar Agora</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MEUS PETS */}
      <View style={styles.sectionBlock}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Seus Pets</Text>
          <TouchableOpacity
            onPress={() => router.push(ROUTES.tutor.newPet as Href)}
            style={styles.addPetHeaderBtn}
          >
            <Plus size={15} color={colors.accent} />
            <Text style={[styles.addPetHeaderText, { color: colors.accent }]}>
              Adicionar Pet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.petsGrid}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              activeOpacity={0.8}
              onPress={() => router.push(ROUTES.tutor.pet(pet.id) as Href)}
              style={[
                styles.petCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <PetAvatar pet={pet} style={styles.petAvatar} />
              <View style={styles.petInfo}>
                <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
                <Text style={[styles.petBreed, { color: colors.textSecondary }]}>
                  {pet.breed} • {pet.age}
                </Text>
                {!!pet.weight && (
                  <Text style={[styles.petWeight, { color: colors.textMuted }]}>
                    Peso: {pet.weight}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => router.push(ROUTES.tutor.newPet as Href)}
            style={[
              styles.addPetCard,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
          >
            <Plus size={22} color={colors.accent} />
            <Text style={[styles.addPetCardText, { color: colors.text }]}>
              Adicionar Novo Pet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  welcomeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  welcomeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  newApptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#064e3b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  newApptBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },
  statDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  nextApptCard: {
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  nextApptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stethoscopeBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
  },
  confirmedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confirmedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  apptDetails: {
    fontSize: 12,
    marginTop: 4,
  },
  nextApptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyApptBox: {
    padding: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyApptText: {
    fontSize: 13,
  },
  emptyApptBtn: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 4,
  },
  emptyApptBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  addPetHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPetHeaderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  petCard: {
    flex: 1,
    minWidth: 240,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  petAvatar: {
    width: 54,
    height: 54,
    borderRadius: 14,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 15,
    fontWeight: '800',
  },
  petBreed: {
    fontSize: 12,
    marginTop: 2,
  },
  petWeight: {
    fontSize: 11,
    marginTop: 2,
  },
  addPetCard: {
    flex: 1,
    minWidth: 240,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPetCardText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
