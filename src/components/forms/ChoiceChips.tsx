import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface ChoiceOption {
  value: string;
  label: string;
  description?: string;
}

interface ChoiceChipsProps {
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
}

/** Grupo de opções selecionáveis (seleção única) exibido como "chips". */
export const ChoiceChips: React.FC<ChoiceChipsProps> = ({ options, value, onChange }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[
              styles.chip,
              { backgroundColor: selected ? colors.primaryLight : colors.surfaceSubtle, borderColor: selected ? colors.accent : colors.border },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.accent : colors.text }]}>{option.label}</Text>
            {option.description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{option.description}</Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  label: { fontSize: 13, fontWeight: '700' },
  description: { fontSize: 11, marginTop: 2 },
});
