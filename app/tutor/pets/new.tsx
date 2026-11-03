import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { ArrowLeft, PawPrint } from 'lucide-react-native';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useCreatePet } from '../../../src/hooks/usePets';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { PetForm } from '../../../src/components/pets/PetForm';
import { PetFormValues, toPetPayload } from '../../../src/domain/petRules';
import { ROUTES } from '../../../src/navigation/routes';

/** Cadastro de um novo pet (POST /api/pets). */
export default function NewPetPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const createPet = useCreatePet();

  const handleSubmit = (values: PetFormValues) => {
    createPet.mutate(toPetPayload(values), {
      onSuccess: (pet) => router.replace(ROUTES.tutor.pet(pet.id) as Href),
    });
  };

  return (
    <ScreenScroll>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
        <ArrowLeft size={16} color={colors.textSecondary} />
        <Text style={[styles.backText, { color: colors.textSecondary }]}>Voltar para Meus Pets</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}>
            <PawPrint size={22} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>Cadastrar novo pet</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Os dados formam o prontuário usado pela clínica nas consultas
            </Text>
          </View>
        </View>

        <PetForm
          submitLabel="Salvar pet"
          submitting={createPet.isPending}
          serverError={createPet.error?.message}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  backText: { fontSize: 14, fontWeight: '600' },
  card: { borderRadius: 22, borderWidth: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
});
