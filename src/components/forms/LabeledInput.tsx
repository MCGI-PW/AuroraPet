import React from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface LabeledInputProps extends TextInputProps {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Campo de texto com rótulo, no padrão visual dos formulários do app. */
export const LabeledInput: React.FC<LabeledInputProps> = ({ label, containerStyle, multiline, style, ...props }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        style={[
          styles.input,
          multiline && styles.multiline,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.surfaceSubtle },
          style,
        ]}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  field: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  multiline: { minHeight: 90, textAlignVertical: 'top' },
});
