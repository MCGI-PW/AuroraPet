import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Info } from 'lucide-react-native';
import { HeaderBrand } from '../common/HeaderBrand';
import { useTheme } from '../../contexts/ThemeContext';
import { appConfig } from '../../config/appConfig';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <HeaderBrand size="sm" />
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Plataforma que conecta tutores, médicos veterinários e a clínica: prontuário digital, agenda de
        consultas, laudos e controle de acesso aos dados do pet.
      </Text>

      <TouchableOpacity onPress={onOpenAbout} style={styles.aboutLink} accessibilityRole="link">
        <Info size={14} color={colors.accent} />
        <Text style={[styles.aboutText, { color: colors.accent }]}>Sobre o App</Text>
      </TouchableOpacity>

      <View style={[styles.bottomRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {appConfig.appName} v{appConfig.version} • FIAP — Mobile Application Development
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: { paddingVertical: 32, paddingHorizontal: 20, borderTopWidth: 1, gap: 12 },
  description: { fontSize: 13, lineHeight: 20 },
  aboutLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  aboutText: { fontSize: 13, fontWeight: '700' },
  bottomRow: { borderTopWidth: 1, paddingTop: 14 },
  meta: { fontSize: 11 },
});
