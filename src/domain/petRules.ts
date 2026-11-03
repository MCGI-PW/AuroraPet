import { PetSpecies } from '../types/pet';

/** Espécies aceitas pelo cadastro de pets (mesma lista validada pela API). */
export const SPECIES_OPTIONS: { key: PetSpecies; label: string; icon: string }[] = [
  { key: 'dog', label: 'Cachorro', icon: '🐶' },
  { key: 'cat', label: 'Gato', icon: '🐱' },
  { key: 'bird', label: 'Pássaro', icon: '🦜' },
  { key: 'other', label: 'Outro', icon: '🐾' },
];

export const speciesLabel = (species: PetSpecies) =>
  SPECIES_OPTIONS.find((s) => s.key === species)?.label ?? 'Outro';

/** Converte o peso digitado ("12,5" ou "12.5 kg") para o formato da API. */
export function normalizeWeightInput(weight: string): string | undefined {
  const value = weight.replace(',', '.').replace(/kg/i, '').trim();
  return value ? `${value} kg` : undefined;
}

/** Extrai o número do peso salvo ("12.5 kg" → "12.5") para edição. */
export const weightToInput = (weight?: string) => (weight ? weight.replace(/\s*kg/i, '') : '');

export interface PetFormValues {
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  weight: string;
  notes: string;
}

export function validatePetForm(values: PetFormValues): string | null {
  if (!values.name.trim()) return 'Informe o nome do pet.';
  if (values.weight.trim()) {
    const number = Number(values.weight.replace(',', '.').replace(/kg/i, '').trim());
    if (!Number.isFinite(number) || number <= 0 || number > 200) return 'Peso inválido (informe em kg, até 200).';
  }
  return null;
}

/** Monta o payload enviado à API a partir do formulário. */
export const toPetPayload = (values: PetFormValues) => ({
  name: values.name.trim(),
  species: values.species,
  breed: values.breed.trim(),
  age: values.age.trim(),
  weight: normalizeWeightInput(values.weight),
  notes: values.notes.trim(),
});
