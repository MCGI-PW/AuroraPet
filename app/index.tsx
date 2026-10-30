import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { Navbar } from '../src/components/landing/Navbar';
import { Hero } from '../src/components/landing/Hero';
import { Benefits } from '../src/components/landing/Benefits';
import { Services } from '../src/components/landing/Services';
import { Clinic } from '../src/components/landing/Clinic';
import { Specialists } from '../src/components/landing/Specialists';
import { AppointmentBanner } from '../src/components/landing/AppointmentBanner';
import { Footer } from '../src/components/landing/Footer';
import { QuickBookingModal } from '../src/components/landing/QuickBookingModal';

export default function LandingPage() {
  const { colors } = useTheme();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNavigateSection = (sectionId: string) => {
    // Para web e mobile, rola ou foca suavemente
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* NAVBAR FIXA NO TOPO */}
      <Navbar
        onOpenBooking={() => setIsBookingModalOpen(true)}
        onNavigateSection={handleNavigateSection}
      />

      {/* CONTEÚDO SCROLLÁVEL */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Hero onOpenBooking={() => setIsBookingModalOpen(true)} />
        <Benefits />
        <Services />
        <Clinic />
        <Specialists onOpenBooking={() => setIsBookingModalOpen(true)} />
        <AppointmentBanner onOpenBooking={() => setIsBookingModalOpen(true)} />
        <Footer />
      </ScrollView>

      {/* MODAL DE AGENDAMENTO */}
      <QuickBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

