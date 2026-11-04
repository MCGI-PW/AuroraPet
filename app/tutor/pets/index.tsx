import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import { ROUTES } from '../../../src/navigation/routes';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { usePets, useDeletePet } from '../../../src/hooks/usePets';
import { ScreenScroll } from '../../../src/components/common/ScreenScroll';
import { PetAvatar } from '../../../src/components/pets/PetAvatar';
import { confirmAction, showMessage } from '../../../src/utils/confirm';
import {
  PawPrint,
  Plus,
  Trash2,
  Edit3,
  ArrowRight,
  AlertCircle,
  Calendar,
} from 'lucide-react-native';
import { PetSpecies } from '../../../src/types/pet';

/** Lista de pets do tutor com filtro por espécie e exclusão. */
export default function PetsListPage() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: pets = [], isLoading, isError, error } = usePets();
  const deletePetMutation = useDeletePet();
  const [speciesFilter, setSpeciesFilter] = useState<'all' | PetSpecies>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredPets =
    speciesFilter === 'all'
      ? pets
      : pets.filter((p) => p.species === speciesFilter);

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmAction({
      title: 'Remover pet',
      message: `Remover "${name}"? As consultas futuras serão canceladas e os acessos concedidos, revogados.`,
      confirmLabel: 'Remover',
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deletePetMutation.mutateAsync(id);
    } catch (err) {
      showMessage('Erro', (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ScreenScroll>
      {/* CABEÇALHO */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Meus Pets</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Prontuário, peso e histórico de saúde dos seus animais
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.tutor.newPet as Href)}
          activeOpacity={0.85}
          style={styles.newBtn}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.newBtnText}>Cadastrar Novo Pet</Text>
        </TouchableOpacity>
      </View>

      {/* FILTROS POR ESPÉCIE */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          onPress={() => setSpeciesFilter('all')}
          style={[
            styles.filterBtn,
            {
              backgroundColor: speciesFilter === 'all' ? colors.primaryLight : colors.surface,
              borderColor: speciesFilter === 'all' ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterBtnText,
              { color: speciesFilter === 'all' ? colors.accent : colors.textSecondary },
            ]}
          >
            Todos ({pets.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSpeciesFilter('dog')}
          style={[
            styles.filterBtn,
            {
              backgroundColor: speciesFilter === 'dog' ? colors.primaryLight : colors.surface,
              borderColor: speciesFilter === 'dog' ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterBtnText,
              { color: speciesFilter === 'dog' ? colors.accent : colors.textSecondary },
            ]}
          >
            🐶 Cães ({pets.filter((p) => p.species === 'dog').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSpeciesFilter('cat')}
          style={[
            styles.filterBtn,
            {
              backgroundColor: speciesFilter === 'cat' ? colors.primaryLight : colors.surface,
              borderColor: speciesFilter === 'cat' ? colors.accent : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterBtnText,
              { color: speciesFilter === 'cat' ? colors.accent : colors.textSecondary },
            ]}
          >
            🐱 Gatos ({pets.filter((p) => p.species === 'cat').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* CARREGAMENTO */}
      {isLoading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Buscando pets cadastrados na API REST...
          </Text>
        </View>
      )}

      {/* ERRO */}
      {isError && (
        <View style={styles.errorBox}>
          <AlertCircle size={20} color="#b91c1c" />
          <View style={{ flex: 1 }}>
            <Text style={styles.errorTitle}>Não foi possível carregar seus pets:</Text>
            <Text style={styles.errorDesc}>
              {(error as Error)?.message || 'Falha ao buscar pets cadastrados.'}
            </Text>
          </View>
        </View>
      )}

      {/* LISTA DE PETS */}
      {!isLoading && !isError && (
        <View style={styles.grid}>
          {filteredPets.length === 0 ? (
            <View
              style={[
                styles.emptyBox,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <PawPrint size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Nenhum pet encontrado
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Você ainda não possui nenhum animal cadastrado nesta categoria. Adicione um novo pet para acompanhar suas consultas.
              </Text>
              <TouchableOpacity
                onPress={() => router.push(ROUTES.tutor.newPet as Href)}
                style={styles.emptyBtn}
              >
                <Text style={styles.emptyBtnText}>+ Cadastrar Primeiro Pet</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredPets.map((pet) => (
              <View
                key={pet.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <PetAvatar pet={pet} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
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
                </View>

                {pet.notes ? (
                  <Text
                    numberOfLines={2}
                    style={[styles.notes, { color: colors.textSecondary }]}
                  >
                    {pet.notes}
                  </Text>
                ) : null}

                <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    onPress={() => router.push(ROUTES.tutor.pet(pet.id) as Href)}
                    style={[
                      styles.footerActionBtn,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Edit3 size={14} color={colors.text} />
                    <Text style={[styles.footerActionText, { color: colors.text }]}>
                      Prontuário
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        ROUTES.tutor.newAppointmentForPet(pet.id) as Href
                      )
                    }
                    style={[
                      styles.footerActionBtn,
                      {
                        backgroundColor: colors.primaryLight,
                        borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                      },
                    ]}
                  >
                    <Calendar size={14} color={colors.accent} />
                    <Text style={[styles.footerActionText, { color: colors.accent }]}>
                      Agendar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDelete(pet.id, pet.name)}
                    disabled={deletingId === pet.id}
                    style={[
                      styles.deleteIconBtn,
                      {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                      },
                    ]}
                  >
                    <Trash2 size={14} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  newBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b91c1c',
  },
  errorDesc: {
    fontSize: 12,
    color: '#b91c1c',
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  emptyBox: {
    width: '100%',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 400,
    lineHeight: 20,
  },
  emptyBtn: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 18,
  },
  emptyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    flex: 1,
    minWidth: 280,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  petName: {
    fontSize: 17,
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
  notes: {
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  footerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteIconBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
