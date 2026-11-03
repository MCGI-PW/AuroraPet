import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useDeleteSpecialist, useSpecialist, useUpdateSpecialist } from '../../../src/hooks/useClinic';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { FullScreenLoader } from '../../../src/components/common/FullScreenLoader';
import { SpecialistForm } from '../../../src/components/clinic/SpecialistForm';
import { CreateSpecialistInput } from '../../../src/types/specialist';
import { ROUTES } from '../../../src/navigation/routes';
import { confirmAction, showMessage } from '../../../src/utils/confirm';

/** Edição e remoção de um veterinário do corpo clínico. */
export default function EditVeterinarianPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { data: specialist, isLoading, error } = useSpecialist(id);
  const updateSpecialist = useUpdateSpecialist();
  const deleteSpecialist = useDeleteSpecialist();

  const initialValues = useMemo<CreateSpecialistInput | undefined>(
    () =>
      specialist && {
        name: specialist.name,
        crmv: specialist.crmv,
        specialty: specialist.specialty,
        bio: specialist.bio ?? '',
        photoUrl: specialist.photoUrl ?? '',
        email: specialist.email ?? '',
        phone: specialist.phone ?? '',
        availableDays: specialist.availableDays ?? [],
        availableHours: specialist.availableHours ?? [],
        active: specialist.active !== false,
      },
    [specialist]
  );

  if (isLoading) return <FullScreenLoader message="Carregando veterinário..." />;
  if (!specialist || !initialValues) {
    return (
      <ScreenScroll>
        <Text style={{ color: colors.text }}>{(error as Error)?.message || 'Veterinário não encontrado.'}</Text>
      </ScreenScroll>
    );
  }

  const handleDelete = async () => {
    const confirmed = await confirmAction({
      title: 'Remover veterinário',
      message: `Remover ${specialist.name} do corpo clínico?`,
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (!confirmed) return;
    deleteSpecialist.mutate(specialist.id, {
      onSuccess: () => router.replace(ROUTES.clinic.vets as Href),
      onError: (err) => showMessage('Não foi possível remover', err.message),
    });
  };

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.navigate(ROUTES.clinic.vets as Href)} style={styles.backBtn}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={[styles.backText, { color: colors.textSecondary }]}>Corpo clínico</Text>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Editar veterinário</Text>
          <TouchableOpacity onPress={handleDelete} disabled={deleteSpecialist.isPending} style={styles.deleteBtn}>
            <Trash2 size={16} color="#dc2626" />
            <Text style={styles.deleteText}>Remover</Text>
          </TouchableOpacity>
        </View>
        <SpecialistForm
          initialValues={initialValues}
          submitLabel="Salvar alterações"
          submitting={updateSpecialist.isPending}
          serverError={updateSpecialist.error?.message}
          onSubmit={(values) =>
            updateSpecialist.mutate(
              { id: specialist.id, data: values },
              { onSuccess: () => showMessage('Dados salvos', 'As alterações já valem para novos agendamentos.') }
            )
          }
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  backText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 21, fontWeight: '800' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  deleteText: { color: '#dc2626', fontWeight: '700', fontSize: 13 },
});
