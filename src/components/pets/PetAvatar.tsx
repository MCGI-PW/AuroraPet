import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';
import { Pet } from '../../types/pet';
import { SPECIES_OPTIONS } from '../../domain/petRules';

interface PetAvatarProps {
  pet: Pick<Pet, 'species' | 'photoUrl'>;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/** Foto do pet ou o emoji da espécie quando não há foto cadastrada. */
export const PetAvatar: React.FC<PetAvatarProps> = ({ pet, size = 56, style }) => {
  const dimension = { width: size, height: size, borderRadius: size / 3.5 };
  if (pet.photoUrl) {
    return <Image source={{ uri: pet.photoUrl }} style={[dimension, style]} resizeMode="cover" />;
  }
  const emoji = SPECIES_OPTIONS.find((s) => s.key === pet.species)?.icon ?? '🐾';
  return (
    <View style={[styles.fallback, dimension, style]}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#ecfdf5', justifyContent: 'center', alignItems: 'center' },
});
