import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  name: string;
  photoUrl?: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

const initialsOf = (name: string) =>
  name
    .replace(/^(Dr\.?|Dra\.?)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/** Foto do profissional ou, na falta dela, as iniciais do nome. */
export const Avatar: React.FC<AvatarProps> = ({ name, photoUrl, size = 56, style }) => {
  const dimension = { width: size, height: size, borderRadius: size / 4 };
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={[dimension, style]} resizeMode="cover" />;
  }
  return (
    <View style={[styles.fallback, dimension, style]}>
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initialsOf(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: { backgroundColor: '#064e3b', justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#ffffff', fontWeight: '800' },
});
