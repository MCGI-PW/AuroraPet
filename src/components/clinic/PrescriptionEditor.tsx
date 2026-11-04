import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pill, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { PrescriptionItem } from '../../types/appointment';
import { emptyPrescription } from '../../domain/consultationReport';
import { LabeledInput } from '../forms/LabeledInput';

interface PrescriptionEditorProps {
  items: PrescriptionItem[];
  onChange: (items: PrescriptionItem[]) => void;
}

/** Edição da receita: lista de medicamentos com dose, frequência e duração. */
export const PrescriptionEditor: React.FC<PrescriptionEditorProps> = ({ items, onChange }) => {
  const { colors } = useTheme();

  const update = (id: string, field: keyof PrescriptionItem, value: string) =>
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));

  return (
    <View>
      {items.map((item, index) => (
        <View key={item.id} style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surfaceSubtle }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitle}>
              <Pill size={16} color={colors.accent} />
              <Text style={[styles.cardTitleText, { color: colors.text }]}>Medicamento {index + 1}</Text>
            </View>
            {items.length > 1 && (
              <TouchableOpacity
                onPress={() => onChange(items.filter((p) => p.id !== item.id))}
                accessibilityLabel={`Remover medicamento ${index + 1}`}
              >
                <Trash2 size={16} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>
          <LabeledInput label="Medicamento" placeholder="Ex: Cefalexina 500mg" value={item.medication} onChangeText={(v) => update(item.id, 'medication', v)} />
          <View style={styles.row}>
            <LabeledInput containerStyle={styles.flex} label="Dose" placeholder="Ex: 1 comprimido" value={item.dosage} onChangeText={(v) => update(item.id, 'dosage', v)} />
            <LabeledInput containerStyle={styles.flex} label="Frequência" placeholder="Ex: A cada 12 horas" value={item.frequency} onChangeText={(v) => update(item.id, 'frequency', v)} />
          </View>
          <View style={styles.row}>
            <LabeledInput containerStyle={styles.flex} label="Duração" placeholder="Ex: 7 dias" value={item.duration} onChangeText={(v) => update(item.id, 'duration', v)} />
            <LabeledInput containerStyle={styles.flex} label="Observação" placeholder="Ex: após as refeições" value={item.instructions ?? ''} onChangeText={(v) => update(item.id, 'instructions', v)} />
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={() => onChange([...items, emptyPrescription()])} style={[styles.addBtn, { borderColor: colors.accent }]}>
        <Plus size={16} color={colors.accent} />
        <Text style={[styles.addText, { color: colors.accent }]}>Adicionar medicamento</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitleText: { fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, paddingVertical: 11 },
  addText: { fontWeight: '700', fontSize: 13 },
});
