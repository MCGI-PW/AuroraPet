import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Href, Redirect, useRouter } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/hooks/useAuth';
import { homeRouteFor, ROUTES } from '../src/navigation/routes';
import { FullScreenLoader } from '../src/components/common/FullScreenLoader';
import { PublicHeader } from '../src/components/landing/PublicHeader';
import { Hero } from '../src/components/landing/Hero';
import { Benefits } from '../src/components/landing/Benefits';
import { Services } from '../src/components/landing/Services';
import { Clinic } from '../src/components/landing/Clinic';
import { Specialists } from '../src/components/landing/Specialists';
import { AppointmentBanner } from '../src/components/landing/AppointmentBanner';
import { Footer } from '../src/components/landing/Footer';

/**
 * Rota de entrada. Com sessão salva (Firebase + AsyncStorage) o usuário vai
 * direto para a sua área; sem sessão, vê a apresentação da clínica com
 * serviços e especialistas carregados da API.
 */
export default function LandingPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { status, user } = useAuth();

  if (status === 'loading') return <FullScreenLoader message="Abrindo o AuroraPet..." />;
  if (status === 'authenticated' && user) return <Redirect href={homeRouteFor(user.role) as Href} />;

  const goToLogin = () => router.push(ROUTES.auth.login as Href);
  const goToRegister = () => router.push(ROUTES.auth.register as Href);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <PublicHeader onLogin={goToLogin} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Hero onPrimaryAction={goToRegister} primaryLabel="Criar conta e agendar consulta" />
        <Benefits />
        <Services />
        <Clinic />
        <Specialists onOpenBooking={goToLogin} />
        <AppointmentBanner onOpenBooking={goToLogin} />
        <Footer onOpenAbout={() => router.push(ROUTES.about as Href)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
});
