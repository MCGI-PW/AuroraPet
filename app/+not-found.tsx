import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { ROUTES } from '../src/navigation/routes';

/** Exibida quando a rota acessada não existe. */
export default function NotFoundPage() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Página não encontrada</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>O endereço acessado não existe no AuroraPet.</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace(ROUTES.landing as Href)}>
        <Text style={styles.buttonText}>Voltar ao início</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 10 },
  title: { fontSize: 20, fontWeight: '800' },
  message: { fontSize: 14, textAlign: 'center' },
  button: { marginTop: 8, backgroundColor: '#064e3b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#ffffff', fontWeight: '700' },
});
