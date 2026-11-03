import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useCreateSpecialist } from '../../../src/hooks/useClinic';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { SpecialistForm } from '../../../src/components/clinic/SpecialistForm';
import { ROUTES } from '../../../src/navigation/routes';
import { showMessage } from '../../../src/utils/confirm';

/** Cadastro de veterinário no corpo clínico (limitado pela cota do plano). */
export default function NewVeterinarianPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const createSpecialist = useCreateSpecialist();

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={[styles.backText, { color: colors.textSecondary }]}>Corpo clínico</Text>
      </TouchableOpacity>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Novo veterinário</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Se o profissional criar uma conta com o mesmo e-mail, ela é vinculada a este cadastro.
        </Text>
        <SpecialistForm
          submitLabel="Cadastrar veterinário"
          submitting={createSpecialist.isPending}
          serverError={createSpecialist.error?.message}
          onSubmit={(values) =>
            createSpecialist.mutate(values, {
              onSuccess: (vet) => {
                showMessage('Veterinário cadastrado', `${vet.name} já aparece na agenda de agendamentos.`);
                router.replace(ROUTES.clinic.vets as Href);
              },
            })
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
  title: { fontSize: 21, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 16 },
});
